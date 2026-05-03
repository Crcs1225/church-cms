import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Hammer,
  MoreVertical,
  PartyPopper,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

const expenseRows = [
  {
    id: "#EXP-9281",
    category: "Utilities",
    description: "Monthly Electricity Bill",
    detail: "Main Sanctuary & Offices",
    amount: "$450.00",
    date: "Sep 24, 2026",
    icon: Zap,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    id: "#EXP-9275",
    category: "Events",
    description: "Youth Ministry Catering",
    detail: "Fall Kick-off Weekend",
    amount: "$1,200.00",
    date: "Sep 22, 2026",
    icon: PartyPopper,
    iconClassName: "bg-blue-100 text-blue-700",
  },
  {
    id: "#EXP-9260",
    category: "Salaries",
    description: "Part-time Custodian",
    detail: "Bi-weekly payroll disbursement",
    amount: "$850.00",
    date: "Sep 20, 2026",
    icon: BriefcaseBusiness,
    iconClassName: "bg-green-100 text-success",
  },
  {
    id: "#EXP-9255",
    category: "Maintenance",
    description: "Roof Repair - North Wing",
    detail: "Emergency leak containment",
    amount: "$2,450.00",
    date: "Sep 15, 2026",
    icon: Hammer,
    iconClassName: "bg-surface-raised text-text-primary",
  },
];

type ExpenseCategoryIconProps = {
  icon: ComponentType<LucideProps>;
  className: string;
};

function ExpenseCategoryIcon({
  icon: Icon,
  className,
}: ExpenseCategoryIconProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </div>
  );
}

export function ExpenseTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-border bg-surface">
            <tr className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenseRows.map((row) => (
              <tr
                key={row.id}
                className="group transition-colors hover:bg-primary/5"
              >
                <td className="px-6 py-4 font-code text-xs text-neutral">
                  {row.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ExpenseCategoryIcon
                      icon={row.icon}
                      className={row.iconClassName}
                    />
                    <span className="text-sm font-semibold">{row.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-text-primary">{row.description}</p>
                  <p className="text-xs text-text-secondary">{row.detail}</p>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                  {row.amount}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {row.date}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Open actions for ${row.id}`}
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-surface px-6 py-4">
        <span className="text-xs text-text-secondary">Showing 4 of 124 results</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="secondary" size="sm" aria-label="Next page">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
