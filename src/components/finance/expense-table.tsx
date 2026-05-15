"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  BriefcaseBusiness,
  Hammer,
  PartyPopper,
  Trash2,
  Zap,
} from "lucide-react";
import { Button, DeletionConfirmModal } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ExpenseTableRow, FinanceTablePagination } from "./finance-data";
import { EditExpenseDialogButton } from "./transaction-modals";

type ExpenseCategoryIconProps = {
  icon: ComponentType<LucideProps>;
  className: string;
};

function ExpenseCategoryIcon({
  icon: Icon,
  className,
}: ExpenseCategoryIconProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </div>
  );
}

function getExpenseCategoryIcon(slug: string) {
  if (slug === "utilities") {
    return { icon: Zap, className: "bg-primary/10 text-primary" };
  }

  if (slug === "events") {
    return { icon: PartyPopper, className: "bg-blue-100 text-blue-700" };
  }

  if (slug === "salaries") {
    return { icon: BriefcaseBusiness, className: "bg-green-100 text-success" };
  }

  return { icon: Hammer, className: "bg-surface-raised text-text-primary" };
}

type ExpenseTableProps = {
  rows: ExpenseTableRow[];
  pagination: FinanceTablePagination;
  onRefreshData?: () => Promise<void> | void;
  onPageChange?: (page: number) => void;
};

export function ExpenseTable({
  rows,
  pagination,
  onRefreshData,
  onPageChange,
}: ExpenseTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<ExpenseTableRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const startRow = pagination.totalRows === 0
    ? 0
    : (pagination.page - 1) * pagination.pageSize + 1;
  const endRow = pagination.totalRows === 0
    ? 0
    : startRow + rows.length - 1;
  const pageNumbers = pagination.pageCount <= 5
    ? Array.from({ length: pagination.pageCount }, (_, index) => index + 1)
    : Array.from(
        { length: 5 },
        (_, index) =>
          Math.max(1, Math.min(pagination.page - 2, pagination.pageCount - 4)) + index,
      );

  async function deleteExpense(publicId: string) {
    setDeleteError(null);
    setDeletingId(publicId);

    const response = await fetch(`/api/finances/expenses/${publicId}`, {
      method: "DELETE",
    });

    setDeletingId(null);

    if (!response.ok) {
      setDeleteError("Unable to delete this expense record.");
      return;
    }

    setDeleteTarget(null);

    if (onRefreshData) {
      await onRefreshData();
      return;
    }

    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-border bg-surface">
            <tr className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length > 0 ? (
              rows.map((row) => {
                const icon = getExpenseCategoryIcon(row.categorySlug);

                return (
                  <tr
                    key={row.publicId}
                    className="group transition-colors hover:bg-primary/5"
                  >
                    <td className="px-6 py-4 font-code text-xs text-neutral">
                      {row.publicId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ExpenseCategoryIcon
                          icon={icon.icon}
                          className={icon.className}
                        />
                        <span className="text-sm font-semibold">{row.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">{row.description}</p>
                      <p className="text-xs text-text-secondary">
                        {row.vendor || row.reference || "No vendor or reference"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                      {row.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {row.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <EditExpenseDialogButton
                          expensePublicId={row.publicId}
                          category={row.categorySlug}
                          amount={row.amountValue}
                          paidAt={row.paidAtValue}
                          description={row.description}
                          vendor={row.vendor}
                          reference={row.reference}
                          onSaved={onRefreshData}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete expense row ${row.publicId}`}
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(row);
                          }}
                          disabled={deletingId === row.publicId}
                        >
                          {deletingId === row.publicId ? (
                            "..."
                          ) : (
                            <Trash2 className="h-4 w-4 text-error" aria-hidden />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-text-secondary"
                >
                  No expense records have been recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-surface px-6 pt-4 pr-24 pb-24 md:flex-row md:items-center md:justify-between md:pr-6 md:pb-4">
        <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange?.(pagination.page - 1)}
          >
            Previous
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === pagination.page ? "primary" : "secondary"}
              size="sm"
              onClick={() => onPageChange?.(pageNumber)}
              disabled={pageNumber === pagination.page}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page >= pagination.pageCount}
            onClick={() => onPageChange?.(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
        <span className="text-xs text-text-secondary md:text-right">
          Showing <span className="font-semibold">{startRow}-{endRow}</span> of{" "}
          <span className="font-semibold">{pagination.totalRows}</span> entries
        </span>
      </div>

      <DeletionConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete Expense Record"
        itemLabel={
          deleteTarget
            ? `${deleteTarget.description} expense record`
            : "this expense record"
        }
        confirmLabel="Delete Record"
        isSubmitting={deletingId !== null}
        error={deleteError}
        onConfirm={() =>
          deleteTarget ? deleteExpense(deleteTarget.publicId) : Promise.resolve()
        }
      />
    </div>
  );
}
