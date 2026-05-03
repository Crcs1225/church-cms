# Church Management System Roadmap

## Current Foundation

The project currently has:

- Next.js app with TypeScript
- Local SQLite database for offline-first storage
- Prisma connected to the local SQLite database
- Starter `members` table
- Project overview documentation
- Ember Studio design system documentation
- Engineering principles documentation in `docs/principles.md`

The immediate priority is to turn this foundation into a usable admin workflow before adding cloud sync or member-facing features.

## Phase 1: Local MVP

Goal: Build a reliable single-device church admin system that works offline.

### Core Data Models

- Members
- Giving records
- Giving categories, such as tithe, offering, missions, and donation
- Events
- Basic users or admins

### Member Management

- Add member
- Edit member
- View member list
- Search and filter members
- Track member status, such as active, inactive, transferred, or deceased
- Store contact details

### Giving And Finance

- Record tithes and offerings
- Assign giving records to members when applicable
- Support anonymous giving
- Filter giving by date range
- Show totals by category
- Show monthly giving summary
- Export basic reports as CSV

### Events

- Create church events
- Edit event details
- View upcoming events
- Track event date, time, location, and description

### Local App Experience

- Build an admin dashboard as the main screen
- Use the Ember Studio design system
- Keep the UI simple, fast, and practical
- Make all core workflows usable without internet

## Phase 2: Data Quality And Reporting

Goal: Make local records easier to trust, audit, and report.

### Validation

- Add required field validation
- Prevent duplicate member records where possible
- Validate dates and financial amounts
- Add clear error states for forms

### Reports

- Giving summary by month
- Giving summary by category
- Giving summary by member
- Member directory report
- Event list report

### Audit-Friendly Records

- Add `createdAt` and `updatedAt` fields consistently
- Add soft-delete or archive behavior for important records
- Track who created or updated financial records once admin users exist

## Phase 3: Backup And Restore

Goal: Protect local data before introducing sync complexity.

### Local Backup

- Add manual database backup
- Add restore from backup
- Add clear backup location guidance
- Warn before overwriting local data

### Data Export

- Export members to CSV
- Export giving records to CSV
- Export events to CSV

## Phase 4: Authentication And Roles

Goal: Add basic access control for church staff.

### Authentication

- Add local admin login
- Store password securely
- Add logout
- Add session protection for admin pages

### Roles

- Admin
- Finance staff
- Events staff
- Viewer

### Permissions

- Restrict financial records to authorized users
- Restrict settings and backup actions to admins
- Allow read-only access where appropriate

## Phase 5: Cloud Sync Research

Goal: validate whether SQLite Cloud fits the project before committing to sync.

### SQLite Cloud Evaluation

- Confirm JavaScript and Next.js compatibility
- Confirm local-first sync workflow
- Confirm conflict handling behavior
- Confirm pricing and limits
- Test sync with two local devices
- Confirm backup and restore story

### Sync Requirements

- Each syncable record should use a stable UUID
- Each syncable record should have `createdAt` and `updatedAt`
- Each syncable record should include sync metadata if needed
- Avoid sharing raw SQLite database files between devices

### Conflict Strategy

- Prefer provider-supported conflict handling if SQLite Cloud supports it for this use case
- Use last-updated-wins only as the first custom fallback
- Add visible conflict review later if needed

## Phase 6: Cloud Sync Implementation

Goal: Support backup and multi-device usage without breaking offline workflows.

### Initial Sync

- Push local records to cloud
- Pull cloud records to local database
- Mark synced records
- Retry failed sync jobs

### Multi-Device Support

- Test two church staff laptops
- Handle offline edits from multiple devices
- Add clear sync status in the admin UI
- Add manual sync button

### Sync Safety

- Prevent duplicate records
- Preserve financial history
- Log sync errors
- Make sync failure non-destructive

## Phase 7: Member Portal

Goal: Let church members view selected information safely.

### Member Features

- View personal giving history
- View upcoming events
- View announcements
- Update basic contact details, if allowed

### Security

- Members only see their own records
- Financial data remains private
- Admin data is never exposed to member accounts

## Phase 8: Polish And Scale

Goal: Make the system stable, pleasant, and ready for real church operations.

### UX Polish

- Improve empty states
- Add loading states
- Add confirmation dialogs for sensitive actions
- Improve mobile and tablet layouts
- Refine print-friendly reports

### Reliability

- Add automated tests for core data workflows
- Add database migration workflow
- Add seed data for development
- Add error logging

### Future Enhancements

- Notifications
- Attendance tracking
- Small group management
- Pledges or campaigns
- Receipt generation
- Import from spreadsheets

## Near-Term Next Steps

1. Build the admin dashboard layout.
2. Add member CRUD screens using Prisma.
3. Expand the Prisma schema for giving records and events.
4. Add basic reporting for local giving data.
5. Add backup and restore before attempting cloud sync.
