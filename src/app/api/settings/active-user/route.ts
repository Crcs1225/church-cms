import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import {
  clearActiveUserCookie,
  jsonWithActiveUserCookie,
} from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const publicId =
    "publicId" in body && typeof body.publicId === "string"
      ? body.publicId.trim()
      : "";

  if (!publicId) {
    return apiError("Admin user ID is required.");
  }

  const user = await prisma.appUser.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      fullName: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    return apiError("Admin user was not found.", 404, "NOT_FOUND");
  }

  if (user.status !== "active") {
    return apiError("Only active admin users can be selected.");
  }

  return jsonWithActiveUserCookie(
    {
      user,
    },
    user.publicId,
  );
}

export async function DELETE() {
  return clearActiveUserCookie(new NextResponse(null, { status: 204 }));
}
