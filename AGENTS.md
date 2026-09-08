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
