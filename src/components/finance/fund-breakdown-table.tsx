import { Badge } from "@/components/ui";

const fundRows = [
  {
    name: "General Fund",
    budgeted: "$500,000",
    actual: "$524,300",
    variance: "+$24,300",
    varianceClassName: "text-success",
    status: "Surplus",
    statusVariant: "success" as const,
  },
  {
    name: "Building Fund",
    budgeted: "$250,000",
    actual: "$210,000",
    variance: "-$40,000",
    varianceClassName: "text-warning",
    status: "Shortfall",
    statusVariant: "warning" as const,
  },
  {
    name: "Missions & Outreach",
    budgeted: "$150,000",
    actual: "$158,200",
    variance: "+$8,200",
    varianceClassName: "text-success",
    status: "Surplus",
    statusVariant: "success" as const,
  },
  {
    name: "Youth Ministry",
    budgeted: "$60,000",
    actual: "$59,800",
    variance: "-$200",
    varianceClassName: "text-text-secondary",
    status: "On Track",
    statusVariant: "default" as const,
  },
  {
    name: "Benevolence Fund",
    budgeted: "$40,000",
    actual: "$42,500",
    variance: "+$2,500",
    varianceClassName: "text-success",
    status: "Surplus",
    statusVariant: "success" as const,
  },
];

export function FundBreakdownTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
            <th className="px-8 py-4">Fund Name</th>
            <th className="px-8 py-4">Budgeted</th>
            <th className="px-8 py-4">Actual</th>
            <th className="px-8 py-4">Variance</th>
            <th className="px-8 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {fundRows.map((row) => (
            <tr key={row.name} className="transition-colors hover:bg-background">
              <td className="px-8 py-5 font-semibold text-text-primary">
                {row.name}
              </td>
              <td className="px-8 py-5 text-text-secondary">{row.budgeted}</td>
              <td className="px-8 py-5 font-semibold text-text-primary">
                {row.actual}
              </td>
              <td className={`px-8 py-5 font-semibold ${row.varianceClassName}`}>
                {row.variance}
              </td>
              <td className="px-8 py-5 text-right">
                <Badge variant={row.statusVariant}>{row.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-background">
          <tr>
            <td className="px-8 py-6 font-semibold text-text-primary">
              Total Operating Budget
            </td>
            <td className="px-8 py-6 font-semibold text-text-secondary">
              $1,000,000
            </td>
            <td className="px-8 py-6 font-semibold text-primary">$994,800</td>
            <td className="px-8 py-6 font-semibold text-warning">-$5,200</td>
            <td className="px-8 py-6" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
