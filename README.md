# NTCCGMI Ilog Malino Admin

Offline-first administration app for The New Testament Christian Church Global Ministry Incorporated - Ilog Malino, built with Next.js, TypeScript, Prisma, and local SQLite.

## Current Scope

The app currently focuses on admin workflows for:

- dashboard overview
- members
- finances: overview, income, expenses, reports
- events
- settings and admin configuration
- global header search across pages and core records

The current architecture is local-first. Data is stored in SQLite on the device, with future sync work planned later.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Prisma 7
- SQLite via `@prisma/adapter-better-sqlite3`
- `lucide-react`

## Important Paths

- Prisma schema: `prisma/schema.prisma`
- SQLite database: `data/church-management.sqlite`
- Prisma client: `@prisma/client` in `node_modules`
- Prisma singleton: `src/lib/prisma.ts`
- API routes: `src/app/api`
- Admin pages: `src/app/admin`

## Local Setup

1. Install dependencies

```bash
cmd /c npm install
```

2. Prepare environment

```bash
copy .env.example .env
```

Default local DB:

```env
DATABASE_URL="file:./data/church-management.sqlite"
```

3. Initialize Prisma and seed local data

```bash
cmd /c npm run db:push
cmd /c npm run db:generate
cmd /c npm run db:seed
```

4. Start development

Preferred on this Windows setup:

```bash
cmd /c npm run dev
```

Explicit Turbopack command if you need to test it separately:

```bash
cmd /c npm run dev:turbopack
```

## Windows Notes

- If `npm.ps1` is blocked in PowerShell, use `cmd /c npm ...`.
- If Turbopack throws `better-sqlite3` junction errors on Windows, use:
- `npm run dev` is already configured to use webpack by default in this repo.
- If you explicitly run Turbopack and hit `better-sqlite3` junction errors on Windows, switch back to:

```bash
cmd /c npm run dev
```

- If you access the dev server from `192.168.0.112`, `allowedDevOrigins` is already configured in `next.config.ts`.

## Verification

Automated checks now run in two places:

- `pre-commit`: `npm run typecheck` and `npm run lint`
- `pre-push`: `npm run verify`
- GitHub Actions: runs verify on Windows and production build on Ubuntu for every push and pull request

The production build is intentionally owned by CI instead of the local `pre-push` hook because this Windows setup can hit a Next.js filesystem issue when building dynamic API routes.

`test:api` is still manual because it requires the Next dev server to be running.

TypeScript:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
```

Lint:

```bash
cmd /c npm run lint
```

Data smoke test:

```bash
cmd /c npm run test:data
```

API smoke test:

Start the dev server first, then run:

```bash
cmd /c npm run test:api
```

## Current Feature Coverage

Implemented now:

- member CRUD and profile views
- member table pagination
- income create, list, update, delete, and bulk delete
- income filtering, export CSV, print/PDF pages, and real pagination
- expense create, list, update, and delete
- expense filtering, export CSV, print/PDF pages, and real pagination
- event create, list, detail, update, and delete
- global header search for pages, members, events, income, and expenses
- finance reports backed by live data
- dashboard backed by live members, finance, event, and activity data
- activity logging for core write flows
- settings flows for church profile, app users, finance categories, notifications, and report signatories
- admin loading screens and settings/access groundwork

Recent additions:

- `/api/search` provides permission-aware grouped search results for the admin header
- the sticky admin header supports keyboard-first search with `Ctrl+K` and `/`

Not implemented yet:

- completed authentication flow
- fully enforced roles and permissions across all admin routes and APIs
- backup and restore flows
- member and event export flows
- cloud sync UI and actual sync engine
- member portal
- production-ready secret/config handling for local integration files

## Backlog

Current reusable task backlog lives in:

- `docs/task-skills/README.md`
- `docs/task-skills/refresh-project-docs/SKILL.md`
- `docs/task-skills/finish-expense-crud/SKILL.md`
- `docs/task-skills/wire-finance-reports/SKILL.md`
- `docs/task-skills/wire-dashboard-live-data/SKILL.md`
