import { ArrowRight, CalendarDays, Download, Search, TrendingUp } from "lucide-react";
import { Button, Card, Input, Progress } from "@/components/ui";
import { FinancePageShell } from "./finance-page-shell";
import { FundBreakdownTable } from "./fund-breakdown-table";
import { ReportsChart } from "./reports-chart";

export function FinanceReports() {
  return (
    <FinancePageShell activeTab="reports">
      <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-8">
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Financial Reporting
            </p>
            <h1 className="mt-1 font-display text-3xl">Reports</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral"
                aria-hidden
              />
              <Input
                className="w-64 rounded-full bg-background pr-9"
                placeholder="Search reports..."
              />
            </div>
            <Button variant="secondary">
              <CalendarDays className="h-4 w-4" aria-hidden />
              Jan 1, 2026 - Jun 30, 2026
            </Button>
            <Button>
              <Download className="h-4 w-4" aria-hidden />
              Export Report
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="relative flex items-center justify-between overflow-hidden border-l-4 border-l-primary p-6">
            <div>
              <h3 className="mb-1 text-sm font-semibold tracking-widest text-neutral uppercase">
                Annual Budget Progress
              </h3>
              <p className="font-display text-4xl">
                $842,500{" "}
                <span className="font-sans text-lg text-neutral">/ $1M</span>
              </p>
            </div>
            <div className="relative h-20 w-20 rounded-full border-8 border-primary/25">
              <div className="absolute inset-2 flex items-center justify-center rounded-full border-8 border-primary border-t-transparent text-xs font-semibold text-primary">
                84%
              </div>
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
                <p className="font-display text-2xl">Tithes & Offerings</p>
                <p className="text-xl font-semibold text-accent">68%</p>
              </div>
              <Progress value={68} />
            </div>
          </Card>

          <Card className="border-l-4 border-l-success p-6">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-sm font-semibold tracking-widest text-neutral uppercase">
                Monthly Variance
              </h3>
              <span className="rounded-sm bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                +4.2%
              </span>
            </div>
            <p className="font-display text-4xl">+$12,480.00</p>
            <p className="mt-2 text-sm italic text-neutral">
              Compared to previous month average
            </p>
          </Card>
        </section>

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
          <ReportsChart />
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border bg-white/50 px-8 py-6">
            <h2 className="font-display text-3xl">Detailed Fund Breakdown</h2>
            <Button variant="ghost">
              View Audit Log
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <FundBreakdownTable />
        </Card>
      </div>
    </FinancePageShell>
  );
}
