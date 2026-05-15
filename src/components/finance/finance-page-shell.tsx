import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { FinanceTabs } from "./finance-tabs";

type FinancePageShellProps = {
  activeTab: string;
  children: ReactNode;
};

export function FinancePageShell({
  activeTab,
  children,
}: FinancePageShellProps) {
  return (
    <AdminShell activeSection="Finances" showQuickCreate={false}>
      <div className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6">
          <FinanceTabs active={activeTab} />
        </div>
      </div>

      {children}
    </AdminShell>
  );
}
