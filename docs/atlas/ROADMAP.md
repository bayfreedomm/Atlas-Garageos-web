# Atlas GarageOS — Reconciled Roadmap

Updated: 2026-09-25. Priority combines user value, organic opportunity, differentiation, data trust, reuse, cost, and duplication risk.

## P0 — protect and measure the current foundation

- `PLANNED` — Finish deployed launch gates: Search Console, Bing Webmaster/IndexNow, canonical/hreflang/sitemap/404/redirect smoke tests, Open Graph checks, and Core Web Vitals on the deployed build.
- `PLANNED` — Analyze Cloudflare 3xx/4xx by path and status. Separate intentional language/HTTPS redirects from broken URLs, bot probes, and real user errors; do not block Googlebot/Bingbot blindly.
- `PLANNED` — Complete visual acceptance on representative mobile widths, WebKit/Firefox, keyboard/assistive technology, reduced motion, low-power GPU, and deployed pages.
- `PLANNED` — Keep the current data contracts and tests green while consolidating the canonical project memory.
- `PLANNED` — Select a licensed/permissioned automotive data strategy before adding safety-relevant specifications or large vehicle coverage.

## P1 — controlled language expansion

- `ACCEPTED` — Add French (`fr`) and Brazilian Portuguese (`pt-BR`) as the next language families; do not expose either locale until its published route set has complete human-reviewed UI, SEO, FAQ, warning, and navigation copy.
- `PLANNED` — Keep language-specific URLs and reciprocal `hreflang`/canonical metadata correct for every published route; language variants are localized product pages, not keyword-only copies.
- `PLANNED` — Roll out in bounded waves: platform/home/tools first, then the highest-value calculator and entity clusters, then the remaining catalog after translation and visual QA.
- `PLANNED` — Use Search Console query/country data to choose the next language after French and Brazilian Portuguese rather than guessing from page-count potential.
- `REJECTED / SUPERSEDED` — Publish incomplete machine-translated catalogues merely to multiply indexed URLs.

## P1 — evidence-first OBD/DTC and warning-light foundation

Build the first high-quality cluster, not thousands of thin pages.

- `PLANNED` — Create a small curated DTC MVP: approximately 25–50 high-intent generic codes across P0xxx, P03xx, P04xx, P01xx, U0xxx, and selected ABS/body families only when source quality is sufficient. The implementation gate is `docs/atlas/OBD_DTC_MVP_BRIEF.md`.
- `PLANNED` — Publish `/obd-codes/` and `/obd-codes/{code}/` with normalized code, family, system, plain meaning, symptoms, possible causes, first checks, diagnostic order, related codes/lights/symptoms, limitations, and provenance/confidence.
- `PLANNED` — Separate generic code meaning from vehicle-specific evidence. Do not create vehicle-code combinations until unique sourced data exists.
- `PLANNED` — Add warning-light MVP for check-engine, ABS, airbag, battery/charging, oil pressure, coolant temperature, TPMS, brake, steering, traction, DPF, and glow-plug families; each needs urgency context and safe immediate action language.
- `PLANNED` — Connect DTCs and warning lights to existing tool/entity navigation without claiming diagnosis or repair certainty.

## P1 — vehicle data and fitment reuse

- `PLANNED` — Define a normalized evidence-backed entity model for Vehicle, ModelYear/Trim, Engine, Transmission, System, Component, Part, Spec, DTC, WarningLight, Symptom, TSB, Recall, Maintenance, Repair, Tire, Wheel, Fitment, Trip, and Ownership records.
- `PLANNED` — Expand vehicle coverage only through a licensed or explicitly permitted source, preserving market/year/trim/axle/position scope and provenance.
- `PLANNED` — Improve current fitment records from reference rows toward exact trim/setup records before adding “compatible” language.
- `PLANNED` — Add selected exact-spec clusters only where a trustworthy source exists: oil/coolant/fluid, plugs/gap, lug torque, tire pressure, battery group/CCA, wiper/filter sizes, and service intervals.

## P2 — guided diagnosis and ownership context

- `PLANNED` — Symptom → possible systems → evidence → next checks flow. Start with a bounded set such as brake vibration, highway steering vibration, no-start, overheating, rough idle, smoke, clicking on turn, AC not cold, repeated battery drain, and loss of power.
- `PLANNED` — Service Second Opinion MVP for structured text/manual entry first; separate parts, labor, fluids, fees, diagnostic charges, scheduled vs repair vs optional work, urgency, and questions to ask. Add PDF/photo extraction only after privacy and parser quality are ready.
- `PLANNED` — Maintenance and repair history linked to My Garage, with explicit user-entered versus sourced versus calculated records.
- `PLANNED` — Repair-or-replace, fuel/charging cost history, maintenance debt, and ownership-cost views after durable user storage exists.

## P2 — durable user context

- `PLANNED` — Define authentication, consent, export, deletion, retention, multi-device sync, and threat model before server persistence.
- `PLANNED` — Use D1 for active structured records and R2 for immutable/raw evidence backups only after a reviewed migration. Keep static public projections separate from private user data.
- `PLANNED` — Turn My Garage into a shared context layer for fitment, calculations, maintenance, repairs, recalls, costs, and history; VIN is an optional resolver, not the product by itself.

## LATER / IDEA

- `IDEA` — Ask Atlas source-bound intent router across calculators, DTC, warnings, symptoms, fitment, maintenance and service quotes.
- `IDEA` — Freeze-frame/live-data explanation for P0171/P0301-style workflows after the generic DTC MVP is proven.
- `IDEA` — Modification compatibility graph for vehicle + wheel + tire + offset + spacer + suspension with `COMPATIBLE`, `NEEDS REVIEW`, `CONFLICT`, and `UNKNOWN` states.
- `IDEA` — Fuse/relay, service reset, TPMS reset, EPB service mode, battery registration, owner manual, key-fob battery, bulbs, filters, paint/VIN/OBD-port/jack-point locations, dimensions, garage fit, cargo/ground clearance, EV range/charging intelligence, real-world consumption, model-year changelog, platform/engine sharing, and OEM part supersession.
- `IDEA` — Product catalog, affiliate/price comparison, and advertising slots only after data licensing, disclosure, consent, and layout stability are solved.

## Explicitly not the next move

- `REJECTED / SUPERSEDED` — Generate 5,000 codes × 30,000 vehicles × languages without unique evidence.
- `REJECTED / SUPERSEDED` — Add a generic chatbot that answers automotive facts from model memory.
- `REJECTED / SUPERSEDED` — Restore universal decorative 2D/3D studios solely to increase feature counts.
- `REJECTED / SUPERSEDED` — Treat more calculator URLs or long SEO text as a substitute for useful data and decisions.
