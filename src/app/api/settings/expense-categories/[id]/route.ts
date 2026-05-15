import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(request, "settings:categories");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const publicId = id.trim();
  const body = await request.json().catch(() => null);

  if (!publicId) {
    return apiError("Category ID is required.");
  }

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const name =
    "name" in body && typeof body.name === "string"
      ? body.name.trim()
      : "";

  if (!name) {
    return apiError("Category name is required.");
  }

  const slug = slugify(name);

  if (!slug) {
    return apiError("Category name is invalid.");
  }

  const existing = await prisma.expenseCategory.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      name: true,
      slug: true,
    },
  });

  if (!existing) {
    return apiError("Expense category not found.", 404, "NOT_FOUND");
  }

  try {
    const category = await prisma.expenseCategory.update({
      where: { publicId },
      data: {
        name,
        slug,
      },
      select: {
        publicId: true,
        name: true,
        slug: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "EXPENSE_CATEGORY_UPDATE",
        entityType: "expense-category",
        entityPublicId: category.publicId,
        description: `Updated expense category ${category.name}.`,
        metadataJson: JSON.stringify({
          before: existing,
          after: category,
        }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return apiError("An expense category with this name already exists.", 409, "CONFLICT");
    }

    throw error;
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(request, "settings:categories");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const publicId = id.trim();

  if (!publicId) {
    return apiError("Category ID is required.");
  }

  const existing = await prisma.expenseCategory.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      name: true,
      slug: true,
      _count: {
        select: {
          expenses: true,
        },
      },
    },
  });

  if (!existing) {
    return apiError("Expense category not found.", 404, "NOT_FOUND");
  }

  if (existing._count.expenses > 0) {
    return apiError("This expense category is already used by expenses and cannot be deleted.", 409, "CONFLICT");
  }

  await prisma.expenseCategory.delete({
    where: { publicId },
  });

  await prisma.activityLog.create({
    data: {
      action: "EXPENSE_CATEGORY_DELETE",
      entityType: "expense-category",
      entityPublicId: publicId,
      description: `Deleted expense category ${existing.name}.`,
      metadataJson: JSON.stringify(existing),
    },
  });

  return NextResponse.json({ deleted: true });
}
