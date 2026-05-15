import { Suspense } from "react";
import { CalendarDays, Database, TrendingDown, TrendingUp } from "lucide-react";
import { Button, Card, Progress } from "@/components/ui";
import { FinancePageShell } from "./finance-page-shell";
import {
  formatCurrency,
  getFinanceReportsFundsData,
  getFinanceReportsSummaryData,
  getFinanceReportsTrendData,
} from "./finance-data";
import { FundBreakdownTable } from "./fund-breakdown-table";
import { ReportsChart } from "./reports-chart";

function formatVarianceLabel(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return {
      badge: "No baseline",
      tone: "text-text-secondary",
      delta: null,
    };
  }

  const delta = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;

  return {
    badge: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`,
    tone: delta >= 0 ? "text-success" : "text-error",
    delta,
  };
}

export async function FinanceReports() {
  return (
    <FinancePageShell activeTab="reports">
      <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-8">
        <Suspense fallback={<ReportsSectionFallback title="Report Summary" />}>
          <ReportsSummarySection />
        </Suspense>

        <Suspense fallback={<ReportsSectionFallback title="Comparative Trend" />}>
          <ReportsTrendSection />
        </Suspense>

        <Suspense fallback={<ReportsSectionFallback title="Fund Allocation Status" />}>
          <ReportsFundsSection />
        </Suspense>
      </div>
    </FinancePageShell>
  );
}

function ReportsSectionFallback({ title }: { title: string }) {
  return (
    <Card className="p-8">
      <div className="mb-6 h-3 w-32 animate-pulse rounded-full bg-surface-raised" />
      <div className="mb-8 h-9 w-56 animate-pulse rounded-full bg-surface-raised" />
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={`${title}-${item}`} className="rounded-xl bg-surface p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-background" />
            <div className="mt-4 h-8 w-32 animate-pulse rounded-full bg-background" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-background" />
          </div>
        ))}
      </div>
    </Card>
  );
}

async function ReportsSummarySection() {
  const reportData = await getFinanceReportsSummaryData();
  const variance = formatVarianceLabel(
    reportData.currentMonthNetCents,
    reportData.previousMonthNetCents,
  );

  return (
    <>
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Financial Reporting
          </p>
          <h1 className="mt-1 font-display text-3xl">Reports</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {reportData.periodStartLabel} - {reportData.periodEndLabel}
          </Button>
          <Button variant="secondary" disabled title="CSV export is not implemented yet">
            <Database className="h-4 w-4" aria-hidden />
            Live data only
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-primary p-6">
          <div className="min-w-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-widest text-neutral uppercase">
                Net Position
              </h3>
              <span className="rounded-sm bg-surface px-2 py-1 text-xs font-semibold text-primary">
                {reportData.totalIncomeCents > 0
                  ? `${Math.round((reportData.netCents / reportData.totalIncomeCents) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <p className="font-display text-4xl leading-tight">
              {formatCurrency(reportData.netCents)}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {formatCurrency(reportData.totalIncomeCents)} income vs{" "}
              {formatCurrency(reportData.totalExpenseCents)} expenses
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-accent p-6">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-sm font-semibold tracking-widest text-neutral uppercase">
              Top Income Source
            </h3>
            <TrendingUp className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className="font-display text-2xl">
                {reportData.topIncomeCategory?.name ?? "No income yet"}
              </p>
              <p className="text-xl font-semibold text-accent">
                {reportData.topIncomeCategory?.sharePercent ?? 0}%
              </p>
            </div>
            <Progress value={reportData.topIncomeCategory?.sharePercent ?? 0} />
            <p className="text-sm text-text-secondary">
              {reportData.topIncomeCategory
                ? `${formatCurrency(reportData.topIncomeCategory.amountCents)} collected in the current reporting window`
                : "No contributions have been recorded for this reporting window."}
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-success p-6">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-sm font-semibold tracking-widest text-neutral uppercase">
              Monthly Variance
            </h3>
            <span className={`rounded-sm bg-surface px-2 py-1 text-xs font-semibold ${variance.tone}`}>
              {variance.badge}
            </span>
          </div>
          <p className="font-display text-4xl">
            {formatCurrency(reportData.currentMonthNetCents)}
          </p>
          <p className="mt-2 text-sm italic text-neutral">
            Compared to {reportData.previousMonthLabel}&apos;s net of{" "}
            {formatCurrency(reportData.previousMonthNetCents)}
          </p>
        </Card>
      </section>
    </>
  );
}

async function ReportsTrendSection() {
  const reportData = await getFinanceReportsTrendData();

  return (
    <Card className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl">Comparative Trend</h2>
          <p className="text-text-secondary">
            Monthly performance analysis: income vs expenses
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-neutral">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-stone-300" />
            <span className="text-xs font-semibold text-neutral">
              Expenses
            </span>
          </div>
        </div>
      </div>
      <ReportsChart months={reportData.months} />
    </Card>
  );
}

async function ReportsFundsSection() {
  const reportData = await getFinanceReportsFundsData();

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border bg-white/50 px-8 py-6">
        <div>
          <h2 className="font-display text-3xl">Fund Allocation Status</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Active funds and their currently allocated amounts.
          </p>
        </div>
        <div className="text-right text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">
            {formatCurrency(reportData.totalExpenseCents)} expenses
          </p>
          <p className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4" aria-hidden />
            Total outflows in the database
          </p>
        </div>
      </div>
      <FundBreakdownTable rows={reportData.funds} />
    </Card>
  );
}
