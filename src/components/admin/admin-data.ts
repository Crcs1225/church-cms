import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type CategoryBreakdownEntry = {
  categoryId: number;
  _sum?: {
    amountCents?: number | null;
  } | null;
};

type CountEntry = {
  count: number;
  label: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const normalizedOffset = day === 0 ? 6 : day - 1;

  return addDays(startOfDay(date), -normalizedOffset);
}

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function formatEventMonth(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function formatEventDetails(event: { startsAt: Date; location: string | null }) {
  const time = event.startsAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return event.location ? `${time} - ${event.location}` : time;
}

type ActivityVariant = "default" | "success" | "warning" | "error" | "primary";

function getActivityVariant(action: string): ActivityVariant {
  if (action.includes("DELETE") || action.includes("ARCHIVE")) {
    return "warning";
  }

  if (action.includes("CREATE")) {
    return "success";
  }

  if (action.includes("UPDATE")) {
    return "primary";
  }

  return "default";
}

function getActivityStatus(action: string) {
  if (action.includes("DELETE")) {
    return "Deleted";
  }

  if (action.includes("ARCHIVE")) {
    return "Archived";
  }

  if (action.includes("CREATE")) {
    return "Created";
  }

  if (action.includes("UPDATE")) {
    return "Updated";
  }

  return "Logged";
}

export type DashboardActivityRow = {
  time: string;
  action: string;
  actorLabel: string;
  details: string;
  status: string;
  variant: ActivityVariant;
};

export type DashboardData = {
  todayIncome: string;
  weekIncome: string;
  monthNet: string;
  monthExpense: string;
  latestContribution: {
    memberName: string;
    amount: string;
    categoryName: string;
  } | null;
  localDataStatus: {
    unsyncedCount: number;
    memberCount: number;
    contributionCount: number;
    expenseCount: number;
    eventCount: number;
  };
  alerts: Array<{
    title: string;
    detail: string;
    timestamp: string;
    tone: "warning" | "primary";
  }>;
  upcomingEvents: Array<{
    publicId: string;
    month: string;
    day: string;
    title: string;
    details: string;
  }>;
  offeringBreakdown: Array<{
    label: string;
    percent: number;
  }>;
  memberStatus: Array<{
    label: string;
    percent: number;
  }>;
  recentMembers: Array<{
    publicId: string;
    name: string;
    detail: string;
  }>;
  activityRows: DashboardActivityRow[];
};

export type DashboardFinancialSnapshot = Pick<
  DashboardData,
  "todayIncome" | "weekIncome" | "monthNet" | "monthExpense" | "latestContribution"
>;

export type DashboardLocalDataStatus = Pick<
  DashboardData,
  "localDataStatus" | "alerts"
>;

export type DashboardCalendarData = Pick<DashboardData, "upcomingEvents">;

export type DashboardBreakdownData = Pick<
  DashboardData,
  "offeringBreakdown" | "memberStatus"
>;

export type DashboardRecentMembersData = Pick<DashboardData, "recentMembers">;

export type DashboardActivityData = Pick<DashboardData, "activityRows">;

export async function getDashboardFinancialSnapshot(): Promise<DashboardFinancialSnapshot> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [
    todayIncome,
    weekIncome,
    monthIncome,
    monthExpenses,
    latestContribution,
  ] = await prisma.$transaction([
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: weekStart,
          lt: tomorrowStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.contribution.aggregate({
      where: {
        receivedAt: {
          gte: monthStart,
          lt: tomorrowStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      where: {
        paidAt: {
          gte: monthStart,
          lt: tomorrowStart,
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.contribution.findFirst({
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const monthIncomeCents = monthIncome._sum.amountCents ?? 0;
  const monthExpenseCents = monthExpenses._sum.amountCents ?? 0;

  return {
    todayIncome: formatCurrency(todayIncome._sum.amountCents ?? 0),
    weekIncome: formatCurrency(weekIncome._sum.amountCents ?? 0),
    monthNet: formatCurrency(monthIncomeCents - monthExpenseCents),
    monthExpense: formatCurrency(monthExpenseCents),
    latestContribution: latestContribution
      ? {
          memberName: latestContribution.member
            ? [
                latestContribution.member.firstName,
                latestContribution.member.lastName,
              ]
                .filter(Boolean)
                .join(" ")
            : "Anonymous giver",
          amount: formatCurrency(latestContribution.amountCents),
          categoryName: latestContribution.category.name,
        }
      : null,
  };
}

export async function getDashboardLocalDataStatus(): Promise<DashboardLocalDataStatus> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const nextWeek = addDays(todayStart, 7);

  const [
    unsyncedMembers,
    unsyncedContributions,
    unsyncedExpenses,
    unsyncedEvents,
    upcomingEvents,
  ] = await prisma.$transaction([
    prisma.member.count({
      where: {
        synced: false,
        deletedAt: null,
      },
    }),
    prisma.contribution.count({
      where: {
        synced: false,
      },
    }),
    prisma.expense.count({
      where: {
        synced: false,
      },
    }),
    prisma.event.count({
      where: {
        synced: false,
      },
    }),
    prisma.event.findMany({
      where: {
        startsAt: {
          gte: todayStart,
        },
      },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      take: 1,
    }),
  ]);

  const totalUnsyncedCount =
    unsyncedMembers + unsyncedContributions + unsyncedExpenses + unsyncedEvents;
  const alerts: DashboardData["alerts"] = [];

  if (totalUnsyncedCount > 0) {
    alerts.push({
      title: "Local records awaiting sync",
      detail: `${totalUnsyncedCount} records are still marked as unsynced in the local database.`,
      timestamp: "Needs review",
      tone: "warning",
    });
  }

  const nextEvent = upcomingEvents[0];
  if (nextEvent && nextEvent.startsAt <= nextWeek) {
    alerts.push({
      title: "Upcoming event this week",
      detail: `${nextEvent.title} is scheduled for ${formatDate(nextEvent.startsAt)}.`,
      timestamp: formatDate(nextEvent.startsAt),
      tone: "primary",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      title: "No active operational alerts",
      detail: "Members, finances, and events do not currently show flagged issues.",
      timestamp: formatDate(now),
      tone: "primary",
    });
  }

  return {
    localDataStatus: {
      unsyncedCount: totalUnsyncedCount,
      memberCount: unsyncedMembers,
      contributionCount: unsyncedContributions,
      expenseCount: unsyncedExpenses,
      eventCount: unsyncedEvents,
    },
    alerts,
  };
}

export async function getDashboardCalendarData(): Promise<DashboardCalendarData> {
  const todayStart = startOfDay(new Date());
  const upcomingEvents = await prisma.event.findMany({
    where: {
      startsAt: {
        gte: todayStart,
      },
    },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    take: 3,
  });

  return {
    upcomingEvents: upcomingEvents.map((event: (typeof upcomingEvents)[number]) => ({
      publicId: event.publicId,
      month: formatEventMonth(event.startsAt),
      day: event.startsAt.getDate().toString().padStart(2, "0"),
      title: event.title,
      details: formatEventDetails(event),
    })),
  };
}

export async function getDashboardBreakdownData(): Promise<DashboardBreakdownData> {
  const [contributionBreakdown, contributionCategories, memberStatuses] =
    await prisma.$transaction([
      prisma.contribution.groupBy({
        by: ["categoryId"],
        _sum: { amountCents: true },
        orderBy: {
          _sum: {
            amountCents: "desc",
          },
        },
        take: 3,
      }),
      prisma.givingCategory.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.member.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          status: true,
        },
      }),
    ]);

  const statusCountsMap = new Map<string, number>();
  for (const member of memberStatuses) {
    statusCountsMap.set(
      member.status,
      (statusCountsMap.get(member.status) ?? 0) + 1,
    );
  }

  const statusCounts = Array.from(statusCountsMap.entries()).map(
    ([label, count]) => ({
      label,
      count,
    }),
  );

  const categoryMap = new Map(
    contributionCategories.map((category: { id: number; name: string }) => [category.id, category.name]),
  );
  const totalBreakdownCents = contributionBreakdown.reduce(
    (sum: number, item: CategoryBreakdownEntry) => sum + (item._sum?.amountCents ?? 0),
    0,
  );
  const totalMemberCount = statusCounts.reduce(
    (sum: number, entry: CountEntry) => sum + entry.count,
    0,
  );

  return {
    offeringBreakdown: contributionBreakdown.map((entry: CategoryBreakdownEntry) => ({
      label: categoryMap.get(entry.categoryId) ?? "Other",
      percent:
        totalBreakdownCents > 0
          ? Math.round((((entry._sum?.amountCents ?? 0) / totalBreakdownCents) * 100))
          : 0,
    })),
    memberStatus: statusCounts
      .sort((left: CountEntry, right: CountEntry) => right.count - left.count)
      .slice(0, 3)
      .map((entry: CountEntry) => ({
        label: entry.label,
        percent:
          totalMemberCount > 0
            ? Math.round(((entry.count / totalMemberCount) * 100))
            : 0,
      })),
  };
}

export async function getDashboardRecentMembersData(): Promise<DashboardRecentMembersData> {
  const recentMembers = await prisma.member.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 3,
    include: {
      memberType: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    recentMembers: recentMembers.map((member: (typeof recentMembers)[number]) => ({
      publicId: member.publicId,
      name: [member.firstName, member.lastName].filter(Boolean).join(" "),
      detail: `${formatDate(member.createdAt)}${
        member.memberType?.name ? ` - ${member.memberType.name}` : ""
      }`,
    })),
  };
}

export async function getDashboardActivityData(): Promise<DashboardActivityData> {
  const activityLogs = await prisma.activityLog.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 8,
  });

  return {
    activityRows: activityLogs.map((log: (typeof activityLogs)[number]) => ({
      time: log.createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: log.action,
      actorLabel: log.entityType,
      details: log.description,
      status: getActivityStatus(log.action),
      variant: getActivityVariant(log.action),
    })),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    financialSnapshot,
    localDataStatus,
    calendarData,
    breakdownData,
    recentMembersData,
    activityData,
  ] = await Promise.all([
    getDashboardFinancialSnapshot(),
    getDashboardLocalDataStatus(),
    getDashboardCalendarData(),
    getDashboardBreakdownData(),
    getDashboardRecentMembersData(),
    getDashboardActivityData(),
  ]);

  return {
    ...financialSnapshot,
    ...localDataStatus,
    ...calendarData,
    ...breakdownData,
    ...recentMembersData,
    ...activityData,
  };
}
