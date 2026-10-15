# Atlas GarageOS — Session Handoff

Updated: 2026-10-15.

## 2026-10-15 session (v7-19)

- Calculator report actions on every tool page: PDF (print) always; email report + double opt-in list built but off (`src/config/lead-capture.ts`).
- Worker added (`src/worker/index.ts`, wrangler `main`, `run_worker_first: ["/api/*"]`); static pages never invoke it. Only `default` may be exported from it (workerd entrypoint rule; guarded by `tests/unit/cloudflare-deploy-config.test.ts`).
- Verified locally with wrangler 4.151 `dev --local` + D1 + a mail sink: report send, list sign-up, confirm, RFC 8058 unsubscribe, rate limits, honeypot, origin check; Chromium form flow in TR and EN; print layout.
- To activate: owner creates D1 `atlas-subscribers` and the Resend domain/secret → add `"d1_databases": [{ "binding": "DB", "database_name": "atlas-subscribers", "database_id": "<id>" }]` to `wrangler.jsonc` → `EMAIL_REPORTS_ENABLED = true` → build, deploy, send one live test.

## 2026-10-15 (v7-21)

- Car model pages: bolt pattern by year table (data-only), headline pattern with its years, de-duplicated wheels heading, curated vehicle named next to Standard/Option sizes (EN + 8 locales).
- Email endpoint: Origin required; daily cron purge for 30-day retention. CI workflow added. Docs: email status, CI, backlog (Turnstile/rate limit, browser smoke test).
- Part B rest evaluated and dropped: tool-page JS is deferred modules (no render blocking; ~10–20 KB gain possible), hero image is object-fit cover at up to 3× DPR so a smaller file would be picked only on 1× screens.
- Generation branch `parca-3-model-sayfalari` still unmerged (behind master); sourcing plan unchanged.

## 2026-10-15 (v7-20, Part B step 1)

- `scripts/split-entity-css.mjs` runs after `astro build` (package.json `build`): the 48,690 reference pages (every typed sitemap except `pages`) load `/_astro/reference.<hash>.css` with only the rules their HTML and scripts can use (purgecss 6.0.0, dev dependency). Tool pages and home keep the full sheet. Tire page transfer 67 KB → 36 KB (CSS 54 → 23 KB gzip).
- Verified: computed styles of every element identical (full vs slim) on 32 sample pages × desktop/mobile × light/dark, plus menu, lookup, details, theme, compare and OBD search interactions; audit now fails if any page links a missing stylesheet.
- Also: report buttons readable in dark mode/hover; drawings redraw after a saved currency is restored; `public/BingSiteAuth.xml` for Bing Webmaster.

## 2026-10-15 morning (v7-19 live)

- D1 `atlas-subscribers` bound in `wrangler.jsonc`; Resend domain atlasgarageos.com verified; `RESEND_API_KEY` set as a Production runtime secret (a copy also sits in Builds → Variables, unused at runtime).
- Live test: POST /api/report → 200, email delivered to the owner's inbox. `EMAIL_REPORTS_ENABLED = true`: "Bu raporu e-postama gönder" shows on every calculator in all 9 locales; list checkbox unticked, double opt-in.

## 2026-10-14 late session (v7-18)

- Crawl graph: rendered HTML had 320,836 internal hrefs with a query string (104,755 unique: `?category` 195,879; `?current&new` 93,843; `?size` 13,951; `?current` 11,457; `?lugs&spacing` 2,034; `?a` 1,836; `?vehicle` 1,836). Now 0. `src/middleware.ts` → `cleanStateLinks()` in `src/seo/state-links.ts` moves state to `data-link-state`; `src/ui/state-link-enhancer.ts` (loaded by `SiteLayout.astro` and `EmbedTireComparison.astro`) restores it on pointer/focus/context-menu/click and cleans script-created links. Clean link total unchanged (1,622,132), 0 orphans, 0 broken, max depth 4.
- robots.txt: `Disallow: /*?` removed; audit now fails on internal query hrefs or on that disallow. Shared `?tool=&state=` and `?current=&new=` URLs still load and prefill (checked in Chromium: click, focus, right-click, middle-click).
- Docs reconciled: FR/PT-BR "next rollout" items, 2026-10-08 French/IndexNow plan, 3-vs-9 embed count and the robots item marked historical/superseded; nothing deleted.
- Branch `parca-3-model-sayfalari`: not merged (merge-tree clean against master, master is 3 commits ahead, branch adds only `src/data/car-generations.ts` + `src/content/car-generation-text.ts`). Verification plan: (1) per row, cite a primary source for name + start/end year (manufacturer press/media site launch & run-out releases; EU type-approval/KBA where available); otherwise two independent references; (2) record the source URL in the table and add a test that every row has one; (3) check each span against ANKUSI model-year records and flag spans where the bolt pattern changes mid-generation; (4) drop rows that stay unsourced; (5) known suspects to check first: Megane IV end year (2023 vs 2024), Hyundai Tucson gap 2010–2015 (sold as ix35 in EU), Passat B9 start (2023 vs 2024), overlapping spans (Astra H/J, i30 1/2, Octavia 2/3/4, BMW 3 E36/E46). Then wire into `CarModelLocaleBody` / EN model page.

