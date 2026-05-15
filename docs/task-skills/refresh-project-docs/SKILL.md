---
name: refresh-project-docs
description: Refresh repo documentation to match the actual current application. Use when Codex needs to replace stale roadmap or README guidance, document implemented admin workflows, and reduce repeated rediscovery in future sessions.
---

# Refresh Project Docs

Bring the docs in line with the real state of the app.

## Problem

- `README.md` is still mostly the default Next.js template.
- `docs/roadmap.md` still lists several milestones that are already implemented.
- The repo has enough working members, finances, and events code that future sessions should not need to re-audit the same baseline.

## Relevant Files

- `README.md`
- `docs/roadmap.md`
- `docs/project-overview.md`
- `AGENTS.md`
- `docs/task-skills/README.md`

## Constraints

- Keep docs concrete and current.
- Prefer describing implemented behavior separately from future backlog.
- Do not claim backup, auth, sync, or exports are complete unless verified in code.
- Preserve Prisma-first and local-first guidance already established in `AGENTS.md`.

## Approach

1. Rewrite the README as a project README, not a framework template.
2. Split roadmap language into:
   - implemented now
   - next up
   - later
3. Add references to the reusable task skills so future work is easier to resume.
4. Keep commands aligned with Windows notes already used in the repo.

## Definition Of Done

- README describes the real app, setup, and current feature coverage.
- Roadmap reflects the current baseline instead of the original bootstrap state.
- Future sessions have a stable place to find the next backlog items.

## Validation

Run:

```bash
cmd /c node_modules\.bin\tsc.cmd --noEmit
cmd /c npm run lint
```
