# NTCCGMI Ilog Malino System

## Overview

This repository contains a local-first administration app for The New Testament Christian Church Global Ministry Incorporated - Ilog Malino, focused on managing:

- members
- giving and expenses
- events
- admin reporting
- settings and admin configuration

The project is optimized for a single-device local workflow first, with future cloud sync planned later.

## Current Product Shape

The current app includes:

- admin dashboard with live member, event, finance, and activity data
- member list, create, edit, and profile flows
- income management with member-linked and anonymous contributions
- expense management
- finance reporting with six-month trend data and fund allocation status
- finance CSV export and print/PDF flows
- event list, calendar, create, detail, edit, and delete flows
- settings flows for church profile, app users, finance categories, notifications, and report signatories
- global admin header search across pages, members, events, income, and expenses

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
- `AppUser`
- `ChurchSettings`
- `ReportSignatory`
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
- `/api/search`
- `/api/settings`

## Current Constraints

- No completed authentication flow yet
- Roles and permissions are in progress but not fully enforced everywhere
- No backup/restore workflow yet
- Member and event export workflows are not implemented yet
- No real cloud sync implementation yet
- Some sync-related UI is intentionally descriptive rather than functional
- Local integration/config secrets must not be committed

## Development Notes

- Use webpack dev mode on this Windows setup if Turbopack fails with `better-sqlite3` junction errors.
- Prefer server reads and browser-side writes through API routes.
- Reuse existing admin, finance, members, and UI patterns before adding new abstractions.
- Real pagination is now implemented on finance and members tables.
- The admin header now includes a permission-aware global search entry point.
