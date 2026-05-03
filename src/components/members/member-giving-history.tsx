import { Badge, Button, Card } from "@/components/ui";
import type { MemberGivingRow } from "./members-data";

type MemberGivingHistoryProps = {
  givingRows: MemberGivingRow[];
};

export function MemberGivingHistory({ givingRows }: MemberGivingHistoryProps) {
  return (
    <Card className="flex flex-col overflow-hidden p-0 lg:col-span-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border p-6 sm:flex-row sm:items-center">
        <h3 className="font-display text-xl text-text-primary">Giving History</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm">All</Button>
          <Button variant="secondary" size="sm">
            Tithes
          </Button>
          <Button variant="secondary" size="sm">
            Offerings
          </Button>
          <Button variant="secondary" size="sm">
            Special
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {givingRows.length > 0 ? (
              givingRows.map((row) => (
                <tr key={row.publicId} className="hover:bg-background">
                  <td className="px-6 py-4 text-sm">{row.date}</td>
                  <td className="px-6 py-4">
                    <Badge className={row.badgeClassName}>{row.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {row.method}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold">
                    {row.amount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-text-secondary"
                >
                  No giving records yet. Totals will stay at $0.00 until this
                  member has contributions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-background p-4 text-center">
        <Button variant="ghost">View All Transactions</Button>
      </div>
    </Card>
  );
}
