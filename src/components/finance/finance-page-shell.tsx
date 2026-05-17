import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import type { AdminUserAccess } from "@/lib/admin-access";
import { FinanceTabs } from "./finance-tabs";

type FinancePageShellProps = {
  activeTab: string;
  currentUser: AdminUserAccess | null;
  activeUsers: AdminUserAccess[];
  children: ReactNode;
};

export function FinancePageShell({
  activeTab,
  currentUser,
  activeUsers,
  children,
}: FinancePageShellProps) {
  return (
    <AdminShell
      activeSection="Finances"
      currentUser={currentUser}
      activeUsers={activeUsers}
      showQuickCreate={false}
    >
      <div className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6">
          <FinanceTabs active={activeTab} />
        </div>
      </div>

      {children}
    </AdminShell>
  );
}
