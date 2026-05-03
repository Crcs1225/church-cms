import { Avatar, Badge } from "@/components/ui";

const activityRows = [
  {
    time: "14:22:10",
    action: "FINANCE_ADD",
    user: "Juan Dela Cruz",
    details: "Added ₱500.00 tithe for Sunday service",
    status: "VERIFIED",
    variant: "success" as const,
  },
  {
    time: "13:45:02",
    action: "MEMBER_UPDATE",
    user: "Admin",
    details: "Updated address for member Maria Santos",
    status: "SYSTEM",
    variant: "default" as const,
  },
  {
    time: "12:10:44",
    action: "FINANCE_BATCH",
    user: "Admin",
    details: "Batch upload: 24 tithe records from Tablet B-02",
    status: "PENDING (8)",
    variant: "warning" as const,
  },
  {
    time: "10:30:15",
    action: "EVENT_CREATE",
    user: "Pastor Arnel",
    details: 'Created event: "Midweek Prayer Focus"',
    status: "PUBLISHED",
    variant: "success" as const,
  },
];

export function ActivityTable() {
  return (
    <div className="max-h-[400px] overflow-y-auto">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
          <tr>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Details</th>
            <th className="px-6 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {activityRows.map((row) => (
            <tr key={`${row.time}-${row.action}`} className="hover:bg-background">
              <td className="px-6 py-4 font-code text-xs text-neutral">{row.time}</td>
              <td className="px-6 py-4 font-semibold">{row.action}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Avatar name={row.user} className="h-6 w-6 text-[10px]" />
                  {row.user}
                </div>
              </td>
              <td className="px-6 py-4">{row.details}</td>
              <td className="px-6 py-4 text-right">
                <Badge variant={row.variant}>{row.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
