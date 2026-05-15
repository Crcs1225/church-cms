import { NextRequest, NextResponse } from "next/server";
import { apiError, getPagination, parseDate, splitFullName } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

function formatMember(member: {
  publicId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthday: Date | null;
  address: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  memberType: { name: string; slug: string } | null;
  contributions: { amountCents: number; receivedAt: Date }[];
}) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ");
  const totalGivingCents = member.contributions.reduce(
    (sum, contribution) => sum + contribution.amountCents,
    0,
  );
  const lastContribution = member.contributions[0] ?? null;

  return {
    publicId: member.publicId,
    fullName,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    birthday: member.birthday?.toISOString() ?? null,
    address: member.address,
    notes: member.notes,
    status: member.status,
    memberType: member.memberType,
    totalGivingCents,
    lastContribution: lastContribution
      ? {
          amountCents: lastContribution.amountCents,
          receivedAt: lastContribution.receivedAt.toISOString(),
        }
      : null,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(request, "members:view");

  if (permission.response) {
    return permission.response;
  }

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = getPagination(searchParams);
  const query = searchParams.get("query")?.trim();
  const status = searchParams.get("status")?.trim();
  const memberType = searchParams.get("memberType")?.trim();

  const where = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(memberType ? { memberType: { slug: memberType } } : {}),
    ...(query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : {}),
  };

  const [members, total] = await prisma.$transaction([
    prisma.member.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: pageSize,
      include: {
        memberType: {
          select: {
            name: true,
            slug: true,
          },
        },
        contributions: {
          orderBy: { receivedAt: "desc" },
          select: {
            amountCents: true,
            receivedAt: true,
          },
        },
      },
    }),
    prisma.member.count({ where }),
  ]);

  return NextResponse.json({
    members: members.map(formatMember),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const permission = await requireRequestPermission(request, "members:manage");

  if (permission.response) {
    return permission.response;
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const name = splitFullName("name" in body ? body.name : null);
  const email = "email" in body && typeof body.email === "string" ? body.email.trim() : "";
  const birthday = parseDate("birthday" in body ? body.birthday : null, null);
  const memberTypeSlug =
    "memberType" in body && typeof body.memberType === "string"
      ? body.memberType.trim()
      : "";

  if (!name) {
    return apiError("Full name is required.");
  }

  if (!email) {
    return apiError("Email address is required.");
  }

  if (birthday === null) {
    return apiError("Birthday must be a valid date.");
  }

  const memberType = memberTypeSlug
    ? await prisma.memberType.findUnique({
        where: { slug: memberTypeSlug },
        select: { id: true },
      })
    : null;

  if (memberTypeSlug && !memberType) {
    return apiError("Selected member type does not exist.", 404, "NOT_FOUND");
  }

  try {
    const member = await prisma.member.create({
      data: {
        firstName: name.firstName,
        lastName: name.lastName,
        email,
        phone:
          "phone" in body && typeof body.phone === "string"
            ? body.phone.trim() || null
            : null,
        birthday: birthday ?? null,
        address:
          "address" in body && typeof body.address === "string"
            ? body.address.trim() || null
            : null,
        notes:
          "notes" in body && typeof body.notes === "string"
            ? body.notes.trim() || null
            : null,
        memberTypeId: memberType?.id ?? null,
      },
      include: {
        memberType: {
          select: {
            name: true,
            slug: true,
          },
        },
        contributions: {
          select: {
            amountCents: true,
            receivedAt: true,
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "MEMBER_CREATE",
        entityType: "member",
        entityPublicId: member.publicId,
        description: `Created member ${member.firstName} ${member.lastName}`.trim(),
      },
    });

    return NextResponse.json({ member: formatMember(member) }, { status: 201 });
  } catch (error) {
    const prismaError = error as { code?: string } | null;

    if (prismaError?.code === "P2002") {
      return apiError("A member with this email already exists.", 409, "CONFLICT");
    }

    throw error;
  }
}
