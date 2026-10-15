# Atlas GarageOS — Verified Project State

Snapshot date: 2026-10-14 (master after v7-16). This file records what the repository proves today; it is not a wishlist. Dated sections further down are history; where a number differs, the snapshot below wins.

## Current snapshot — 2026-10-14

| Measure | Value | Evidence |
|---|---|---|
| HTML pages built | 48,964 (48,954 indexable + 404 + 9 noindex embeds) | `pnpm build`, `pnpm audit:seo` |
| Sitemap | `/sitemap.xml` is a sitemap index with 9 typed children | `src/seo/sitemap.ts` `sitemapGroups()` |
| `pages` (home, hubs, 23 calculators, policies × 9 locales) | 264 | `sitemap-pages.xml` |
| `tire-sizes` (974 sizes + 18 height groups + hub, × 9) | 8,937 | `sitemap-tire-sizes.xml` |
| `tire-comparisons` (542 factory-backed pairs × 9) | 4,878 | `src/data/tire-comparisons.ts` |
| `bolt-patterns` (22 patterns + 169 make charts + hub, × 9) | 1,728 | `sitemap-bolt-patterns.xml` |
| `vehicles` (204 curated rows + hub, × 9, + 3 compare hubs) | 1,848 | `src/data/vehicle-fitment.ts` |
| `cars` (EN directory, 246 makes, 3,133 models) | 3,380 | `src/data/cars.ts` |
| `car-years` (EN EPA model years from 2000) | 8,158 | `yearPageYears()` |
| `cars-localized` (169 makes, 2,298 ANKUSI models, × 8 locales) | 19,744 | `src/ui/car-locale.ts` |
| `obd-codes` (hub + 16 guides) | 17 | `src/data/dtc-records.ts` |
| Locales | en, de, es, fr, it, pt-br, pl, nl, tr — all `published: true`; every calculator translated | `src/localization/locales.ts` |
| Tests | 49 files / 333 tests | `pnpm test` |
| Internal link graph | 0 orphan pages, 0 broken internal links, every page ≤ 4 clicks from `/` | rendered-output link crawl, 2026-10-14 |

- `VERIFIED DONE` — IndexNow: key file `public/719c746308ef2b913463b2443bb03c00.txt`, `/build-id.txt`, `scripts/indexnow.mjs` and `.github/workflows/indexnow.yml` submit only new/changed/removed sitemap URLs after Cloudflare serves the commit. The first live run (2026-10-14) was answered `403 SiteVerificationNotCompleted` while the engines verified the fresh key; the script now waits and retries.
- `REJECTED / SUPERSEDED` (v7-16 → v7-18) — `robots.txt` disallowed query-string URLs (`Disallow: /*?`) because internal hand-off links produced ~104,800 distinct calculator-state variants.
- `VERIFIED DONE` — v7-18: rendered HTML has 0 internal query-string hrefs (`src/middleware.ts` + `src/seo/state-links.ts`; state in `data-link-state`, restored on interaction by `src/ui/state-link-enhancer.ts`); robots.txt allows query URLs so shared links expose their clean canonical. Enforced by `pnpm audit:seo` and `tests/unit/state-links.test.ts`.
- `VERIFIED DONE` — Vehicle → Tire → Compare → Calculator flow (`src/components/TireSizeFlow.astro`) on curated vehicle pages and on EN/localized car model pages with tire data: each sourced size opens its tire page, the published comparison with the baseline (only factory-backed pairs; otherwise the comparison calculator pre-filled), the speedometer calculator pre-filled, or the tire calculator. Comparison pages also hand both sizes to the speedometer and fit-check calculators. No new URLs.
- `VERIFIED DONE` — One true-scale fitment cross-section (`src/ui/fitment-section.ts`) replaces the small side/front/vehicle panels on the tire-comparison and wheel-offset calculators and appears on every tire comparison page.

## Build and architecture

