import { Suspense } from "react";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { FinanceOverview } from "@/components/finance";
import { LoadingScreen } from "@/components/ui";

export default async function FinanceOverviewPage() {
  const { currentUser, activeUsers } = await getAdminViewerData();

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
      <FinanceOverview currentUser={currentUser} activeUsers={activeUsers} />
    </Suspense>
  );
}
