import { cn } from "@/lib/cn";

const reportBars = [
  { month: "Jan", expenses: "h-[60%]", income: "h-[75%]" },
  { month: "Feb", expenses: "h-[55%]", income: "h-[68%]" },
  { month: "Mar", expenses: "h-[65%]", income: "h-[82%]" },
  { month: "Apr", expenses: "h-[58%]", income: "h-[70%]" },
  { month: "May", expenses: "h-[62%]", income: "h-[78%]" },
  { month: "Jun", expenses: "h-[50%]", income: "h-[88%]" },
];

export function ReportsChart() {
  return (
    <div className="relative flex h-[300px] items-end justify-between gap-4 px-4">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between border-b border-border">
        <div className="h-0 w-full border-t border-stone-100" />
        <div className="h-0 w-full border-t border-stone-100" />
        <div className="h-0 w-full border-t border-stone-100" />
        <div className="h-0 w-full border-t border-stone-100" />
      </div>

      {reportBars.map((bar) => (
        <div
          key={bar.month}
          className="z-10 flex flex-1 flex-col items-center gap-2"
        >
          <div className="flex h-full w-full items-end justify-center gap-1">
            <div className={cn("w-6 rounded-t-sm bg-stone-300", bar.expenses)} />
            <div className={cn("w-6 rounded-t-sm bg-primary", bar.income)} />
          </div>
          <span className="text-xs font-semibold text-neutral uppercase">
            {bar.month}
          </span>
        </div>
      ))}
    </div>
  );
}
