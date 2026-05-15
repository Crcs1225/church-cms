import { prisma } from "@/lib/prisma";
import {
  buildContributionWhere,
  buildExpenseWhere,
  getNormalizedDateRange,
} from "@/lib/finance-filters";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type SummedAmountEntry = {
  categoryId: number;
  _sum?: {
    amountCents?: number | null;
  } | null;
};

type NamedCategory = {
  id: number;
  name: string;
  slug?: string;
};

type FundWithAllocations = {
  publicId: string;
  name: string;
  targetCents: number | null;
  allocations: Array<{
    amountCents: number;
  }>;
};

type RecentTransactionDraft = {
  publicId: string;
  type: "income" | "expense";
  date: string;
  description: string;
  category: string;
  amount: string;
  amountClassName: string;
  iconKey: "income" | "utilities" | "outreach" | "general";
  sortKey: number;
};

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatMonthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
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

export type FinanceFilterOption = {
  value: string;
  label: string;
};

export type FinanceIncomeFilters = {
  memberQuery?: string;
  categorySlug?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
};

export type FinanceExpensesFilters = {
  categorySlug?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
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

export type FinanceTablePagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
};

export type FinanceIncomePageData = {
  matchingIncome: string;
  matchingIncomeCountLabel: string;
  latestContributionAmount: string;
  latestContributionCaption: string;
  topCategoryValue: string;
  topCategoryLabel: string;
  topCategorySharePercent: number;
  categories: FinanceFilterOption[];
  dateFromValue: string;
  dateToValue: string;
  rows: IncomeTableRow[];
  pagination: FinanceTablePagination;
};

export type FinanceReportMonth = {
  key: string;
  label: string;
  incomeCents: number;
  expenseCents: number;
};

export type FinanceReportFundRow = {
  publicId: string;
  name: string;
  targetCents: number | null;
  allocatedCents: number;
};

export type FinanceReportsPageData = {
  totalIncomeCents: number;
  totalExpenseCents: number;
  netCents: number;
  currentMonthIncomeCents: number;
  currentMonthExpenseCents: number;
  currentMonthNetCents: number;
  previousMonthNetCents: number;
  previousMonthLabel: string;
  months: FinanceReportMonth[];
  funds: FinanceReportFundRow[];
  topIncomeCategory: {
    name: string;
    amountCents: number;
    sharePercent: number;
  } | null;
  periodStartLabel: string;
  periodEndLabel: string;
};

export type FinanceReportsSummaryData = Pick<
  FinanceReportsPageData,
  | "totalIncomeCents"
  | "totalExpenseCents"
  | "netCents"
  | "currentMonthIncomeCents"
  | "currentMonthExpenseCents"
  | "currentMonthNetCents"
  | "previousMonthNetCents"
  | "previousMonthLabel"
  | "topIncomeCategory"
  | "periodStartLabel"
  | "periodEndLabel"
>;

export type FinanceReportsTrendData = Pick<FinanceReportsPageData, "months">;

export type FinanceReportsFundsData = Pick<
  FinanceReportsPageData,
  "funds" | "totalExpenseCents"
>;

export type FinanceOverviewTransaction = {
  publicId: string;
  type: "income" | "expense";
  date: string;
  description: string;
  category: string;
  amount: string;
  amountClassName: string;
  iconKey: "income" | "utilities" | "outreach" | "general";
};

export type FinanceOverviewPageData = {
  totalIncome: string;
  totalExpenses: string;
  netBalance: string;
  incomeTrendPercent: number;
  expenseTrendPercent: number;
  netStatusLabel: string;
  netStatusTone: "success" | "warning";
  months: FinanceReportMonth[];
  fundProgress: Array<{
    publicId: string;
    label: string;
    progress: number;
  }>;
  recentTransactions: FinanceOverviewTransaction[];
};

export type FinanceExpensesPageData = {
  operationalCosts: string;
  matchingCountLabel: string;
  utilitySpend: string;
  utilitySharePercent: number;
  topExpenseCategoryLabel: string;
  topExpenseCategoryValue: string;
  topExpenseCategorySharePercent: number;
  maintenanceSpend: string;
  maintenanceSharePercent: number;
  categories: FinanceFilterOption[];
  dateFromValue: string;
  dateToValue: string;
};

