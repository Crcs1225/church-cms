---
name: wire-finance-reports
description: Replace the placeholder finance reports screen with live data. Use when Codex needs to connect the reports page to Prisma-backed summaries, activity logs, and real fund or category breakdowns without turning the screen into a marketing-style dashboard.
---

# Wire Finance Reports

Turn the reports page into a real operational reporting screen.

## Problem

`src/components/finance/finance-reports.tsx` still renders placeholder ranges, placeholder totals, a static chart, and a mock fund breakdown table.

The app already has live finance data and a summary endpoint, so this page is one of the clearest unfinished admin surfaces.

## Relevant Files

- `src/components/finance/finance-reports.tsx`
- `src/components/finance/reports-chart.tsx`
- `src/components/finance/fund-breakdown-table.tsx`
- `src/app/admin/finances/reports/page.tsx`
- `src/app/api/finances/summary/route.ts`
- `src/components/finance/finance-data.ts`
- `prisma/schema.prisma`

## Constraints

- Keep the interface dense and operational.
- Prefer server reads for the initial page payload.
- Reuse existing finance formatting and component patterns.
- Do not fabricate budget numbers that are not stored anywhere.
- If `Fund` and `FundAllocation` are not populated enough for a true fund report, prefer honest category-based reporting over polished fake data.

## Approach

1. Inspect the current `summary` API payload and existing Prisma helpers.
2. Decide whether the reports page should read directly on the server or consume the existing summary route.
3. Replace placeholder KPI cards with metrics derived from real contribution and expense data.
4. Replace `ReportsChart` static bars with a real month-by-month comparison.
5. Replace `FundBreakdownTable` mock rows with either:
   - real fund allocation data, if available and populated, or
   - a category breakdown that matches the current data model.
6. Make the export button honest:
   - either implement a real export,
   - or relabel/remove it until export exists.

## Definition Of Done

- Reports page no longer depends on hardcoded finance values.
- Chart and table render real data.
- Date range and labels match actual computed periods.
- No fake "budget progress" metric remains unless backed by persisted data.
- Typecheck and lint pass.

## Validation

Run:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
cmd /c npm run lint
```

If API logic changes, also run:

```bash
cmd /c npm run test:data
cmd /c npm run test:api
```
