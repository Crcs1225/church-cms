import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function getContributionBadgeClassName(slug: string) {
  if (slug === "tithe") {
    return "bg-orange-100 text-orange-800 border-orange-200";
  }

  if (slug === "offering") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (slug === "missions" || slug === "pledge") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  return "bg-stone-200 text-stone-800 border-stone-300";
}

export type FinanceIncomeFilters = {
  memberQuery?: string;
  categorySlug?: string;
};

export type IncomeTableRow = {
  publicId: string;
  memberName: string;
  memberPublicId: string | null;
  type: string;
  categorySlug: string;
  badgeClassName: string;
  amount: string;
  amountValue: string;
  date: string;
  receivedAtValue: string;
  paymentMethod: string;
};

export type FinanceIncomePageData = {
  rows: IncomeTableRow[];
  totalRows: number;
};

export async function getFinanceIncomePageData({
  memberQuery,
  categorySlug,
}: FinanceIncomeFilters = {}): Promise<FinanceIncomePageData> {
  const normalizedMemberQuery = memberQuery?.trim() ?? "";
  const normalizedCategorySlug = categorySlug?.trim() ?? "";

  const where = {
    ...(normalizedCategorySlug ? { category: { slug: normalizedCategorySlug } } : {}),
    ...(normalizedMemberQuery
      ? {
          OR: [
            { publicId: { contains: normalizedMemberQuery } },
            {
              member: {
                is: {
                  OR: [
                    { publicId: { contains: normalizedMemberQuery } },
                    { firstName: { contains: normalizedMemberQuery } },
                    { lastName: { contains: normalizedMemberQuery } },
                    { email: { contains: normalizedMemberQuery } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const [contributions, totalRows] = await prisma.$transaction([
    prisma.contribution.findMany({
      where,
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      take: 25,
      include: {
        member: {
          select: {
            publicId: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.contribution.count({ where }),
  ]);

  return {
    rows: contributions.map((contribution) => ({
      publicId: contribution.publicId,
      memberName: contribution.member
        ? [contribution.member.firstName, contribution.member.lastName]
            .filter(Boolean)
            .join(" ")
        : "Anonymous giver",
      memberPublicId: contribution.member?.publicId ?? null,
      type: contribution.category.name,
      categorySlug: contribution.category.slug,
      badgeClassName: getContributionBadgeClassName(contribution.category.slug),
      amount: formatCurrency(contribution.amountCents),
      date: formatDate(contribution.receivedAt),
      amountValue: (contribution.amountCents / 100).toFixed(2),
      receivedAtValue: contribution.receivedAt.toISOString().slice(0, 10),
      paymentMethod: contribution.paymentMethod,
    })),
    totalRows,
  };
}
