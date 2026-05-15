# NTCCGMI Ilog Malino Admin

Offline-first administration app for The New Testament Christian Church Global Ministry Incorporated - Ilog Malino, built with Next.js, TypeScript, Prisma, and local SQLite.

## Current Scope

The app currently focuses on admin workflows for:

- dashboard overview
- members
- finances: overview, income, expenses, reports
- events

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
- Prisma client: `src/generated/prisma`
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
cmd /c npm run dev:webpack
```

Fallback standard dev command:

```bash
cmd /c npm run dev
```

## Windows Notes

- If `npm.ps1` is blocked in PowerShell, use `cmd /c npm ...`.
- If Turbopack throws `better-sqlite3` junction errors on Windows, use:

```bash
cmd /c npm run dev:webpack
```

- If you access the dev server from `192.168.0.112`, `allowedDevOrigins` is already configured in `next.config.ts`.

## Verification

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
- income create, list, update, delete, and bulk delete
- expense create, list, update, and delete
- event create, list, detail, update, and delete
- finance reports backed by live data
- dashboard backed by live members, finance, event, and activity data
- activity logging for core write flows

Not implemented yet:

- auth and roles
- backup and restore flows
- finance CSV export
- finance print-to-PDF reports
- cloud sync UI and actual sync engine
- member portal

## Backlog

Current reusable task backlog lives in:

- `docs/task-skills/README.md`
- `docs/task-skills/refresh-project-docs/SKILL.md`
- `docs/task-skills/finish-expense-crud/SKILL.md`
- `docs/task-skills/wire-finance-reports/SKILL.md`
- `docs/task-skills/wire-dashboard-live-data/SKILL.md`
