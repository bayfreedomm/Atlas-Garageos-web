# Atlas GarageOS Agent Guide

## Non-negotiable architecture

- Keep `src/core` pure TypeScript: no Astro, DOM, browser storage, SEO, localization, network, or UI imports.
- Accept only validated domain values in calculation functions. Add or change validation through domain factories.
- Keep canonical calculations in millimetres. Unit conversion belongs in `core/units`; display formatting stays outside core.
- Treat URL and persisted data as untrusted. Parse, validate, and normalize it before creating domain values.
- Do not turn geometric comparisons into safety or fitment verdicts. Never invent clearance thresholds.
- Feature modules orchestrate core/domain behavior. UI, storage, localization, and SEO stay behind their own boundaries.
- Language, unit system, and currency are independent preferences.
- Application-state URLs and indexable SEO routes are separate concepts.
- Prefer static output and Cloudflare-compatible APIs. Add dependencies only when their value is clear.

## Quality gates

Before a checkpoint, run `pnpm test`, `pnpm typecheck`, and `pnpm build`. Add unit tests for every important formula and regression. Preserve unrelated working code and keep experiments outside the production core.

## V3 decision ledger
Before significant product, UI, SEO, localization, growth, or visual changes, read `V3_MASTER_PLAN.md`. Locked decisions must not be silently removed or reversed; update the ledger when an implementation pass changes status.

## Persistent project memory

The current project-memory source of truth is:

- `docs/atlas/MASTER_PLAN.md` — reconciled product strategy and non-negotiable boundaries.
- `docs/atlas/PROJECT_STATE.md` — verified repository reality only; never a wish list.
- `docs/atlas/ROADMAP.md` — accepted future work, ordered by priority.

Before important Atlas work, read those three files and then consult `docs/atlas/DECISIONS.md`, `docs/atlas/IDEA_BANK.md`, or `docs/atlas/HANDOFF.md` when relevant. Do not rely on old chat memory or assumptions. Treat current code, routes, data, tests, and configuration as the authority for what exists.

Use these status labels consistently: `VERIFIED DONE`, `PARTIAL`, `PLANNED`, `BLOCKED`, `IDEA`, and `REJECTED / SUPERSEDED`. A `VERIFIED DONE` claim should name evidence such as a route, file/component, test, data source, or configuration. Update `PROJECT_STATE.md` and `ROADMAP.md` after meaningful work, record durable product decisions with date and rationale in `DECISIONS.md`, and keep unaccepted ideas in `IDEA_BANK.md`. Update `HANDOFF.md` at the end of a substantial session with what changed, what was verified, what remains, and the next sensible task.

Preserve working behavior and data contracts. Do not silently replace an existing decision, create a duplicate memory system, or treat a generated/static artifact as the source of truth. This repository currently has no server-side user-account database; local Garage storage is not durable multi-user persistence.
