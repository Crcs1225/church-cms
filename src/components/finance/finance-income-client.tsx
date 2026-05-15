"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Filter,
  FilterX,
  Layers3,
  Search,
  Clock3,
} from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { ActiveFiltersSummary } from "./active-filters-summary";
import {
  buildHrefWithParams,
  buildIncomeFilterParams,
} from "./finance-filter-query";
import { FinanceExportMenu } from "./finance-export-menu";
import type {
  FinanceIncomeFilters,
  FinanceIncomePageData,
} from "./finance-data";
import { FinanceStatCard } from "./finance-stat-card";
import { IncomeTable } from "./income-table";
import { AddIncomeDialogButton } from "./transaction-modals";
import { FinanceProgressCard } from "./finance-progress-card";

type FinanceIncomeClientProps = {
  initialData: FinanceIncomePageData;
  initialFilters?: FinanceIncomeFilters;
};

async function fetchIncomeData(filters: FinanceIncomeFilters) {
  const params = buildIncomeFilterParams(filters);
  const response = await fetch(
    buildHrefWithParams("/api/finances/income", params),
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load filtered income data.");
  }

  return (await response.json()) as FinanceIncomePageData;
}

export function FinanceIncomeClient({
  initialData,
  initialFilters,
}: FinanceIncomeClientProps) {
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState(initialData);
  const [hideFloatingAction, setHideFloatingAction] = useState(false);
  const [formValues, setFormValues] = useState<FinanceIncomeFilters>({
    memberQuery: initialFilters?.memberQuery ?? "",
    categorySlug: initialFilters?.categorySlug ?? "",
    dateFrom: initialFilters?.dateFrom ?? initialData.dateFromValue,
    dateTo: initialFilters?.dateTo ?? initialData.dateToValue,
    page: initialFilters?.page ?? initialData.pagination.page,
  });
  const [appliedFilters, setAppliedFilters] = useState<FinanceIncomeFilters>({
    memberQuery: initialFilters?.memberQuery ?? "",
    categorySlug: initialFilters?.categorySlug ?? "",
    dateFrom: initialData.dateFromValue,
    dateTo: initialData.dateToValue,
    page: initialFilters?.page ?? initialData.pagination.page,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDirty =
    (formValues.memberQuery ?? "") !== (appliedFilters.memberQuery ?? "")
    || (formValues.categorySlug ?? "") !== (appliedFilters.categorySlug ?? "")
    || (formValues.dateFrom ?? "") !== (appliedFilters.dateFrom ?? "")
    || (formValues.dateTo ?? "") !== (appliedFilters.dateTo ?? "");

  const selectedCategory =
    data.categories.find((category) => category.value === appliedFilters.categorySlug)?.label
    ?? "";
  const activeFilters = [
    appliedFilters.memberQuery?.trim()
      ? { label: "Member", value: appliedFilters.memberQuery.trim() }
      : null,
    selectedCategory
      ? { label: "Income Type", value: selectedCategory }
      : null,
    data.dateFromValue
      ? { label: "From", value: data.dateFromValue }
      : null,
    data.dateToValue
      ? { label: "To", value: data.dateToValue }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  const exportHref = useMemo(
    () => buildHrefWithParams(
      "/api/finances/income/export",
      buildIncomeFilterParams(appliedFilters),
    ),
    [appliedFilters],
  );
  const printHref = useMemo(
    () => buildHrefWithParams(
      "/admin/finances/income/print",
      buildIncomeFilterParams(appliedFilters),
    ),
    [appliedFilters],
  );

  function syncUrl(filters: FinanceIncomeFilters) {
    const href = buildHrefWithParams(
      "/admin/finances/income",
      buildIncomeFilterParams(filters),
    );
    window.history.replaceState(null, "", href);
  }

  function applyFilters(nextFilters: FinanceIncomeFilters) {
    setError(null);
    setIsLoading(true);

    void (async () => {
      try {
        const nextData = await fetchIncomeData(nextFilters);
        const normalizedFilters = {
          memberQuery: nextFilters.memberQuery?.trim() ?? "",
          categorySlug: nextFilters.categorySlug?.trim() ?? "",
          dateFrom: nextData.dateFromValue,
          dateTo: nextData.dateToValue,
          page: nextData.pagination.page,
        };

        setData(nextData);
        setAppliedFilters(normalizedFilters);
        setFormValues(normalizedFilters);
        syncUrl(normalizedFilters);
      } catch {
        setError("Unable to refresh the income table right now.");
      } finally {
        setIsLoading(false);
      }
    })();
  }

  function resetFilters() {
    applyFilters({
      memberQuery: "",
      categorySlug: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
    });
  }

  async function refreshCurrentData() {
    try {
      const nextData = await fetchIncomeData(appliedFilters);
      setData(nextData);
      setAppliedFilters((current) => ({
        ...current,
        dateFrom: nextData.dateFromValue,
        dateTo: nextData.dateToValue,
        page: nextData.pagination.page,
      }));
      setFormValues((current) => ({
        ...current,
        dateFrom: nextData.dateFromValue,
        dateTo: nextData.dateToValue,
        page: nextData.pagination.page,
      }));
      setError(null);
    } catch {
      setError("The income data changed, but the live view could not refresh.");
    }
  }

  function goToPage(page: number) {
    applyFilters({
      ...appliedFilters,
      page,
    });
  }

  useEffect(() => {
    const sentinel = footerSentinelRef.current;

    if (!sentinel) {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver | null = null;

    const syncObserver = () => {
      observer?.disconnect();

      if (!mediaQuery.matches) {
        setHideFloatingAction(false);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setHideFloatingAction(entry?.isIntersecting ?? false);
        },
        {
          threshold: 0.1,
        },
      );

      observer.observe(sentinel);
    };

    syncObserver();
    mediaQuery.addEventListener("change", syncObserver);

    return () => {
      observer?.disconnect();
      mediaQuery.removeEventListener("change", syncObserver);
    };
  }, []);

  return (
    <div className="mx-auto max-w-300 px-6 py-10">
      <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-display text-5xl leading-tight text-text-primary">
            Income Management
          </h1>
          <p className="max-w-xl text-text-secondary">
            Track and manage all church contributions, from weekly tithes to
            special pledges. Securely record member donations and prepare
            receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FinanceExportMenu
            csvHref={exportHref}
            printHref={printHref}
            csvLabel="Export CSV"
            printLabel="Print / PDF"
          />
          <AddIncomeDialogButton onSaved={refreshCurrentData} />
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <FinanceStatCard
          label="Matching Income"
          value={data.matchingIncome}
          caption={data.matchingIncomeCountLabel}
          trend={(
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <Filter className="h-3 w-3" aria-hidden />
              Live
            </span>
          )}
        />
        <FinanceStatCard
          label="Latest Contribution"
          value={data.latestContributionAmount}
          caption={data.latestContributionCaption}
          accentClassName="border-l-accent"
          trend={(
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock3 className="h-3 w-3" aria-hidden />
              Most recent
            </span>
          )}
        />
        <FinanceProgressCard
          label="Top Income Source"
          value={data.topCategoryValue}
          description={data.topCategoryLabel}
          progressLabel="Share of matching income"
          progressValue={data.topCategorySharePercent}
          accentClassName="border-l-blue-700"
        />
      </section>

      <form
        className="mb-6 rounded-lg border border-border bg-white p-4"
        id="income-filter-form"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters({
            ...formValues,
            page: 1,
          });
        }}
      >
        <div className="flex items-end justify-start gap-x-4 gap-y-4">
          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <Label
              htmlFor="income-member-search"
              className="text-xs font-semibold text-text-secondary"
            >
              Search
            </Label>
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral"
                aria-hidden
              />
              <Input
                id="income-member-search"
                className="h-9 w-full bg-surface pr-2 pl-8 text-xs"
                placeholder="Giver name or member ID..."
                value={formValues.memberQuery ?? ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    memberQuery: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <Label
              htmlFor="income-type"
              className="text-xs font-semibold text-text-secondary"
            >
              Income Type
            </Label>
            <select
              id="income-type"
              aria-label="Filter by income type"
              title="Filter by income type"
              className="h-9 w-full rounded-md border border-transparent bg-surface px-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formValues.categorySlug ?? ""}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  categorySlug: event.target.value,
                }))
              }
            >
              <option value="">All income types</option>
              {data.categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <Label className="text-xs font-semibold text-text-secondary">
              Date Range
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Input
                  id="income-date-from"
                  type="date"
                  aria-label="Income date from"
                  title="Income date from"
                  className="h-9 w-full bg-surface pr-1 pl-8 text-xs"
                  value={formValues.dateFrom ?? ""}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      dateFrom: event.target.value,
                    }))
                  }
                />
                <CalendarDays
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
              </div>
              <span className="shrink-0 text-xs text-neutral-400">to</span>
              <div className="relative flex-1 min-w-0">
                <Input
                  id="income-date-to"
                  type="date"
                  aria-label="Income date to"
                  title="Income date to"
                  className="h-9 w-full bg-surface pr-1 pl-8 text-xs"
                  value={formValues.dateTo ?? ""}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      dateTo: event.target.value,
                    }))
                  }
                />
                <CalendarDays
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-text-secondary opacity-70">
          <Layers3 className="h-3 w-3" aria-hidden />
          {isDirty ? "Unapplied changes..." : "View is up to date"}
        </div>
      </form>

      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-6 py-3">
        <ActiveFiltersSummary filters={activeFilters} />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            type="submit"
            form="income-filter-form"
            disabled={isLoading}
            className="h-8 px-3 text-xs"
          >
            <Filter className="mr-1.5 h-3 w-3" aria-hidden />
            {isLoading ? "..." : "Apply"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={resetFilters}
            disabled={isLoading}
            aria-label="Reset income filters"
            title="Reset income filters"
            className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
          >
            <FilterX className="mr-1 h-3.5 w-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <IncomeTable
        rows={data.rows}
        pagination={data.pagination}
        onRefreshData={refreshCurrentData}
        onPageChange={goToPage}
      />
      <div ref={footerSentinelRef} className="h-1 w-full" aria-hidden />
      <AddIncomeDialogButton
        floating
        floatingHidden={hideFloatingAction}
        label="Quick add income"
        onSaved={refreshCurrentData}
      />
    </div>
  );
}