- `VERIFIED DONE` — Astro static output is configured in `astro.config.mjs`; Cloudflare assets-only deployment points to `./dist` in `wrangler.jsonc`.
- `VERIFIED DONE` — `src/core` contains pure TypeScript calculation domains for tire geometry, wheel position, fitment clearance/search, drivetrain, EV energy, and units.
- `VERIFIED DONE` — UI, localization, SEO, browser state, visualization, and storage live outside `src/core`.
- `VERIFIED DONE` — Quality scripts are `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- `VERIFIED DONE` — Current build: see the snapshot table (48,964 pages, ~3 min 10 s locally). The 2026-10-08 figure of 2,145 pages is historical. The normal Vite large-chunk note (three-3d, lazy-loaded) remains non-fatal.

## Published product surface

- `VERIFIED DONE` — `src/seo/tool-registry.ts` defines the implemented calculator/data-product registry and localized route helpers.
- `VERIFIED DONE` — 23 registry entries are `kind: 'tool'`, plus the Fitment Studio flagship and Gas Prices Today data product.
- `VERIFIED DONE` — All nine locales (en, de, es, fr, it, pt-br, pl, nl, tr) are published route families with translated calculators, entity pages and policies (superseding the 2026-10-08 EN/DE/ES-only state).
- `VERIFIED DONE` — Tool families include tires/wheels, fuel/trips, converters, performance, EV, fitment, vehicle reference, and gas-price history.
- `VERIFIED DONE` — Shareable calculator state is client-side URL state; clean canonical routes remain separate from application state.
- `VERIFIED DONE` — Page-specific quick facts, common mistakes, warnings, methodology, related tools, decision graphs, and localized copy are implemented for the current registry.

## Search and indexability

- `VERIFIED DONE` — `scripts/audit-seo-build.mjs` now enforces the rendered-output SEO contract across all generated HTML: unique non-empty titles and descriptions per language, one indexable H1, route-matching canonical URLs, sitemap membership, valid JSON-LD, reciprocal self-referencing hreflang clusters with `x-default`, and no query/fragment URLs.
- `VERIFIED DONE` — The latest production output (2026-10-14) contains 48,964 HTML files, 48,954 indexable canonical pages and exactly 48,954 sitemap URLs (historical: 2,145 / 2,141 on 2026-10-08). The only excluded HTML outputs are the 404 page and nine embed routes (one tire-comparison embed per locale), each intentionally `noindex`; none appears in the sitemap (10 noindex files in `dist`, verified 2026-10-14). The earlier "three embed routes" count dates from the EN/DE/ES period.
- `VERIFIED DONE` — The latest length review reports zero titles over 75 characters and zero descriptions over 180 characters. Shared EN/DE/ES tire/bolt templates and the remaining page-specific outliers were shortened without changing route identity or page purpose.
- `PARTIAL` — Local technical SEO is verified, but Google indexing, search-result rewrites, ranking, deployed Core Web Vitals and crawl behavior remain external outcomes requiring Search Console and production monitoring.

## Data and evidence

- `VERIFIED DONE` — `src/data/vehicle-fitment.ts` contains 204 curated vehicle rows (132 US, 72 EU; was 84 on 2026-10-08) with per-row source, confidence, optional factory sizes and EN/DE/ES notes. 2026-10-08: every row except Toyota Corolla, Nissan Rogue/Altima and Tesla Model 3/Y was re-checked against its wheel-size.com generation page (OE size, PCD, bore, wheel, torque); several earlier rows were corrected (Tiguan, Passat, Octavia, Clio, GLC, CR-V, Camry, Leon, Captur, Trafic, MG ZS). It is not a licensed exhaustive OEM feed.
- `VERIFIED DONE` — Commercial (C) van sizes are first-class tire entities (`215-65-r16c` etc.) with passenger-twin links; tire pages add inch view, near-diameter alternatives by rim with speedometer reading, same-rim neighbours and Standard/Option vehicle labels; DE/ES pages use decimal commas and `205/55 R16` notation.
- `VERIFIED DONE` — Tire/bolt/vehicle hubs are linked from home, navigation drawer, footer and tire tools in all three locales.
- `VERIFIED DONE` — 2026-10-08 Part 1 (traffic): Search Console showed >90 % of impressions land on individual tire-size pages, so the tire catalog was expanded from 597 to ~1,000 sizes (wheel-size.com OE list incl. LT metric, tiresize.com diameter index, 10″–24″ plus 14.5/16.5/17.5/19.5/22.5″ rims, 60+ high-flotation sizes such as 33x12.50R15). Flotation sizes are a first-class entry type (`flotation` geometry in `src/data/tire-size-catalog.ts`). New "N-inch tires" height-group pages (`/tire-sizes/33-inch/`, `/de/reifengroessen/33-zoll/`, `/es/medidas-neumaticos/33-pulgadas/`) are generated by the same tire routes. EN titles now target "in inches", ES titles "en pulgadas"; DE/ES write half-inch rims with a comma (R22,5).
- `VERIFIED DONE` — Production tire reference data and OEM merge generate 974 tire-size entities (plus 18 height groups) in the current source state; 582 was the 2026-10-08 count.
- `VERIFIED DONE` — Tire-size and bolt-pattern route families generate 10,665 localized entity URLs (8,937 + 1,728) plus 4,878 comparison URLs; the older 1,782 / 20 / 96 counts are historical.
- `VERIFIED DONE` — Bolt-pattern geometry is derived from canonical PCD/lug data; adjacent-hole spacing is not duplicated as hand-entered data.
- `VERIFIED DONE` — Fuel snapshots and append-only history live in `src/data` and are updated by GitHub Actions scripts from official/public provider paths with status and provenance types.
- `VERIFIED DONE` — Repository-level data-vault documentation and JSON schemas exist under `data/` for vehicle fitment and fuel observations.
- `PARTIAL` — Vehicle data is curated and useful, but coverage, trim precision, market scope, torque evidence, and licensing are not sufficient for a universal OEM database claim.

## Garage and user data

- `VERIFIED DONE` — `src/domain/garage.ts`, `src/storage/garage-repository.ts`, serialization, and local-storage repository support validated client-side saved vehicle/setup memory.
- `PARTIAL` — My Garage is local-browser storage, not account-backed durable multi-user storage. There is no auth, server database, D1 binding, R2 backup, user profile API, retention policy, or deletion/export workflow in the current runtime.
- `PLANNED` — A future D1/R2/auth design is documented as a growth direction only; it is not implemented or a promise of current persistence.
- `VERIFIED DONE` (code) / `BLOCKED` (activation) — v7-19 calculator reports and email list: every calculator page has "Download PDF report" (browser print-to-PDF, `src/components/ReportActions.astro`, `src/ui/report-actions.ts`, print CSS in `product-v4.css`). "Email me this report" with an optional double opt-in list is built: Worker `src/worker/index.ts` (`/api/report`, `/api/confirm`, `/api/unsubscribe`; wrangler `main` + `run_worker_first: ["/api/*"]`), validation `src/features/lead-capture/`, copy `src/content/report-capture-text.ts`, privacy section `PrivacyEmailReports.astro` (9 locales). Storage: D1 tables `subscribers` (email, locale, status pending/confirmed/unsubscribed, token, consent/confirm dates) and `report_sends` (hashes only, 30-day retention). Sending: Resend. Hidden behind `EMAIL_REPORTS_ENABLED = false` until the D1 database (binding `DB`) and the `RESEND_API_KEY` secret exist. Evidence: `tests/unit/lead-capture.test.ts`, local `wrangler dev` + D1 run (send, double opt-in, one-click unsubscribe, rate limits, honeypot, origin check) and a Chromium form test in TR/EN.

## Visual system

- `VERIFIED DONE` — Tire, wheel offset, PCD, speedometer, gear, compression, EV, fitment, and fit-check surfaces have purpose-built technical visual systems with Canvas/WebGL fallbacks where applicable.
- `VERIFIED DONE` — All 23 published calculator tools are assigned to a relevant visual family. Fourteen result-led utility/reference/guided-entry routes again expose their tool-specific Engineering 2D view by default with optional 3D exploration; the other nine retain their native tire, offset, PCD, speed, gearing, compression, EV, and fit-check visual systems.
- `VERIFIED DONE` — Public assets actively used are `public/atlas-hero-car.webp` for the homepage, `public/atlas-hero-car.png` for social metadata, and `public/atlas-mark.svg` / `favicon.svg` for identity. Three `design/brand-concepts/*.svg` files are reference concepts, not active UI assets.
- `VERIFIED DONE` — 2026-10-08 Part 2 mobile redesign (63 % of search clicks are mobile): tire pages lead with an answer strip (height, width, sidewall, circumference) and a section jump bar, merge the metric and inch grids into one mm | inch spec table, put alternatives and vehicles before the explanatory sections, hide secondary table columns on phones and flatten every entity section into hairline-separated bands below 48rem. The tire hub folds its rim groups (49,555 px → ~4,000 px at 390 px) and adds a size lookup. A tire-size lookup box (`src/components/TireSizeLookup.astro`, `src/ui/tire-size-lookup.ts`, `/tire-size-index.json`) parses any spelling (205 55 16, LT285/70R17, 315/80 R22,5, 33x12.5r20) and is the first action in the home hero.
- `REJECTED / SUPERSEDED` (history) — 2026-10-08 Part 3 French, superseded by the full nine-locale rollout: the reference families are published in French ahead of the full site — `/fr/dimensions-pneus/` (every tire size and tire-height page), `/fr/entraxes/` (every bolt pattern) and a French home `/fr/` with the size lookup. `entityLocales()` adds `fr` via `ENTITY_FAMILY_ONLY_LOCALES` in `src/seo/entity-routes.ts`; `fr` stays `published: false` in `locales.ts` because calculators, vehicle pages and policies are not translated, and French pages link to the English tools with an "(anglais)" label. French chrome lives in `frUiStrings` / `chromeStrings()` in `src/localization/site-catalog.ts`.
- `VERIFIED DONE` — 2026-10-14 (v7-17) one drawing language for calculator visuals: `src/ui/tool-drawings.ts` (pure SVG string renderers, 19 kinds) + `src/ui/tool-drawing-driver.ts` + `src/components/ToolDrawingFrame.astro`. Light, thin-line, blue = current / orange = new. Server renders the defaults; the driver re-renders on `input`/`change`/`submit`. Numbers come from the calculators' own functions (`convertPressureTool`, `convertPowerTool`, `convertTorqueTool`, `convertFuelEconomyTool`, `calculatePowerToWeightTool`, `calculateFuelCostTool`, `calculateRoadTripCostTool`, `calculateEvChargingCostTool`, `pcdFromAdjacentHoleSpacingMm`). Blank/invalid input keeps the geometry and clears the readout (no NaN, no "—"/"¤" placeholders); DOT drawing applies the decoder's week 1–53 / not-in-future rule. Used by the 14 utility tools (`ToolEngineering2D.astro`), speedometer, compression, fitment studio (`ParametricEngineering2D.astro`), bolt pattern (`PcdEngineeringVisual.astro`) and the 9 EV pages. Tire anatomy, fit-check shape and gear wheels were restyled to the same language in CSS (geometry unchanged). Evidence: `tests/unit/tool-drawings.test.ts`; Chromium sweep of 24 tool routes at 1280 px and 390 px, every input-driven drawing changed with input.
- `PARTIAL` — Visual quality still needs page-by-page physical-device, WebKit/Firefox, GPU, accessibility, and deployed performance acceptance.
- `VERIFIED DONE` — The shared 2D explainers now bind pressure needle, power level, torque lever, selected tire load/speed code, DOT week/year, towing allowance, quarter-mile motion and sourced vehicle lug count to current validated form state instead of changing only the caption.
- `VERIFIED DONE` — Optional 3D studios on the fourteen result-led tools now resolve the sibling calculator form they belong to and rebuild from current values on `input`, `change`, and `submit`. Evidence: `src/ui/tool-3d.ts` form resolution plus the two-value coverage and controller-binding regressions in `tests/unit/all-tools-3d-coverage.test.ts`.
- `VERIFIED DONE` — A live 390 px browser sweep covered all 23 English tool routes with no document-level horizontal overflow; every opened 3D studio initialized through WebGL. The shared mobile Engineering 2D plates now preserve a readable drawing scale inside an internally pannable, initially centered viewport instead of shrinking 760-unit diagrams into unreadable labels. Evidence: `src/styles/product-v4.css`, `src/components/ToolVisualStudio.astro`, and the mobile-legibility regression.
- `VERIFIED DONE` — The first visual-meaning polish group replaces abstract converter/gearing placeholders on MPG/L·100 km, hp/kW, Nm/lb-ft, power-to-weight, and gear-ratio pages. Their Engineering 2D surfaces now show authoritative converted values inside recognizable fuel, power, torque, vehicle-mass, tire, wheel, and axle-ratio relationships. EN/DE/ES gear pages share one component, and desktop plus 390 px Chromium acceptance found no document overflow or console warnings. Evidence: `src/components/ToolEngineering2D.astro`, `ToolVisualStudio.astro`, `GearRatioTechnicalVisual.astro`, `src/ui/gear-ratio-calculator.ts`, and `tests/unit/all-tools-3d-coverage.test.ts`.

## Feature reality matrix

| Area | Status | Evidence / boundary |
|---|---|---|
| OBD / DTC intelligence | `PARTIAL` | A visible `/obd-codes/` Diagnostics hub, validated lookup, 16 reviewed generic code guides, home/header/drawer/footer entry points, TechArticle schema and sitemap projection are implemented. `src/domain/dtc.ts` still gates catalog validity and publication. Coverage is intentionally incomplete and no vehicle-specific diagnostic engine exists. |
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

## Part 4 — vehicles in every language, US expansion (2026-10-08) — historical log

> Historical record. Counts and locale lists below describe 2026-10-08; the current state is the 2026-10-14 snapshot at the top.

- Vehicle dataset: 201 rows (132 US-market, 69 EU-market). 117 US rows added from tirewheelguide.com (USA trims only, first OE row per trim; torque not published there, so no torque on those rows; fastener type set by make: BMW/Mercedes-Benz/Audi/VW/Porsche/Volvo = wheel bolts, others = lug nuts).
- Every vehicle now has a page in EN (/vehicles/), DE (/de/fahrzeuge/), ES (/es/vehiculos/) and FR (/fr/vehicules/), with reciprocal hreflang (x-default = EN). The market the data describes is shown in the spec table. Vehicle links always stay in the reader's language.
- Comparison and trip hand-off accept every vehicle in every language.
- wheel-size.com is no longer used for automated collection: it answered with human-verification pages, and Atlas does not work around bot checks.
- Build: 4,979 sitemap URLs; bolt-pattern pages 14 → 22 per locale.

## Part 5 — five more languages, /cars/ (EPA + ANKUSI), bolt charts by make (2026-10-09) — historical log

> Historical record. "Reference-only locales … calculators stay English" was superseded: all nine locales are published with translated calculators (snapshot, `src/localization/locales.ts`).

- Reference-only locales are now one list (src/localization/reference-locales.ts): fr, it, pt-br, pl, nl, tr. Each publishes tire sizes, tire heights, bolt patterns, bolt charts by make, vehicles and a home (ReferenceHome.astro); calculators stay English and say so. Chrome copy lives in src/content/reference-locale-text.ts.
- /cars/: EPA fuel economy (fueleconomy.gov, 50,407 configurations 1984–2027) merged with the ANKUSI Wheel Fitment Dataset (CC BY 4.0, 9,701 records) into src/data/generated/cars.json by scripts/build-cars-data.py. Pages: directory, one per make, one per model (all years in a table), one per model year from 2000 (MPG by version, annual fuel cost at today's EIA price, wheel record). English only.
- Bolt pattern chart per make in all nine languages (/bolt-patterns/{make}/ and localized equivalents); bolt-pattern pages list every make/model recorded with that pattern.
- 14 vehicles gained wheel torque from checkfitment.com rows marked "verified" (medium confidence).
