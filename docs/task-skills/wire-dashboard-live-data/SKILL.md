---
name: wire-dashboard-live-data
description: Replace dashboard mock cards and tables with live operational data. Use when Codex needs to turn the admin home page into a real church operations dashboard powered by members, events, finance summaries, and activity logs already present in the database.
---

# Wire Dashboard Live Data

Replace dashboard mock content with real data from the current schema.

## Problem

`src/app/admin/page.tsx` and `src/components/admin/activity-table.tsx` still depend heavily on hardcoded sample values.

That creates a misleading sense of completeness and duplicates information the database already knows.

## Relevant Files

- `src/app/admin/page.tsx`
- `src/components/admin/activity-table.tsx`
- `src/components/admin/metric-card.tsx`
- `src/app/api/finances/summary/route.ts`
- `prisma/schema.prisma`

## Constraints

- Keep the page fast and practical.
- Prefer server-side reads for initial dashboard data.
- Remove or relabel cards that imply sync, attendance, or alerts if those systems are not implemented yet.
- Keep accessible names on all controls.
- Do not invent "user" data that does not exist in the schema.

## Approach

1. Replace static metrics with real totals from members, contributions, expenses, and upcoming events.
2. Replace the mock activity table with recent `ActivityLog` records.
3. Use real upcoming events instead of hardcoded calendar items.
4. Use recent members from `createdAt` instead of sample names.
5. Audit every card:
   - keep it if backed by real data
   - simplify it if partial
   - remove it if purely fictional

## Definition Of Done

- Dashboard no longer ships with placeholder member names, money values, or activity rows.
- Cards map to real schema-backed data.
- Any still-unimplemented domain is clearly labeled or removed.
- Typecheck and lint pass.

## Validation

Run:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
cmd /c npm run lint
```
