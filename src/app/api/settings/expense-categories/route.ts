import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function POST(request: NextRequest) {
  const permission = await requireRequestPermission(request, "settings:categories");

  if (permission.response) {
    return permission.response;
  }

  const body = await request.json().catch(() => null);

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

  try {
    const category = await prisma.expenseCategory.create({
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
        action: "EXPENSE_CATEGORY_CREATE",
        entityType: "expense-category",
        entityPublicId: category.publicId,
        description: `Created expense category ${category.name}.`,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return apiError("An expense category with this name already exists.", 409, "CONFLICT");
    }

    throw error;
  }
}
