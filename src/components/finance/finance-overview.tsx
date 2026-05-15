import Link from "next/link";
import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { Button, Card, Progress } from "@/components/ui";
import { FinanceChart } from "./finance-chart";
import { getFinanceOverviewPageData } from "./finance-data";
import { FinancePageShell } from "./finance-page-shell";
import { FinanceStatCard } from "./finance-stat-card";
import { TransactionTable } from "./transaction-table";

export async function FinanceOverview() {
  const overviewData = await getFinanceOverviewPageData();

  return (
    <FinancePageShell activeTab="overview">
      <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-10">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FinanceStatCard
            label="Total Income"
            value={overviewData.totalIncome}
            caption="from last 30 days"
            trend={
              <span className="flex items-center text-xs font-semibold text-success">
                <TrendingUp className="mr-1 h-3 w-3" aria-hidden />
                {overviewData.incomeTrendPercent >= 0 ? "+" : ""}
                {overviewData.incomeTrendPercent}%
              </span>
            }
          />
          <FinanceStatCard
            label="Total Expenses"
            value={overviewData.totalExpenses}
            caption="from last 30 days"
            accentClassName="border-l-neutral"
            trend={
              <span className="flex items-center text-xs font-semibold text-error">
                <TrendingDown className="mr-1 h-3 w-3" aria-hidden />
                {overviewData.expenseTrendPercent >= 0 ? "+" : ""}
                {overviewData.expenseTrendPercent}%
              </span>
            }
          />
          <FinanceStatCard
            label="Net Balance"
            value={overviewData.netBalance}
            caption="available liquidity"
            accentClassName="border-l-blue-700"
            trend={
              <span
                className={`flex items-center text-xs font-semibold ${
                  overviewData.netStatusTone === "success"
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />
                {overviewData.netStatusLabel}
              </span>
            }
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="relative overflow-hidden p-6 lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl">Income vs Expenses</h3>
                <p className="text-xs text-text-secondary">
                  Rolling 6-month comparison
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-xs">
                  <span className="mr-2 h-3 w-3 rounded-full bg-primary" />
                  <span className="text-text-secondary">Income</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="mr-2 h-3 w-3 rounded-full bg-stone-300" />
                  <span className="text-text-secondary">Expenses</span>
                </div>
              </div>
            </div>
            <FinanceChart months={overviewData.months} />
          </Card>

          <Card className="flex flex-col justify-between p-6">
            <div>
              <h3 className="font-display text-xl">Earmarked Funds</h3>
              <p className="mb-6 text-xs text-text-secondary">
                Current allocation for mission projects
              </p>
              {overviewData.fundProgress.length > 0 ? (
                <div className="space-y-4">
                  {overviewData.fundProgress.map((fund) => (
                    <Progress key={fund.publicId} value={fund.progress} label={fund.label} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  No active fund targets are available yet.
                </p>
              )}
            </div>
            <Button variant="secondary" className="mt-8 w-full">
              View Allocation Details
            </Button>
          </Card>
        </section>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h3 className="font-display text-xl">Recent Transactions</h3>
              <p className="text-xs text-text-secondary">
                Latest 5 financial activities
              </p>
            </div>
            <Link
              href="/admin/finances/income"
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all records
            </Link>
          </div>
          <TransactionTable transactions={overviewData.recentTransactions} />
        </Card>
      </div>
    </FinancePageShell>
  );
}
