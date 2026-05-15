import { NextRequest } from "next/server";
import { requireRequestPermission } from "@/lib/admin-access";
import { buildCsv, csvResponse } from "@/lib/csv";
import { buildExpenseWhere } from "@/lib/finance-filters";
import { prisma } from "@/lib/prisma";

function getDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(request, "finances:export");

  if (permission.response) {
    return permission.response;
  }

  const { searchParams } = new URL(request.url);
  const where = buildExpenseWhere({
    categorySlug: searchParams.get("category"),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
    query: searchParams.get("query"),
  });

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: [{ paidAt: "desc" }, { id: "desc" }],
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  const csv = buildCsv(
    [
      "publicId",
      "paidAt",
      "amount",
      "amountCents",
      "category",
      "categorySlug",
      "description",
      "vendor",
      "reference",
      "receiptPath",
      "notes",
    ],
    expenses.map((expense: (typeof expenses)[number]) => [
      expense.publicId,
      expense.paidAt.toISOString(),
      (expense.amountCents / 100).toFixed(2),
      expense.amountCents,
      expense.category.name,
      expense.category.slug,
      expense.description,
      expense.vendor ?? "",
      expense.reference ?? "",
      expense.receiptPath ?? "",
      expense.notes ?? "",
    ]),
  );

  return csvResponse(`expense-export-${getDateStamp()}.csv`, csv);
}
