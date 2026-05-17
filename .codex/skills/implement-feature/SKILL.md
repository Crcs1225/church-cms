---
name: implement-feature
description: Implement product or application features from start to finish. Use when Codex needs to add a feature, wire UI to data, change backend behavior, or deliver a scoped enhancement with planning, resource gathering, implementation, testing, error fixing, and a final regression pass.
---

# Implement Feature

Follow this workflow in order unless the task is so small that a step can be collapsed without losing safety.

## 1. Plan

- Define the user-facing outcome in one or two sentences.
- Identify the affected layers: UI, API, data, permissions, and tests.
- Choose the smallest implementation that fits the current architecture.
- Call out assumptions that could change behavior or scope.

## 2. Gather Resources

- Read the files that currently own the feature area before proposing changes.
- Reuse existing patterns for routing, fetching, form handling, permissions, and UI primitives.
- Check repository instructions such as `AGENTS.md`, schema rules, and testing expectations.
- Look for existing helpers or components before introducing new abstractions.

## 3. Implement

- Make the server and client changes needed for the feature end to end.
- Keep write scope tight and avoid incidental refactors.
- Prefer stable route identities and existing domain models.
- Add concise comments only when the intent would otherwise be hard to parse.

## 4. Test

- Run the smallest meaningful verification first.
- After backend or API changes, run the repo's typecheck and lint commands at minimum, then broader tests when relevant.
- After UI-only changes, run typecheck and lint unless the repo requires more.
- Confirm the new feature path, not just the build.

## 5. Fix Errors

- Treat failing typecheck, lint, runtime, or test output as part of the implementation work.
- Fix the root cause instead of suppressing the signal.
- Re-run the failed check after each meaningful fix.

## 6. Regression Pass

- Recheck nearby flows touched by the change.
- Verify permissions, empty states, loading states, and navigation still behave correctly.
- Summarize remaining risks if a full verification path could not be run.

## Output Standard

- Finish with the implemented result, the checks you ran, and any unresolved risk.
- If verification was blocked, state exactly what could not be executed and why.
