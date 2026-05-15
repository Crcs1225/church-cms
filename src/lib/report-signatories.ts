import { prisma } from "@/lib/prisma";

export type ReportSignatoryItem = {
  publicId: string;
  roleSlug: string;
  roleName: string;
  fullName: string;
  title: string | null;
  email: string | null;
  phone: string | null;
};

export async function getReportSignatories(): Promise<ReportSignatoryItem[]> {
  const signatories = await prisma.reportSignatory.findMany({
    orderBy: [{ sortOrder: "asc" }, { roleName: "asc" }],
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

  return signatories;
}
