import { Suspense } from "react";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { FinanceReports } from "@/components/finance";
import { LoadingScreen } from "@/components/ui";

export default async function FinanceReportsPage() {
  const { currentUser, activeUsers } = await getAdminViewerData();

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
      <FinanceReports currentUser={currentUser} activeUsers={activeUsers} />
    </Suspense>
  );
}