## 2026-10-14 night session (v7-17)

- Drawings: new `src/ui/tool-drawings.ts` / `tool-drawing-driver.ts` / `ToolDrawingFrame.astro` replace the old Engineering 2D plates on 14 utility tools, speedometer, compression, fitment studio, bolt pattern and EV. Old `update2D` in `ToolVisualStudio.astro` and `paintBattery` in `ev-charging-calculator.ts` removed. Tire anatomy, fit-check and gear visuals restyled in `product-v4.css` (end of file).
- Fixed on the way: NaN on blank fields, future DOT year accepted by the drawing, drawing math duplicated outside the calculators.
- Verified: 50 files / 338 tests, astro check 0 errors, 48,964 pages, SEO audit passed; Chromium 24-route sweep desktop + 390 px.
- Next: Part B (CSS cleanup: 4 stylesheet generations, ~295 KB; lazy tire catalog on tool pages; responsive hero image), then Part C (generation answers on model pages, branch `parca-3-model-sayfalari`).

## 2026-10-14 evening session (v7-15, v7-16)

- v7-15: `src/ui/fitment-section.ts` true-scale cross-section on the tire comparison and wheel offset calculators and on all tire comparison pages; IndexNow retries while a new key is being verified.
- v7-16: Vehicle → Tire → Compare → Calculator flow (`TireSizeFlow.astro`, `src/content/vehicle-flow-text.ts`, `src/ui/model-tire-flow.ts`) on vehicle pages and EN/localized car model pages; comparison pages link the speedometer and fit-check calculators with both sizes; `publishedComparison()` / `speedometerHref()` / `fitCheckHref()`; robots `Disallow: /*?` enforced by the SEO audit; docs reconciled to the current master (see PROJECT_STATE snapshot).
- Verified: link crawl (0 orphans, 0 broken, depth ≤ 4), prefill of speedometer/fit-check from `?current=&new=` in Chromium, 390 px layout of the flow table, full test/check/build/audit gate.
- Open: branch `parca-3-model-sayfalari` (generation table + 9-locale copy, not wired in); Bing Webmaster registration; Search Console per-sitemap reading after 2–3 weeks.

## 2026-10-14 session (v7-14)

- Sitemap: `/sitemap.xml` is now a sitemap index with one child per page type (`src/seo/sitemap.ts` → `sitemapGroups()`; `src/pages/sitemap-[group].xml.ts`): pages, tire-sizes, tire-comparisons, bolt-patterns, vehicles, cars, car-years, cars-localized, obd-codes. `scripts/audit-seo-build.mjs` follows the index and checks the 50,000-URL / 50 MB limits.
- IndexNow: key file `public/719c746308ef2b913463b2443bb03c00.txt` (`src/seo/indexnow.ts`), `/build-id.txt` (commit of the live deployment), `scripts/indexnow.mjs` (hash diff of built HTML vs. previous run; only new/changed/removed sitemap URLs; batches of 10,000) and `.github/workflows/indexnow.yml` (on push to master + daily 22:50 UTC; state in the Actions cache). First run submits every sitemap URL once. Builds are byte-deterministic (verified), so unchanged pages are never resubmitted.
- Tire comparisons: `src/data/tire-comparisons.ts` publishes 542 factory-backed "X vs Y" pairs (same-vehicle factory sizes from curated rows and ANKUSI records, plus the closest ±1-inch alternative of every factory size) at `/{tire segment}/{a}-vs-{b}/` in all 9 locales (4,878 pages), with FAQPage JSON-LD. Copy: `src/content/tire-comparison-text.ts`; model: `src/ui/tire-comparison.ts`; body: `src/components/TireComparisonEntity.astro`.
- Tire-size pages gained "compared with" and "car models listed with this size" (ANKUSI) sections.
- Vehicles: added Fiat Egea / Tipo (356), Hyundai Bayon (BC3), Renault Taliant (low confidence, one source). Togg T10X and EU Corolla E210 were not added: no published size data / conflicting PCD sources.
- Gate: 47 files / 323 tests, astro check 0 errors, 48,964 pages, SEO audit passed, 0 long titles/descriptions.
- Next: Part 3 — Türkiye fuel price page (/tr/akaryakit-fiyatlari-bugun/).

