# Atlas GarageOS — Reconciled Roadmap

Updated: 2026-10-14. Priority combines user value, organic opportunity, differentiation, data trust, reuse, cost, and duplication risk.

## P0 — next three (2026-10-14, ranked by Search Console signal)

Rule for this cycle: no new pSEO route family or mass URL generation. Improve, link and measure the existing ~49,000-page graph.

1. `PLANNED` — **Measure which cluster Google rewards.** Submit `/sitemap.xml` (index) in Search Console and Bing Webmaster; after 2–3 weeks read indexed / discovered-not-indexed per typed sitemap and per locale. Decide car-years (8,158 EN pages, weakest linking) and cars-localized depth from that data, not before. Confirm IndexNow runs green and that crawled-not-indexed parameter URLs fall now that no internal link carries a query string (v7-18).
2. `BLOCKED` (source verification) — **Generation answers on existing car model pages** (branch `parca-3-model-sayfalari`, one WIP commit `ff098ec`, 35 models / ~150 generation rows, merges cleanly into master but stays unmerged until every row is sourced — see DECISIONS 2026-10-14 "Generation names need sources" and HANDOFF verification plan): editorial generation years for ~35 high-demand EU/TR models mapped onto ANKUSI records ("Megane 4", "Corsa F", "Passat B8" headings, FAQ and titles) plus a bolt-pattern-by-year timeline for every other model. Targets impressions already at positions 5–8 with 0 clicks ("opel corsa f lochkreis", "megane 4 bijon aralığı", "duster bijon aralığı"). No new URLs.
3. `PLANNED` — **CTR on tire-size pages (where ~all clicks come from)**: rewrite titles/descriptions for the DE/ES/PL tire sizes with impressions but low CTR, and surface the new cross-section and comparison links above the fold. Watch 2–4 weeks before further changes.

## P0 — protect and measure the current foundation

- `VERIFIED DONE` — 2026-10-14: typed sitemap index + IndexNow (v7-14), true-scale cross-section drawing (v7-15), Vehicle → Tire → Compare → Calculator flow (v7-16; its robots query-URL disallow was superseded in v7-18 by clean internal hrefs). Link crawl: 0 orphans, 0 broken internal links, max click depth 4. v7-17: one drawing language across calculator visuals, driven by the calculators' own functions.

- `PARTIAL` — Finish deployed launch gates: local rendered-output canonical/hreflang/sitemap/noindex/JSON-LD/title/description checks pass across all 48,964 HTML outputs; IndexNow is wired. Bing Webmaster registration, deployed 404/redirect/Open Graph smoke tests and Core Web Vitals remain.
- `VERIFIED DONE` — Keep `pnpm audit:seo` in every release gate. It currently reconciles 48,954 indexable canonicals with 48,954 sitemap URLs across the 9 typed sitemaps, fails on any internal `<a href>` carrying a query string, forbids `Disallow: /*?` in robots.txt (since v7-18; v7-16 required it) and reports zero long-title/description advisories.
- `PLANNED` — Analyze Cloudflare 3xx/4xx by path and status. Separate intentional language/HTTPS redirects from broken URLs, bot probes, and real user errors; do not block Googlebot/Bingbot blindly.
- `PLANNED` — Complete visual acceptance on representative mobile widths, WebKit/Firefox, keyboard/assistive technology, reduced motion, low-power GPU, and deployed pages.
- `VERIFIED DONE` — Local Chromium acceptance at 390 px covered all 23 English tool routes: no document-level horizontal overflow, all opened 3D studios initialized with WebGL, and no browser console error/warning was observed in the sampled live-state pass. Physical devices, WebKit/Firefox, accessibility and deployed performance remain in the broader acceptance item above.
- `PARTIAL` — Apply the page-by-page visual/content consistency gate. The shared 3D synchronization and converter/gearing visual group are verified: MPG/L·100 km, hp/kW, Nm/lb-ft, power-to-weight, and gear ratio now expose current authoritative values and meaningful geometry. Continue the same visual review across the remaining calculator families; a visual claiming to respond to input must change with that input, and displayed codes/units/vehicle geometry must match current form state.
- `VERIFIED DONE` — Optional 3D studio post-mount synchronization was repaired. The shared 3D controller now locates the calculator rendered as the studio's sibling instead of searching only its ancestors, reads current form data at mount, and refreshes on `input`, `change`, and `submit`. Regression coverage compares two valid states across all twelve input-driven additional scenes; the two intentionally static measurement/map explainers remain static.
- `PLANNED` — Keep the current data contracts and tests green while consolidating the canonical project memory.
- `PLANNED` — Select a licensed/permissioned automotive data strategy before adding safety-relevant specifications or large vehicle coverage.

