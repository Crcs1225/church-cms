import { NextRequest, NextResponse } from "next/server";
import type { AppPermission } from "@/lib/admin-access";
import { apiError } from "@/lib/api-utils";
import { hasPermission, resolveRequestAppUser } from "@/lib/admin-access";
import {
  GLOBAL_SEARCH_MIN_QUERY_LENGTH,
  GLOBAL_SEARCH_RESULT_LIMIT,
  type GlobalSearchGroup,
  type GlobalSearchItem,
} from "@/lib/global-search";
import { prisma } from "@/lib/prisma";

type PageSearchEntry = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  permission: AppPermission;
  keywords: string[];
};

const pageEntries: PageSearchEntry[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "Overview, metrics, and recent activity",
    href: "/admin",
    permission: "dashboard:view",
    keywords: ["dashboard", "overview", "activity", "home"],
  },
  {
    id: "members",
    title: "Members",
    subtitle: "Browse the congregation directory",
    href: "/admin/members",
    permission: "members:view",
    keywords: ["members", "directory", "congregation", "people"],
  },
  {
    id: "members-new",
    title: "Add Member",
    subtitle: "Create a new member record",
    href: "/admin/members/new",
    permission: "members:manage",
    keywords: ["add member", "new member", "create member", "register member"],
  },
  {
    id: "finances-overview",
    title: "Finance Overview",
    subtitle: "View balances, trends, and summaries",
    href: "/admin/finances",
    permission: "finances:view",
    keywords: ["finances", "finance", "overview", "summary", "budget"],
  },
  {
    id: "finances-income",
    title: "Income",
    subtitle: "Review donations and other income",
    href: "/admin/finances/income",
    permission: "finances:view",
    keywords: ["income", "donations", "giving", "contributions", "offerings"],
  },
  {
    id: "finances-expenses",
    title: "Expenses",
    subtitle: "Review recorded expenses",
    href: "/admin/finances/expenses",
    permission: "finances:view",
    keywords: ["expenses", "spending", "purchases", "bills"],
  },
  {
    id: "finances-reports",
    title: "Finance Reports",
    subtitle: "Open finance reporting views",
    href: "/admin/finances/reports",
    permission: "finances:view",
    keywords: ["reports", "finance report", "statements", "print report"],
  },
  {
    id: "events",
    title: "Events",
    subtitle: "Browse upcoming and past events",
    href: "/admin/events",
    permission: "events:view",
    keywords: ["events", "calendar", "gatherings", "schedule"],
  },
  {
    id: "events-calendar",
    title: "Event Calendar",
    subtitle: "Open the calendar view",
    href: "/admin/events/calendar",
    permission: "events:view",
    keywords: ["calendar", "month view", "event calendar"],
  },
  {
    id: "events-create",
    title: "Create Event",
    subtitle: "Schedule a new event",
    href: "/admin/events/create",
    permission: "events:manage",
    keywords: ["create event", "new event", "schedule event"],
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "Manage church profile, notifications, and users",
    href: "/admin/settings",
    permission: "settings:view",
    keywords: ["settings", "configuration", "profile", "notifications", "users"],
  },
];

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function normalizeQuery(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function formatMoney(amountCents: number) {
  return currencyFormatter.format(amountCents / 100);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function matchesQuery(query: string, values: string[]) {
  return values.some((value) => value.toLowerCase().includes(query));
}

function buildPageResults(
  query: string,
  permissionCheck: (permission: AppPermission) => boolean,
) {
  return pageEntries
    .filter((entry) => permissionCheck(entry.permission))
    .filter((entry) => matchesQuery(query, [entry.title, entry.subtitle, ...entry.keywords]))
    .slice(0, GLOBAL_SEARCH_RESULT_LIMIT)
    .map<GlobalSearchItem>((entry) => ({
      id: entry.id,
      title: entry.title,
      href: entry.href,
      subtitle: entry.subtitle,
      meta: "Go to page",
      group: "pages",
    }));
}

export async function GET(request: NextRequest) {
  const user = await resolveRequestAppUser(request);

  if (!user || user.status !== "active") {
    return apiError("An active admin user is required to search.", 403, "BAD_REQUEST");
  }

  const query = normalizeQuery(new URL(request.url).searchParams.get("query"));

  if (query.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) {
    return NextResponse.json({
      query,
      groups: [],
    });
  }

  const can = (permission: AppPermission) => hasPermission(user, permission);

  const memberPromise = can("members:view")
    ? prisma.member.findMany({
        where: {
          deletedAt: null,
          OR: [
            { publicId: { contains: query } },
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
            { phone: { contains: query } },
            { memberType: { is: { name: { contains: query } } } },
            { memberType: { is: { slug: { contains: query } } } },
          ],
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: GLOBAL_SEARCH_RESULT_LIMIT,
        select: {
          publicId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          memberType: {
            select: {
              name: true,
            },
          },
        },
      })
    : Promise.resolve([]);

  const eventPromise = can("events:view")
    ? prisma.event.findMany({
        where: {
          OR: [
            { publicId: { contains: query } },
            { title: { contains: query } },
            { description: { contains: query } },
            { location: { contains: query } },
          ],
        },
        orderBy: [{ startsAt: "desc" }, { id: "desc" }],
        take: GLOBAL_SEARCH_RESULT_LIMIT,
        select: {
          publicId: true,
          title: true,
          location: true,
          startsAt: true,
        },
      })
    : Promise.resolve([]);

  const incomePromise = can("finances:view")
    ? prisma.contribution.findMany({
        where: {
          OR: [
            { publicId: { contains: query } },
            { reference: { contains: query } },
            { notes: { contains: query } },
            { category: { is: { name: { contains: query } } } },
            { category: { is: { slug: { contains: query } } } },
            {
              member: {
                is: {
                  OR: [
                    { publicId: { contains: query } },
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { email: { contains: query } },
                  ],
                },
              },
            },
          ],
        },
        orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
        take: GLOBAL_SEARCH_RESULT_LIMIT,
        select: {
          publicId: true,
          amountCents: true,
          receivedAt: true,
          reference: true,
          category: {
            select: {
              name: true,
            },
          },
          member: {
            select: {
              publicId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    : Promise.resolve([]);

  const expensePromise = can("finances:view")
    ? prisma.expense.findMany({
        where: {
          OR: [
            { publicId: { contains: query } },
            { vendor: { contains: query } },
            { description: { contains: query } },
            { reference: { contains: query } },
            { notes: { contains: query } },
            { category: { is: { name: { contains: query } } } },
            { category: { is: { slug: { contains: query } } } },
          ],
        },
        orderBy: [{ paidAt: "desc" }, { id: "desc" }],
        take: GLOBAL_SEARCH_RESULT_LIMIT,
        select: {
          publicId: true,
          vendor: true,
          description: true,
          amountCents: true,
          paidAt: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      })
    : Promise.resolve([]);

  const [members, events, income, expenses] = await Promise.all([
    memberPromise,
    eventPromise,
    incomePromise,
    expensePromise,
  ]);

  const groups: GlobalSearchGroup[] = [];
  const pageResults = buildPageResults(query, can);

  if (pageResults.length > 0) {
    groups.push({
      key: "pages",
      label: "Pages",
      items: pageResults,
    });
  }

  if (members.length > 0) {
    groups.push({
      key: "members",
      label: "Members",
      items: members.map((member) => ({
        id: member.publicId,
        title: [member.firstName, member.lastName].filter(Boolean).join(" "),
        href: `/admin/members/${member.publicId}`,
        subtitle: [member.memberType?.name, member.email ?? member.phone, member.status]
          .filter(Boolean)
          .join(" · "),
        meta: "Member",
        group: "members",
      })),
    });
  }

  if (events.length > 0) {
    groups.push({
      key: "events",
      label: "Events",
      items: events.map((event) => ({
        id: event.publicId,
        title: event.title,
        href: `/admin/events/${event.publicId}`,
        subtitle: [event.location, formatDate(event.startsAt)].filter(Boolean).join(" · "),
        meta: "Event",
        group: "events",
      })),
    });
  }

  if (income.length > 0) {
    groups.push({
      key: "income",
      label: "Income",
      items: income.map((contribution) => ({
        id: contribution.publicId,
        title: contribution.member
          ? [contribution.member.firstName, contribution.member.lastName]
              .filter(Boolean)
              .join(" ")
          : "General income record",
        href: "/admin/finances/income",
        subtitle: [
          contribution.category.name,
          formatMoney(contribution.amountCents),
          formatDate(contribution.receivedAt),
        ].join(" · "),
        meta: contribution.reference || "Income",
        group: "income",
      })),
    });
  }

  if (expenses.length > 0) {
    groups.push({
      key: "expenses",
      label: "Expenses",
      items: expenses.map((expense) => ({
        id: expense.publicId,
        title: expense.description,
        href: "/admin/finances/expenses",
        subtitle: [
          expense.category.name,
          expense.vendor || "No vendor",
          formatMoney(expense.amountCents),
          formatDate(expense.paidAt),
        ].join(" · "),
        meta: "Expense",
        group: "expenses",
      })),
    });
  }

  return NextResponse.json({
    query,
    groups,
  });
}
