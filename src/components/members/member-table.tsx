"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Edit, Eye } from "lucide-react";
import { AddIncomeDialogButton } from "@/components/finance/transaction-modals";
import { Avatar, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { MembersTablePagination, MemberTableRow } from "./members-data";

function PresenceDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white",
        active ? "bg-success" : "bg-stone-300",
      )}
    />
  );
}

type MemberTableProps = {
  members: MemberTableRow[];
  pagination: MembersTablePagination;
};

export function MemberTable({ members, pagination }: MemberTableProps) {
  const startRow = pagination.totalRows === 0
    ? 0
    : (pagination.page - 1) * pagination.pageSize + 1;
  const endRow = pagination.totalRows === 0
    ? 0
    : startRow + members.length - 1;
  const pageNumbers = useMemo(() => {
    if (pagination.pageCount <= 5) {
      return Array.from({ length: pagination.pageCount }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(pagination.page - 2, pagination.pageCount - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }, [pagination.page, pagination.pageCount]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-background">
            <tr className="text-sm font-semibold text-stone-600">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Last Contribution</th>
              <th className="px-6 py-4">Total Giving</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member.publicId}
                  className="transition-colors hover:bg-surface-bright"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar name={member.name} className="h-10 w-10" />
                        <PresenceDot active={member.active} />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {member.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {member.group} - {member.status}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-text-primary">{member.email}</p>
                      <p className="text-text-secondary">{member.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {member.contribution ? (
                      <div className="text-sm">
                        <p className="font-semibold text-text-primary">
                          {member.contribution}
                        </p>
                        <p className="text-text-secondary">
                          {member.contributionDate}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm italic text-neutral">
                        No recent data
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "font-code font-semibold",
                        member.active ? "text-primary" : "text-neutral",
                      )}
                    >
                      {member.totalGiving}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/members/${member.publicId}`}
                        className="inline-flex h-8 items-center justify-center rounded-md px-3 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                        aria-label={`View profile for ${member.name}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/admin/members/${member.publicId}/edit?from=list`}
                        className="inline-flex h-8 items-center justify-center rounded-md px-3 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden />
                      </Link>
                      <AddIncomeDialogButton
                        triggerVariant="icon"
                        label={`Add giving record for ${member.name}`}
                        memberPublicId={member.publicId}
                        memberLabel={member.name}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-text-secondary"
                >
                  No members yet. Add your first member to start building the
                  directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center justify-start gap-2">
          <Link
            href={
              pagination.page - 1 <= 1
                ? "/admin/members"
                : `/admin/members?page=${pagination.page - 1}`
            }
            aria-disabled={pagination.page <= 1}
            tabIndex={pagination.page <= 1 ? -1 : undefined}
            className={pagination.page <= 1 ? "pointer-events-none" : undefined}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
          </Link>
          {pageNumbers.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={pageNumber === 1 ? "/admin/members" : `/admin/members?page=${pageNumber}`}
              aria-current={pageNumber === pagination.page ? "page" : undefined}
            >
              <Button
                variant={pageNumber === pagination.page ? "primary" : "secondary"}
                size="sm"
                disabled={pageNumber === pagination.page}
              >
                {pageNumber}
              </Button>
            </Link>
          ))}
          <Link
            href={
              pagination.page + 1 === 1
                ? "/admin/members"
                : `/admin/members?page=${pagination.page + 1}`
            }
            aria-disabled={pagination.page >= pagination.pageCount}
            tabIndex={pagination.page >= pagination.pageCount ? -1 : undefined}
            className={pagination.page >= pagination.pageCount ? "pointer-events-none" : undefined}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.pageCount}
            >
              Next
            </Button>
          </Link>
        </div>
        <p className="text-sm text-text-secondary md:text-right">
          Showing <span className="font-semibold">{startRow}-{endRow}</span> of{" "}
          <span className="font-semibold">{pagination.totalRows}</span> entries
        </p>
      </div>
    </div>
  );
}
