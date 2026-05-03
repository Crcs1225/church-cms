import Link from "next/link";
import { cn } from "@/lib/cn";

const tabs = [
  { label: "Overview", href: "/admin/finances", value: "overview" },
  { label: "Income", href: "/admin/finances/income", value: "income" },
  { label: "Expenses", href: "/admin/finances/expenses", value: "expenses" },
  { label: "Reports", href: "/admin/finances/reports", value: "reports" },
];

type FinanceTabsProps = {
  active: string;
};

export function FinanceTabs({ active }: FinanceTabsProps) {
  return (
    <nav aria-label="Finance sections" className="flex h-16 items-center gap-6">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={cn(
            "flex h-full items-center border-b-2 px-1 text-sm font-semibold transition-colors",
            tab.value === active
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-primary",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
