import { Suspense } from "react";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { FinanceExpenses } from "@/components/finance";
import { LoadingScreen } from "@/components/ui";

type FinanceExpensesPageProps = {
  searchParams: Promise<{
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
};

export default async function FinanceExpensesPage({
  searchParams,
}: FinanceExpensesPageProps) {
  const { category, dateFrom, dateTo, page } = await searchParams;
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <Suspense
      fallback={
        <LoadingScreen
          compact
          className="px-6 py-10"
          title="Loading Expense Records"
          description="Preparing filtered expense totals, category insights, and the latest expense ledger."
        />
      }
    >
      <FinanceExpenses
        currentUser={currentUser}
        activeUsers={activeUsers}
        categorySlug={category}
        dateFrom={dateFrom}
        dateTo={dateTo}
        page={Math.max(1, Number(page ?? "1") || 1)}
      />
    </Suspense>
  );
}
