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
  const isRestricted =
    "isRestricted" in body ? Boolean(body.isRestricted) : false;

  if (!name) {
    return apiError("Category name is required.");
  }

  const slug = slugify(name);

  if (!slug) {
    return apiError("Category name is invalid.");
  }

  try {
    const category = await prisma.givingCategory.create({
      data: {
        name,
        slug,
        isRestricted,
      },
      select: {
        publicId: true,
        name: true,
        slug: true,
        isRestricted: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "GIVING_CATEGORY_CREATE",
        entityType: "giving-category",
        entityPublicId: category.publicId,
        description: `Created income category ${category.name}.`,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return apiError("An income category with this name already exists.", 409, "CONFLICT");
    }

    throw error;
  }
}
