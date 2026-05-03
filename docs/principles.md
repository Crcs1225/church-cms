# Engineering Principles

This document captures the main implementation principles currently used in the church management app.

## Core Principles

### KISS

Keep implementations straightforward.

- Prefer the smallest useful abstraction.
- Avoid speculative architecture.
- Choose simple data flow over clever indirection.

### DRY

Reuse patterns that already exist in the codebase.

- Reuse shared UI components before creating new visual variants.
- Reuse form flows when create and edit are fundamentally the same interaction.
- Reuse modal systems and query helpers instead of cloning similar behavior per feature.

### SOLID

Apply these in a pragmatic way.

- Single Responsibility:
  Components should own one clear job. Example: page shells, tables, forms, and data fetchers should stay separate.
- Open/Closed:
  Extend shared components through props or composition before duplicating them.
- Liskov Substitution:
  Variants should behave consistently and not surprise callers.
- Interface Segregation:
  Keep props and helpers focused; do not force components to depend on unrelated behavior.
- Dependency Inversion:
  UI should depend on stable helpers and APIs, not raw database details scattered everywhere.

## Data Principles

### Prisma Is The Source Of Truth

- Schema changes should start in `prisma/schema.prisma`.
- Generated Prisma files should not be edited manually.
- `db/schema.sql` is not the primary schema definition.

### Local-First

- SQLite is the primary working database.
- The app should remain useful offline.
- Sync concerns should not distort straightforward local CRUD flows.

### Stable Public IDs

- Use `publicId` for routes, UI references, and client-facing identity.
- Avoid exposing internal numeric IDs in feature flows.

### Patch Updates

- Edit flows should send only changed fields when practical.
- This keeps requests smaller, reduces accidental overwrites, and makes updates easier to reason about.

## Frontend Principles

### Server Reads, Client Writes

- Prefer fetching page data on the server with Prisma-backed helpers.
- Use API routes for browser-triggered create, update, and delete actions.
- Do not call Prisma directly from client components.

### Contextual Actions

- Quick actions, floating buttons, and modals should only appear where they are relevant.
- Avoid global actions that imply the wrong context.

### One UI Pattern Per Job

- If a universal modal or form already exists, extend it rather than creating a second near-match.
- Member income entry and finance income entry should use the same modal system.

### Accessibility First

- Every interactive control needs a clear accessible name.
- Labels, `aria-label`, and semantic structure are part of the feature, not polish.

## Current Folder Direction

- Feature-specific read helpers can live near the feature when they are not shared:
  - `src/components/members/members-data.ts`
  - `src/components/finance/finance-data.ts`
- If query logic becomes shared across pages, move it into `src/lib/data`.

## Practical Rule Of Thumb

Before adding a new component, modal, page flow, or helper, ask:

1. Can we reuse an existing pattern?
2. Can we keep this feature-specific instead of generalizing too early?
3. Can we keep reads on the server and writes through APIs?
4. Can we update only what changed?
