import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

type MemberStatCardProps = {
  label: string;
  value: string;
  trend: string;
  icon: ComponentType<LucideProps>;
  accentClassName?: string;
  iconClassName?: string;
  trendClassName?: string;
  description?: string;
};

export function MemberStatCard({
  label,
  value,
  trend,
  icon: Icon,
  accentClassName = "bg-primary",
  iconClassName = "bg-primary/10 text-primary",
  trendClassName = "text-success",
  description,
}: MemberStatCardProps) {
  return (
    <Card className="relative overflow-hidden p-6">
      <div className={cn("absolute top-0 bottom-0 left-0 w-1", accentClassName)} />
      <div className="mb-4 flex items-start justify-between">
        <span className={cn("rounded-md p-2", iconClassName)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className={cn("text-xs font-semibold", trendClassName)}>
          {trend}
        </span>
      </div>
      <h4 className="mb-1 text-xs font-semibold tracking-widest text-text-secondary uppercase">
        {label}
      </h4>
      <p className="font-display text-[32px] leading-tight text-text-primary">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-xs text-text-secondary">{description}</p>
      ) : null}
    </Card>
  );
}
