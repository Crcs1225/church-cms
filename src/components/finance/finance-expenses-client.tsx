"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Filter,
  FilterX,
  Layers3,
} from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { ActiveFiltersSummary } from "./active-filters-summary";
import {
  buildExpenseFilterParams,
  buildHrefWithParams,
} from "./finance-filter-query";
import { FinanceExportMenu } from "./finance-export-menu";
import type {
  FinanceExpensesFilters,
  FinanceExpensesViewData,
} from "./finance-data";
import { FinanceStatCard } from "./finance-stat-card";
import { ExpenseTable } from "./expense-table";
import { AddExpenseDialogButton } from "./transaction-modals";
import { FinanceProgressCard } from "./finance-progress-card";

type FinanceExpensesClientProps = {
  initialData: FinanceExpensesViewData;
  initialFilters?: FinanceExpensesFilters;
};

async function fetchExpenseData(filters: FinanceExpensesFilters) {
  const params = buildExpenseFilterParams(filters);
  const response = await fetch(
    buildHrefWithParams("/api/finances/expenses", params),
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load filtered expense data.");
  }

  return (await response.json()) as FinanceExpensesViewData;
}

export function FinanceExpensesClient({
  initialData,
  initialFilters,
}: FinanceExpensesClientProps) {
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState(initialData);
  const [hideFloatingAction, setHideFloatingAction] = useState(false);
  const [formValues, setFormValues] = useState<FinanceExpensesFilters>({
    categorySlug: initialFilters?.categorySlug ?? "",
    dateFrom: initialFilters?.dateFrom ?? initialData.dateFromValue,
    dateTo: initialFilters?.dateTo ?? initialData.dateToValue,
    page: initialFilters?.page ?? initialData.pagination.page,
  });
  const [appliedFilters, setAppliedFilters] = useState<FinanceExpensesFilters>({
    categorySlug: initialFilters?.categorySlug ?? "",
    dateFrom: initialData.dateFromValue,
    dateTo: initialData.dateToValue,
    page: initialFilters?.page ?? initialData.pagination.page,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDirty =
    (formValues.categorySlug ?? "") !== (appliedFilters.categorySlug ?? "")
    || (formValues.dateFrom ?? "") !== (appliedFilters.dateFrom ?? "")
    || (formValues.dateTo ?? "") !== (appliedFilters.dateTo ?? "");

  const selectedCategory =
    data.categories.find((category) => category.value === appliedFilters.categorySlug)?.label
    ?? "";
  const activeFilters = [
    selectedCategory
      ? { label: "Category", value: selectedCategory }
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
      "/api/finances/expenses/export",
      buildExpenseFilterParams(appliedFilters),
    ),
    [appliedFilters],
  );
  const printHref = useMemo(
    () => buildHrefWithParams(
      "/admin/finances/expenses/print",
      buildExpenseFilterParams(appliedFilters),
    ),
    [appliedFilters],
  );

  function syncUrl(filters: FinanceExpensesFilters) {
    const href = buildHrefWithParams(
      "/admin/finances/expenses",
      buildExpenseFilterParams(filters),
    );
    window.history.replaceState(null, "", href);
  }

  function applyFilters(nextFilters: FinanceExpensesFilters) {
    setError(null);
    setIsLoading(true);

    void (async () => {
      try {
        const nextData = await fetchExpenseData(nextFilters);
        const normalizedFilters = {
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
        setError("Unable to refresh the expense table right now.");
      } finally {
        setIsLoading(false);
      }
    })();
  }

  function resetFilters() {
    applyFilters({
      categorySlug: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
    });
  }

  async function refreshCurrentData() {
    try {
      const nextData = await fetchExpenseData(appliedFilters);
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
      setError("The expense data changed, but the live view could not refresh.");
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
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 font-display text-5xl leading-tight text-text-primary">
            Expense Tracking
          </h1>
          <p className="text-text-secondary">
            Monitor your church&apos;s operational outflows and recurring
            maintenance costs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FinanceExportMenu
            csvHref={exportHref}
            printHref={printHref}
            csvLabel="Export CSV"
            printLabel="Print / PDF"
          />
          <AddExpenseDialogButton onSaved={refreshCurrentData} />
        </div>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <FinanceStatCard
          label="Matching Expenses"
          value={data.operationalCosts}
          caption={data.matchingCountLabel}
          trend={(
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <Filter className="h-3 w-3" aria-hidden />
              Live
            </span>
          )}
        />
        <FinanceStatCard
          label="Utility Spend"
          value={data.utilitySpend}
          caption="matching utility expenses"
          accentClassName="border-l-neutral"
          trend={(
            <span className="flex items-center gap-1 text-xs font-semibold text-warning">
              {data.utilitySharePercent}% of expenses
            </span>
          )}
        />
        <FinanceProgressCard
          label="Top Expense Category"
          value={data.topExpenseCategoryValue}
          description={data.topExpenseCategoryLabel}
          progressLabel="Share of monthly expenses"
          progressValue={data.topExpenseCategorySharePercent}
          accentClassName="border-l-blue-700"
        />
      </section>

      <form
        className="mb-6 rounded-lg border border-border bg-white p-4"
        id="expense-filter-form"
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
            <Label htmlFor="expense-category" className="text-xs font-semibold text-text-secondary">
              Expense Category
            </Label>
            <select
              id="expense-category"
              aria-label="Filter expenses by category"
              title="Filter expenses by category"
              className="h-9 w-full rounded-md border border-transparent bg-surface px-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={formValues.categorySlug ?? ""}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  categorySlug: event.target.value,
                }))
              }
            >
              <option value="">All categories</option>
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
                  id="expense-date-from"
                  type="date"
                  aria-label="Expense date from"
                  title="Expense date from"
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
                  id="expense-date-to"
                  type="date"
                  aria-label="Expense date to"
                  title="Expense date to"
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
            form="expense-filter-form"
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
            aria-label="Reset expense filters"
            title="Reset expense filters"
            className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
          >
            <FilterX className="mr-1 h-3.5 w-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <ExpenseTable
        rows={data.rows}
        pagination={data.pagination}
        onRefreshData={refreshCurrentData}
        onPageChange={goToPage}
      />
      <div ref={footerSentinelRef} className="h-1 w-full" aria-hidden />

      <section className="mt-12 flex flex-col gap-6 rounded-lg border border-orange-100 bg-orange-50/40 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-primary bg-white font-semibold text-primary">
            {data.maintenanceSharePercent}%
          </div>
          <div>
            <h4 className="text-xl font-semibold text-text-primary">
              Maintenance Share
            </h4>
            <p className="text-sm text-text-secondary">
              Share of matching expenses allocated to maintenance for the selected scope.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:text-right">
          <div>
            <p className="text-xs text-text-secondary">Matching maintenance</p>
            <p className="font-semibold text-text-primary">
              {data.maintenanceSpend}
            </p>
          </div>
          <Button variant="inverse" disabled title="Budget controls are not implemented yet">
            Live summary
          </Button>
        </div>
      </section>

      <AddExpenseDialogButton
        floating
        floatingHidden={hideFloatingAction}
        label="Quick add expense"
        onSaved={refreshCurrentData}
      />
    </div>
  );
}
