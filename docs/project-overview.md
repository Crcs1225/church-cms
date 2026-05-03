# Church Management System (CMS)

## Project Overview

The Church Management System (CMS) is a web-based application designed to help churches manage their internal operations efficiently. The system focuses on financial tracking, member management, and event coordination, with an offline-first architecture and optional cloud synchronization through a hosted SQLite-compatible service for multi-device access.

This document is intended as project context for contributors and AI assistants working in this repository.

## Goals

### Primary Goals

- Provide a simple and reliable system for managing:
  - Tithes and offerings
  - Member records
  - Church events
- Ensure the system works offline for local use
- Enable data synchronization to the cloud for backup and multi-device access, preferably through SQLite Cloud or a similar SQLite-native sync service

### Long-Term Goals

- Allow members to:
  - View their giving history
  - Check events and announcements
- Support multi-device usage, such as multiple church staff laptops
- Provide real-time or near real-time data sync
- Scale into a full church management platform

## Description

This project is built as an offline-first application:

- Data is stored locally on the device using a lightweight database
- The system continues to function without internet access
- When online, data can sync to a cloud backend for:
  - Backup
  - Cross-device access

The system will initially focus on an admin dashboard, with future expansion to a member-facing portal.

## Tech Stack

### Frontend And Backend

- Next.js, used as the fullstack React framework
- TypeScript, used for type safety

### Database

- SQLite, used as the embedded local database for offline storage
- Current implementation uses local SQLite with Prisma and `better-sqlite3`

### ORM

- Prisma is used as the application ORM for managing schema and type-safe queries
- Prisma connects to SQLite through `@prisma/adapter-better-sqlite3`

### Cloud Backend

- SQLite Cloud is the preferred cloud-sync candidate because it keeps the architecture SQLite-centered:
  - Hosted SQLite-compatible database services
  - SQLite-native sync options
  - JavaScript driver support
- Supabase remains a possible fallback option if the project later needs PostgreSQL-first features:
  - PostgreSQL database
  - Authentication
  - API services

## Architecture

### Current Offline-First Architecture

```text
[ Next.js App ]
       |
[ Prisma ORM ]
       |
[ SQLite Database (Local) ]
```

### Local SQLite Implementation

```text
[ Next.js App ]
       |
[ Prisma Client ]
       |
[ better-sqlite3 Adapter ]
       |
[ SQLite Database (Local) ]
```

### Future Cloud Sync Architecture

```text
[ Local SQLite ]
       |
      Sync
       |
[ SQLite Cloud ]
       |
[ Other Devices / Clients ]
```

## Key Features

### Phase 1: MVP

- Admin authentication
- Member management
- Tithes and offerings recording
- Basic financial reports

### Phase 2

- Data synchronization with SQLite Cloud or another SQLite-native cloud sync provider
- Backup and restore system
- Multi-device support

### Phase 3

- Member portal for viewing personal contributions
- Event management and announcements
- Optional notifications

## Data Sync Strategy

Each syncable record should include:

- `id`, preferably a UUID
- `createdAt`
- `updatedAt`
- `synced` flag or equivalent sync metadata

Local data should be marked as unsynced until uploaded. Sync should occur when internet is available.

The initial manual conflict resolution strategy is last updated wins. If SQLite Cloud sync supports CRDT-based merging for the selected runtime, prefer the provider's built-in conflict handling instead of custom conflict logic.

## Storage Strategy

- Local data is stored in SQLite per device
- The hosted cloud database acts as:
  - Backup
  - Source of truth for shared data
- Each device maintains its own local database and syncs with the cloud
- Avoid directly sharing SQLite database files across devices

## Deployment Plan

### Local Deployment

- Runs as a local web app or desktop-wrapped app
- Database is stored on the machine

### Future Deployment

- Frontend: Vercel or similar platform, if the app becomes web-hosted
- Backend and database: SQLite Cloud, if its sync model fits the app
- Alternative backend and database: Supabase with PostgreSQL

## Constraints And Considerations

- Must work offline reliably
- Avoid direct sharing of database files across devices
- Handle sync conflicts carefully
- Keep the system simple and scalable
- Treat financial data as sensitive and design access controls accordingly

## Dependencies

### Current Core Dependencies

- `next`
- `react`
- `react-dom`
- `better-sqlite3`
- `@prisma/client`
- `@prisma/adapter-better-sqlite3`

### Current Development Dependencies

- `typescript`
- `eslint`
- `@types/better-sqlite3`
- `prisma`
- `@prisma/client`

### Planned Cloud Dependencies

- SQLite Cloud JavaScript driver or sync package, pending implementation choice
- `@supabase/supabase-js`

## Summary

This project is designed as a scalable, offline-first church management system that starts simple and can evolve into a connected platform. The architecture prioritizes reliability in low-connectivity environments while leaving room for cloud backup, multi-device workflows, and member-facing features.