## P0 — audience (v7-19)

- `VERIFIED DONE` — 2026-10-15: email reports live (D1 bound, Resend domain verified, runtime secret set, live send test passed, `EMAIL_REPORTS_ENABLED = true`). v7-21: Origin header required, daily retention cron.
- `PLANNED` (backlog, before traffic grows) — Bot protection for `/api/report` beyond IP/address limits: Cloudflare Turnstile on the email form or an edge rate-limiting rule, so distributed bots cannot wear down the Resend sending reputation.
- `PLANNED` — First list use: fuel-price change emails for ES/DE/US from the existing fuel bot data (no Turkey price source in the repository yet). Move bulk sending to a paid tier or newsletter tool once the list outgrows Resend's free 100/day.
- `REJECTED / SUPERSEDED` — Gate results or the PDF behind an email wall: search visitors leave instead, and pogo-sticking hurts the pages that bring all traffic.

## P0 — engineering gate

- `PARTIAL` — CI release gate on PRs and master (`.github/workflows/ci.yml`, v7-21); confirm the first green run, then require it as a branch-protection status check for master (owner setting on GitHub).
- `PLANNED` — Keep a browser smoke test in the release gate: computed-style comparison (full vs reference CSS) on a fixed sample of reference pages plus menu/lookup/theme interactions, so a future runtime-built class cannot be silently purged.

## P0.5 — reference-data growth (Search Console proven demand)

- `VERIFIED DONE` — 2026-10-08 tire-entity upgrade: C sizes, inch view, alternatives with speedometer reading, localized numbers/titles, hub links site-wide, 84 re-checked vehicle rows.
- `PLANNED` — Confirm Nissan Rogue/Altima and Toyota Corolla against a second source (no OE rows on wheel-size for those generations).
- `PLANNED` — Grow vehicle rows toward the top EU/US models per make, one verified generation page each; add Fiat Ducato as two rows (5x118 / 5x130 Maxi) once each variant's OE size is confirmed.
- `VERIFIED DONE` — Part 1: ~1,000-size tire catalog, flotation sizes, tire-height group pages, "in inches"/"pulgadas" titles.
- `VERIFIED DONE` — Part 2: mobile density redesign + tire-size lookup.
- `VERIFIED DONE` — 2026-10-14 (v7-14): typed sitemap index, IndexNow workflow, 542 × 9 factory-backed tire comparison pages, tire-page model/comparison sections, Egea/Bayon/Taliant rows.
- `REJECTED / SUPERSEDED` (history, 2026-10-08 plan) — Next: backlinks via the embeddable widget and forum answers; vehicle growth + make pages; Part 3: wheel/rim compatibility pages; Part 4: French entity pages; Part 5: IndexNow, OG images, internal-link and performance pass. Superseded 2026-10-14: French entity pages (all nine locales) and IndexNow are `VERIFIED DONE`; internal-link pass done (v7-16/v7-18); wheel/rim compatibility pages are a new URL family and wait for the no-new-pSEO cycle to end.
- `PLANNED` — Remaining from that plan: backlinks via the embeddable widget and forum answers; OG images; performance pass (P0 Part B: CSS consolidation, lazy tire catalog, responsive hero).
- `PLANNED` — Watch GSC impressions/CTR on the new tire titles and height pages for 2–4 weeks before further title changes.

