import { FinancePrintReport, formatCurrency, formatDate } from "@/components/finance";
import { getChurchSettings } from "@/lib/church-settings";
import { buildExpenseWhere, getNormalizedDateRange } from "@/lib/finance-filters";
import { prisma } from "@/lib/prisma";
import { getReportSignatories } from "@/lib/report-signatories";

type FinanceExpensesPrintPageProps = {
  searchParams: Promise<{
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

function buildFilterLabels({
  category,
  dateFrom,
  dateTo,
}: {
  category?: string;
  dateFrom: string;
  dateTo: string;
}) {
  const labels = ["Scope: Expenses"];

  if (category?.trim()) {
    labels.push(`Category: ${category.trim()}`);
  }

  if (dateFrom || dateTo) {
    labels.push(`Dates: ${dateFrom || "Start"} to ${dateTo || "Now"}`);
  }

  return labels;
}

export default async function FinanceExpensesPrintPage({
  searchParams,
}: FinanceExpensesPrintPageProps) {
  const { category, dateFrom, dateTo } = await searchParams;
  const dateRange = getNormalizedDateRange(dateFrom, dateTo);
  const where = buildExpenseWhere({
    categorySlug: category,
    dateFrom,
    dateTo,
  });

  const [churchSettings, signatories, [expenses, totalAmount, groupedCategories]] = await Promise.all([
    getChurchSettings(),
    getReportSignatories(),
    prisma.$transaction([
      prisma.expense.findMany({
        where,
        orderBy: [{ paidAt: "desc" }, { id: "desc" }],
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.expense.aggregate({
        where,
        _sum: {
          amountCents: true,
        },
      }),
      prisma.expense.groupBy({
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
    ? await prisma.expenseCategory.findMany({
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
      title="Expense Print Report"
      subtitle="A print-optimized expense report for approvals, filing, and PDF export."
      generatedAt={formatDate(new Date())}
      filters={buildFilterLabels({
        category,
        dateFrom: dateRange.dateFromValue,
        dateTo: dateRange.dateToValue,
      })}
      summaries={[
        {
          label: "Matching Expenses",
          value: formatCurrency(totalAmountCents),
          caption:
            expenses.length === 1
              ? "1 expense matched these filters"
              : `${expenses.length} expenses matched these filters`,
        },
        {
          label: "Latest Expense",
          value: expenses[0] ? formatCurrency(expenses[0].amountCents) : formatCurrency(0),
          caption: expenses[0]
            ? `${expenses[0].description} on ${formatDate(expenses[0].paidAt)}`
            : "No matching expense found.",
        },
        {
          label: "Top Expense Category",
          value: formatCurrency(topCategory?.amountCents ?? 0),
          caption: topCategory?.category
            ? `${topCategory.category.name} at ${totalAmountCents > 0 ? Math.round(((topCategory.amountCents ?? 0) / totalAmountCents) * 100) : 0}% of matching expenses`
            : "No expense category matched.",
        },
      ]}
      columns={[
        "Date",
        "Public ID",
        "Category",
        "Description",
        "Vendor",
        "Amount",
      ]}
      rows={expenses.map((expense: (typeof expenses)[number]) => [
        formatDate(expense.paidAt),
        expense.publicId,
        expense.category.name,
        expense.description,
        expense.vendor ?? "N/A",
        formatCurrency(expense.amountCents),
      ])}
      signatories={signatories}
      organizationName={churchSettings.churchName}
      logoPath={churchSettings.logoPath}
    />
  );
}
