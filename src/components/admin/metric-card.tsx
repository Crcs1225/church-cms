import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: ReactNode;
  accent?: boolean;
  className?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  accent,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "space-y-1 rounded-md bg-surface p-4",
        accent && "border-l-4 border-primary",
        className,
      )}
    >
      <p className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
        {label}
      </p>
      <p className="font-display text-3xl leading-tight">{value}</p>
      {detail ? <div className="text-xs text-text-secondary">{detail}</div> : null}
    </div>
  );
}
