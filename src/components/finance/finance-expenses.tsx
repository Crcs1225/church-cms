import {
  type FinanceExpensesFilters,
  getFinanceExpensesViewData,
} from "./finance-data";
import { FinanceExpensesClient } from "./finance-expenses-client";
import { FinancePageShell } from "./finance-page-shell";
import type { AdminUserAccess } from "@/lib/admin-access";

export async function FinanceExpenses({
  currentUser,
  activeUsers,
  categorySlug = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
}: (FinanceExpensesFilters & {
  currentUser: AdminUserAccess | null;
  activeUsers: AdminUserAccess[];
  page?: number;
})) {
  const initialData = await getFinanceExpensesViewData({
    categorySlug,
    dateFrom,
    dateTo,
    page,
    pageSize: 20,
  });

  return (
    <FinancePageShell
      activeTab="expenses"
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
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
