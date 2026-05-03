import { cn } from "@/lib/cn";

type ProgressProps = {
  value: number;
  label?: string;
  className?: string;
};

export function Progress({ value, label, className }: ProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-text-primary">{label}</span>
          <span className="font-code text-xs text-text-secondary">
            {normalizedValue}%
          </span>
        </div>
      ) : null}
      <div className="h-1 overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
