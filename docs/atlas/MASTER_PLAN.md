# Atlas GarageOS — Canonical Master Plan

Status: `VERIFIED DONE` for the reconciliation pass on 2026-09-25.

This is the canonical current strategy summary. `V3_MASTER_PLAN.md` remains the historical V3 decision ledger; older root-level package notes and handoffs are history, not competing current instructions.

## Product north star

Atlas is an automotive decision-support system, not only a calculator directory:

`Vehicle context → trusted data → calculation/diagnosis → visualization → evidence/confidence → meaning → next action → vehicle history`

The product loop is:

`DATA → TOOL → VISUALIZATION → MEANING → DECISION → ACTION`

The first visit must stay fast and useful. A route earns indexability through a real user problem, a deterministic answer or sourced reference, interpretation, limitations, and a relevant next action. More URLs by themselves are not a growth strategy.

## Non-negotiable trust rules

- Generic facts and vehicle-specific facts are separate evidence classes.
- Safety- or maintenance-relevant specifications are never invented from model memory.
- Unknown or unverified values stay explicitly `UNKNOWN` / `NOT VERIFIED`.
- A geometric comparison is not a safety, fitment, or legal verdict.
- Official recall, manufacturer communication/TSB, government investigation, owner complaint, community report, calculated, and estimated evidence types must not be blended.
- Every durable data row needs provenance, scope, and confidence.
- AI may route intent and explain verified Atlas results; it must not manufacture automotive facts.
- Published SEO pages must be meaningfully distinct and connected through the knowledge graph.

## Product layers

1. Acquisition: fast tools, sourced entity pages, localized search-intent routes.
2. Understanding: formulas, technical visuals, quick facts, warnings, methodology, evidence labels.
3. Context: vehicle, tire, wheel, fuel, and later DTC/warning/symptom entities.
4. Decision support: fitment projections, guided diagnosis, service second opinion, next checks.
5. Memory: My Garage, maintenance/repair history, saved calculations, cost history, and eventually a vehicle digital twin.

## Current strategic position

The strongest verified foundation is Tires & Wheels plus Fuel & Trips: validated millimetre calculations, localized tools, fitment references, entity pages, durable fuel history, and Cloudflare-compatible static output. The largest unbuilt opportunity is an evidence-first OBD/DTC cluster that can become both an organic entry point and a graph entity family.

## Reconciliation summary

- Keep the existing toolbox, calculator engines, fitment boundaries, provenance language, localization rules, shareable state, and data-vault direction.
- Treat old universal 3D coverage as superseded by the 2026-09-25 visual-truthfulness decision: every tool keeps a relevant visual explanation, while 3D is reserved for geometry or other state where it answers a real question.
- Treat the historical 20-tire/96-entity counts as superseded by the verified 582 tire sizes and 1,782 tire/PCD entity URLs in the current source state.
- Treat the old “DE/ES unpublished” wording in early V3 sections as historical; current code publishes EN/DE/ES and keeps PT-BR/FR unpublished until QA.
- Do not start a giant vehicle × code × locale SEO matrix. Build small, sourced, high-value clusters first.

## Strategic product thesis

Traffic magnets and product moats must reinforce one another.

Traffic magnets: OBD codes, warning lights, symptoms, exact maintenance/spec queries, known problems, model-year pages, and focused fitment lookups.

Moats: Vehicle Intelligence Graph, Digital Twin/My Garage, Service Second Opinion, Modification Compatibility, Guided Diagnosis, Ask Atlas routing, and provenance/confidence infrastructure.

The correct order is evidence and reusable entities first, then UI surfaces and SEO expansion.

## Complete accepted strategy scope

The following scope is intentionally preserved in canonical memory. An item appearing here is not automatically implemented; execution status and priority live in `PROJECT_STATE.md` and `ROADMAP.md`.

- Acquisition: calculators, tire/wheel/vehicle entities, model-year depth where sourced, OBD/DTC, warning lights, symptoms, exact specifications, maintenance queries, known problems, recalls/TSBs, focused fitment lookups, controlled localization, internal links, embeds, Search Console, Bing/IndexNow and useful community distribution.
- Vehicle intelligence: Vehicle → Generation → Model Year → Trim → Platform → Engine → Transmission → System → Component → Part → Specification → DTC → Warning Light → Symptom → TSB → Recall → Maintenance → Repair → Cost → Tire → Wheel → PCD → Fitment → Fuel → Trip → Ownership.
- Decision products: guided diagnosis, service second opinion, modification compatibility, exact-vehicle trip/ownership context, repair-or-replace support and source-bound Ask Atlas routing.
- Durable user context: My Garage, exact vehicle, mileage, tires/wheels/modifications, maintenance and repair history, replaced parts, recalls, fuel/charging history, saved calculations, ownership costs, export/deletion/retention and eventual multi-device digital twin.
- Micro-intents retained for evaluation: fuse/relay, OBD/VIN/paint-code locations, jack points, TPMS/service resets, EPB service mode, battery registration, bulbs, filters, batteries, wipers, owner manuals, dimensions, garage fit, cargo/ground clearance, EV range/charging and key-fob batteries.
- Evidence disciplines: generic versus vehicle-specific separation; official recall, TSB/manufacturer communication, government investigation, complaint, community report, calculated and estimated evidence remain distinct; unsupported facts stay `UNKNOWN` / `NOT VERIFIED`.
- Commercial possibilities retained for later evaluation: licensed product catalogues, parts/price comparison, affiliates and stable advertising placements with disclosure and without obstructing the primary answer.

Nothing in this scope should be silently discarded. Items may move between `P0`, `P1`, `P2`, or `LATER / IDEA` only through an explicit dated decision.

## Scope of this reconciliation

This pass changed documentation only. No product/runtime code, route, data file, or media asset was changed while creating this memory system.
