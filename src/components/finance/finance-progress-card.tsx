import type { ReactNode } from "react";
import { Card, Progress } from "@/components/ui";
import { cn } from "@/lib/cn";

type FinanceProgressCardProps = {
  label: string;
  value: string;
  description?: string;
  progressLabel: string;
  progressValue: number;
  accentClassName?: string;
  children?: ReactNode;
};

export function FinanceProgressCard({
  label,
  value,
  description,
  progressLabel,
  progressValue,
  accentClassName = "border-l-primary",
  children,
}: FinanceProgressCardProps) {
  return (
    <Card className={cn("border-l-4 p-6", accentClassName)}>
      <p className="mb-2 text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
        {label}
      </p>
      <p className="font-display text-3xl text-text-primary">{value}</p>
      {description ? (
        <p className="mt-2 text-xs text-text-secondary">{description}</p>
      ) : null}
      <div className="mt-4 border-t border-border pt-4">
        <Progress value={progressValue} label={progressLabel} />
      </div>
      {children}
    </Card>
  );
}
