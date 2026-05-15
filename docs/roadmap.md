# NTCCGMI Ilog Malino Roadmap

## Current State

The app is past bootstrap and already includes usable admin workflows for:

- members
- finances
- events
- dashboard visibility

It also already has:

- Prisma-first local SQLite data model
- activity logging
- member soft-archive behavior
- finance reports backed by real data
- dashboard cards backed by real data

## Current Gaps

These are the main gaps between the current codebase and a more production-ready local MVP.

### Operational Safety

- backup and restore workflow
- export flows for members and events
- clearer destructive-action audit coverage where still missing

### Access Control

- local admin authentication
- roles and permissions
- session protection for admin routes

### Sync Readiness

- real sync engine
- sync status UX beyond persisted `synced` flags
- conflict strategy implementation

### UX Hardening

- broader loading and error states
- more complete filtering on event and expense screens
- more report variants beyond the current finance CSV and print/PDF flows
- mobile and tablet polish

## Near-Term Priorities

### Priority 1

- restore full repo validation stability
- keep dashboard and reports honest and data-backed
- refresh docs whenever major screens change

### Priority 2

- backup and restore
- export tooling
- stronger data validation and duplicate prevention

### Priority 3

- authentication and roles
- sync research and implementation

## Suggested Next Work

1. Add backup and restore workflows for the local SQLite database.
2. Add export for members and events to match the completed finance CSV/PDF tooling.
3. Add authentication and role protection for admin routes.
4. Add real pagination and richer post-save feedback across finance tables.
5. Design the first real sync workflow after backup/export safety is in place.
