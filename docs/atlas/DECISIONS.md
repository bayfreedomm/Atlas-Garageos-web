# Atlas GarageOS — Accepted Decisions

Durable decisions are recorded with date, status, rationale, and evidence. Historical V3 decisions remain in `V3_MASTER_PLAN.md`.

## 2026-10-08 — French reference families before French tools

Status: `ACCEPTED`.

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

Status: `ACCEPTED`.

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
