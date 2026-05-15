import { FinancePrintReport, formatCurrency, formatDate } from "@/components/finance";
import { getChurchSettings } from "@/lib/church-settings";
import { buildContributionWhere, getNormalizedDateRange } from "@/lib/finance-filters";
import { prisma } from "@/lib/prisma";
import { getReportSignatories } from "@/lib/report-signatories";

type FinanceIncomePrintPageProps = {
  searchParams: Promise<{
    member?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

function buildFilterLabels({
  member,
  category,
  dateFrom,
  dateTo,
}: {
  member?: string;
  category?: string;
  dateFrom: string;
  dateTo: string;
}) {
  const labels = ["Scope: Income"];

  if (member?.trim()) {
    labels.push(`Member: ${member.trim()}`);
  }

  if (category?.trim()) {
    labels.push(`Category: ${category.trim()}`);
  }

  if (dateFrom || dateTo) {
    labels.push(`Dates: ${dateFrom || "Start"} to ${dateTo || "Now"}`);
  }

  return labels;
}

export default async function FinanceIncomePrintPage({
  searchParams,
}: FinanceIncomePrintPageProps) {
  const { member, category, dateFrom, dateTo } = await searchParams;
  const dateRange = getNormalizedDateRange(dateFrom, dateTo);
  const where = buildContributionWhere({
    memberQuery: member,
    categorySlug: category,
    dateFrom,
    dateTo,
  });

  const [churchSettings, signatories, [contributions, totalAmount, groupedCategories]] = await Promise.all([
    getChurchSettings(),
    getReportSignatories(),
    prisma.$transaction([
      prisma.contribution.findMany({
        where,
        orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
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
      prisma.contribution.aggregate({
        where,
        _sum: {
          amountCents: true,
        },
      }),
      prisma.contribution.groupBy({
        by: ["categoryId"],
        where,
        _sum: {
          amountCents: true,
        },
        orderBy: {
          _sum: {
            amountCents: "desc",
          },
        },
      }),
    ]),
  ]);

  const categoryIds = groupedCategories.map(
    (entry: { categoryId: number }) => entry.categoryId,
  );
  const categories = categoryIds.length
    ? await prisma.givingCategory.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      })
    : [];
  const categoriesById = new Map(
    categories.map((item: { id: number; name: string }) => [item.id, item]),
  );
  const topCategory = groupedCategories
    .map((entry: { categoryId: number; _sum?: { amountCents?: number | null } | null }) => ({
      category: categoriesById.get(entry.categoryId) ?? null,
      amountCents: entry._sum?.amountCents ?? 0,
    }))
    .find((entry: { category: { id: number; name: string } | null; amountCents: number }) => entry.category !== null);
  const totalAmountCents = totalAmount._sum.amountCents ?? 0;

  return (
    <FinancePrintReport
      title="Income Print Report"
      subtitle="A print-optimized contribution report for review, filing, and PDF export."
      generatedAt={formatDate(new Date())}
      filters={buildFilterLabels({
        member,
        category,
        dateFrom: dateRange.dateFromValue,
        dateTo: dateRange.dateToValue,
      })}
      summaries={[
        {
          label: "Matching Income",
          value: formatCurrency(totalAmountCents),
          caption:
            contributions.length === 1
              ? "1 contribution matched these filters"
              : `${contributions.length} contributions matched these filters`,
        },
        {
          label: "Latest Contribution",
          value: contributions[0]
            ? formatCurrency(contributions[0].amountCents)
            : formatCurrency(0),
          caption: contributions[0]
            ? `${contributions[0].member ? [contributions[0].member.firstName, contributions[0].member.lastName].filter(Boolean).join(" ") : "Anonymous giver"} on ${formatDate(contributions[0].receivedAt)}`
            : "No matching contribution found.",
        },
        {
          label: "Top Income Source",
          value: formatCurrency(topCategory?.amountCents ?? 0),
          caption: topCategory?.category
            ? `${topCategory.category.name} at ${totalAmountCents > 0 ? Math.round(((topCategory.amountCents ?? 0) / totalAmountCents) * 100) : 0}% of matching income`
            : "No income category matched.",
        },
      ]}
      columns={[
        "Date",
        "Public ID",
        "Member",
        "Category",
        "Payment",
        "Amount",
      ]}
      rows={contributions.map((contribution: (typeof contributions)[number]) => [
        formatDate(contribution.receivedAt),
        contribution.publicId,
        contribution.member
          ? [contribution.member.firstName, contribution.member.lastName]
              .filter(Boolean)
              .join(" ")
          : "Anonymous giver",
        contribution.category.name,
        contribution.paymentMethod,
        formatCurrency(contribution.amountCents),
      ])}
      signatories={signatories}
      organizationName={churchSettings.churchName}
      logoPath={churchSettings.logoPath}
    />
  );
}
