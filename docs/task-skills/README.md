# Task Skills

These files capture the next concrete implementation tasks for this repo in a reusable format.

Use them when you want to hand a focused task to a future coding session without rewriting scope, constraints, or acceptance criteria.

## Recommended Order

1. `finish-expense-crud`
2. `wire-finance-reports`
3. `wire-dashboard-live-data`
4. `refresh-project-docs`

## Why These Are Next

- Expense records have create and list APIs, but no single-record update/delete route yet.
- Finance reports still render static placeholder content even though the schema and summary APIs exist.
- The admin dashboard is still mostly mock data despite `activity_logs`, members, events, and finance data already being stored.
- Core docs still describe earlier milestones and the README is still mostly the default Next.js template.

## How To Use

Open the task folder and follow its `SKILL.md`.

Example:

- `docs/task-skills/finish-expense-crud/SKILL.md`
- `docs/task-skills/wire-finance-reports/SKILL.md`

Each skill file includes:

- the problem being solved
- the relevant files and models
- implementation guardrails
- a definition of done
- the validation commands to run