## P1 — controlled language expansion

- `REJECTED / SUPERSEDED` (history, 2026-09-25) — Add French (`fr`) and Brazilian Portuguese (`pt-BR`) as the next language families; do not expose either locale until its published route set has complete human-reviewed UI, SEO, FAQ, warning, and navigation copy. Superseded: all nine locales (en, de, es, fr, it, pt-br, pl, nl, tr) are published with translated calculators — see PROJECT_STATE snapshot.
- `PLANNED` — Keep language-specific URLs and reciprocal `hreflang`/canonical metadata correct for every published route; language variants are localized product pages, not keyword-only copies.
- `PLANNED` — Roll out in bounded waves: platform/home/tools first, then the highest-value calculator and entity clusters, then the remaining catalog after translation and visual QA.
- `PLANNED` — Audit hardcoded English, locale jumps, navigation/footer copy, result/validation text, visual labels, metadata, schema, canonical, reciprocal `hreflang`, sitemap membership and internal links before each locale launch.
- `PLANNED` — Use Search Console query/country data to choose any tenth language rather than guessing from page-count potential.
- `REJECTED / SUPERSEDED` — Publish incomplete machine-translated catalogues merely to multiply indexed URLs.

## P1 — evidence-first OBD/DTC and warning-light foundation

Build the first high-quality cluster, not thousands of thin pages.

- `VERIFIED DONE` — Add the pure domain foundation for five-character code normalization, hexadecimal suffixes, evidence/reuse records, catalog validation, and a publication gate. Evidence: `src/domain/dtc.ts`, `src/domain/evidence.ts`, and `tests/unit/dtc-domain.test.ts`.
- `VERIFIED DONE` — Launch the visible Atlas Diagnostics product shell: `/obd-codes/`, code-format lookup, 16 original reviewed generic guides, home/header/drawer/footer discovery, TechArticle schema and sitemap entries. Evidence: `src/data/dtc-records.ts`, `src/components/DtcLookup.astro`, `src/pages/obd-codes/`, and sitemap/catalog regression coverage.
- `PARTIAL` — The first 16 high-intent generic guides validate the visible workflow. Expand through original source-cited synthesis toward 100 strong guides, then 250 and 1,000+ as evidence/review throughput permits. A bulk proprietary data import remains blocked without compatible rights; original editorial publication is no longer blocked on a bulk-annex license.
- `PARTIAL` — Expand `/obd-codes/{code}/` from the initial 16 guides toward the most useful generic set. Current pages include normalized code, family, meaning, symptoms, causes, diagnostic order, related codes, limitations and provenance; warning-light/symptom entities and broad coverage remain.
- `PLANNED` — Separate generic code meaning from vehicle-specific evidence. Do not create vehicle-code combinations until unique sourced data exists.
- `PLANNED` — Add warning-light MVP for check-engine, ABS, airbag, battery/charging, oil pressure, coolant temperature, TPMS, brake, steering, traction, DPF, and glow-plug families; each needs urgency context and safe immediate action language.
- `PLANNED` — Connect DTCs and warning lights to existing tool/entity navigation without claiming diagnosis or repair certainty.

## P1 — vehicle data and fitment reuse

- `PLANNED` — Define a normalized evidence-backed entity model for Vehicle, ModelYear/Trim, Engine, Transmission, System, Component, Part, Spec, DTC, WarningLight, Symptom, TSB, Recall, Maintenance, Repair, Tire, Wheel, Fitment, Trip, and Ownership records.
- `PLANNED` — Expand vehicle coverage only through a licensed or explicitly permitted source, preserving market/year/trim/axle/position scope and provenance.
- `PLANNED` — Improve current fitment records from reference rows toward exact trim/setup records before adding “compatible” language.
- `PLANNED` — Add selected exact-spec clusters only where a trustworthy source exists: oil/coolant/fluid, plugs/gap, lug torque, tire pressure, battery group/CCA, wiper/filter sizes, and service intervals.
- `PLANNED` — Model official recalls, manufacturer communications/TSBs, government investigations, owner complaints and community reports as separate evidence classes; never turn report concentration into a confirmed-defect claim.
- `PLANNED` — Evaluate model-year/generation depth from Search Console demand and verified unique data; do not create thin year pages.

