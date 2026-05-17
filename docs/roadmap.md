# NTCCGMI Ilog Malino Roadmap

## Current State

The app is past bootstrap and already includes usable admin workflows for:

- members
- finances
- events
- dashboard visibility
- settings and admin configuration

It also already has:

- Prisma-first local SQLite data model
- activity logging
- member soft-archive behavior
- finance reports backed by real data
- dashboard cards backed by real data
- permission-aware global header search across pages and core records
- finance CSV export
- finance print/PDF report pages
- real pagination on finance and members tables
- loading screens for core admin routes
- settings foundations for church profile, finance categories, app users, and report signatories

## Current Gaps

These are the main gaps between the current codebase and a more production-ready local MVP.

### Operational Safety

- backup and restore workflow
- export flows for members and events
- clearer destructive-action audit coverage where still missing
- secret/config hygiene for local-only integration files

### Access Control

- local admin authentication
- complete role and permission enforcement across all admin surfaces
- session protection for admin routes
- hardening of active admin user switching so it is no longer just local workflow scaffolding

### Sync Readiness

- real sync engine
- sync status UX beyond persisted `synced` flags
- conflict strategy implementation

### UX Hardening

- broader loading and error states
- more complete filtering on event and member screens
- richer post-save feedback and empty-state polish
- mobile and tablet polish

## Near-Term Priorities

### Priority 1

- restore full repo validation stability
- keep dashboard and reports honest and data-backed
- refresh docs whenever major screens change
- remove local secrets from tracked history and lock down config handling

### Priority 2

- backup and restore
- member and event export tooling
- stronger data validation and duplicate prevention

### Priority 3

- authentication and full route protection
- sync research and implementation

## Suggested Next Work

1. Add backup and restore workflows for the local SQLite database.
2. Add export for members and events to match the completed finance CSV/PDF tooling.
3. Finish authentication, session checks, and role protection for admin routes and APIs.
4. Add stronger duplicate prevention and validation around key write flows.
5. Design the first real sync workflow after backup/export safety is in place.