## 2026-10-08 session

- Full audit of the live version: fixed English leftovers on DE/ES pages (drawer, footer, fitment studio, tool visuals, utility results, home, 404, tool search label), decimal commas, unrealistic "similar sizes", hreflang x-default on ES vehicle pages, unstyled vehicle FAQ, missing hub links.
- Added C van tire sizes, inch view, alternatives table with speedometer reading, same-rim neighbours, shorter CTR-oriented tire titles.
- Re-checked vehicle data against wheel-size.com; 84 rows (Berlingo III added).
- Gate: 42 files / 291 tests, astro check 0 errors, 2,145 pages, SEO audit passed with 0 long titles/descriptions.

## Earlier

## What was done

- Audited the repository-level memory sources, root planning notes, data-vault notes, source tree, route families, tests, workflows, and public/design assets.
- Established the canonical `docs/atlas/` memory layer without deleting historical package notes.
- Added the reconciled product strategy, verified state matrix, prioritized roadmap, accepted decisions, idea bank, and this handoff.
- Added persistent-memory rules to `AGENTS.md` and linked the historical V3 ledger to the canonical docs.
- Added `OBD_DTC_MVP_BRIEF.md` as the implementation gate for a bounded, evidence-first OBD/DTC cluster.
- Restored the visual-studio mount for fourteen result-led tools after confirming the user's product rule that every calculator keeps a relevant visual; Engineering 2D opens first and 3D remains optional.
- Reconciled the full strategy scope into canonical memory so language expansion, OBD/warnings/symptoms, exact specs, evidence classes, service second opinion, durable Garage data, digital twin, modification compatibility, Ask Atlas and retained micro-intents are not dependent on chat history.
- Corrected shared 2D state binding: PSI/bar needle, hp/kW level, torque lever, selected tire code, DOT date, towing/quarter-mile indicators and vehicle lug count now follow current calculator or sourced vehicle state.
- Corrected optional 3D state binding for the fourteen result-led tool studios. Their controller now resolves the sibling `.tool-machine` form, so edits made before or after opening the 3D tab feed the live scene instead of leaving it on fallback defaults.
- Added regression coverage for the sibling form contract and two distinct valid states across every input-driven additional 3D scene.
- Ran a live browser sweep across all 23 English tool routes at a 390 px viewport. No route produced document-level horizontal overflow; every opened 3D studio initialized through WebGL.
- Improved shared Engineering 2D phone legibility: the wide technical drawing keeps a readable scale in an internal horizontal viewport, starts centered on the working geometry, and no longer shrinks its labels to near-illegible sizes.
- Rebuilt the first five weak visual explanations: MPG/L·100 km now compares both gallon standards with L/100 km around a fuel/road relationship; hp/kW shows one mechanical output in both units; Nm/lb-ft shows a bolt, lever arm, applied force and both units; power-to-weight separates live power, normalized mass and hp/tonne; Gear Ratio now uses recognizable tire/wheel assemblies and an installed-to-effective axle-ratio flow shared by EN/DE/ES.
- Began the real OBD/DTC foundation without publishing unlicensed code content. Added strict DTC normalization, evidence/reuse records, catalog duplicate/reference checks, and a publication gate that rejects unreviewed, thin, or non-redistributable records.
- Added `OBD_SOURCE_PLAN.md`, recording SAE J2012-DA as the maintained authority, government regulations as context rather than a replacement dataset, and the 50-candidate → 250-public → 1,000+ evidence-gated scale decision.
- Added a durable rendered-output SEO audit and release script. It checks every generated page for title, description, H1, robots, canonical, sitemap, language, reciprocal hreflang, JSON-LD and duplicate metadata failures.
- Shortened shared EN/DE/ES tire and bolt entity metadata plus the remaining long fuel, fit-check, homepage and Spanish vehicle titles/descriptions. The final audit has no metadata-length advisories.
- Shipped the first visible Atlas Diagnostics product: an OBD hub and validated lookup, 16 reviewed generic code guides, related-code navigation, evidence panels, safety boundaries, home/header/drawer/footer entry points, TechArticle schema and automatic sitemap projection.

