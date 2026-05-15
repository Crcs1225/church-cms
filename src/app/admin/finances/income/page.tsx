import { Suspense } from "react";
import { FinanceIncome } from "@/components/finance";
import { LoadingScreen } from "@/components/ui";

type FinanceIncomePageProps = {
  searchParams: Promise<{
    member?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
};

export default async function FinanceIncomePage({
  searchParams,
}: FinanceIncomePageProps) {
  const { member, category, dateFrom, dateTo, page } = await searchParams;

  return (
    <Suspense
      fallback={
        <LoadingScreen
          compact
          className="px-6 py-10"
          title="Loading Income Records"
          description="Preparing filtered contribution totals, categories, and the latest income ledger."
        />
      }
    >
      <FinanceIncome
        memberQuery={member}
        categorySlug={category}
        dateFrom={dateFrom}
        dateTo={dateTo}
        page={Math.max(1, Number(page ?? "1") || 1)}
      />
    </Suspense>
  );
}
