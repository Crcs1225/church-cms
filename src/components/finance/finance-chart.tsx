import type { FinanceReportMonth } from "./finance-data";

type FinanceChartProps = {
  months: FinanceReportMonth[];
};

export function FinanceChart({ months }: FinanceChartProps) {
  const maxCents = Math.max(
    1,
    ...months.flatMap((month) => [month.incomeCents, month.expenseCents]),
  );

  return (
    <div>
      <div className="flex h-64 w-full items-end justify-between border-b border-border px-2 pt-4">
        {months.map((month) => (
          <div
            key={month.key}
            className="group relative h-full w-12 rounded-t bg-surface-raised"
          >
            <div
              className="absolute bottom-0 left-0 w-1/2 rounded-t bg-primary/80 transition-all"
              style={{
                height: `${Math.max(6, (month.incomeCents / maxCents) * 100)}%`,
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-1/2 rounded-t bg-stone-300/80 transition-all"
              style={{
                height: `${Math.max(6, (month.expenseCents / maxCents) * 100)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between px-2">
        {months.map((month) => (
          <span
            key={month.key}
            className="text-[10px] text-text-secondary uppercase"
          >
            {month.label}
          </span>
        ))}
      </div>
    </div>
  );
}
