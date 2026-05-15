import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { isValidAppRole, requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(request, "settings:users");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const publicId = id.trim();
  const body = await request.json().catch(() => null);

  if (!publicId) {
    return apiError("Admin user ID is required.");
  }

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const fullName =
    "fullName" in body && typeof body.fullName === "string"
      ? body.fullName.trim()
      : "";
  const email =
    "email" in body && typeof body.email === "string"
      ? body.email.trim()
      : "";
  const role =
    "role" in body && typeof body.role === "string"
      ? body.role.trim()
      : "";
  const status =
    "status" in body && typeof body.status === "string"
      ? body.status.trim()
      : "";

  if (!fullName) {
    return apiError("User full name is required.");
  }

  if (!email) {
    return apiError("User email is required.");
  }

  if (!role) {
    return apiError("User role is required.");
  }

  if (!isValidAppRole(role)) {
    return apiError("User role is invalid.");
  }

  if (!status) {
    return apiError("User status is required.");
  }

  const existing = await prisma.appUser.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!existing) {
    return apiError("Admin user not found.", 404, "NOT_FOUND");
  }

  try {
    const user = await prisma.appUser.update({
      where: { publicId },
      data: {
        fullName,
        email,
        role,
        status,
      },
      select: {
        publicId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "APP_USER_UPDATE",
        entityType: "app-user",
        entityPublicId: user.publicId,
        description: `Updated admin user ${user.fullName}.`,
        metadataJson: JSON.stringify({
          before: existing,
          after: user,
        }),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return apiError("An admin user with this email already exists.", 409, "CONFLICT");
    }

    throw error;
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(request, "settings:users");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const publicId = id.trim();

  if (!publicId) {
    return apiError("Admin user ID is required.");
  }

  const existing = await prisma.appUser.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      fullName: true,
      email: true,
    },
  });

  if (!existing) {
    return apiError("Admin user not found.", 404, "NOT_FOUND");
  }

  await prisma.appUser.delete({
    where: { publicId },
  });

  await prisma.activityLog.create({
    data: {
      action: "APP_USER_DELETE",
      entityType: "app-user",
      entityPublicId: publicId,
      description: `Deleted admin user ${existing.fullName}.`,
      metadataJson: JSON.stringify(existing),
    },
  });

  return NextResponse.json({ deleted: true });
}
