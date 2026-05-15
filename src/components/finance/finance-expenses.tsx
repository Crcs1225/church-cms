import {
  type FinanceExpensesFilters,
  getFinanceExpensesViewData,
} from "./finance-data";
import { FinanceExpensesClient } from "./finance-expenses-client";
import { FinancePageShell } from "./finance-page-shell";

export async function FinanceExpenses({
  categorySlug = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
}: FinanceExpensesFilters & { page?: number } = {}) {
  const initialData = await getFinanceExpensesViewData({
    categorySlug,
    dateFrom,
    dateTo,
    page,
    pageSize: 20,
  });

  return (
    <FinancePageShell activeTab="expenses">
      <FinanceExpensesClient
        initialData={initialData}
        initialFilters={{
          categorySlug,
          dateFrom: initialData.dateFromValue,
          dateTo: initialData.dateToValue,
          page: initialData.pagination.page,
        }}
      />
    </FinancePageShell>
  );
}
