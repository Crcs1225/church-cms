import { Suspense } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  ChevronRight,
  Database,
  FolderSync,
  Info,
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
  getDashboardActivityData,
  getDashboardBreakdownData,
  getDashboardCalendarData,
  getDashboardFinancialSnapshot,
  getDashboardLocalDataStatus,
  getDashboardRecentMembersData,
} from "@/components/admin";
import { Avatar, Badge, Button, Card, LoadingScreen, Progress } from "@/components/ui";

const quickActions = [
  { label: "Add Tithe", href: "/admin/finances/income", icon: ReceiptText },
  { label: "Add Member", href: "/admin/members/new", icon: Users },
  { label: "Create Event", href: "/admin/events/create", icon: CalendarPlus },
  { label: "View Reports", href: "/admin/finances/reports", icon: TrendingUp },
];

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          compact
          className="px-6 py-10"
          title="Loading Dashboard"
          description="Gathering member, finance, event, and activity summaries for the admin overview."
        />
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  return (
    <AdminShell activeSection="Dashboard">
      <div className="mx-auto max-w-350 p-6">
        <header className="mb-6">
          <h2 className="font-display text-3xl leading-tight">
            Overview Dashboard
          </h2>
          <p className="text-text-secondary">
            Real-time overview of members, finances, events, and local activity.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <QuickActionsSection />

          <Suspense fallback={<DashboardSectionFallback title="Local Data Status" className="col-span-12 lg:col-span-4" />}>
            <LocalDataStatusSection />
          </Suspense>

          <Suspense fallback={<DashboardSectionFallback title="Financial Snapshot" className="col-span-12 lg:col-span-8" />}>
            <FinancialSnapshotSection />
          </Suspense>

          <Suspense fallback={<DashboardSectionFallback title="Operational Alerts" className="col-span-12 lg:col-span-4" />}>
            <OperationalAlertsSection />
          </Suspense>

          <Suspense fallback={<DashboardSectionFallback title="Calendar" className="col-span-12 lg:col-span-4" />}>
            <CalendarSection />
          </Suspense>

          <Suspense fallback={<DashboardSectionFallback title="Breakdowns" className="col-span-12 space-y-4 lg:col-span-4" />}>
            <BreakdownSection />
          </Suspense>

          <Suspense fallback={<DashboardSectionFallback title="New Members" className="col-span-12 lg:col-span-4" />}>
            <RecentMembersSection />
          </Suspense>

          <Suspense fallback={<DashboardSectionFallback title="System Activity Log" className="col-span-12" />}>
            <ActivityLogSection />
          </Suspense>
        </div>
      </div>
    </AdminShell>
  );
}

function QuickActionsSection() {
  return (
    <Card className="col-span-12 lg:col-span-8">
      <h3 className="mb-4 text-sm font-semibold tracking-widest text-text-secondary uppercase">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.label}
            label={action.label}
            href={action.href}
            icon={action.icon}
          />
        ))}
      </div>
    </Card>
  );
}

function DashboardSectionFallback({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="mb-4 h-3 w-32 animate-pulse rounded-full bg-surface-raised" />
      <div className="mb-6 h-8 w-48 animate-pulse rounded-full bg-surface-raised" />
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={`${title}-${item}`} className="rounded-md bg-surface p-4">
            <div className="h-3 w-28 animate-pulse rounded-full bg-background" />
            <div className="mt-3 h-6 w-32 animate-pulse rounded-full bg-background" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-background" />
          </div>
        ))}
      </div>
    </Card>
  );
}

