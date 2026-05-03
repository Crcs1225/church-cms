import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
