import { Suspense } from "react";
import { FinanceOverview } from "@/components/finance";
import { LoadingScreen } from "@/components/ui";

export default function FinanceOverviewPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          compact
          className="px-6 py-10"
          title="Loading Finance Overview"
          description="Building current income, expense, fund, and transaction snapshots."
        />
      }
    >
      <FinanceOverview />
    </Suspense>
  );
}
