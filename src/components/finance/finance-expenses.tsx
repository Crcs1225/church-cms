import {
  CalendarDays,
  Filter,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { FinancePageShell } from "./finance-page-shell";
import { FinanceStatCard } from "./finance-stat-card";
import { ExpenseTable } from "./expense-table";
import { AddExpenseDialogButton } from "./transaction-modals";
import { FinanceProgressCard } from "./finance-progress-card";

export function FinanceExpenses() {
  return (
    <FinancePageShell activeTab="expenses">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 font-display text-5xl leading-tight text-text-primary">
              Expense Tracking
            </h1>
            <p className="text-text-secondary">
              Monitor your church&apos;s operational outflows and recurring
              maintenance costs.
            </p>
          </div>
          <AddExpenseDialogButton />
        </header>

        <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FinanceStatCard
            label="Operational Costs"
            value="$4,820.00"
            caption="2.4% vs last month"
            trend={
              <span className="flex items-center gap-1 text-xs font-semibold text-success">
                <TrendingDown className="h-3 w-3" aria-hidden />
                Lower
              </span>
            }
          />
          <FinanceStatCard
            label="Utility Spend"
            value="$1,250.45"
            caption="12% peak usage period"
            accentClassName="border-l-neutral"
            trend={
              <span className="flex items-center gap-1 text-xs font-semibold text-warning">
                <TrendingUp className="h-3 w-3" aria-hidden />
                Elevated
              </span>
            }
          />
          <FinanceProgressCard
            label="Upcoming Payments"
            value="$2,100.00"
            description="Next: Staff Salaries (Oct 01)"
            progressLabel="Budget Used"
            progressValue={68}
            accentClassName="border-l-blue-700"
          />
        </section>

        <section className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-border bg-white p-4">
          <div className="min-w-56 flex-1">
            <Label
              htmlFor="expense-category"
              className="mb-1 text-[11px] tracking-widest text-neutral uppercase"
            >
              Category
            </Label>
            <select
              id="expense-category"
              aria-label="Filter expenses by category"
              title="Filter expenses by category"
              className="h-10 w-full rounded-md border border-transparent bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
            >
              <option>All Categories</option>
              <option>Utilities</option>
              <option>Events</option>
              <option>Salaries</option>
              <option>Maintenance</option>
              <option>Misc</option>
            </select>
          </div>

          <div className="min-w-56 flex-1">
            <Label
              htmlFor="expense-date-range"
              className="mb-1 text-[11px] tracking-widest text-neutral uppercase"
            >
              Date Range
            </Label>
            <div className="relative">
              <Input
                id="expense-date-range"
                className="bg-surface pr-9"
                defaultValue="Sep 1 - Sep 30, 2026"
              />
              <CalendarDays
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral"
                aria-hidden
              />
            </div>
          </div>

          <Button variant="secondary">
            <Filter className="h-4 w-4" aria-hidden />
            Advanced Filters
          </Button>
        </section>

        <ExpenseTable />

        <section className="mt-12 flex flex-col gap-6 rounded-lg border border-orange-100 bg-orange-50/40 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-primary bg-white font-semibold text-primary">
              84%
            </div>
            <div>
              <h4 className="text-xl font-semibold text-text-primary">
                Annual Maintenance Budget
              </h4>
              <p className="text-sm text-text-secondary">
                You have reached 84% of your projected annual spend. Consider
                pausing non-essential repairs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:text-right">
            <div>
              <p className="text-xs text-text-secondary">Remaining</p>
              <p className="font-semibold text-text-primary">$12,400.00</p>
            </div>
            <Button variant="inverse">Adjust Budget</Button>
          </div>
        </section>
      </div>

      <AddExpenseDialogButton floating label="Quick add expense" />
    </FinancePageShell>
  );
}
