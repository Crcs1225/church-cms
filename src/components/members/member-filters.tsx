import { Button, Label } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MemberFiltersProps = {
  totalMembers: number;
  visibleMembers: number;
};

export function MemberFilters({
  totalMembers,
  visibleMembers,
}: MemberFiltersProps) {
  return (
    <section className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5">
        <Label
          htmlFor="member-status"
          className="text-xs font-semibold text-text-secondary uppercase"
        >
          Status:
        </Label>
        <select
          id="member-status"
          aria-label="Filter members by status"
          title="Filter members by status"
          className="border-none bg-transparent text-sm font-semibold text-primary outline-none focus:ring-0"
        >
          <option>Active Members</option>
          <option>Inactive</option>
          <option>Archived</option>
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5">
        <Label
          htmlFor="member-group"
          className="text-xs font-semibold text-text-secondary uppercase"
        >
          Group:
        </Label>
        <select
          id="member-group"
          aria-label="Filter members by group"
          title="Filter members by group"
          className="border-none bg-transparent text-sm font-semibold text-primary outline-none focus:ring-0"
        >
          <option>All Groups</option>
          <option>Small Group A</option>
          <option>Youth Ministry</option>
          <option>Worship Team</option>
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5">
        <Label
          htmlFor="member-sort"
          className="text-xs font-semibold text-text-secondary uppercase"
        >
          Sort:
        </Label>
        <select
          id="member-sort"
          aria-label="Sort members"
          title="Sort members"
          className="border-none bg-transparent text-sm font-semibold text-primary outline-none focus:ring-0"
        >
          <option>Recent Contribution</option>
          <option>Name (A-Z)</option>
          <option>Total Giving</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-text-secondary">
          Showing {visibleMembers.toLocaleString()} of{" "}
          {totalMembers.toLocaleString()}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" aria-label="Previous members page">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Next members page">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
