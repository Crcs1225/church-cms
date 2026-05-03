import {
  CalendarDays,
  Download,
  Filter,
  Search,
  TrendingUp,
  Clock3,
} from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { FinancePageShell } from "./finance-page-shell";
import { getFinanceIncomePageData } from "./finance-data";
import { FinanceStatCard } from "./finance-stat-card";
import { IncomeTable } from "./income-table";
import { AddIncomeDialogButton } from "./transaction-modals";
import { FinanceProgressCard } from "./finance-progress-card";

type FinanceIncomeProps = {
  memberQuery?: string;
  categorySlug?: string;
};

export async function FinanceIncome({
  memberQuery = "",
  categorySlug = "",
}: FinanceIncomeProps) {
  const incomeData = await getFinanceIncomePageData({
    memberQuery,
    categorySlug,
  });

  return (
    <FinancePageShell activeTab="income">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 font-display text-5xl leading-tight text-text-primary">
              Income Management
            </h1>
            <p className="max-w-xl text-text-secondary">
              Track and manage all church contributions, from weekly tithes to
              special pledges. Securely record member donations and prepare
              receipts.
            </p>
          </div>
          <AddIncomeDialogButton />
        </header>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FinanceStatCard
            label="This Month's Tithes"
            value="$24,850.00"
            caption="12% from last month"
            trend={
              <span className="flex items-center gap-1 text-xs font-semibold text-success">
                <TrendingUp className="h-3 w-3" aria-hidden />
                Growing
              </span>
            }
          />
          <FinanceStatCard
            label="Total Offering"
            value="$12,420.50"
            caption="Last updated 2h ago"
            accentClassName="border-l-accent"
            trend={
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock3 className="h-3 w-3" aria-hidden />
                Current
              </span>
            }
          />
          <FinanceProgressCard
            label="Growth Project Fund"
            value="$156,000.00"
            progressLabel="Target Reached"
            progressValue={78}
          />
        </section>

        <form
          className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4"
          method="get"
        >
          <div className="min-w-56 flex-1">
            <Label htmlFor="income-member-search" className="sr-only">
              Search members
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                aria-hidden
              />
              <Input
                id="income-member-search"
                name="member"
                className="bg-background pl-9"
                placeholder="Search giver name or member ID..."
                defaultValue={memberQuery}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <Label htmlFor="income-type" className="sr-only">
                Filter by income type
              </Label>
              <select
                id="income-type"
                name="category"
                aria-label="Filter by income type"
                title="Filter by income type"
                className="h-10 rounded-md border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
                defaultValue={categorySlug}
              >
                <option value="">Income Type</option>
                <option value="tithe">Tithes</option>
                <option value="offering">Offerings</option>
                <option value="donation">Donations</option>
                <option value="pledge">Pledges</option>
                <option value="seed-of-faith">Seed of Faith</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <Label htmlFor="income-date-range" className="sr-only">
                Date range
              </Label>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
                <Input
                  id="income-date-range"
                  className="min-w-60 bg-background pl-9"
                  placeholder="Jan 01, 2026 - Jan 31, 2026"
                />
              </div>
            </div>

            <Button variant="secondary" size="md" type="submit" aria-label="Apply income filters">
              <Filter className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="secondary" size="md" type="button" aria-label="Download income">
              <Download className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </form>

        <IncomeTable rows={incomeData.rows} totalRows={incomeData.totalRows} />
      </div>

      <AddIncomeDialogButton floating label="Quick add income" />
    </FinancePageShell>
  );
}
