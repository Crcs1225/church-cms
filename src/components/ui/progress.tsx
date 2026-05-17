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
        <svg
          className="h-full w-full"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect
            x="0"
            y="0"
            width={normalizedValue}
            height="4"
            rx="2"
            className="fill-primary"
          />
        </svg>
      </div>
    </div>
  );
}