## What was verified

- Current source contains a static Astro/Cloudflare product with 23 calculator tool entries, a Fitment Studio flagship, a fuel-price data product, 30 curated vehicle rows, 582 tire-size entities, and localized EN/DE/ES route families.
- Local Garage storage exists, but there is no auth-backed durable user database.
- OBD/DTC, warning-light, symptom diagnosis, Service Second Opinion, TSB/recall, VIN, and Ask Atlas surfaces are not present in the current source inventory.
- Public hero/brand assets and unused design concept assets were inventoried; no media was deleted.
- Visual coverage now maps all 23 published calculator tools to either a native visual system or the restored 2D/3D studio. After the 3D synchronization and mobile-legibility repair, 40 test files / 267 tests, Astro typecheck, and the 1,927-page production build passed.
- Live form checks confirmed changing values in fuel, road-trip, MPG, pressure, power, torque, power-to-weight, tire code, DOT date, towing, quarter-mile and vehicle lookup updates the already-open 3D readout; 3D remains uninitialized until its tab is opened.
- The 3D synchronization pass changed `src/ui/tool-3d.ts`, its regression coverage, and canonical project memory; canonical calculations and data contracts were not changed.
- The visual-meaning polish passed the regression suite, Astro typecheck, and the 1,927-page production build. Live Chromium checks confirmed all five revised visuals render current values, produce no console warning/error, and cause no document-level overflow at a 390 px viewport.
- The new OBD domain unit suite covers canonical/hex code normalization, invalid formats, family/slug derivation, sourced allocation, missing reuse permission, thin-page blocking, draft filtering, duplicate codes and dangling/self relationships. The full gate passed with 41 files / 277 tests, zero typecheck diagnostics, and the unchanged 1,927-page production build. Production data and routes were intentionally not added.
- The SEO release gate passed across 1,927 generated HTML files: 1,923 indexable canonical pages exactly match 1,923 sitemap URLs; the 404 and three embed pages (EN/DE/ES at the time; nine since the nine-locale rollout) are intentionally noindex and excluded. Duplicate per-language metadata, canonical/hreflang/JSON-LD errors and long-metadata advisories are zero.
- Final verification after the SEO changes passed 41 test files / 277 tests, Astro check across 348 files with zero diagnostics, and a 1,927-page production build. The existing non-fatal lazy-chunk size warning remains.
- Diagnostics verification passed 41 test files / 278 tests, Astro check across 352 files with zero diagnostics, a 1,944-page production build, and a rendered-output SEO audit reconciling 1,940 sitemap URLs with 1,940 indexable canonicals. Long-title and description advisories remain zero. Local browser checks confirmed the hub, P0420 detail guide and homepage entry expose the intended navigation and content.

## What remains

- Complete P0 launch and Cloudflare 3xx/4xx path analysis.
- Submit and inspect the production sitemap in Google Search Console and Bing Webmaster Tools, then measure coverage, selected canonicals, search-result title rewrites and deployed Core Web Vitals; local correctness cannot guarantee indexing or ranking.
- Complete the remaining physical-device, WebKit/Firefox, keyboard/assistive-technology and deployed Core Web Vitals acceptance; the local Chromium/mobile route sweep is complete.
- Decide the first licensed/permitted evidence source before adding safety-relevant vehicle data.
- Obtain compatible SAE J2012-DA or alternative rights before any bulk descriptor import or translation. Generic original Atlas guides may expand from cited evidence; vehicle-specific service claims still need stronger source permission and review.
- Expand the generic Diagnostics catalog through original sourced synthesis; do not bulk-copy SAE annexes or competitor encyclopedias. A bulk data license is still required for bulk import, and vehicle-specific service procedures remain separately permissioned.
- Keep the current calculation/fitment foundation stable while the knowledge graph model is specified.
- Continue the page-by-page visual-meaning audit with the remaining shared studios, prioritizing fuel/road-trip, towing/quarter-mile, and the tire-code/reference family; preserve any visual that is already specific and truthful.

## Next sensible task

Current (2026-10-14): follow `ROADMAP.md` → "P0 — next three" (per-sitemap measurement, generation answers on car model pages from branch `parca-3-model-sayfalari`, tire-page CTR).

Historical (pre-2026-10-14): complete the remaining DTC cycle/retired-record tests and the route/sitemap publication projection using synthetic fixtures only. In parallel, procure/approve the source license; after that gate passes, curate the first 50 candidates and expand toward the 250-page public target.
