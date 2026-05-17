type ActiveFilter = {
  label: string;
  value: string;
};

type ActiveFiltersSummaryProps = {
  filters: ActiveFilter[];
};

export function ActiveFiltersSummary({ filters }: ActiveFiltersSummaryProps) {
  const hasFilters = filters.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold tracking-widest text-text-secondary uppercase">
        {hasFilters ? "Active Filters" : "No Active Filters"}
      </span>
      {hasFilters ? (
        filters.map((filter) => (
          <span
            key={`${filter.label}:${filter.value}`}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-primary"
          >
            <span className="font-semibold">{filter.label}:</span> {filter.value}
          </span>
        ))
      ) : (
        <span className="text-sm text-text-secondary">
          Showing the full table with no server filters applied.
        </span>
      )}
    </div>
  );
}
