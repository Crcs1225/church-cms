import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { NextRequest, NextResponse } from "next/server";
import {
  apiError,
  getPagination,
  parseAmountToCents,
  parseDate,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

function formatContribution(contribution: {
  publicId: string;
  amountCents: number;
  paymentMethod: string;
  receivedAt: Date;
  reference: string | null;
  notes: string | null;
  member: { publicId: string; firstName: string; lastName: string; email: string | null } | null;
  category: { name: string; slug: string; isRestricted: boolean };
}) {
  return {
    publicId: contribution.publicId,
    amountCents: contribution.amountCents,
    paymentMethod: contribution.paymentMethod,
    receivedAt: contribution.receivedAt.toISOString(),
    reference: contribution.reference,
    notes: contribution.notes,
    member: contribution.member
      ? {
          publicId: contribution.member.publicId,
          fullName: [
            contribution.member.firstName,
            contribution.member.lastName,
          ]
            .filter(Boolean)
            .join(" "),
          email: contribution.member.email,
        }
      : null,
    category: contribution.category,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = getPagination(searchParams);
  const category = searchParams.get("category")?.trim();
  const member = searchParams.get("member")?.trim();

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(member
      ? {
          OR: [
            { publicId: { contains: member } },
            {
              member: {
                OR: [
                  { publicId: { contains: member } },
                  { firstName: { contains: member } },
                  { lastName: { contains: member } },
                  { email: { contains: member } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [contributions, total] = await prisma.$transaction([
    prisma.contribution.findMany({
      where,
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      skip,
      take: pageSize,
      include: {
        member: {
          select: {
            publicId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            isRestricted: true,
          },
        },
      },
    }),
    prisma.contribution.count({ where }),
  ]);

  return NextResponse.json({
    contributions: contributions.map(formatContribution),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const amountCents = parseAmountToCents("amount" in body ? body.amount : null);
  const categorySlug =
    "category" in body && typeof body.category === "string"
      ? body.category.trim()
      : "";
  const receivedAt = parseDate("receivedAt" in body ? body.receivedAt : null);
  const memberPublicId =
    "memberPublicId" in body && typeof body.memberPublicId === "string"
      ? body.memberPublicId.trim()
      : "";

  if (!amountCents) {
    return apiError("Income amount must be greater than zero.");
  }

  if (!categorySlug) {
    return apiError("Income category is required.");
  }

  if (!receivedAt) {
    return apiError("Income date must be valid.");
  }

  const [category, member] = await prisma.$transaction([
    prisma.givingCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    }),
    memberPublicId
      ? prisma.member.findUnique({
          where: { publicId: memberPublicId },
          select: {
            id: true,
            publicId: true,
            firstName: true,
            lastName: true,
          },
        })
      : prisma.member.findFirst({
          where: { id: -1 },
          select: {
            id: true,
            publicId: true,
            firstName: true,
            lastName: true,
          },
        }),
  ]);

  if (!category) {
    return apiError("Income category does not exist.", 404, "NOT_FOUND");
  }

  if (memberPublicId && !member) {
    return apiError("Member does not exist.", 404, "NOT_FOUND");
  }

  try {
    const contribution = await prisma.contribution.create({
      data: {
        amountCents,
        categoryId: category.id,
        memberId: member?.id ?? null,
        receivedAt,
        paymentMethod:
          "paymentMethod" in body && typeof body.paymentMethod === "string"
            ? body.paymentMethod.trim() || "cash"
            : "cash",
        reference:
          "reference" in body && typeof body.reference === "string"
            ? body.reference.trim() || null
            : null,
        notes:
          "notes" in body && typeof body.notes === "string"
            ? body.notes.trim() || null
            : null,
      },
      include: {
        member: {
          select: {
            publicId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            isRestricted: true,
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "INCOME_CREATE",
        entityType: "contribution",
        entityPublicId: contribution.publicId,
        description: member
          ? `Recorded income of ${amountCents} cents for ${[
              member.firstName,
              member.lastName,
            ]
              .filter(Boolean)
              .join(" ")}.`
          : `Recorded income of ${amountCents} cents.`,
        metadataJson: JSON.stringify({
          amountCents,
          category: contribution.category.slug,
          memberId: member?.id ?? null,
          memberPublicId: member?.publicId ?? null,
          memberName: member
            ? [member.firstName, member.lastName].filter(Boolean).join(" ")
            : null,
        }),
      },
    });

    return NextResponse.json(
      { contribution: formatContribution(contribution) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return apiError("Unable to record income.", 400);
    }

    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || !("publicIds" in body) || !Array.isArray(body.publicIds)) {
    return apiError("A list of contribution public IDs is required for bulk delete.");
  }

  const rawPublicIds: unknown[] = body.publicIds;

  const publicIds = rawPublicIds
    .filter((value: unknown): value is string => typeof value === "string")
    .map((value: string) => value.trim())
    .filter(Boolean);

  if (publicIds.length === 0) {
    return apiError("Select at least one contribution to delete.");
  }

  const deleted = await prisma.contribution.deleteMany({
    where: {
      publicId: {
        in: publicIds,
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "INCOME_BULK_DELETE",
      entityType: "contribution",
      description: `Deleted ${deleted.count} income records.`,
      metadataJson: JSON.stringify({
        publicIds,
        deletedCount: deleted.count,
      }),
    },
  });

  return NextResponse.json({
    deletedCount: deleted.count,
  });
}