async function LocalDataStatusSection() {
  const dashboardData = await getDashboardLocalDataStatus();

  return (
    <section className="relative col-span-12 flex flex-col justify-between overflow-hidden rounded-lg bg-primary p-6 text-white lg:col-span-4">
      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Local Data Status</h3>
            <p className="text-xs text-white/80">Offline-first SQLite health snapshot</p>
          </div>
          <span className="flex items-center gap-2 rounded-sm bg-white/20 px-2 py-1 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                dashboardData.localDataStatus.unsyncedCount > 0
                  ? "bg-warning"
                  : "bg-success"
              }`}
            />
            {dashboardData.localDataStatus.unsyncedCount > 0
              ? "Needs Review"
              : "Current"}
          </span>
        </div>
        <p className="mb-6 text-sm text-white/90">
          {dashboardData.localDataStatus.unsyncedCount > 0
            ? `${dashboardData.localDataStatus.unsyncedCount} records are still flagged as unsynced across local workflows.`
            : "All tracked records are currently marked as synced in the local database."}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-xs text-white/75">Members</p>
            <p className="mt-1 font-semibold">
              {dashboardData.localDataStatus.memberCount}
            </p>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-xs text-white/75">Income</p>
            <p className="mt-1 font-semibold">
              {dashboardData.localDataStatus.contributionCount}
            </p>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-xs text-white/75">Expenses</p>
            <p className="mt-1 font-semibold">
              {dashboardData.localDataStatus.expenseCount}
            </p>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <p className="text-xs text-white/75">Events</p>
            <p className="mt-1 font-semibold">
              {dashboardData.localDataStatus.eventCount}
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-6 flex items-center gap-2 text-sm font-semibold text-white/85">
        <FolderSync className="h-4 w-4" aria-hidden />
        Sync UI is not implemented yet. These counts come from persisted flags.
      </div>
      <Database
        className="absolute -right-8 -bottom-8 h-32 w-32 text-white/10"
        aria-hidden
      />
    </section>
  );
}

async function FinancialSnapshotSection() {
  const dashboardData = await getDashboardFinancialSnapshot();

  return (
    <Card className="relative col-span-12 overflow-hidden border-l-4 border-l-primary bg-background lg:col-span-8">
      <div className="mb-6 flex items-end justify-between">
        <h3 className="font-display text-2xl">Financial Snapshot</h3>
        <Link href="/admin/finances" className="text-sm font-semibold text-primary">
          View Ledger
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          label="Today's Total"
          value={dashboardData.todayIncome}
          detail={
            <span className="flex items-center gap-1 font-semibold text-success">
              <TrendingUp className="h-3 w-3" aria-hidden />
              Income received today
            </span>
          }
        />
        <MetricCard
          label="Week To Date"
          value={dashboardData.weekIncome}
          detail={<span className="italic">Month net: {dashboardData.monthNet}</span>}
        />
        <div className="rounded-md bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
              Latest Contribution
            </span>
            <Badge variant={dashboardData.latestContribution ? "success" : "default"}>
              {dashboardData.latestContribution ? "Logged" : "Empty"}
            </Badge>
          </div>
          {dashboardData.latestContribution ? (
            <div className="flex items-center gap-3">
              <Avatar name={dashboardData.latestContribution.memberName} />
              <div>
                <p className="text-sm font-semibold">
                  {dashboardData.latestContribution.memberName}
                </p>
                <p className="text-xs text-text-secondary">
                  {dashboardData.latestContribution.amount} -{" "}
                  {dashboardData.latestContribution.categoryName}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              No contribution has been recorded yet.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

async function OperationalAlertsSection() {
  const dashboardData = await getDashboardLocalDataStatus();

  return (
    <Card className="col-span-12 overflow-hidden p-0 lg:col-span-4">
      <div className="flex items-center justify-between border-b border-border bg-background p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Info className="h-4 w-4 text-warning" aria-hidden />
          Operational Alerts
        </h3>
        <Badge variant={dashboardData.alerts[0]?.tone === "warning" ? "warning" : "primary"}>
          {dashboardData.alerts.length} Item{dashboardData.alerts.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {dashboardData.alerts.map((alert) => (
          <div key={`${alert.title}-${alert.timestamp}`} className="p-4 hover:bg-background">
            <p
              className={`flex items-center gap-2 text-sm font-semibold ${
                alert.tone === "warning" ? "text-warning" : "text-primary"
              }`}
            >
              {alert.tone === "warning" ? (
                <FolderSync className="h-4 w-4" aria-hidden />
              ) : (
                <CalendarPlus className="h-4 w-4" aria-hidden />
              )}
              {alert.title}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{alert.detail}</p>
            <p className="mt-2 text-[11px] font-semibold tracking-widest text-neutral uppercase">
              {alert.timestamp}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function CalendarSection() {
  const dashboardData = await getDashboardCalendarData();

  return (
    <Card className="col-span-12 bg-background lg:col-span-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl">Calendar</h3>
        <Button variant="ghost" size="sm" aria-label="More calendar actions">
          <MoreVertical className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <div className="space-y-4">
        {dashboardData.upcomingEvents.map((event) => (
          <EventItem
            key={event.publicId}
            month={event.month}
            day={event.day}
            title={event.title}
            details={event.details}
          />
        ))}
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
            Upcoming Events
          </p>
          <p className="text-sm text-text-secondary">
            {dashboardData.upcomingEvents.length > 0
              ? `${dashboardData.upcomingEvents.length} upcoming events are currently scheduled.`
              : "No upcoming events are scheduled yet."}
          </p>
        </div>
      </div>
    </Card>
  );
}

async function BreakdownSection() {
  const dashboardData = await getDashboardBreakdownData();

  return (
    <section className="col-span-12 space-y-4 lg:col-span-4">
      <Card className="bg-background">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
            Member Status Mix
          </p>
          <span className="text-xs font-semibold text-primary">Live</span>
        </div>
        {dashboardData.memberStatus.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.memberStatus.map((status) => (
              <Progress key={status.label} value={status.percent} label={status.label} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No member status data is available yet.
          </p>
        )}
      </Card>

      <Card className="bg-background">
        <p className="mb-4 text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
          Offering Breakdown
        </p>
        {dashboardData.offeringBreakdown.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.offeringBreakdown.map((item) => (
              <Progress key={item.label} value={item.percent} label={item.label} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No contributions have been recorded yet.
          </p>
        )}
      </Card>
    </section>
  );
}

async function RecentMembersSection() {
  const dashboardData = await getDashboardRecentMembersData();

  return (
    <Card className="col-span-12 bg-background lg:col-span-4">
      <h3 className="mb-4 font-display text-xl">New Members</h3>
      {dashboardData.recentMembers.length > 0 ? (
        <div className="space-y-3">
          {dashboardData.recentMembers.map((member) => (
            <Link
              key={member.publicId}
              href={`/admin/members/${member.publicId}`}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface"
            >
              <Avatar name={member.name} className="h-10 w-10" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{member.name}</p>
                <p className="text-xs text-text-secondary">{member.detail}</p>
              </div>
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary"
                aria-hidden
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          No members have been added yet.
        </p>
      )}
      <Link
        href="/admin/members"
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-semibold text-text-primary transition-all duration-150 hover:bg-surface-raised"
      >
        View All Members
      </Link>
    </Card>
  );
}

async function ActivityLogSection() {
  const dashboardData = await getDashboardActivityData();

  return (
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
          <option>Events</option>
        </select>
      </div>
      <ActivityTable rows={dashboardData.activityRows} />
    </Card>
  );
}
