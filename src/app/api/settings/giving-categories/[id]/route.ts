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
  const isRestricted =
    "isRestricted" in body ? Boolean(body.isRestricted) : false;

  if (!name) {
    return apiError("Category name is required.");
  }

  const slug = slugify(name);

  if (!slug) {
    return apiError("Category name is invalid.");
  }

  const existing = await prisma.givingCategory.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      name: true,
      slug: true,
      isRestricted: true,
    },
  });

  if (!existing) {
    return apiError("Income category not found.", 404, "NOT_FOUND");
  }

  try {
    const category = await prisma.givingCategory.update({
      where: { publicId },
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
        action: "GIVING_CATEGORY_UPDATE",
        entityType: "giving-category",
        entityPublicId: category.publicId,
        description: `Updated income category ${category.name}.`,
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
      return apiError("An income category with this name already exists.", 409, "CONFLICT");
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

  const existing = await prisma.givingCategory.findUnique({
    where: { publicId },
    select: {
      id: true,
      publicId: true,
      name: true,
      slug: true,
      _count: {
        select: {
          contributions: true,
        },
      },
    },
  });

  if (!existing) {
    return apiError("Income category not found.", 404, "NOT_FOUND");
  }

  if (existing._count.contributions > 0) {
    return apiError("This income category is already used by contributions and cannot be deleted.", 409, "CONFLICT");
  }

  await prisma.givingCategory.delete({
    where: { publicId },
  });

  await prisma.activityLog.create({
    data: {
      action: "GIVING_CATEGORY_DELETE",
      entityType: "giving-category",
      entityPublicId: publicId,
      description: `Deleted income category ${existing.name}.`,
      metadataJson: JSON.stringify(existing),
    },
  });

  return NextResponse.json({ deleted: true });
}
