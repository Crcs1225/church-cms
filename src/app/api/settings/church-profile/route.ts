import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { getChurchSettings } from "@/lib/church-settings";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(
    request,
    "settings:church-profile",
  );

  if (permission.response) {
    return permission.response;
  }

  const settings = await getChurchSettings();

  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const permission = await requireRequestPermission(
    request,
    "settings:church-profile",
  );

  if (permission.response) {
    return permission.response;
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const churchName =
    "churchName" in body && typeof body.churchName === "string"
      ? body.churchName.trim()
      : "";
  const shortName =
    "shortName" in body && typeof body.shortName === "string"
      ? body.shortName.trim()
      : "";
  const contactEmail =
    "contactEmail" in body && typeof body.contactEmail === "string"
      ? body.contactEmail.trim()
      : "";
  const address =
    "address" in body && typeof body.address === "string"
      ? body.address.trim()
      : "";
  const phone =
    "phone" in body && typeof body.phone === "string"
      ? body.phone.trim()
      : "";

  if (!churchName) {
    return apiError("Church name is required.");
  }

  if (!shortName) {
    return apiError("Short name is required.");
  }

  const existing = await getChurchSettings();

  const settings = await prisma.churchSettings.update({
    where: {
      singletonKey: "default",
    },
    data: {
      churchName,
      shortName,
      contactEmail: contactEmail || null,
      address: address || null,
      phone: phone || null,
    },
    select: {
      publicId: true,
      churchName: true,
      shortName: true,
      contactEmail: true,
      address: true,
      phone: true,
      logoPath: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "CHURCH_SETTINGS_UPDATE",
      entityType: "church-settings",
      entityPublicId: settings.publicId,
      description: "Updated church profile settings.",
      metadataJson: JSON.stringify({
        before: existing,
        after: settings,
      }),
    },
  });

  return NextResponse.json({ settings });
}
