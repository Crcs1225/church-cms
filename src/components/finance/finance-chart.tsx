import { cn } from "@/lib/cn";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const chartBars = [
  {
    wrapper: "h-[40%]",
    income: "h-[80%] group-hover:h-[85%]",
    expense: "h-[45%] group-hover:h-[50%]",
  },
  {
    wrapper: "h-[55%]",
    income: "h-[70%] group-hover:h-[75%]",
    expense: "h-[50%] group-hover:h-[55%]",
  },
  {
    wrapper: "h-[70%]",
    income: "h-[90%] group-hover:h-[95%]",
    expense: "h-[40%] group-hover:h-[45%]",
  },
  {
    wrapper: "h-[60%]",
    income: "h-[65%] group-hover:h-[70%]",
    expense: "h-[60%] group-hover:h-[65%]",
  },
  {
    wrapper: "h-[80%]",
    income: "h-[85%] group-hover:h-[90%]",
    expense: "h-[30%] group-hover:h-[35%]",
  },
  {
    wrapper: "h-full",
    income: "h-[95%] group-hover:h-full",
    expense: "h-[40%] group-hover:h-[45%]",
  },
];

export function FinanceChart() {
  return (
    <div>
      <div className="flex h-64 w-full items-end justify-between border-b border-border px-2 pt-4">
        {chartBars.map((bar, index) => (
          <div
            key={months[index]}
            className={cn(
              "group relative w-12 rounded-t bg-surface-raised",
              bar.wrapper,
            )}
          >
            <div
              className={cn(
                "absolute bottom-0 left-0 w-1/2 rounded-t bg-primary/80 transition-all",
                bar.income,
              )}
            />
            <div
              className={cn(
                "absolute right-0 bottom-0 w-1/2 rounded-t bg-stone-300/80 transition-all",
                bar.expense,
              )}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between px-2">
        {months.map((month) => (
          <span
            key={month}
            className="text-[10px] text-text-secondary uppercase"
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}
