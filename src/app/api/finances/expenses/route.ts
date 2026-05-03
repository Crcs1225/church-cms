import { NextRequest, NextResponse } from "next/server";
import {
  apiError,
  getPagination,
  parseAmountToCents,
  parseDate,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = getPagination(searchParams);
  const category = searchParams.get("category")?.trim();
  const query = searchParams.get("query")?.trim();

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(query
      ? {
          OR: [
            { vendor: { contains: query } },
            { description: { contains: query } },
            { reference: { contains: query } },
          ],
        }
      : {}),
  };

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      orderBy: [{ paidAt: "desc" }, { id: "desc" }],
      skip,
      take: pageSize,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json({
    expenses: expenses.map(formatExpense),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const amountCents = parseAmountToCents("amount" in body ? body.amount : null);
  const categorySlug =
    "category" in body && typeof body.category === "string"
      ? body.category.trim()
      : "";
  const paidAt = parseDate("paidAt" in body ? body.paidAt : null);
  const description =
    "description" in body && typeof body.description === "string"
      ? body.description.trim()
      : "";

  if (!amountCents) {
    return apiError("Expense amount must be greater than zero.");
  }

  if (!categorySlug) {
    return apiError("Expense category is required.");
  }

  if (!description) {
    return apiError("Expense description is required.");
  }

  if (!paidAt) {
    return apiError("Expense date must be valid.");
  }

  const category = await prisma.expenseCategory.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });

  if (!category) {
    return apiError("Expense category does not exist.", 404, "NOT_FOUND");
  }

  const expense = await prisma.expense.create({
    data: {
      amountCents,
      categoryId: category.id,
      description,
      paidAt,
      vendor:
        "vendor" in body && typeof body.vendor === "string"
          ? body.vendor.trim() || null
          : null,
      reference:
        "reference" in body && typeof body.reference === "string"
          ? body.reference.trim() || null
          : null,
      receiptPath:
        "receiptPath" in body && typeof body.receiptPath === "string"
          ? body.receiptPath.trim() || null
          : null,
      notes:
        "notes" in body && typeof body.notes === "string"
          ? body.notes.trim() || null
          : null,
    },
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
      action: "EXPENSE_CREATE",
      entityType: "expense",
      entityPublicId: expense.publicId,
      description: `Recorded expense of ${amountCents} cents.`,
      metadataJson: JSON.stringify({
        amountCents,
        category: expense.category.slug,
      }),
    },
  });

  return NextResponse.json({ expense: formatExpense(expense) }, { status: 201 });
}