## P1 — search, navigation and graph readiness

- `PLANNED` — Extend the current homepage search/tool finder into an entity-aware router for tools, vehicles, tire sizes, bolt patterns and, once published, DTC/warning/symptom records.
- `PLANNED` — Keep the frontend simple while the graph expands; expose problem-first entry points and relevant next actions rather than a feature dump.
- `PLANNED` — Use Search Console queries and country data as recurring roadmap input, recording which clusters Google is testing before expanding them.

## P2 — guided diagnosis and ownership context

- `PLANNED` — Symptom → possible systems → evidence → next checks flow. Start with a bounded set such as brake vibration, highway steering vibration, no-start, overheating, rough idle, smoke, clicking on turn, AC not cold, repeated battery drain, and loss of power.
- `PLANNED` — Service Second Opinion MVP for structured text/manual entry first; separate parts, labor, fluids, fees, diagnostic charges, scheduled vs repair vs optional work, urgency, and questions to ask. Add PDF/photo extraction only after privacy and parser quality are ready.
- `PLANNED` — Maintenance and repair history linked to My Garage, with explicit user-entered versus sourced versus calculated records.
- `PLANNED` — Repair-or-replace, fuel/charging cost history, maintenance debt, and ownership-cost views after durable user storage exists.
- `PLANNED` — Add known-problem/TSB/recall/complaint views only after the evidence model and permitted data adapters exist.
- `PLANNED` — Preserve user-entered, sourced, calculated and estimated history as visibly separate record types throughout My Garage.

## P2 — durable user context

- `PLANNED` — Define authentication, consent, export, deletion, retention, multi-device sync, and threat model before server persistence.
- `PLANNED` — Use D1 for active structured records and R2 for immutable/raw evidence backups only after a reviewed migration. Keep static public projections separate from private user data.
- `PLANNED` — Turn My Garage into a shared context layer for fitment, calculations, maintenance, repairs, recalls, costs, and history; VIN is an optional resolver, not the product by itself.

## LATER / IDEA

- `IDEA` — Ask Atlas source-bound intent router across calculators, DTC, warnings, symptoms, fitment, maintenance and service quotes.
- `IDEA` — VIN as an optional exact-vehicle resolver feeding trusted context, never as a standalone claim of complete vehicle truth.
- `IDEA` — Freeze-frame/live-data explanation for P0171/P0301-style workflows after the generic DTC MVP is proven.
- `IDEA` — Modification compatibility graph for vehicle + wheel + tire + offset + spacer + suspension with `COMPATIBLE`, `NEEDS REVIEW`, `CONFLICT`, and `UNKNOWN` states.
- `IDEA` — Fuse/relay, service reset, TPMS reset, EPB service mode, battery registration, owner manual, key-fob battery, bulbs, filters, paint/VIN/OBD-port/jack-point locations, dimensions, garage fit, cargo/ground clearance, EV range/charging intelligence, real-world consumption, model-year changelog, platform/engine sharing, and OEM part supersession.
- `IDEA` — Product catalog, affiliate/price comparison, and advertising slots only after data licensing, disclosure, consent, and layout stability are solved.

## Explicitly not the next move

- `REJECTED / SUPERSEDED` — Generate 5,000 codes × 30,000 vehicles × languages without unique evidence.
- `REJECTED / SUPERSEDED` — Add a generic chatbot that answers automotive facts from model memory.
- `REJECTED / SUPERSEDED` — Restore universal decorative 2D/3D studios solely to increase feature counts.
- `REJECTED / SUPERSEDED` — Treat more calculator URLs or long SEO text as a substitute for useful data and decisions.
