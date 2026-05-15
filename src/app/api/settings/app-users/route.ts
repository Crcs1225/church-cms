import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { isValidAppRole, requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const permission = await requireRequestPermission(request, "settings:users");

  if (permission.response) {
    return permission.response;
  }

  const body = await request.json().catch(() => null);

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
      : "active";

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

  try {
    const user = await prisma.appUser.create({
      data: {
        fullName,
        email,
        role,
        status: status || "active",
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
        action: "APP_USER_CREATE",
        entityType: "app-user",
        entityPublicId: user.publicId,
        description: `Created admin user ${user.fullName}.`,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return apiError("An admin user with this email already exists.", 409, "CONFLICT");
    }

    throw error;
  }
}
