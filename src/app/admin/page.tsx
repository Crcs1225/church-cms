import {
  AlertCircle,
  CalendarPlus,
  ChevronRight,
  Cloud,
  MoreVertical,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ActivityTable,
  AdminShell,
  EventItem,
  MetricCard,
  QuickActionCard,
} from "@/components/admin";
import { Avatar, Badge, Button, Card, Progress } from "@/components/ui";

const quickActions = [
  { label: "Add Tithe", icon: ReceiptText },
  { label: "Add Member", icon: Users },
  { label: "Create Event", icon: CalendarPlus },
  { label: "View Reports", icon: TrendingUp },
];

const members = [
  {
    name: "Maria Santos",
    detail: "Joined Oct 22 - Young Professionals",
  },
  {
    name: "Robert Lim",
    detail: "Joined Oct 21 - Men's Ministry",
  },
  {
    name: "Anna Lee",
    detail: "Updated profile - Yesterday",
  },
];

const attendanceBars = [
  { heightClassName: "h-[40%]", toneClassName: "bg-surface-raised" },
  { heightClassName: "h-[60%]", toneClassName: "bg-surface-raised" },
  { heightClassName: "h-[55%]", toneClassName: "bg-surface-raised" },
  { heightClassName: "h-[80%]", toneClassName: "bg-surface-raised" },
  { heightClassName: "h-[90%]", toneClassName: "bg-primary/40" },
  { heightClassName: "h-full", toneClassName: "bg-primary" },
  { heightClassName: "h-[20%]", toneClassName: "bg-surface-raised" },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell activeSection="Dashboard">
      <div className="mx-auto max-w-350 p-6">
        <header className="mb-6">
          <h2 className="font-display text-3xl leading-tight">
            Overview Dashboard
          </h2>
          <p className="text-text-secondary">
            Welcome back. Here is what is happening with Grace Community today.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 lg:col-span-8">
            <h3 className="mb-4 text-sm font-semibold tracking-widest text-text-secondary uppercase">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.label}
                  label={action.label}
                  icon={action.icon}
                />
              ))}
            </div>
          </Card>

          <section className="relative col-span-12 flex flex-col justify-between overflow-hidden rounded-lg bg-primary p-6 text-white lg:col-span-4">
            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Cloud Sync</h3>
                  <p className="text-xs text-white/80">Last sync: 2 mins ago</p>
                </div>
                <span className="flex items-center gap-2 rounded-sm bg-white/20 px-2 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Synced
                </span>
              </div>
              <p className="mb-6 text-sm text-white/90">
                All offline records have been reconciled with the central
                database.
              </p>
            </div>
            <Button variant="inverse" className="relative z-10 w-full">
              <Cloud className="h-4 w-4" aria-hidden />
              Sync Now
            </Button>
            <Cloud
              className="absolute -right-8 -bottom-8 h-32 w-32 text-white/10"
              aria-hidden
            />
          </section>

          <Card className="relative col-span-12 overflow-hidden border-l-4 border-l-primary bg-background lg:col-span-8">
            <div className="mb-6 flex items-end justify-between">
              <h3 className="font-display text-2xl">Financial Snapshot</h3>
              <a href="#" className="text-sm font-semibold text-primary">
                View Ledger
              </a>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <MetricCard
                label="Today's Total"
                value="₱12,450.00"
                detail={
                  <span className="flex items-center gap-1 font-semibold text-success">
                    <TrendingUp className="h-3 w-3" aria-hidden />
                    +12% from avg
                  </span>
                }
              />
              <MetricCard
                label="Week To Date"
                value="₱84,200.00"
                detail={<span className="italic">Month: ₱245,000</span>}
              />
              <div className="rounded-md bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
                    Pending Verification
                  </span>
                  <Badge variant="warning">8 entries</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name="Juan Dela Cruz" />
                  <div>
                    <p className="text-sm font-semibold">Juan Dela Cruz</p>
                    <p className="text-xs text-text-secondary">₱500.00 - Tithe</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="col-span-12 overflow-hidden p-0 lg:col-span-4">
            <div className="flex items-center justify-between border-b border-border bg-background p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4 text-warning" aria-hidden />
                Live Alerts
              </h3>
              <Badge variant="error">2 New</Badge>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 hover:bg-background">
                <p className="flex items-center gap-2 text-sm font-semibold text-error">
                  <AlertCircle className="h-4 w-4" aria-hidden />
                  Unsynced data pending
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  3 finance records from tablet B-02 have not reached the server.
                </p>
                <p className="mt-2 text-[11px] font-semibold tracking-widest text-neutral uppercase">
                  15 minutes ago
                </p>
              </div>
              <div className="p-4 hover:bg-background">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <CalendarPlus className="h-4 w-4" aria-hidden />
                  Upcoming Event
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Youth Fellowship Night starts tomorrow at 6:00 PM.
                </p>
                <p className="mt-2 text-[11px] font-semibold tracking-widest text-neutral uppercase">
                  2 hours ago
                </p>
              </div>
            </div>
          </Card>

          <Card className="col-span-12 bg-background lg:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl">Calendar</h3>
              <Button variant="ghost" size="sm" aria-label="More calendar actions">
                <MoreVertical className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <div className="space-y-4">
              <EventItem
                month="Oct"
                day="24"
                title="Midweek Prayer"
                details="7:00 PM - Main Sanctuary"
              />
              <EventItem
                month="Oct"
                day="26"
                title="Youth Outreach"
                details="9:00 AM - Plaza Building"
              />
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
                  Birthdays Today
                </p>
                <div className="flex -space-x-2">
                  <Avatar name="Lina Cruz" />
                  <Avatar name="Marco Reyes" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-surface text-[10px] font-semibold text-text-secondary">
                    +3
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <section className="col-span-12 space-y-4 lg:col-span-4">
            <Card className="bg-background">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
                  Weekly Attendance Trend
                </p>
                <span className="text-xs font-semibold text-success">+4.2%</span>
              </div>
              <div className="flex h-12 items-end gap-1">
                {attendanceBars.map((bar, index) => (
                  <div
                    key={`${bar.heightClassName}-${index}`}
                    className={`flex-1 rounded-t ${bar.heightClassName} ${bar.toneClassName}`}
                  />
                ))}
              </div>
            </Card>

            <Card className="bg-background">
              <p className="mb-4 text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
                Offering Breakdown
              </p>
              <div className="space-y-3">
                <Progress value={72} label="Tithe" />
                <Progress value={18} label="Missions" />
                <Progress value={10} label="Others" />
              </div>
            </Card>
          </section>

          <Card className="col-span-12 bg-background lg:col-span-4">
            <h3 className="mb-4 font-display text-xl">New Members</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
                >
                  <Avatar name={member.name} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-text-secondary">{member.detail}</p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Open ${member.name}`}>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-4 w-full">
              View All Members
            </Button>
          </Card>

          <Card className="col-span-12 overflow-hidden bg-background p-0">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="font-display text-xl">System Activity Log</h3>
              <label htmlFor="activity-category" className="sr-only">
                Filter activity log by category
              </label>
              <select
                id="activity-category"
                aria-label="Filter activity log by category"
                title="Filter activity log by category"
                className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
              >
                <option>All Categories</option>
                <option>Financial</option>
                <option>Membership</option>
              </select>
            </div>
            <ActivityTable />
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
