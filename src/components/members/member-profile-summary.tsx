import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Card } from "@/components/ui";

type MemberProfileSummaryProps = {
  label: string;
  value: string;
  icon: ComponentType<LucideProps>;
  iconClassName: string;
};

export function MemberProfileSummary({
  label,
  value,
  icon: Icon,
  iconClassName,
}: MemberProfileSummaryProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-md ${iconClassName}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
          {label}
        </p>
        <p className="font-display text-xl text-text-primary">{value}</p>
      </div>
    </Card>
  );
}
