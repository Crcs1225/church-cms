import { NextRequest, NextResponse } from "next/server";
import { apiError, parseAmountToCents, parseDate } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type ExpenseRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatExpense(expense: {
  publicId: string;
  vendor: string | null;
  description: string;
  amountCents: number;
  paidAt: Date;
  reference: string | null;
  receiptPath: string | null;
  notes: string | null;
  category: { name: string; slug: string };
}) {
  return {
    publicId: expense.publicId,
    vendor: expense.vendor,
    description: expense.description,
    amountCents: expense.amountCents,
    paidAt: expense.paidAt.toISOString(),
    reference: expense.reference,
    receiptPath: expense.receiptPath,
    notes: expense.notes,
    category: expense.category,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: ExpenseRouteContext,
) {
  const permission = await requireRequestPermission(request, "finances:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const existingExpense = await prisma.expense.findUnique({
    where: { publicId: id },
    select: {
      publicId: true,
      description: true,
    },
  });

  if (!existingExpense) {
    return apiError("Expense record does not exist.", 404, "NOT_FOUND");
  }

  const updateData: {
    categoryId?: number;
    vendor?: string | null;
    description?: string;
    amountCents?: number;
    paidAt?: Date;
    reference?: string | null;
    receiptPath?: string | null;
    notes?: string | null;
  } = {};

  if ("amount" in body) {
    const amountCents = parseAmountToCents(body.amount);

    if (!amountCents) {
      return apiError("Expense amount must be greater than zero.");
    }

    updateData.amountCents = amountCents;
  }

  if ("category" in body) {
    const categorySlug =
      typeof body.category === "string" ? body.category.trim() : "";

    if (!categorySlug) {
      return apiError("Expense category is required.");
    }

    const category = await prisma.expenseCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (!category) {
      return apiError("Expense category does not exist.", 404, "NOT_FOUND");
    }

    updateData.categoryId = category.id;
  }

  if ("description" in body) {
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!description) {
      return apiError("Expense description is required.");
    }

    updateData.description = description;
  }

  if ("paidAt" in body) {
    const paidAt = parseDate(body.paidAt, null);

    if (!paidAt) {
      return apiError("Expense date must be valid.");
    }

    updateData.paidAt = paidAt;
  }

  if ("vendor" in body) {
    updateData.vendor =
      typeof body.vendor === "string" ? body.vendor.trim() || null : null;
  }

  if ("reference" in body) {
    updateData.reference =
      typeof body.reference === "string" ? body.reference.trim() || null : null;
  }

  if ("receiptPath" in body) {
    updateData.receiptPath =
      typeof body.receiptPath === "string" ? body.receiptPath.trim() || null : null;
  }

  if ("notes" in body) {
    updateData.notes =
      typeof body.notes === "string" ? body.notes.trim() || null : null;
  }

  const expense = await prisma.expense.update({
    where: { publicId: id },
    data: updateData,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "EXPENSE_UPDATE",
      entityType: "expense",
      entityPublicId: expense.publicId,
      description: `Updated expense: ${expense.description || existingExpense.description}`,
      metadataJson: JSON.stringify({
        amountCents: expense.amountCents,
        category: expense.category.slug,
        vendor: expense.vendor,
        paidAt: expense.paidAt.toISOString(),
      }),
    },
  });

  return NextResponse.json({ expense: formatExpense(expense) });
}

export async function DELETE(
  request: NextRequest,
  { params }: ExpenseRouteContext,
) {
  const permission = await requireRequestPermission(request, "finances:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { publicId: id },
    select: {
      publicId: true,
      description: true,
      amountCents: true,
      vendor: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!expense) {
    return apiError("Expense record does not exist.", 404, "NOT_FOUND");
  }

  await prisma.expense.delete({
    where: { publicId: id },
  });

  await prisma.activityLog.create({
    data: {
      action: "EXPENSE_DELETE",
      entityType: "expense",
      entityPublicId: expense.publicId,
      description: `Deleted expense: ${expense.description}`,
      metadataJson: JSON.stringify({
        amountCents: expense.amountCents,
        category: expense.category.slug,
        vendor: expense.vendor,
      }),
    },
  });

  return NextResponse.json({
    deleted: true,
  });
}
