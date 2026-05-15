# NTCCGMI Ilog Malino System

## Overview

This repository contains a local-first administration app for The New Testament Christian Church Global Ministry Incorporated - Ilog Malino, focused on managing:

- members
- giving and expenses
- events
- admin reporting

The project is optimized for a single-device local workflow first, with future cloud sync planned later.

## Current Product Shape

The current app includes:

- admin dashboard with live member, event, finance, and activity data
- member list, create, edit, and profile flows
- income management with member-linked and anonymous contributions
- expense management
- finance reporting with six-month trend data and fund allocation status
- event list, calendar, create, detail, edit, and delete flows

## Architecture

Current runtime shape:

```text
[ Next.js App ]
       |
[ Prisma Client ]
       |
[ better-sqlite3 Adapter ]
       |
[ Local SQLite Database ]
```

## Data Principles

- Prisma schema is the source of truth.
- Public UI and route identity should use `publicId`.
- Money is stored as integer cents.
- Local SQLite is the primary working datastore.
- Sync can be layered later without changing the local-first model.

## Key Models

- `MemberType`
- `Member`
- `GivingCategory`
- `Contribution`
- `ExpenseCategory`
- `Expense`
- `Fund`
- `FundAllocation`
- `Event`
- `ActivityLog`
- `ReportSnapshot`

## API Surface

Current route groups:

- `/api/member-types`
- `/api/members`
- `/api/finances/categories`
- `/api/finances/income`
- `/api/finances/expenses`
- `/api/finances/summary`
- `/api/events`

## Current Constraints

- No auth or roles yet
- No backup/restore workflow yet
- Finance CSV export is implemented
- Finance print-friendly PDF workflow is implemented through browser print pages
- No real cloud sync implementation yet
- Some sync-related UI is intentionally descriptive rather than functional

## Development Notes

- Use webpack dev mode on this Windows setup if Turbopack fails with `better-sqlite3` junction errors.
- Prefer server reads and browser-side writes through API routes.
- Reuse existing admin, finance, members, and UI patterns before adding new abstractions.
