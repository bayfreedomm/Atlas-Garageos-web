# Atlas GarageOS — Verified Project State

Snapshot date: 2026-09-25. This file records what the repository proves today; it is not a wishlist.

## Build and architecture

- `VERIFIED DONE` — Astro static output is configured in `astro.config.mjs`; Cloudflare assets-only deployment points to `./dist` in `wrangler.jsonc`.
- `VERIFIED DONE` — `src/core` contains pure TypeScript calculation domains for tire geometry, wheel position, fitment clearance/search, drivetrain, EV energy, and units.
- `VERIFIED DONE` — UI, localization, SEO, browser state, visualization, and storage live outside `src/core`.
- `VERIFIED DONE` — Quality scripts are `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- `VERIFIED DONE` — Current workspace build generated 1,927 static pages during the latest successful production build; the normal Vite large-chunk note remains non-fatal.

## Published product surface

- `VERIFIED DONE` — `src/seo/tool-registry.ts` defines the implemented calculator/data-product registry and localized route helpers.
- `VERIFIED DONE` — 23 registry entries are `kind: 'tool'`, plus the Fitment Studio flagship and Gas Prices Today data product.
- `VERIFIED DONE` — EN, DE, and ES are published route families. PT-BR and FR remain unpublished pending full translation QA.
- `VERIFIED DONE` — Tool families include tires/wheels, fuel/trips, converters, performance, EV, fitment, vehicle reference, and gas-price history.
- `VERIFIED DONE` — Shareable calculator state is client-side URL state; clean canonical routes remain separate from application state.
- `VERIFIED DONE` — Page-specific quick facts, common mistakes, warnings, methodology, related tools, decision graphs, and localized copy are implemented for the current registry.

## Data and evidence

- `VERIFIED DONE` — `src/data/vehicle-fitment.ts` contains a curated 30-vehicle starter reference with per-row source and confidence fields. It is not a licensed exhaustive OEM feed.
- `VERIFIED DONE` — Production tire reference data and OEM merge generate 582 tire-size entities in the current source state.
- `VERIFIED DONE` — Tire-size and bolt-pattern route families generate 1,782 localized entity URLs in the current build state; the older 20/96 counts are historical.
- `VERIFIED DONE` — Bolt-pattern geometry is derived from canonical PCD/lug data; adjacent-hole spacing is not duplicated as hand-entered data.
- `VERIFIED DONE` — Fuel snapshots and append-only history live in `src/data` and are updated by GitHub Actions scripts from official/public provider paths with status and provenance types.
- `VERIFIED DONE` — Repository-level data-vault documentation and JSON schemas exist under `data/` for vehicle fitment and fuel observations.
- `PARTIAL` — Vehicle data is curated and useful, but coverage, trim precision, market scope, torque evidence, and licensing are not sufficient for a universal OEM database claim.

## Garage and user data

- `VERIFIED DONE` — `src/domain/garage.ts`, `src/storage/garage-repository.ts`, serialization, and local-storage repository support validated client-side saved vehicle/setup memory.
- `PARTIAL` — My Garage is local-browser storage, not account-backed durable multi-user storage. There is no auth, server database, D1 binding, R2 backup, user profile API, retention policy, or deletion/export workflow in the current runtime.
- `PLANNED` — A future D1/R2/auth design is documented as a growth direction only; it is not implemented or a promise of current persistence.

## Visual system

- `VERIFIED DONE` — Tire, wheel offset, PCD, speedometer, gear, compression, EV, fitment, and fit-check surfaces have purpose-built technical visual systems with Canvas/WebGL fallbacks where applicable.
- `VERIFIED DONE` — The 2026-09-25 visual-truthfulness pass removed the shared generic Visual Studio from 14 result-led utility/reference/guided-entry routes. Their calculation-specific result visuals remain.
- `VERIFIED DONE` — Public assets actively used are `public/atlas-hero-car.webp` for the homepage, `public/atlas-hero-car.png` for social metadata, and `public/atlas-mark.svg` / `favicon.svg` for identity. Three `design/brand-concepts/*.svg` files are reference concepts, not active UI assets.
- `PARTIAL` — Visual quality still needs page-by-page physical-device, WebKit/Firefox, GPU, accessibility, and deployed performance acceptance.

## Feature reality matrix

| Area | Status | Evidence / boundary |
|---|---|---|
| OBD / DTC intelligence | `NOT FOUND` | No OBD/DTC catalog, routes, parser, or diagnostic engine found in source inventory. |
| Warning lights | `NOT FOUND` | No warning-light entity family or route found. |
| Symptom diagnosis | `NOT FOUND` | No guided symptom-to-system diagnosis engine found. |
| Service Second Opinion | `NOT FOUND` | No upload/quote parser or repair-cost reasoning surface found. |
| Known problems | `NOT FOUND` | No structured known-problem entity set found. |
| TSB / recall | `NOT FOUND` | No official communication/recall data adapter or evidence model for these records found. |
| Maintenance / exact specs | `PARTIAL` | Vehicle fitment includes selected wheel/tire/PCD/torque references with confidence; no broad maintenance/spec catalog. |
| VIN | `NOT FOUND` | No VIN decoder or exact-vehicle resolver found. |
| My Garage / digital twin | `PARTIAL` | Local saved vehicle/setup repository exists; no account-backed history or shared graph context. |
| Vehicle intelligence graph | `PARTIAL` | Vehicle, tire, PCD, fuel and fitment links exist; no generalized graph/entity storage layer. |
| Fitment / compatibility | `PARTIAL` | Deterministic geometry, measured clearance projections, entity references and Fitment Studio exist; no universal fit/safety verdict. |
| Ownership cost | `PARTIAL` | Fuel cost, road trip, EV charge and fuel-price history exist; repairs, maintenance, depreciation and total ownership cost do not. |
| Ask Atlas | `NOT FOUND` | No intent router or source-bound automotive assistant surface found. |

