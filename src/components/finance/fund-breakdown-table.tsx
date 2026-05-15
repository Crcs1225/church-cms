import { Badge } from "@/components/ui";
import { formatCurrency, type FinanceReportFundRow } from "./finance-data";

type FundBreakdownTableProps = {
  rows: FinanceReportFundRow[];
};

export function FundBreakdownTable({ rows }: FundBreakdownTableProps) {
  const totals = rows.reduce(
    (summary, row) => ({
      targetCents:
        summary.targetCents + (row.targetCents ?? 0),
      allocatedCents: summary.allocatedCents + row.allocatedCents,
    }),
    {
      targetCents: 0,
      allocatedCents: 0,
    },
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
            <th className="px-8 py-4">Fund Name</th>
            <th className="px-8 py-4">Target</th>
            <th className="px-8 py-4">Allocated</th>
            <th className="px-8 py-4">Remaining</th>
            <th className="px-8 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const remainingCents =
              row.targetCents === null ? null : row.targetCents - row.allocatedCents;
            const varianceClassName =
              remainingCents === null
                ? "text-text-secondary"
                : typeof remainingCents === "number" && remainingCents < 0
                  ? "text-success"
                  : typeof remainingCents === "number" && remainingCents === 0
                    ? "text-text-secondary"
                    : "text-warning";
            const status =
              row.targetCents === null
                ? { label: "No Target", variant: "default" as const }
                : typeof remainingCents === "number" && remainingCents < 0
                  ? { label: "Over Target", variant: "success" as const }
                  : typeof remainingCents === "number" && remainingCents === 0
                    ? { label: "Funded", variant: "primary" as const }
                    : { label: "Open", variant: "warning" as const };

            return (
              <tr key={row.publicId} className="transition-colors hover:bg-background">
                <td className="px-8 py-5 font-semibold text-text-primary">
                  {row.name}
                </td>
                <td className="px-8 py-5 text-text-secondary">
                  {row.targetCents === null ? "Not set" : formatCurrency(row.targetCents)}
                </td>
                <td className="px-8 py-5 font-semibold text-text-primary">
                  {formatCurrency(row.allocatedCents)}
                </td>
                <td className={`px-8 py-5 font-semibold ${varianceClassName}`}>
                  {remainingCents === null ? "Flexible" : formatCurrency(remainingCents)}
                </td>
                <td className="px-8 py-5 text-right">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-background">
          <tr>
            <td className="px-8 py-6 font-semibold text-text-primary">
              Total Active Funds
            </td>
            <td className="px-8 py-6 font-semibold text-text-secondary">
              {formatCurrency(totals.targetCents)}
            </td>
            <td className="px-8 py-6 font-semibold text-primary">
              {formatCurrency(totals.allocatedCents)}
            </td>
            <td className="px-8 py-6 font-semibold text-warning">
              {formatCurrency(totals.targetCents - totals.allocatedCents)}
            </td>
            <td className="px-8 py-6" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
