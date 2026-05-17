# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is a Next.js church management app using:

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Prisma 7 with local SQLite
- `lucide-react` for icons

The app is currently focused on admin workflows for:

- Dashboard
- Members
- Finances: overview, income, expenses, reports
- Events
- Settings and admin configuration
- Global header search for pages and core records
- Local-first data storage before future sync work

## Working Principles

These are the main principles currently guiding the codebase.

- `KISS`: prefer the simplest implementation that cleanly fits the current feature.
- `DRY`: reuse existing UI, form, modal, and query patterns before adding new variants.
- `SOLID`: keep components and modules focused on one responsibility and avoid feature leakage.
- `Prisma-first`: Prisma schema is the source of truth for application data structure.
- `Local-first`: assume SQLite is the primary working datastore; sync can be layered later.
- `Server reads, client writes`: load page data on the server where possible; use API routes for browser-side create/update/delete actions.
- `Contextual UI`: floating buttons, modals, and quick actions should only appear where they make sense.
- `Patch updates`: for edit flows, send only changed fields when practical to reduce noise and unnecessary writes.
- `Stable public IDs`: use `publicId` for UI and route-facing identity, not internal numeric IDs.
- `Accessible by default`: every interactive control must have a clear accessible name.

## Important Commands

Use these from the repository root.

```bash
npm run dev
npm run lint
npm run test:data
npm run test:api
node_modules/.bin/tsc --noEmit
npm run db:push
npm run db:seed
npm run db:setup
```

Notes:

- On Windows PowerShell, `npm.ps1` may be blocked. Use `cmd /c npm run ...` when needed.
- `test:data` checks SQLite data relationships without a Next server.
- `test:api` expects the Next dev server to be running, defaulting to `http://127.0.0.1:3000`.
- If Turbopack has Prisma junction issues on Windows, run dev/build with webpack, for example:

```bash
node_modules\.bin\next.cmd dev --hostname 127.0.0.1 --port 3000 --webpack
```

## Database

Prisma is the source of truth for the schema.

- Schema: `prisma/schema.prisma`
- SQLite database: `data/church-management.sqlite`
- Prisma client package: `@prisma/client` in `node_modules`
- Prisma singleton: `src/lib/prisma.ts`
- Seed script: `scripts/seed-db.mjs`

Do not revive `db/schema.sql` as the main schema source unless explicitly asked. Prefer Prisma changes through `prisma/schema.prisma`, then run:

```bash
npm run db:push
npm run db:generate
npm run db:seed
```

Money is stored as integer cents. Public API IDs should use `publicId`, not internal numeric database IDs.

## API Routes

Current API route handlers live under `src/app/api`.

Important routes:

- `GET /api/member-types`
- `GET /api/members`
- `POST /api/members`
- `GET /api/members/[id]`
- `PATCH /api/members/[id]`
- `DELETE /api/members/[id]`
- `GET /api/finances/categories`
- `GET /api/finances/income`
- `POST /api/finances/income`
- `GET /api/finances/expenses`
- `POST /api/finances/expenses`
- `GET /api/finances/summary`
- `GET /api/search`

Shared API helpers live in `src/lib/api-utils.ts`.

## UI Structure

Reusable UI primitives live in `src/components/ui`.

Admin shell components live in `src/components/admin`.

Finance components live in `src/components/finance`.

Member components live in `src/components/members`.

Use existing components and visual patterns before adding new abstractions.

## Design Rules

- Use `lucide-react` icons for buttons and actions.
- Keep admin interfaces dense, calm, and operational.
- Avoid landing-page or marketing-style sections for app screens.
- Avoid inline styles.
- Reuse universal components when possible instead of introducing near-duplicate versions.
- Global header search should stay permission-aware and return direct navigation targets where practical.
- Every form control must have an accessible name. For `select`, include a visible/sr-only label plus `aria-label` and `title` if analyzer warnings appear.
- Floating action buttons should be contextual. Finance income FAB only belongs on the income tab; expense FAB only belongs on the expenses tab.
- The default `AdminShell` quick-create FAB is disabled by default to prevent confusing cross-page actions.

## Testing Expectations

After changing backend or API code, run:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
cmd /c npm run lint
cmd /c npm run test:data
cmd /c npm run test:api
```

If no dev server is running, start one before `test:api`.

After changing only UI code, at minimum run:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
cmd /c npm run lint
```

## File Editing

- Keep changes scoped to the task.
- Do not edit generated Prisma files manually.
- Do not revert user changes unless explicitly requested.
- Prefer adding small reusable helpers/components only when they reduce real duplication.
