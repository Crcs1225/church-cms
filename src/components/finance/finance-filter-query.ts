import type {
  FinanceExpensesFilters,
  FinanceIncomeFilters,
} from "./finance-data";

export function buildIncomeFilterParams({
  memberQuery,
  categorySlug,
  dateFrom,
  dateTo,
  page,
}: FinanceIncomeFilters & { page?: number } = {}) {
  const params = new URLSearchParams();

  if (memberQuery?.trim()) {
    params.set("member", memberQuery.trim());
  }

  if (categorySlug?.trim()) {
    params.set("category", categorySlug.trim());
  }

  if (dateFrom?.trim()) {
    params.set("dateFrom", dateFrom.trim());
  }

  if (dateTo?.trim()) {
    params.set("dateTo", dateTo.trim());
  }

  if (typeof page === "number" && Number.isFinite(page) && page > 1) {
    params.set("page", String(Math.floor(page)));
  }

  params.set("pageSize", "20");

  return params;
}

export function buildExpenseFilterParams({
  categorySlug,
  dateFrom,
  dateTo,
  page,
}: FinanceExpensesFilters & { page?: number } = {}) {
  const params = new URLSearchParams();

  if (categorySlug?.trim()) {
    params.set("category", categorySlug.trim());
  }

  if (dateFrom?.trim()) {
    params.set("dateFrom", dateFrom.trim());
  }

  if (dateTo?.trim()) {
    params.set("dateTo", dateTo.trim());
  }

  if (typeof page === "number" && Number.isFinite(page) && page > 1) {
    params.set("page", String(Math.floor(page)));
  }

  params.set("pageSize", "20");

  return params;
}

export function buildHrefWithParams(
  pathname: string,
  params: URLSearchParams,
) {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}
