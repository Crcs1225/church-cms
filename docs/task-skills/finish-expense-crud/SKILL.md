---
name: finish-expense-crud
description: Complete the missing expense maintenance flow. Use when Codex needs to add single-record expense update and delete support, connect it to existing finance UI patterns, and keep activity logging aligned with the current Prisma-first API style.
---

# Finish Expense CRUD

Complete the missing edit and delete flow for expenses.

## Problem

Income supports list, create, update, single delete, and bulk delete flows.

Expenses currently support:

- `GET /api/finances/expenses`
- `POST /api/finances/expenses`

Expenses do not yet support:

- `PATCH /api/finances/expenses/[id]`
- `DELETE /api/finances/expenses/[id]`

That leaves expense management inconsistent with the rest of the app.

## Relevant Files

- `src/app/api/finances/expenses/route.ts`
- `src/app/api/finances/income/[id]/route.ts`
- `src/components/finance/transaction-modals.tsx`
- `src/components/finance/expense-table.tsx`
- `src/lib/api-utils.ts`
- `prisma/schema.prisma`

## Constraints

- Keep `publicId` as the route-facing identifier.
- Keep money values in integer cents.
- Reuse income route patterns where practical.
- Log updates and deletes to `ActivityLog`.
- Do not introduce a new abstraction unless it removes clear duplication.

## Approach

1. Add `src/app/api/finances/expenses/[id]/route.ts`.
2. Mirror the validation style used by income update/delete routes.
3. Allow patch updates for:
   - `category`
   - `vendor`
   - `description`
   - `amount`
   - `paidAt`
   - `reference`
   - `receiptPath`
   - `notes`
4. Return the same expense shape already produced by the list/create route.
5. Add matching `EXPENSE_UPDATE` and `EXPENSE_DELETE` activity log entries.
6. If expense UI already exposes edit/delete controls, wire them to the new route. If not, stop at API support unless the UI gap is trivial to close.

## Definition Of Done

- Editing an expense works through a dedicated `[id]` route.
- Deleting an expense works through a dedicated `[id]` route.
- Validation errors return consistent API error payloads.
- Activity logs are written for both operations.
- Typecheck and lint pass.

## Validation

Run:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
cmd /c npm run lint
cmd /c npm run test:data
cmd /c npm run test:api
```
