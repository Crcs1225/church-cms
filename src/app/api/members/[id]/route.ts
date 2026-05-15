import { NextRequest, NextResponse } from "next/server";
import { apiError, parseDate, splitFullName } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function memberWhere(id: string) {
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    return { id: numericId };
  }

  return { publicId: id };
}

function formatMember(member: NonNullable<Awaited<ReturnType<typeof findMember>>>) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(" ");
  const totalGivingCents = member.contributions.reduce(
    (
      sum: number,
      contribution: { amountCents: number },
    ) => sum + contribution.amountCents,
    0,
  );

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
    contributions: member.contributions.map((contribution: (typeof member.contributions)[number]) => ({
      publicId: contribution.publicId,
      amountCents: contribution.amountCents,
      paymentMethod: contribution.paymentMethod,
      receivedAt: contribution.receivedAt.toISOString(),
      reference: contribution.reference,
      category: contribution.category,
    })),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

function findMember(id: string) {
  return prisma.member.findFirst({
    where: {
      ...memberWhere(id),
      deletedAt: null,
    },
    include: {
      memberType: {
        select: {
          name: true,
          slug: true,
        },
      },
      contributions: {
        orderBy: { receivedAt: "desc" },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(_request, "members:view");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const member = await findMember(id);

  if (!member) {
    return apiError("Member was not found.", 404, "NOT_FOUND");
  }

  return NextResponse.json({ member: formatMember(member) });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(request, "members:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const existing = await prisma.member.findFirst({
    where: {
      ...memberWhere(id),
      deletedAt: null,
    },
    select: { id: true, publicId: true },
  });

  if (!existing) {
    return apiError("Member was not found.", 404, "NOT_FOUND");
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const data: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    birthday?: Date | null;
    address?: string | null;
    notes?: string | null;
    status?: string;
    memberTypeId?: number | null;
  } = {};

  if ("name" in body) {
    const name = splitFullName(body.name);

    if (!name) {
      return apiError("Full name must not be empty.");
    }

    data.firstName = name.firstName;
    data.lastName = name.lastName;
  }

  if ("email" in body) {
    data.email = typeof body.email === "string" ? body.email.trim() || null : null;
  }

  if ("phone" in body) {
    data.phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
  }

  if ("birthday" in body) {
    const birthday = parseDate(body.birthday, null);

    if (birthday === null && body.birthday) {
      return apiError("Birthday must be a valid date.");
    }

    data.birthday = birthday;
  }

  if ("address" in body) {
    data.address =
      typeof body.address === "string" ? body.address.trim() || null : null;
  }

  if ("notes" in body) {
    data.notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
  }

  if ("status" in body && typeof body.status === "string") {
    data.status = body.status.trim() || "active";
  }

  if ("memberType" in body) {
    const slug =
      typeof body.memberType === "string" ? body.memberType.trim() : "";
    const memberType = slug
      ? await prisma.memberType.findUnique({
          where: { slug },
          select: { id: true },
        })
      : null;

    if (slug && !memberType) {
      return apiError("Selected member type does not exist.", 404, "NOT_FOUND");
    }

    data.memberTypeId = memberType?.id ?? null;
  }

  const member = await prisma.member.update({
    where: { id: existing.id },
    data,
    include: {
      memberType: {
        select: {
          name: true,
          slug: true,
        },
      },
      contributions: {
        orderBy: { receivedAt: "desc" },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "MEMBER_UPDATE",
      entityType: "member",
      entityPublicId: existing.publicId,
      description: `Updated member ${member.firstName} ${member.lastName}`.trim(),
    },
  });

  return NextResponse.json({ member: formatMember(member) });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const permission = await requireRequestPermission(request, "members:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await context.params;
  const existing = await prisma.member.findFirst({
    where: {
      ...memberWhere(id),
      deletedAt: null,
    },
    select: { id: true, publicId: true, firstName: true, lastName: true },
  });

  if (!existing) {
    return apiError("Member was not found.", 404, "NOT_FOUND");
  }

  await prisma.member.update({
    where: { id: existing.id },
    data: {
      status: "archived",
      deletedAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "MEMBER_ARCHIVE",
      entityType: "member",
      entityPublicId: existing.publicId,
      description: `Archived member ${existing.firstName} ${existing.lastName}`.trim(),
    },
  });

  return NextResponse.json({ ok: true });
}
