import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function monthKey(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const now = searchParams.get("date")
    ? new Date(searchParams.get("date") ?? "")
    : new Date();
  const anchorDate = Number.isNaN(now.getTime()) ? new Date() : now;
  const currentMonthStart = startOfMonth(anchorDate);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const sixMonthStart = addMonths(currentMonthStart, -5);

  const [
    incomeTotal,
    expenseTotal,
    monthlyIncome,
    monthlyExpenses,
    recentIncome,
    recentExpenses,
    funds,
    activityLogs,
  ] = await prisma.$transaction([
    prisma.contribution.aggregate({
      _sum: { amountCents: true },
    }),
    prisma.expense.aggregate({
      _sum: { amountCents: true },
    }),
    prisma.contribution.findMany({
      where: {
        receivedAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amountCents: true,
        receivedAt: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        paidAt: {
          gte: sixMonthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amountCents: true,
        paidAt: true,
      },
    }),
    prisma.contribution.findMany({
      orderBy: [{ receivedAt: "desc" }, { id: "desc" }],
      take: 5,
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
            slug: true,
          },
        },
      },
    }),
    prisma.expense.findMany({
      orderBy: [{ paidAt: "desc" }, { id: "desc" }],
      take: 5,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.fund.findMany({
      where: { archivedAt: null },
      include: {
        allocations: {
          select: {
            amountCents: true,
          },
        },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = addMonths(sixMonthStart, index);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthKey(date),
      incomeCents: 0,
      expenseCents: 0,
    };
  });

  const monthIndex = new Map(months.map((month) => [month.key, month]));

  for (const contribution of monthlyIncome) {
    const key = `${contribution.receivedAt.getFullYear()}-${contribution.receivedAt.getMonth()}`;
    const month = monthIndex.get(key);

    if (month) {
      month.incomeCents += contribution.amountCents;
    }
  }

  for (const expense of monthlyExpenses) {
    const key = `${expense.paidAt.getFullYear()}-${expense.paidAt.getMonth()}`;
    const month = monthIndex.get(key);

    if (month) {
      month.expenseCents += expense.amountCents;
    }
  }

  const totalIncomeCents = incomeTotal._sum.amountCents ?? 0;
  const totalExpenseCents = expenseTotal._sum.amountCents ?? 0;

  return NextResponse.json({
    totals: {
      incomeCents: totalIncomeCents,
      expenseCents: totalExpenseCents,
      netCents: totalIncomeCents - totalExpenseCents,
    },
    monthly: months,
    funds: funds.map((fund) => {
      const allocatedCents = fund.allocations.reduce(
        (sum, allocation) => sum + allocation.amountCents,
        0,
      );

      return {
        publicId: fund.publicId,
        name: fund.name,
        slug: fund.slug,
        description: fund.description,
        targetCents: fund.targetCents,
        allocatedCents,
      };
    }),
    recentTransactions: [
      ...recentIncome.map((contribution) => ({
        publicId: contribution.publicId,
        type: "income",
        description: contribution.category.name,
        amountCents: contribution.amountCents,
        date: contribution.receivedAt.toISOString(),
        member: contribution.member
          ? [contribution.member.firstName, contribution.member.lastName]
              .filter(Boolean)
              .join(" ")
          : null,
        category: contribution.category,
      })),
      ...recentExpenses.map((expense) => ({
        publicId: expense.publicId,
        type: "expense",
        description: expense.description,
        amountCents: expense.amountCents,
        date: expense.paidAt.toISOString(),
        vendor: expense.vendor,
        category: expense.category,
      })),
    ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    activityLogs: activityLogs.map((log) => ({
      publicId: log.publicId,
      action: log.action,
      entityType: log.entityType,
      entityPublicId: log.entityPublicId,
      description: log.description,
      metadataJson: log.metadataJson,
      createdAt: log.createdAt.toISOString(),
    })),
    period: {
      start: sixMonthStart.toISOString(),
      end: nextMonthStart.toISOString(),
    },
  });
}
