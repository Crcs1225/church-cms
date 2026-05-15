import { NextRequest } from "next/server";
import { requireRequestPermission } from "@/lib/admin-access";
import { buildCsv, csvResponse } from "@/lib/csv";
import { buildContributionWhere } from "@/lib/finance-filters";
import { prisma } from "@/lib/prisma";

function getDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(request, "finances:export");

  if (permission.response) {
    return permission.response;
  }

  const { searchParams } = new URL(request.url);
  const where = buildContributionWhere({
    memberQuery: searchParams.get("member"),
    categorySlug: searchParams.get("category"),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
  });

  const contributions = await prisma.contribution.findMany({
    where,
    orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
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
        },
      },
    },
  });

  const csv = buildCsv(
    [
      "publicId",
      "receivedAt",
      "amount",
      "amountCents",
      "paymentMethod",
      "category",
      "categorySlug",
      "memberPublicId",
      "memberName",
      "memberEmail",
      "reference",
      "notes",
    ],
    contributions.map((contribution: (typeof contributions)[number]) => [
      contribution.publicId,
      contribution.receivedAt.toISOString(),
      (contribution.amountCents / 100).toFixed(2),
      contribution.amountCents,
      contribution.paymentMethod,
      contribution.category.name,
      contribution.category.slug,
      contribution.member?.publicId ?? "",
      contribution.member
        ? [contribution.member.firstName, contribution.member.lastName]
            .filter(Boolean)
            .join(" ")
        : "Anonymous giver",
      contribution.member?.email ?? "",
      contribution.reference ?? "",
      contribution.notes ?? "",
    ]),
  );

  return csvResponse(`income-export-${getDateStamp()}.csv`, csv);
}
