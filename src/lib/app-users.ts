import { prisma } from "@/lib/prisma";

export type AppUserItem = {
  publicId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

export async function getAppUsers(): Promise<AppUserItem[]> {
  return prisma.appUser.findMany({
    orderBy: [{ status: "asc" }, { fullName: "asc" }],
    select: {
      publicId: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    },
  });
}
