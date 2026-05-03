import { Card } from "@/components/ui";
import { FinancePageShell } from "./finance-page-shell";

type FinancePlaceholderProps = {
  activeTab: string;
  title: string;
};

export function FinancePlaceholder({
  activeTab,
  title,
}: FinancePlaceholderProps) {
  return (
    <FinancePageShell activeTab={activeTab}>
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <Card className="p-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Finance
          </p>
          <h1 className="mt-3 font-display text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            This tab reuses the finance route shell and navigation. The detailed
            workflow can be filled in after the overview dashboard is stable.
          </p>
        </Card>
      </div>
    </FinancePageShell>
  );
}
