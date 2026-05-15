import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { getChurchSettings } from "@/lib/church-settings";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const permission = await requireRequestPermission(
    request,
    "settings:notifications",
  );

  if (permission.response) {
    return permission.response;
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const existing = await getChurchSettings();

  const settings = await prisma.churchSettings.update({
    where: {
      singletonKey: "default",
    },
    data: {
      dailyDigestEnabled:
        "dailyDigestEnabled" in body
          ? Boolean(body.dailyDigestEnabled)
          : existing.dailyDigestEnabled,
      newMemberAlertsEnabled:
        "newMemberAlertsEnabled" in body
          ? Boolean(body.newMemberAlertsEnabled)
          : existing.newMemberAlertsEnabled,
      lowBudgetWarningEnabled:
        "lowBudgetWarningEnabled" in body
          ? Boolean(body.lowBudgetWarningEnabled)
          : existing.lowBudgetWarningEnabled,
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

  await prisma.activityLog.create({
    data: {
      action: "NOTIFICATION_SETTINGS_UPDATE",
      entityType: "church-settings",
      entityPublicId: settings.publicId,
      description: "Updated notification settings.",
      metadataJson: JSON.stringify({
        before: {
          dailyDigestEnabled: existing.dailyDigestEnabled,
          newMemberAlertsEnabled: existing.newMemberAlertsEnabled,
          lowBudgetWarningEnabled: existing.lowBudgetWarningEnabled,
        },
        after: {
          dailyDigestEnabled: settings.dailyDigestEnabled,
          newMemberAlertsEnabled: settings.newMemberAlertsEnabled,
          lowBudgetWarningEnabled: settings.lowBudgetWarningEnabled,
        },
      }),
    },
  });

  return NextResponse.json({ settings });
}
