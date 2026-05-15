import { prisma } from "@/lib/prisma";
import { CHURCH_NAME_FULL, CHURCH_NAME_SHORT } from "@/lib/branding";

export type ChurchSettingsData = {
  publicId: string;
  churchName: string;
  shortName: string;
  contactEmail: string | null;
  address: string | null;
  phone: string | null;
  logoPath: string | null;
  dailyDigestEnabled: boolean;
  newMemberAlertsEnabled: boolean;
  lowBudgetWarningEnabled: boolean;
};

export async function getChurchSettings(): Promise<ChurchSettingsData> {
  const settings = await prisma.churchSettings.findUnique({
    where: {
      singletonKey: "default",
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

  if (settings) {
    return settings;
  }

  return prisma.churchSettings.create({
    data: {
      singletonKey: "default",
      churchName: CHURCH_NAME_FULL,
      shortName: CHURCH_NAME_SHORT,
      contactEmail: "admin@ntccgmi-ilogmalino.org",
      address: "Ilog Malino, Bolinao, Pangasinan",
      phone: "+63 917 000 0000",
      dailyDigestEnabled: true,
      newMemberAlertsEnabled: true,
      lowBudgetWarningEnabled: false,
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
}
