import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import {
  deleteLocalChurchLogo,
  getChurchLogoUploadError,
  saveChurchLogo,
} from "@/lib/church-logo";
import { getChurchSettings } from "@/lib/church-settings";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const permission = await requireRequestPermission(
    request,
    "settings:church-profile",
  );

  if (permission.response) {
    return permission.response;
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return apiError("Request body must be valid form data.");
  }

  const file = formData.get("logo");

  if (!(file instanceof File)) {
    return apiError("A church logo file is required.");
  }

  const uploadError = getChurchLogoUploadError(file);

  if (uploadError) {
    return apiError(uploadError);
  }

  const existing = await getChurchSettings();
  const nextLogoPath = await saveChurchLogo(file);

  const settings = await prisma.churchSettings.update({
    where: {
      singletonKey: "default",
    },
    data: {
      logoPath: nextLogoPath,
    },
    select: {
      publicId: true,
      churchName: true,
      shortName: true,
      contactEmail: true,
      address: true,
      phone: true,
      logoPath: true,
      dailyDigestEnabled: true,
      newMemberAlertsEnabled: true,
      lowBudgetWarningEnabled: true,
    },
  });

  await deleteLocalChurchLogo(existing.logoPath);

  await prisma.activityLog.create({
    data: {
      action: "CHURCH_LOGO_UPDATE",
      entityType: "church-settings",
      entityPublicId: settings.publicId,
      description: "Updated church logo.",
      metadataJson: JSON.stringify({
        before: existing.logoPath,
        after: settings.logoPath,
      }),
    },
  });

  return NextResponse.json({ settings });
}