export type ExpenseTableRow = {
  publicId: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  vendor: string | null;
  amount: string;
  amountValue: string;
  date: string;
  paidAtValue: string;
  reference: string | null;
};

export type FinanceExpensesTableData = {
  rows: ExpenseTableRow[];
  pagination: FinanceTablePagination;
};

export type FinanceExpensesViewData = FinanceExpensesPageData &
  FinanceExpensesTableData;

function mapFinanceFilterOptions(categories: NamedCategory[]) {
  return categories.map((category: NamedCategory) => ({
    value: category.slug ?? "",
    label: category.name,
  }));
}

function mapIncomeRows(
  contributions: Array<{
    publicId: string;
    amountCents: number;
    receivedAt: Date;
    paymentMethod: string;
    member: {
      publicId: string;
      firstName: string;
      lastName: string;
    } | null;
    category: {
      name: string;
      slug: string;
    };
  }>,
): IncomeTableRow[] {
  return contributions.map((contribution) => ({
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
  }));
}

function mapExpenseRows(
  expenses: Array<{
    publicId: string;
    description: string;
    vendor: string | null;
    amountCents: number;
    paidAt: Date;
    reference: string | null;
    category: {
      name: string;
      slug: string;
    };
  }>,
): ExpenseTableRow[] {
  return expenses.map((expense) => ({
    publicId: expense.publicId,
    categoryName: expense.category.name,
    categorySlug: expense.category.slug,
    description: expense.description,
    vendor: expense.vendor,
    amount: formatCurrency(expense.amountCents),
    amountValue: (expense.amountCents / 100).toFixed(2),
    date: formatDate(expense.paidAt),
    paidAtValue: expense.paidAt.toISOString().slice(0, 10),
    reference: expense.reference,
  }));
}

async function findIncomeRows(
  where: ReturnType<typeof buildContributionWhere>,
  page: number,
  pageSize: number,
) {
  return prisma.contribution.findMany({
    where,
    orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
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
  });
}

