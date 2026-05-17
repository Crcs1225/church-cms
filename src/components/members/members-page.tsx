import Link from "next/link";
import { Suspense } from "react";
import {
  ChevronRight,
  Download,
  HandHeart,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Button, Card } from "@/components/ui";
import type { AdminUserAccess } from "@/lib/admin-access";
import { getMembersSummaryData, getMembersTableData } from "./members-data";
import { MemberFilters } from "./member-filters";
import { MemberStatCard } from "./member-stat-card";
import { MemberTable } from "./member-table";

export async function MembersPage({
  page = 1,
  currentUser,
  activeUsers,
}: {
  page?: number;
  currentUser: AdminUserAccess | null;
  activeUsers: AdminUserAccess[];
}) {
  const { activeMembers } = await getMembersSummaryData();

  return (
    <AdminShell
      activeSection="Members"
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-2 flex items-center gap-2 text-xs text-text-secondary"
            >
              <span>Directory</span>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span className="font-semibold text-primary">Congregation</span>
            </nav>
            <h1 className="font-display text-5xl leading-tight text-text-primary">
              Congregation
            </h1>
            <p className="mt-1 text-text-secondary">
              Manage {activeMembers.toLocaleString()} active community members
              and their engagement history.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Download className="h-4 w-4" aria-hidden />
              Export List
            </Button>
            <Link
              href="/admin/members/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-all duration-150 hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(194,65,12,0.25)] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add Member
            </Link>
          </div>
        </header>

        <Suspense fallback={<MembersSectionFallback lines={5} />}>
          <MembersDirectorySection page={page} />
        </Suspense>

        <Suspense fallback={<MembersSectionFallback lines={3} className="mt-12" />}>
          <MembersSummarySection />
        </Suspense>
      </main>
    </AdminShell>
  );
}

function MembersSectionFallback({
  lines,
  className = "",
}: {
  lines: number;
  className?: string;
}) {
  return (
    <Card className={`rounded-xl p-6 ${className}`.trim()}>
      <div className="space-y-4">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-lg bg-surface-raised" />
        ))}
      </div>
    </Card>
  );
}

async function MembersDirectorySection({ page }: { page: number }) {
  const { members, totalMembers, pagination } = await getMembersTableData({
    page,
    pageSize: 10,
  });

  return (
    <>
      <MemberFilters totalMembers={totalMembers} visibleMembers={members.length} />
      <MemberTable members={members} pagination={pagination} />
    </>
  );
}

async function MembersSummarySection() {
  const { newMembersLast30Days } = await getMembersSummaryData();

  return (
    <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      <MemberStatCard
        label="Total Attendance"
        value="1,142"
        trend="+12%"
        icon={TrendingUp}
      />
      <MemberStatCard
        label="New Members"
        value={newMembersLast30Days.toLocaleString()}
        trend="+5%"
        description="Past 30 days"
        icon={HandHeart}
        accentClassName="bg-accent"
        iconClassName="bg-accent/10 text-accent"
      />
      <MemberStatCard
        label="Retention Rate"
        value="94.2%"
        trend="-2%"
        icon={Users}
        accentClassName="bg-blue-700"
        iconClassName="bg-blue-50 text-blue-700"
        trendClassName="text-warning"
      />
    </section>
  );
}
