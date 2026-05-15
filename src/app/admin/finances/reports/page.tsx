import { Suspense } from "react";
import { FinanceReports } from "@/components/finance";
import { LoadingScreen } from "@/components/ui";

export default function FinanceReportsPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          compact
          className="px-6 py-10"
          title="Loading Reports"
          description="Aggregating comparative trends, top categories, and allocation summaries for reporting."
        />
      }
    >
      <FinanceReports />
    </Suspense>
  );
}
