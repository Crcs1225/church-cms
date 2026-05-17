import type { FinanceReportMonth } from "./finance-data";

type ReportsChartProps = {
  months: FinanceReportMonth[];
};

export function ReportsChart({ months }: ReportsChartProps) {
  const maxCents = Math.max(
    1,
    ...months.flatMap((month) => [month.incomeCents, month.expenseCents]),
  );

  return (
    <div className="relative flex h-75 items-end justify-between gap-4 px-4">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between border-b border-border">
        <div className="h-0 w-full border-t border-stone-100" />
        <div className="h-0 w-full border-t border-stone-100" />
        <div className="h-0 w-full border-t border-stone-100" />
        <div className="h-0 w-full border-t border-stone-100" />
      </div>

      {months.map((month) => (
        <div
          key={month.key}
          className="z-10 flex flex-1 flex-col items-center gap-2"
        >
          <div className="flex h-full w-full items-end justify-center gap-1">
            <div 
              className="w-6 rounded-t-sm bg-stone-300"
              style={{
                height: `${Math.max(4, (month.expenseCents / maxCents) * 100)}%`,
              }}
              title={`Expenses: ${(month.expenseCents / 100).toFixed(2)}`}
            />
            <div
              className="w-6 rounded-t-sm bg-primary"
              style={{
                height: `${Math.max(4, (month.incomeCents / maxCents) * 100)}%`,
              }}
              title={`Income: ${(month.incomeCents / 100).toFixed(2)}`}
            />
          </div>
          <span className="text-xs font-semibold text-neutral uppercase">
            {month.label}
          </span>
        </div>
      ))}
    </div>
  );
}
