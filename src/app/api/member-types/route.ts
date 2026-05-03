import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const memberTypes = await prisma.memberType.findMany({
    orderBy: { name: "asc" },
    select: {
      publicId: true,
      name: true,
      slug: true,
    },
  });

  return NextResponse.json({ memberTypes });
}
