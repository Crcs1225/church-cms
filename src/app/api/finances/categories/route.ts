import { NextRequest, NextResponse } from "next/server";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(request, "finances:view");

  if (permission.response) {
    return permission.response;
  }

  const [givingCategories, expenseCategories, funds] = await prisma.$transaction([
    prisma.givingCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        publicId: true,
        name: true,
        slug: true,
        isRestricted: true,
      },
    }),
    prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        publicId: true,
        name: true,
        slug: true,
      },
    }),
    prisma.fund.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        targetCents: true,
      },
    }),
  ]);

  return NextResponse.json({
    givingCategories,
    expenseCategories,
    funds,
  });
}
