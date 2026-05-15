import type { Prisma } from "@/generated/prisma/client";

type FinanceDateRange = {
  start: Date | null;
  endExclusive: Date | null;
  dateFromValue: string;
  dateToValue: string;
};

type ContributionFilterArgs = {
  memberQuery?: string | null;
  categorySlug?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
};

type ExpenseFilterArgs = {
  categorySlug?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  query?: string | null;
};

function parseDateInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== month
    || parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function getNormalizedDateRange(
  dateFrom?: string | null,
  dateTo?: string | null,
): FinanceDateRange {
  const parsedFrom = parseDateInput(dateFrom);
  const parsedTo = parseDateInput(dateTo);
  const start = parsedFrom
    ? new Date(parsedFrom.getFullYear(), parsedFrom.getMonth(), parsedFrom.getDate())
    : null;
  const inclusiveEnd = parsedTo
    ? new Date(parsedTo.getFullYear(), parsedTo.getMonth(), parsedTo.getDate())
    : null;

  if (start && inclusiveEnd && inclusiveEnd < start) {
    return {
      start: inclusiveEnd,
      endExclusive: addDays(start, 1),
      dateFromValue: inclusiveEnd.toISOString().slice(0, 10),
      dateToValue: start.toISOString().slice(0, 10),
    };
  }

  return {
    start,
    endExclusive: inclusiveEnd ? addDays(inclusiveEnd, 1) : null,
    dateFromValue: start ? start.toISOString().slice(0, 10) : "",
    dateToValue: inclusiveEnd ? inclusiveEnd.toISOString().slice(0, 10) : "",
  };
}

export function buildContributionWhere({
  memberQuery,
  categorySlug,
  dateFrom,
  dateTo,
}: ContributionFilterArgs): Prisma.ContributionWhereInput {
  const normalizedMemberQuery = memberQuery?.trim() ?? "";
  const normalizedCategorySlug = categorySlug?.trim() ?? "";
  const dateRange = getNormalizedDateRange(dateFrom, dateTo);
  const receivedAtFilter =
    dateRange.start || dateRange.endExclusive
      ? {
          ...(dateRange.start ? { gte: dateRange.start } : {}),
          ...(dateRange.endExclusive ? { lt: dateRange.endExclusive } : {}),
        }
      : undefined;

  return {
    ...(receivedAtFilter ? { receivedAt: receivedAtFilter } : {}),
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
}

export function buildExpenseWhere({
  categorySlug,
  dateFrom,
  dateTo,
  query,
}: ExpenseFilterArgs): Prisma.ExpenseWhereInput {
  const normalizedCategorySlug = categorySlug?.trim() ?? "";
  const normalizedQuery = query?.trim() ?? "";
  const dateRange = getNormalizedDateRange(dateFrom, dateTo);
  const paidAtFilter =
    dateRange.start || dateRange.endExclusive
      ? {
          ...(dateRange.start ? { gte: dateRange.start } : {}),
          ...(dateRange.endExclusive ? { lt: dateRange.endExclusive } : {}),
        }
      : undefined;

  return {
    ...(normalizedCategorySlug ? { category: { slug: normalizedCategorySlug } } : {}),
    ...(paidAtFilter ? { paidAt: paidAtFilter } : {}),
    ...(normalizedQuery
      ? {
          OR: [
            { vendor: { contains: normalizedQuery } },
            { description: { contains: normalizedQuery } },
            { reference: { contains: normalizedQuery } },
          ],
        }
      : {}),
  };
}
