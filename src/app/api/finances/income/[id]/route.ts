import { NextRequest, NextResponse } from "next/server";
import { apiError, parseAmountToCents, parseDate } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type IncomeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: IncomeRouteContext) {
  const permission = await requireRequestPermission(request, "finances:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;
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

  const [existingContribution, category, member] = await prisma.$transaction([
    prisma.contribution.findUnique({
      where: { publicId: id },
      select: { id: true, publicId: true },
    }),
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

  if (!existingContribution) {
    return apiError("Income record does not exist.", 404, "NOT_FOUND");
  }

  if (!category) {
    return apiError("Income category does not exist.", 404, "NOT_FOUND");
  }

  if (memberPublicId && !member) {
    return apiError("Member does not exist.", 404, "NOT_FOUND");
  }

  const contribution = await prisma.contribution.update({
    where: { publicId: id },
    data: {
      amountCents,
      categoryId: category.id,
      memberId: member?.id ?? null,
      receivedAt,
      paymentMethod:
        "paymentMethod" in body && typeof body.paymentMethod === "string"
          ? body.paymentMethod.trim() || "cash"
          : "cash",
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
      action: "INCOME_UPDATE",
      entityType: "contribution",
      entityPublicId: contribution.publicId,
      description: `Updated income of ${amountCents} cents.`,
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

  return NextResponse.json({
    contribution: {
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
    },
  });
}

export async function DELETE(request: NextRequest, { params }: IncomeRouteContext) {
  const permission = await requireRequestPermission(request, "finances:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;

  const contribution = await prisma.contribution.findUnique({
    where: { publicId: id },
    select: {
      publicId: true,
      amountCents: true,
    },
  });

  if (!contribution) {
    return apiError("Income record does not exist.", 404, "NOT_FOUND");
  }

  await prisma.contribution.delete({
    where: { publicId: id },
  });

  await prisma.activityLog.create({
    data: {
      action: "INCOME_DELETE",
      entityType: "contribution",
      entityPublicId: contribution.publicId,
      description: `Deleted income of ${contribution.amountCents} cents.`,
      metadataJson: JSON.stringify({
        amountCents: contribution.amountCents,
      }),
    },
  });

  return NextResponse.json({
    deleted: true,
  });
}
