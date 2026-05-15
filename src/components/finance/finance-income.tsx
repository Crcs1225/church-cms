import { getFinanceIncomePageData } from "./finance-data";
import { FinanceIncomeClient } from "./finance-income-client";
import { FinancePageShell } from "./finance-page-shell";

type FinanceIncomeProps = {
  memberQuery?: string;
  categorySlug?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
};

export async function FinanceIncome({
  memberQuery = "",
  categorySlug = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
}: FinanceIncomeProps) {
  const initialData = await getFinanceIncomePageData({
    memberQuery,
    categorySlug,
    dateFrom,
    dateTo,
    page,
    pageSize: 20,
  });

  return (
    <FinancePageShell activeTab="income">
      <FinanceIncomeClient
        initialData={initialData}
        initialFilters={{
          memberQuery,
          categorySlug,
          dateFrom: initialData.dateFromValue,
          dateTo: initialData.dateToValue,
          page: initialData.pagination.page,
        }}
      />
    </FinancePageShell>
  );
}
