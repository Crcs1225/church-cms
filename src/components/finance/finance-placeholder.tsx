import { Card } from "@/components/ui";
import type { AdminUserAccess } from "@/lib/admin-access";
import { FinancePageShell } from "./finance-page-shell";

type FinancePlaceholderProps = {
  activeTab: string;
  title: string;
  currentUser: AdminUserAccess | null;
  activeUsers: AdminUserAccess[];
};

export function FinancePlaceholder({
  activeTab,
  title,
  currentUser,
  activeUsers,
}: FinancePlaceholderProps) {
  return (
    <FinancePageShell
      activeTab={activeTab}
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <Card className="p-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Finance
          </p>
          <h1 className="mt-3 font-display text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            This tab reuses the finance route shell and navigation. The detailed
            workflow can be filled in after the overview dashboard is stable.
          </p>
        </Card>
      </div>
    </FinancePageShell>
  );
}
