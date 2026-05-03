import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { HandHeart, Home, Utensils, Zap } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

const transactions = [
  {
    date: "Oct 24, 2026",
    description: "Weekly Tithes & Offerings",
    category: "Unrestricted",
    amount: "+$4,250.00",
    amountClassName: "text-success",
    icon: HandHeart,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    date: "Oct 22, 2026",
    description: "Utility Bill - City Power",
    category: "Operations",
    amount: "-$842.15",
    amountClassName: "text-error",
    icon: Zap,
    iconClassName: "bg-surface-raised text-text-secondary",
  },
  {
    date: "Oct 20, 2026",
    description: "Community Kitchen Supplies",
    category: "Outreach",
    amount: "-$1,200.00",
    amountClassName: "text-error",
    icon: Utensils,
    iconClassName: "bg-blue-50 text-blue-700",
  },
  {
    date: "Oct 18, 2026",
    description: "Roof Restoration Fundraiser",
    category: "Restricted",
    amount: "+$2,800.00",
    amountClassName: "text-success",
    icon: Home,
    iconClassName: "bg-primary/10 text-primary",
  },
];

type TransactionIconProps = {
  icon: ComponentType<LucideProps>;
  className: string;
};

function TransactionIcon({ icon: Icon, className }: TransactionIconProps) {
  return (
    <div
      className={cn(
        "mr-3 flex h-8 w-8 items-center justify-center rounded-full",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </div>
  );
}

export function TransactionTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((transaction) => (
            <tr
              key={`${transaction.date}-${transaction.description}`}
              className="transition-colors hover:bg-background"
            >
              <td className="px-6 py-4 text-sm">{transaction.date}</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <TransactionIcon
                    icon={transaction.icon}
                    className={transaction.iconClassName}
                  />
                  <span className="text-sm font-semibold">
                    {transaction.description}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge>{transaction.category}</Badge>
              </td>
              <td
                className={cn(
                  "px-6 py-4 text-right text-sm font-semibold",
                  transaction.amountClassName,
                )}
              >
                {transaction.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
