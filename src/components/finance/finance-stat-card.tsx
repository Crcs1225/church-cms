import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FinanceStatCardProps = {
  label: string;
  value: string;
  caption: string;
  trend: ReactNode;
  accentClassName?: string;
};

export function FinanceStatCard({
  label,
  value,
  caption,
  trend,
  accentClassName = "border-l-primary",
}: FinanceStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border border-l-4 bg-surface p-6 transition-shadow duration-150 hover:shadow-[0_4px_16px_rgba(28,25,23,0.06)]",
        accentClassName,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
          {label}
        </span>
        {trend}
      </div>
      <p className="font-display text-3xl leading-tight text-text-primary">
        {value}
      </p>
      <p className="mt-2 text-xs text-text-secondary">{caption}</p>
    </div>
  );
}