async function findExpenseRows(
  where: ReturnType<typeof buildExpenseWhere>,
  page: number,
  pageSize: number,
) {
  return prisma.expense.findMany({
    where,
    orderBy: [{ paidAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}

function normalizePage(value: number | undefined) {
  if (!Number.isFinite(value) || !value) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function normalizePageSize(value: number | undefined) {
  if (!Number.isFinite(value) || !value) {
    return 20;
  }

  return Math.min(100, Math.max(1, Math.floor(value)));
}

export async function getFinanceIncomePageData({
  memberQuery,
  categorySlug,
  dateFrom,
  dateTo,
  page,
  pageSize,
}: FinanceIncomeFilters & {
  page?: number;
  pageSize?: number;
} = {}): Promise<FinanceIncomePageData> {
  const dateRange = getNormalizedDateRange(dateFrom, dateTo);
  const where = buildContributionWhere({
    memberQuery,
    categorySlug,
    dateFrom,
    dateTo,
  });
  const currentPage = normalizePage(page);
  const currentPageSize = normalizePageSize(pageSize);

  const [
    totalRows,
    incomeTotal,
    latestContribution,
    groupedCategories,
    categories,
  ] = await prisma.$transaction([
    prisma.contribution.count({ where }),
    prisma.contribution.aggregate({
      where,
      _sum: { amountCents: true },
    }),
    prisma.contribution.findFirst({
      where,
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.contribution.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amountCents: true },
      orderBy: {
        _sum: {
          amountCents: "desc",
        },
      },
    }),
    prisma.givingCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(totalRows / currentPageSize));
  const safePage = Math.min(currentPage, pageCount);
  const contributions = await findIncomeRows(where, safePage, currentPageSize);

  const matchingIncomeCents = incomeTotal._sum.amountCents ?? 0;
  const categoriesById = new Map(
    categories.map((category: NamedCategory) => [category.id, category]),
  );
  const topCategory = groupedCategories
    .map((entry: SummedAmountEntry) => ({
      category: categoriesById.get(entry.categoryId) ?? null,
      amountCents: entry._sum?.amountCents ?? 0,
    }))
    .find((entry: { category: NamedCategory | null; amountCents: number }) => entry.category !== null);
  const latestContributionMemberName = latestContribution?.member
    ? [latestContribution.member.firstName, latestContribution.member.lastName]
        .filter(Boolean)
        .join(" ")
    : "Anonymous giver";

  return {
    matchingIncome: formatCurrency(matchingIncomeCents),
    matchingIncomeCountLabel:
      totalRows === 1 ? "1 matching contribution" : `${totalRows} matching contributions`,
    latestContributionAmount: latestContribution
      ? formatCurrency(latestContribution.amountCents)
      : formatCurrency(0),
    latestContributionCaption: latestContribution
      ? `${latestContributionMemberName} on ${formatDate(latestContribution.receivedAt)}`
      : "No contributions matched these filters yet.",
    topCategoryValue: formatCurrency(topCategory?.amountCents ?? 0),
    topCategoryLabel: topCategory?.category?.name ?? "No income source yet",
    topCategorySharePercent:
      matchingIncomeCents > 0
        ? Math.round(((topCategory?.amountCents ?? 0) / matchingIncomeCents) * 100)
        : 0,
    categories: mapFinanceFilterOptions(categories),
    dateFromValue: dateRange.dateFromValue,
    dateToValue: dateRange.dateToValue,
    rows: mapIncomeRows(contributions),
    pagination: {
      page: safePage,
      pageSize: currentPageSize,
      pageCount,
      totalRows,
    },
  };
}

export async function getFinanceReportsSummaryData(): Promise<FinanceReportsSummaryData> {
  const anchorDate = new Date();
  const currentMonthStart = startOfMonth(anchorDate);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const sixMonthStart = addMonths(currentMonthStart, -5);

  const [
    incomeTotal,
    expenseTotal,
    incomeByCategory,
    currentMonthIncome,
    currentMonthExpenses,
    previousMonthIncome,
    previousMonthExpenses,
  ] = await prisma.$transaction([
    prisma.contribution.aggregate({
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      _sum: { amountCents: true },
    }),
    prisma.contribution.groupBy({
      by: ["categoryId"],
      where: {
        receivedAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      orderBy: {
        categoryId: "asc",
      },
      _sum: {
        amountCents: true,
      },
    }),
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        paidAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        paidAt: {
          gte: previousMonthStart,
          lt: currentMonthStart,
        },
      },
      _sum: { amountCents: true },
    }),
  ]);

  const categoryIds = incomeByCategory.map((entry: SummedAmountEntry) => entry.categoryId);
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
    categories.map((category: NamedCategory) => [category.id, category]),
  );

  const totalIncomeCents = incomeTotal._sum.amountCents ?? 0;
  const totalExpenseCents = expenseTotal._sum.amountCents ?? 0;
  const currentMonthIncomeCents = currentMonthIncome._sum.amountCents ?? 0;
  const currentMonthExpenseCents = currentMonthExpenses._sum.amountCents ?? 0;
  const previousMonthIncomeCents = previousMonthIncome._sum.amountCents ?? 0;
  const previousMonthExpenseCents = previousMonthExpenses._sum.amountCents ?? 0;
  const currentMonthNetCents = currentMonthIncomeCents - currentMonthExpenseCents;
  const previousMonthNetCents = previousMonthIncomeCents - previousMonthExpenseCents;

  const topIncomeCategoryEntry = incomeByCategory
    .map((entry: SummedAmountEntry) => ({
      category: categoriesById.get(entry.categoryId) ?? null,
      amountCents: entry._sum?.amountCents ?? 0,
    }))
    .sort(
      (
        left: { category: NamedCategory | null; amountCents: number },
        right: { category: NamedCategory | null; amountCents: number },
      ) => right.amountCents - left.amountCents,
    )[0];

  return {
    totalIncomeCents,
    totalExpenseCents,
    netCents: totalIncomeCents - totalExpenseCents,
    currentMonthIncomeCents,
    currentMonthExpenseCents,
    currentMonthNetCents,
    previousMonthNetCents,
    previousMonthLabel: formatMonthLabel(previousMonthStart),
    topIncomeCategory:
      topIncomeCategoryEntry && topIncomeCategoryEntry.category
        ? {
            name: topIncomeCategoryEntry.category.name,
            amountCents: topIncomeCategoryEntry.amountCents,
            sharePercent:
              currentMonthIncomeCents > 0
                ? Math.round((topIncomeCategoryEntry.amountCents / currentMonthIncomeCents) * 100)
                : totalIncomeCents > 0
                  ? Math.round((topIncomeCategoryEntry.amountCents / totalIncomeCents) * 100)
                  : 0,
          }
        : null,
    periodStartLabel: formatDate(sixMonthStart),
    periodEndLabel: formatDate(new Date(nextMonthStart.getTime() - 1)),
  };
}

export async function getFinanceReportsTrendData(): Promise<FinanceReportsTrendData> {
  const anchorDate = new Date();
  const currentMonthStart = startOfMonth(anchorDate);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const sixMonthStart = addMonths(currentMonthStart, -5);
  const [monthlyIncome, monthlyExpenses] = await prisma.$transaction([
    prisma.contribution.findMany({
      where: {
        receivedAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amountCents: true,
        receivedAt: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        paidAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = addMonths(sixMonthStart, index);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
      incomeCents: 0,
      expenseCents: 0,
    };
  });

  const monthIndex = new Map(months.map((month) => [month.key, month]));

  for (const contribution of monthlyIncome) {
    const key = `${contribution.receivedAt.getFullYear()}-${contribution.receivedAt.getMonth()}`;
    const month = monthIndex.get(key);

    if (month) {
      month.incomeCents += contribution.amountCents;
    }
  }

  for (const expense of monthlyExpenses) {
    const key = `${expense.paidAt.getFullYear()}-${expense.paidAt.getMonth()}`;
    const month = monthIndex.get(key);

    if (month) {
      month.expenseCents += expense.amountCents;
    }
  }

  return {
    months,
  };
}

export async function getFinanceReportsFundsData(): Promise<FinanceReportsFundsData> {
  const [funds, expenseTotal] = await prisma.$transaction([
    prisma.fund.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      include: {
        allocations: {
          select: {
            amountCents: true,
          },
        },
      },
    }),
    prisma.expense.aggregate({
      _sum: { amountCents: true },
    }),
  ]);

  return {
    totalExpenseCents: expenseTotal._sum.amountCents ?? 0,
    funds: funds.map((fund: FundWithAllocations) => ({
      publicId: fund.publicId,
      name: fund.name,
      targetCents: fund.targetCents,
      allocatedCents: fund.allocations.reduce(
        (sum: number, allocation: { amountCents: number }) => sum + allocation.amountCents,
        0,
      ),
    })),
  };
}

export async function getFinanceReportsPageData(): Promise<FinanceReportsPageData> {
  const [summaryData, trendData, fundsData] = await Promise.all([
    getFinanceReportsSummaryData(),
    getFinanceReportsTrendData(),
    getFinanceReportsFundsData(),
  ]);

  return {
    ...summaryData,
    ...trendData,
    ...fundsData,
  };
}

export { formatCurrency, formatDate };

export async function getFinanceOverviewPageData(): Promise<FinanceOverviewPageData> {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const currentThirtyDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  const previousThirtyDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59);
  const previousThirtyDayEnd = currentThirtyDayStart;
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const sixMonthStart = addMonths(currentMonthStart, -5);

  const [
    currentIncome,
    previousIncome,
    currentExpenses,
    previousExpenses,
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    funds,
    recentIncome,
    recentExpenses,
  ] = await prisma.$transaction([
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: currentThirtyDayStart,
          lt: tomorrow,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: previousThirtyDayStart,
          lt: previousThirtyDayEnd,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        paidAt: {
          gte: currentThirtyDayStart,
          lt: tomorrow,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        paidAt: {
          gte: previousThirtyDayStart,
          lt: previousThirtyDayEnd,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.contribution.aggregate({
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      _sum: { amountCents: true },
    }),
    prisma.contribution.findMany({
      where: {
        receivedAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amountCents: true,
        receivedAt: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        paidAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    }),
    prisma.fund.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      include: {
        allocations: {
          select: {
            amountCents: true,
          },
        },
      },
      take: 3,
    }),
    prisma.contribution.findMany({
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      take: 5,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.expense.findMany({
      orderBy: [{ paidAt: "desc" }, { id: "desc" }],
      take: 5,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = addMonths(sixMonthStart, index);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
      incomeCents: 0,
      expenseCents: 0,
    };
  });

  const monthIndex = new Map(months.map((month) => [month.key, month]));

  for (const contribution of monthlyIncome) {
    const key = `${contribution.receivedAt.getFullYear()}-${contribution.receivedAt.getMonth()}`;
    const month = monthIndex.get(key);

    if (month) {
      month.incomeCents += contribution.amountCents;
    }
  }

  for (const expense of monthlyExpenses) {
    const key = `${expense.paidAt.getFullYear()}-${expense.paidAt.getMonth()}`;
    const month = monthIndex.get(key);

    if (month) {
      month.expenseCents += expense.amountCents;
    }
  }

  const currentIncomeCents = currentIncome._sum.amountCents ?? 0;
  const previousIncomeCents = previousIncome._sum.amountCents ?? 0;
  const currentExpenseCents = currentExpenses._sum.amountCents ?? 0;
  const previousExpenseCents = previousExpenses._sum.amountCents ?? 0;
  const totalIncomeCents = totalIncome._sum.amountCents ?? 0;
  const totalExpenseCents = totalExpenses._sum.amountCents ?? 0;
  const netCents = totalIncomeCents - totalExpenseCents;

  const incomeTrendPercent =
    previousIncomeCents > 0
      ? Math.round(((currentIncomeCents - previousIncomeCents) / previousIncomeCents) * 1000) / 10
      : 0;
  const expenseTrendPercent =
    previousExpenseCents > 0
      ? Math.round(((currentExpenseCents - previousExpenseCents) / previousExpenseCents) * 1000) / 10
      : 0;

  const recentTransactions = [
    ...recentIncome.map((contribution: (typeof recentIncome)[number]) => ({
      publicId: contribution.publicId,
      type: "income" as const,
      date: formatDate(contribution.receivedAt),
      description: contribution.category.name,
      category: contribution.category.slug === "tithe" ? "Unrestricted" : contribution.category.name,
      amount: `+${formatCurrency(contribution.amountCents)}`,
      amountClassName: "text-success",
      iconKey: "income" as const,
      sortKey: contribution.receivedAt.getTime(),
    })),
    ...recentExpenses.map((expense: (typeof recentExpenses)[number]) => ({
      publicId: expense.publicId,
      type: "expense" as const,
      date: formatDate(expense.paidAt),
      description: expense.description,
      category: expense.category.name,
      amount: `-${formatCurrency(expense.amountCents)}`,
      amountClassName: "text-error",
      iconKey:
        expense.category.slug === "utilities"
          ? ("utilities" as const)
          : expense.category.slug === "outreach"
            ? ("outreach" as const)
            : ("general" as const),
      sortKey: expense.paidAt.getTime(),
    })),
  ]
    .sort(
      (
        left: { sortKey: number },
        right: { sortKey: number },
      ) => right.sortKey - left.sortKey,
    )
    .slice(0, 5)
    .map((transaction: RecentTransactionDraft) => ({
      publicId: transaction.publicId,
      type: transaction.type,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      amountClassName: transaction.amountClassName,
      iconKey: transaction.iconKey,
    }));

  return {
    totalIncome: formatCurrency(currentIncomeCents),
    totalExpenses: formatCurrency(currentExpenseCents),
    netBalance: formatCurrency(netCents),
    incomeTrendPercent,
    expenseTrendPercent,
    netStatusLabel: netCents >= 0 ? "Positive Balance" : "Needs Review",
    netStatusTone: netCents >= 0 ? "success" : "warning",
    months,
    fundProgress: funds.map((fund: FundWithAllocations) => {
      const allocatedCents = fund.allocations.reduce(
        (sum: number, allocation: { amountCents: number }) => sum + allocation.amountCents,
        0,
      );
      const progress =
        fund.targetCents && fund.targetCents > 0
          ? Math.round((allocatedCents / fund.targetCents) * 100)
          : 0;

      return {
        publicId: fund.publicId,
        label: fund.name,
        progress,
      };
    }),
    recentTransactions,
  };
}

export async function getFinanceExpensesPageData({
  categorySlug,
  dateFrom,
  dateTo,
}: FinanceExpensesFilters = {}): Promise<FinanceExpensesPageData> {
  const dateRange = getNormalizedDateRange(dateFrom, dateTo);
  const where = buildExpenseWhere({
    categorySlug,
    dateFrom,
    dateTo,
  });

  const [
    matchingExpenses,
    utilityExpenses,
    groupedExpenses,
    categories,
    maintenanceExpenses,
    totalRows,
  ] = await prisma.$transaction([
    prisma.expense.aggregate({
      where,
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        ...where,
        category: {
          slug: "utilities",
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amountCents: true },
      orderBy: {
        _sum: {
          amountCents: "desc",
        },
      },
    }),
    prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    prisma.expense.aggregate({
      where: {
        ...where,
        category: {
          slug: "maintenance",
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.count({ where }),
  ]);

  const matchingExpenseCents = matchingExpenses._sum.amountCents ?? 0;
  const utilityExpenseCents = utilityExpenses._sum.amountCents ?? 0;
  const maintenanceExpenseCents = maintenanceExpenses._sum.amountCents ?? 0;
  const categoriesById = new Map(
    categories.map((category: NamedCategory) => [category.id, category]),
  );
  const topCategory = groupedExpenses
    .map((entry: SummedAmountEntry) => ({
      category: categoriesById.get(entry.categoryId) ?? null,
      amountCents: entry._sum?.amountCents ?? 0,
    }))
    .find((entry: { category: NamedCategory | null; amountCents: number }) => entry.category !== null);

  return {
    operationalCosts: formatCurrency(matchingExpenseCents),
    matchingCountLabel: totalRows === 1 ? "1 matching expense" : `${totalRows} matching expenses`,
    utilitySpend: formatCurrency(utilityExpenseCents),
    utilitySharePercent:
      matchingExpenseCents > 0
        ? Math.round((utilityExpenseCents / matchingExpenseCents) * 100)
        : 0,
    topExpenseCategoryLabel: topCategory?.category?.name ?? "No expenses yet",
    topExpenseCategoryValue: formatCurrency(topCategory?.amountCents ?? 0),
    topExpenseCategorySharePercent:
      matchingExpenseCents > 0
        ? Math.round(((topCategory?.amountCents ?? 0) / matchingExpenseCents) * 100)
        : 0,
    maintenanceSpend: formatCurrency(maintenanceExpenseCents),
    maintenanceSharePercent:
      matchingExpenseCents > 0
        ? Math.round((maintenanceExpenseCents / matchingExpenseCents) * 100)
        : 0,
    categories: mapFinanceFilterOptions(categories),
    dateFromValue: dateRange.dateFromValue,
    dateToValue: dateRange.dateToValue,
  };
}

export async function getFinanceExpensesTableData({
  categorySlug,
  dateFrom,
  dateTo,
  page,
  pageSize,
}: FinanceExpensesFilters & {
  page?: number;
  pageSize?: number;
} = {}): Promise<FinanceExpensesTableData> {
  const where = buildExpenseWhere({
    categorySlug,
    dateFrom,
    dateTo,
  });
  const currentPage = normalizePage(page);
  const currentPageSize = normalizePageSize(pageSize);

  const totalRows = await prisma.expense.count({ where });
  const pageCount = Math.max(1, Math.ceil(totalRows / currentPageSize));
  const safePage = Math.min(currentPage, pageCount);
  const expenses = await findExpenseRows(where, safePage, currentPageSize);

  return {
    rows: mapExpenseRows(expenses),
    pagination: {
      page: safePage,
      pageSize: currentPageSize,
      pageCount,
      totalRows,
    },
  };
}

export async function getFinanceExpensesViewData(
  filters: FinanceExpensesFilters & { pageSize?: number } = {},
): Promise<FinanceExpensesViewData> {
  const [summaryData, tableData] = await Promise.all([
    getFinanceExpensesPageData(filters),
    getFinanceExpensesTableData(filters),
  ]);

  return {
    ...summaryData,
    ...tableData,
  };
}
