"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Avatar, Badge, Button, DeletionConfirmModal } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FinanceTablePagination, IncomeTableRow } from "./finance-data";
import { EditIncomeDialogButton } from "./transaction-modals";

type IncomeTableProps = {
  rows: IncomeTableRow[];
  pagination: FinanceTablePagination;
  onRefreshData?: () => Promise<void> | void;
  onPageChange?: (page: number) => void;
};

export function IncomeTable({
  rows,
  pagination,
  onRefreshData,
  onPageChange,
}: IncomeTableProps) {
  const router = useRouter();
  const [selectedPublicIds, setSelectedPublicIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<IncomeTableRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
  const visibleSelectedPublicIds = selectedPublicIds.filter((publicId) =>
    rows.some((row) => row.publicId === publicId),
  );

  const allSelected =
    rows.length > 0 && rows.every((row) => visibleSelectedPublicIds.includes(row.publicId));

  const selectedCount = visibleSelectedPublicIds.length;

  const selectedLabel = useMemo(() => {
    if (selectedCount === 0) {
      return "No income rows selected.";
    }

    if (selectedCount === 1) {
      return "1 income row selected.";
    }

    return `${selectedCount} income rows selected.`;
  }, [selectedCount]);
  const startRow = pagination.totalRows === 0
    ? 0
    : (pagination.page - 1) * pagination.pageSize + 1;
  const endRow = pagination.totalRows === 0
    ? 0
    : startRow + rows.length - 1;
  const pageNumbers = useMemo(() => {
    if (pagination.pageCount <= 5) {
      return Array.from({ length: pagination.pageCount }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(pagination.page - 2, pagination.pageCount - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }, [pagination.page, pagination.pageCount]);

  function toggleSelection(publicId: string) {
    setSelectedPublicIds((current) =>
      current.includes(publicId)
        ? current.filter((value) => value !== publicId)
        : [...current, publicId],
    );
  }

  function toggleSelectAll() {
    setSelectedPublicIds(allSelected ? [] : rows.map((row) => row.publicId));
  }

  async function deleteIncome(publicId: string) {
    setDeleteError(null);
    setDeletingId(publicId);

    const response = await fetch(`/api/finances/income/${publicId}`, {
      method: "DELETE",
    });

    setDeletingId(null);

    if (!response.ok) {
      setDeleteError("Unable to delete this income record.");
      return;
    }

    setSelectedPublicIds((current) => current.filter((value) => value !== publicId));
    setDeleteTarget(null);

    if (onRefreshData) {
      await onRefreshData();
      return;
    }

    router.refresh();
  }

  async function deleteSelectedRows() {
    if (visibleSelectedPublicIds.length === 0) {
      return;
    }
    setBulkDeleteError(null);
    setIsBulkDeleting(true);

    const response = await fetch("/api/finances/income", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicIds: visibleSelectedPublicIds,
      }),
    });

    setIsBulkDeleting(false);

    if (!response.ok) {
      setBulkDeleteError("Unable to delete the selected income records.");
      return;
    }

    setSelectedPublicIds([]);
    setBulkDeleteOpen(false);

    if (onRefreshData) {
      await onRefreshData();
      return;
    }

    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-text-secondary">{selectedLabel}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedPublicIds([])}
            disabled={selectedCount === 0 || isBulkDeleting}
          >
            Clear Selection
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setBulkDeleteError(null);
              setBulkDeleteOpen(true);
            }}
            disabled={selectedCount === 0 || isBulkDeleting}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {isBulkDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
              <th className="px-4 py-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all income rows"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                </label>
              </th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length > 0 ? (
              rows.map((row) => {
                const isSelected = selectedPublicIds.includes(row.publicId);

                return (
                  <tr
                    key={row.publicId}
                    className={cn(
                      "group transition-colors hover:bg-primary/5",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    <td className="px-4 py-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(row.publicId)}
                          aria-label={`Select income row ${row.publicId}`}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </label>
                    </td>
                    <td className="px-6 py-4 font-code text-xs text-text-secondary">
                      {row.publicId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.memberName} />
                        <div>
                          <p className="text-sm font-semibold">{row.memberName}</p>
                          <p className="text-xs text-text-secondary">
                            {row.memberPublicId ?? "No member linked"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={row.badgeClassName}>{row.type}</Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {row.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {row.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <EditIncomeDialogButton
                          contributionPublicId={row.publicId}
                          memberPublicId={row.memberPublicId}
                          memberLabel={
                            row.memberPublicId ? row.memberName : undefined
                          }
                          category={row.categorySlug}
                          amount={row.amountValue}
                          receivedAt={row.receivedAtValue}
                          paymentMethod={row.paymentMethod}
                          onSaved={onRefreshData}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete income row ${row.publicId}`}
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
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-text-secondary"
                >
                  No income records matched your filters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-background px-6 pt-4 pr-24 pb-24 md:flex-row md:items-center md:justify-between md:pr-6 md:pb-4">
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
        <p className="text-sm text-text-secondary md:text-right">
          Showing <span className="font-semibold">{startRow}-{endRow}</span> of{" "}
          <span className="font-semibold">{pagination.totalRows}</span> entries
        </p>
      </div>

      <DeletionConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete Income Record"
        itemLabel={deleteTarget ? `${deleteTarget.memberName}'s income record` : "this income record"}
        confirmLabel="Delete Record"
        isSubmitting={deletingId !== null}
        error={deleteError}
        onConfirm={() =>
          deleteTarget ? deleteIncome(deleteTarget.publicId) : Promise.resolve()
        }
      />

      <DeletionConfirmModal
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          setBulkDeleteOpen(open);
          if (!open) {
            setBulkDeleteError(null);
          }
        }}
        title="Delete Selected Income"
        itemLabel={`${selectedCount} selected income record${selectedCount === 1 ? "" : "s"}`}
        confirmLabel="Delete Selected"
        isSubmitting={isBulkDeleting}
        error={bulkDeleteError}
        onConfirm={deleteSelectedRows}
      />
    </div>
  );
}
