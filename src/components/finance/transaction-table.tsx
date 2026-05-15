import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { HandHeart, Home, Utensils, Zap } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FinanceOverviewTransaction } from "./finance-data";

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

function getTransactionIcon(iconKey: FinanceOverviewTransaction["iconKey"]) {
  if (iconKey === "income") {
    return { icon: HandHeart, className: "bg-primary/10 text-primary" };
  }

  if (iconKey === "utilities") {
    return { icon: Zap, className: "bg-surface-raised text-text-secondary" };
  }

  if (iconKey === "outreach") {
    return { icon: Utensils, className: "bg-blue-50 text-blue-700" };
  }

  return { icon: Home, className: "bg-primary/10 text-primary" };
}

type TransactionTableProps = {
  transactions: FinanceOverviewTransaction[];
};

export function TransactionTable({ transactions }: TransactionTableProps) {
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
          {transactions.length === 0 ? (
            <tr>
              <td className="px-6 py-8 text-sm text-text-secondary" colSpan={4}>
                No transactions have been recorded yet.
              </td>
            </tr>
          ) : null}
          {transactions.map((transaction) => (
            (() => {
              const icon = getTransactionIcon(transaction.iconKey);

              return (
                <tr
                  key={transaction.publicId}
                  className="transition-colors hover:bg-background"
                >
                  <td className="px-6 py-4 text-sm">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <TransactionIcon
                        icon={icon.icon}
                        className={icon.className}
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
              );
            })()
          ))}
        </tbody>
      </table>
    </div>
  );
}
