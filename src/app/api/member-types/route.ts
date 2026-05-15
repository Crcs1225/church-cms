import { NextRequest, NextResponse } from "next/server";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(request, "members:view");

  if (permission.response) {
    return permission.response;
  }

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
