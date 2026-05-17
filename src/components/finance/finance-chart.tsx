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
          (() => {
            const incomeHeight = Math.max(6, Math.round((month.incomeCents / maxCents) * 100));
            const expenseHeight = Math.max(6, Math.round((month.expenseCents / maxCents) * 100));

            return (
              <div
                key={month.key}
                className="group relative h-full w-12 rounded-t bg-surface-raised"
              >
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <rect
                    x="0"
                    y={100 - incomeHeight}
                    width="50"
                    height={incomeHeight}
                    rx="4"
                    className="fill-primary/80"
                  />
                  <rect
                    x="50"
                    y={100 - expenseHeight}
                    width="50"
                    height={expenseHeight}
                    rx="4"
                    className="fill-stone-300/80"
                  />
                </svg>
              </div>
            );
          })()
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
