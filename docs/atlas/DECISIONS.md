# Atlas GarageOS — Accepted Decisions

Durable decisions are recorded with date, status, rationale, and evidence. Historical V3 decisions remain in `V3_MASTER_PLAN.md`.

## 2026-10-08 — French reference families before French tools

Status: `REJECTED / SUPERSEDED` (2026-10-14: `fr` and the other eight locales are fully published, calculators included). Kept as history.

Tire-size and bolt-pattern pages carry the site's search traffic, so French publishes those families (and a French home) first, with fully written French copy. Calculators, vehicle pages and policy pages stay English for French readers and are labelled "(anglais)". This supersedes "do not expose FR until the whole route set is translated" for the reference families only; `fr` remains unpublished for tools.

## 2026-10-08 — Traffic first: grow the tire-size long tail

Status: `ACCEPTED`.

28-day Search Console data (83 clicks, 6.86k impressions) showed tire-size detail pages carry almost all impressions and clicks; Google indexed 1,780 pages and rejected only 2 as low quality. The next growth lever is therefore more real tire-size pages (every OE/production size from two public size lists, flotation and truck sizes) and tire-height group pages, before comparison pages, vehicle growth or a new language. Sizes are only added from a published size list and validated by geometry; nothing is invented.

## 2026-10-08 — Spanish uses "birlos" for bolt patterns

Status: `ACCEPTED`.

The Spanish bolt-pattern route family is already indexed as `/es/patrones-birlos/`, so all Spanish copy uses "birlos" consistently (stray "pernos" removed). Switching to Spain-style "tornillos" would need new URLs plus redirects; revisit only if Search Console country data shows Spain dominates and the slug change is worth the reindex cost.

## 2026-10-08 — Vehicle reference rows follow one generation page

Status: `VERIFIED DONE`.

Each vehicle row cites the exact wheel-size.com generation/market page it was checked against. Base size = the smallest-rim OE size fitted on at least 30 % of trims; other OE sizes become `optionalTireSizes`. Torque is published only when the page lists one value; vehicles with split hubs (Fiat Ducato 5x118/5x130) or no OE rows (Transit Custom) are left out rather than guessed. All re-checked rows are `medium` confidence.

## 2026-09-25 — Canonical project memory

Status: `VERIFIED DONE`.

