import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(
    request,
    "settings:signatories",
  );

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const publicId = id.trim();
  const body = await request.json().catch(() => null);

  if (!publicId) {
    return apiError("Report signatory ID is required.");
  }

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const fullName =
    "fullName" in body && typeof body.fullName === "string"
      ? body.fullName.trim()
      : "";
  const title =
    "title" in body && typeof body.title === "string"
      ? body.title.trim()
      : "";
  const email =
    "email" in body && typeof body.email === "string"
      ? body.email.trim()
      : "";
  const phone =
    "phone" in body && typeof body.phone === "string"
      ? body.phone.trim()
      : "";

  if (!fullName) {
    return apiError("Signatory full name is required.");
  }

  const existing = await prisma.reportSignatory.findUnique({
    where: { publicId },
    select: {
      id: true,
      publicId: true,
      roleSlug: true,
      roleName: true,
      fullName: true,
      title: true,
      email: true,
      phone: true,
    },
  });

  if (!existing) {
    return apiError("Report signatory not found.", 404, "NOT_FOUND");
  }

  const signatory = await prisma.reportSignatory.update({
    where: { publicId },
    data: {
      fullName,
      title: title || null,
      email: email || null,
      phone: phone || null,
    },
    select: {
      publicId: true,
      roleSlug: true,
      roleName: true,
      fullName: true,
      title: true,
      email: true,
      phone: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "REPORT_SIGNATORY_UPDATE",
      entityType: "report-signatory",
      entityPublicId: signatory.publicId,
      description: `Updated report signatory for ${signatory.roleName}.`,
      metadataJson: JSON.stringify({
        roleSlug: signatory.roleSlug,
        before: {
          fullName: existing.fullName,
          title: existing.title,
          email: existing.email,
          phone: existing.phone,
        },
        after: {
          fullName: signatory.fullName,
          title: signatory.title,
          email: signatory.email,
          phone: signatory.phone,
        },
      }),
    },
  });

  return NextResponse.json({ signatory });
}
