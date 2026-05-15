import { Avatar, Badge } from "@/components/ui";
import type { DashboardActivityRow } from "./admin-data";

type ActivityTableProps = {
  rows: DashboardActivityRow[];
};

export function ActivityTable({ rows }: ActivityTableProps) {
  return (
    <div className="max-h-[400px] overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
          <tr>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">Entity</th>
            <th className="px-6 py-3">Details</th>
            <th className="px-6 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {rows.map((row) => (
            <tr key={`${row.time}-${row.action}`} className="hover:bg-background">
              <td className="px-6 py-4 font-code text-xs text-neutral">{row.time}</td>
              <td className="px-6 py-4 font-semibold">{row.action}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Avatar name={row.actorLabel} className="h-6 w-6 text-[10px]" />
                  {row.actorLabel}
                </div>
              </td>
              <td className="px-6 py-4">{row.details}</td>
              <td className="px-6 py-4 text-right">
                <Badge variant={row.variant}>{row.status}</Badge>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-6 py-8 text-sm text-text-secondary" colSpan={5}>
                No activity has been logged yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