`docs/atlas/MASTER_PLAN.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `DECISIONS.md`, `IDEA_BANK.md`, and `HANDOFF.md` are the current memory layer. Root package/handoff notes remain historical and are not deleted. `AGENTS.md` tells future sessions to read the canonical trio before important work.

Rationale: repository reality must not depend on chat memory, and duplicate planning systems create contradictory instructions.

## 2026-09-25 — Documentation-only reconciliation

Status: `VERIFIED DONE`.

This pass must not change product/runtime code, routes, data, or media. Current code and tests outrank stale documentation when describing what exists; old product decisions are retained as history or explicitly marked superseded.

## 2026-09-25 — Visual truthfulness with complete relevant coverage

Status: `VERIFIED DONE`.

The old universal “every tool has a 3D + Engineering 2D studio” checkpoint is superseded. Every tool must still expose a relevant visual explanation, but the visual may be a calculation-specific result diagram, a technical SVG, a data graphic, or a native 3D scene. 3D is used only where it answers a real spatial/mechanical question; it is not forced onto unrelated utility pages.

Rationale: removing a tool's relevant visual entirely weakens the product promise. A shared blueprint plate repeated one metaphor across unrelated calculations and competed with better result explanations, so retained visuals must stay tool-specific and non-decorative.

Correction: the fourteen result-led tools retain their tool-specific Engineering 2D view with optional 3D exploration. The 2D view is the default so the page paints quickly; removing those visual studios entirely is superseded.

Additional acceptance rule: a diagram that says it responds to pressure, power, torque, code, date, vehicle or another input must be bound to that current value. A changing caption beneath a static contradictory shape is not accepted as a working visualization.

## 2026-09-25 — OBD/DTC is a P1 foundation candidate, not immediate code

Status: `PLANNED`.

OBD/DTC is accepted as a high-value organic cluster and knowledge-graph entity family. The first implementation requires a bounded sourced MVP, provenance/confidence, generic versus vehicle-specific separation, and safety language before route generation.

Rationale: the opportunity is large, but unsupported automotive facts would create trust and safety debt.

## 2026-09-26 — OBD scale is gated by evidence, not an arbitrary page ceiling

Status: `PARTIAL`.

Fifty candidate codes are the technical/editorial validation batch, not the product limit. The first public target is 250 reviewed generic code pages, with 1,000+ accepted later when source coverage, demand and review throughput support it. Vehicle/year/language combinations are not generated without unique evidence.

SAE J2012-DA is the maintained authoritative code/descriptor source, but access or purchase alone is not treated as public-redistribution permission. Production DTC content and routes remain blocked until Atlas records an explicit compatible license and automotive review process. The domain schema and publication gate may be built before that content license.

Rationale: this preserves ambitious traffic growth while preventing copied, unsafe or thin pages from entering the index.

## 2026-09-26 — Original synthesis may publish from cited public evidence

Status: `VERIFIED DONE` for the first generic Diagnostics release.

Atlas does not require a bulk-redistribution license merely to write its own cautious explanation of a technical fact. A generic OBD guide may publish when its identity is anchored to the SAE framework, its operating/safety context is supported by public government material, the wording is original, sources and limitations are visible, and no source database or article text is copied. Bulk importing a proprietary annex, vehicle-specific service procedure, wiring diagram or manufacturer claim still requires compatible permission.

Rationale: evidence discipline should prevent fabricated or copied claims without blocking useful original editorial work assembled from public technical research. Vehicle-specific and safety-critical claims remain a higher evidence class than generic code education.

## 2026-09-25 — French and Brazilian Portuguese are the next language rollout

Status: `REJECTED / SUPERSEDED` (2026-10-14: both shipped as part of the nine published locales). The quality bar below still applies to any future locale.

FR and PT-BR are the next language families. They remain unpublished until their main content, metadata, navigation, warnings, FAQs, internal links, and reciprocal `hreflang` annotations pass completeness and visual QA.

Rationale: more languages expand addressable markets, but language count is not a substitute for localized usefulness. Bounded waves protect quality and make Search Console measurement meaningful.

## 2026-09-25 — No universal fitment verdict

Status: `VERIFIED DONE`.

Geometry, measured clearances, sourced reference data, and evidence labels may support `calculated`, `user measured`, `reference`, or `needs review` explanations. They must not silently become a universal “safe” or “fits” claim.

## 2026-09-25 — User persistence is a later infrastructure block

Status: `PLANNED`.

Current local Garage storage is not presented as durable account storage. Any future multi-user persistence must define auth, consent, export, deletion, retention, and backup before D1/R2 implementation.

## Historical decisions retained

- The V3 decision ledger remains authoritative for existing architecture, localization, SEO, trust, and visual principles unless a later dated decision explicitly supersedes a specific item.
- Package notes 5.1–6.8 remain implementation evidence and historical context; they are not current roadmap priorities by themselves.

- 2026-10-08 — Vehicles are published in every entity language instead of being split by market (US → EN only, EU → DE/ES only). The page states the market; this quadruples vehicle pages without new data and keeps every vehicle link in the reader's language.
- 2026-10-08 — Stop automated collection from any site that serves a human-verification/bot check; switch source instead.

## 2026-10-14 — Value of the existing graph before more URLs

Status: `ACCEPTED`.

- No new pSEO route family or mass URL generation this cycle; the ~49,000-page graph is linked, enriched and measured first. Generation sections on existing car model pages are allowed because they add no URL.
- `/sitemap.xml` is a sitemap index with one child per page type so Search Console reports indexing per cluster; IndexNow submits only new/changed/removed sitemap URLs.
- ~~Query-string URLs are calculator state and are disallowed in robots.txt (`Disallow: /*?`); internal hand-off links may keep using them.~~ Superseded the same day by "Clean internal hrefs, crawlable query URLs" below.
- Tire comparison pages exist only for factory-backed pairs (two factory sizes of one vehicle/wheel record, or a factory size and its closest ±1-inch manufactured alternative). Same-diameter plus-one pairs (e.g. 255/40 R19 vs 255/35 R20) are kept: rim size and sidewall differ and that is the question being searched.
- Vehicle and model pages link sizes onward (tire page, published comparison, pre-filled speedometer/tire calculator) but never state that a size fits; ANKUSI sizes are labelled "recorded", not standard/option.

Rationale: Search Console showed 6.5k indexed vs 10.4k discovered-not-indexed with ~100k crawlable parameter variants; crawl focus and per-cluster measurement are worth more than page count.

## 2026-10-14 — Clean internal hrefs, crawlable query URLs (v7-18)

Status: `ACCEPTED`.

- Rendered HTML never links to a query-string URL. `src/middleware.ts` runs `cleanStateLinks()` (`src/seo/state-links.ts`) on every built page: the clean canonical path stays in `href`, calculator state moves to `data-link-state`. `src/ui/state-link-enhancer.ts` restores the query on the first pointer/focus/context-menu/click interaction (so clicks, new tabs and "copy link" keep the state) and cleans links that scripts add after load.
- robots.txt no longer has `Disallow: /*?`. Query URLs now only come from shares and bookmarks; crawling them lets Google read their clean canonical instead of indexing blocked URL-only results.
- `pnpm audit:seo` fails on any internal `<a href>` with a query string and on `Disallow: /*?`.

Rationale: the v7-16 crawl found 320,836 query-state hrefs (104,755 unique) in rendered HTML. Removing them at the source removes the parameter graph instead of hiding it.

## 2026-10-14 — Generation names need sources before production

Status: `ACCEPTED`.

Editorial generation names and year spans (e.g. "Megane IV 2016–2024") are factual claims that appear in titles and FAQ. Branch `parca-3-model-sayfalari` stays unmerged until every generation row carries a source (manufacturer press release or homologation/EU type-approval data first; two independent references otherwise) and the ANKUSI year mapping is checked per row. Unsourced rows are dropped, not guessed.

## 2026-10-15 — Audience by opt-in, not by wall (v7-19)

Status: `ACCEPTED`.

- Results and the PDF stay free and ungated. Email is offered as "email me this report" plus a separate, unticked list checkbox with double opt-in (GET shows a button, POST confirms, so mail scanners cannot confirm or unsubscribe anyone).
- The list lives in our own Cloudflare D1 database (portable, no subscriber cap); Resend sends. Telegram was not chosen.
- Reports can only describe our own calculator routes with short label/value lines (no links, markup or free text), rate limited per IP (6/h) and per address (3/day), with a honeypot and a same-origin check.

Rationale: all traffic is search traffic; a wall loses the visit, an opt-in keeps the visit and still builds a list.

## 2026-10-15 — Page-specific images for search thumbnails

Status: `ACCEPTED`.

- Reference pages use Atlas's own technical drawings (no licence to track); car photos come only from sources with explicit reuse rights (Wikimedia Commons CC BY / CC BY-SA / public domain), are copied to Atlas (never hotlinked), optimized, and carry recorded and visible attribution. A photo must match the generation the page describes; otherwise the technical image is used.
- One image file per entity for all locales; the visible `<img>`, og:image, twitter:image and structured data use the same file.

Rationale: Atlas pages had no `<img>` and one generic og:image, so search engines had nothing page-specific to show as a thumbnail.


## 2026-10-15 — Remembered car and the decision panel

Status: `ACCEPTED`.

- The remembered car is only a curated vehicle id in the existing browser store; sizes are always read from `src/data/vehicle-fitment.ts`, never from storage. It prefills a calculator only when the form is untouched and the URL carries no state.
- "If you switch" explains geometry in plain words and lists what is still open; it never says a size fits. The checklist is the visitor's own ticks, kept per size change in this browser.
- The decision panel supersedes the comparison page's "What should I check next?" card (V3 package 5.9); the speedometer hand-off with both sizes is kept inside the checklist.

Rationale: owner brief 2026-10-15 — make the existing flow user-focused without new URLs or feature clutter.

## 2026-10-15 — Answer-first titles on bolt-pattern answers

Status: `ACCEPTED`.

- Vehicle, brand bolt-chart and car model titles lead with the answer ("Opel Corsa (F) Lochkreis 4x108, Reifengröße 185/65 R15"), shortened step by step to fit the 75-character budget. Car model pages show up to two patterns so older generations are not misled. Descriptions list bolt pattern, center bore, tire and wheel from the curated row only.

Rationale: Search Console 2026-10-15 — these pages rank 5–9 for model bolt-pattern queries with 0 clicks, while answer-first DE tire-size titles convert.

## 2026-10-15 — Generation names sourced and published (v7-26)

Status: `ACCEPTED` (closes "Generation names need sources before production", 2026-10-14).

- 35 European/Turkish models, 130 generations. Each model's generation names and European production years were read from English and German Wikipedia generation articles (`GENERATION_SOURCES` in `src/data/car-generations.ts`); a generation is kept only when both agree on the start year within one year. Wikipedia counts as the "two independent references" route; no manufacturer data was used. Dropped as single-source: Clio 6, Megane E-Tech, RAV4 6, i20 4.
- Each ANKUSI wheel record belongs to exactly one generation (the newest that had started by its first year), so overlap years never double-count.
- A generation names one bolt pattern (title, FAQ, short answer) only when it has at least two records and all regular versions agree; performance trims (Type R, RS, OPC, N, AMG …) are listed but never set the headline. Otherwise the page shows every recorded pattern with its versions and makes no single claim (e.g. Ford Focus 2, where the records mix markets).
- Generation sections show the source links. No new URLs.

Rationale: Search Console shows generation queries ("megane 4 bijon aralığı", "corsa f lochkreis", "passat b8 lochkreis") ranking 5–9 with 0 clicks.
