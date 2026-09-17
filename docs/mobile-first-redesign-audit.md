# GarageOS radical mobile-first redesign audit

Date: 2026-09-17  
Scope: `Atlas-GarageOS.zip`  
Reference implementation: `/tools/tire-size-calculator/`

## Executive finding

GarageOS does not need a calculation rewrite. Its strongest asset is the existing separation of deterministic math, validated domain values, feature orchestration, SEO registry, and static Astro routes. The redesign should preserve that substrate and replace the presentation system above it.

The principal UI problem is accumulated presentation history. The active shell imports `global.css`, `product-v3.css`, and `product-v4.css`; together they contain 2,114 lines and roughly 205 KB of unminified CSS. Several selectors redefine the same tool shell, heading, card, workspace, and responsive behavior at different points in the cascade. The result is visually competent in places, but difficult to reason about and still shaped like a product dashboard rather than a fast utility.

The new direction is a task document, not a dashboard: identify the job, enter the minimum values, show one decisive answer, connect the number to a truthful shape, then reveal explanation and follow-on tools.

## 1. Keep / replace / remove map

### Keep — product engines and durable boundaries

| Area | Evidence | Decision |
|---|---|---|
| `src/core/**` | Pure deterministic tire, wheel, fitment, unit, drivetrain, and energy calculations | Keep unchanged unless a failing reference vector proves a defect |
| `src/domain/**` | Factories, validation issues, branded values, durable vehicle and garage concepts | Keep; all untrusted input must continue through these factories |
| `src/features/tools/**` | Thin orchestration from form-shaped input to validated core results | Keep; this is the correct UI-independent calculator API |
| `src/features/fitment-explorer/**`, `src/features/compare/**` | Bounded composition of existing engines | Keep; redesign only their interaction model |
| `src/storage/**` | Repository boundary and validated serialization/migrations | Keep |
| `src/seo/tool-registry.ts`, sitemap/routes | Central identity, canonical, related-tool and indexability source | Keep and make the new IA consume it |
| `src/content/tool-insights.ts` | Page-specific facts, mistakes and warnings | Keep content; replace its card-heavy rendering |
| Tests | 106 passing formula, validation, SEO and product tests | Keep as the regression contract |
| Static Astro output / Cloudflare-compatible architecture | Fast, low-cost, crawlable delivery | Keep |

### Replace — presentation contracts

| Area | Current issue | Replacement |
|---|---|---|
| `src/components/ToolPage.astro` | One generic component forces intro, machine card, visual, insight cards, explanation card, CTA card and related cards onto almost every tool | A small set of task templates: instant converter, single-input calculator, comparison calculator, guided/advanced tool |
| `src/components/SiteLayout.astro` navigation presentation | Desktop nav, drawer, theme control and historical mobile patterns compete for attention | Compact brand bar; Toolbox as primary discovery; contextual advanced-tool escape route; Garage secondary |
| `src/ui/tool-calculators.ts` | 452-line DOM controller mixes many tools and several visual update paths | Per-tool presentation adapters sharing tiny DOM helpers; feature functions remain untouched |
| Result presentation | Summary banner plus equally weighted metric cards makes the answer compete with its details | One primary answer, one plain-language interpretation, compact secondary measurement list |
| Technical visual placement | Often a large independent card or an additional section | Attach the visual directly to the primary answer; it must answer a specific question |
| Responsive model | Many historical overrides; desktop and mobile order have changed repeatedly | Base styles at 360 px, explicit 390/430 acceptance, one expansion breakpoint, optional wide enhancement |
| Typography | Multiple large `clamp()` headings and inherited product-era rules | Compact scale with one intentional large number: 11/12 metadata, 13 helper, 14 body, 16 section, 24–28 page title, 38–56 primary result |
| Theme implementation | Theme is useful, but page components inherit conflicting historical rules | Keep theme tokens; rebuild component tokens once with verified light/dark contrast |

### Remove or retire after migration

| Candidate | Reason |
|---|---|
| `product-v3.css` and superseded portions of `global.css` / `product-v4.css` | Cascading historical patches are the main source of unpredictability; remove only after every live route moves to the new primitives |
| Generic `.tool-machine` metaphor | It visually frames every utility as a dashboard/module instead of a quick answer page |
| Mobile bottom dock as a universal site requirement | A fixed app-style dock costs viewport space and overstates Home/Garage as primary jobs; validate removal through the new shell |
| Repeated outer cards around sections, facts and related links | Borders should express grouping, not decorate every block |
| Decorative hero scale and oversized headings on utility pages | They delay the input and reduce information density |
| Duplicate result summary where the same answer already appears as the primary result | Retain one accessible live region, not two visible answers |
| Generic visual filler | Keep only visuals that change with a meaningful domain value or clarify a formula |

“Remove” means retire through route-by-route migration, not delete before coverage exists.

## 2. Proposed information architecture

### Primary site structure

1. **Home / Tool launcher** — search-first list of high-intent automotive jobs and four restrained categories.
2. **Toolbox** — Tires & Wheels, Fuel & Trips, Performance, Converters, EV. Category chips are filters, not dashboard widgets.
3. **Calculator page** — the primary organic landing page and complete task surface.
4. **Wheel & Tire Compare** — advanced multi-step product, linked contextually from relevant tire/wheel answers.
5. **Accuracy & Methodology** — trust layer linked from every tool's compact method disclosure.
6. **My Garage** — save/reuse action surfaced after a useful result or inside advanced flows; not first-visit primary navigation.
7. **Privacy** — footer utility.

### Calculator page information order

1. Compact breadcrumb and category.
2. Plain title plus one-sentence promise.
3. Minimum required inputs.
4. Primary answer immediately after submit; valid defaults may calculate on load.
5. Technical visual attached to the answer.
6. Secondary measurements.
7. “What this means” / code-reading aid.
8. Three page-specific facts and one mistake or warning.
9. Collapsible method, formula, assumptions, and limitations; content remains in the HTML for crawlability.
10. Two or three intentional next actions.

This preserves the locked `input → answer → visual meaning → facts → warning/method → related` decision while removing the dashboard/card treatment.

## Mobile design system

### Layout

- Design widths: 360 px baseline, 390 px primary QA, 430 px large phone.
- Content gutter: 15–16 px; never rely on a desktop container compressed into mobile.
- Single reading column on phones. At 768 px, input and answer may become two columns without changing source order.
- No fixed bottom UI over forms. Sticky actions only inside genuinely long guided flows and only when they do not cover content.
- Touch targets: 48 px preferred, 44 px minimum.

### Type

- Metadata: 10–11 px uppercase only for short labels.
- Helper and captions: 11–12 px.
- Body: 13–14 px, 1.45–1.6 line-height.
- Section heading: 15–16 px.
- Page title: 25 px at 360, up to 38 px on wide screens.
- Primary numeric answer: 38–56 px; this is the only intentionally large type on the calculator.
- Numeric inputs/results use the existing monospace token when scanning benefits.

### Spacing and shape

- 4 px base rhythm: 4, 8, 12, 16, 24, 32.
- Input groups and the answer may use one containing surface. Supporting content returns to the page flow.
- Radius: 8–12 px controls, 16 px primary surface; avoid nested rounded cards.
- One-pixel separators are preferred over independent cards.

### Color and meaning

- Blue: action, navigation, current/neutral geometry.
- Orange: measurement callout or proposed/change emphasis.
- Yellow/red: caution only, never decoration.
- Green: validated success or explicit non-overlap meaning only; never an inferred safety verdict.
- Both themes must meet at least 4.5:1 for body and control text.

### Motion and technical visuals

- Inputs may update a valid preview on animation frame; submit commits the answer and validation state.
- Motion is optional and honors reduced-motion.
- Visuals use canonical result values, proportional geometry where feasible, measurement lines, and short callouts.
- If a small difference is magnified, label the magnification. Never fake physics or compatibility.

## 3. Reference implementation

The root-English Tire Size Calculator has been rebuilt from scratch without `ToolPage.astro` or its `.tool-machine` hierarchy.

Implemented behavior:

- 360-first compact header and input row.
- Width/profile/rim fields mirror the code printed on a tire.
- Existing `calculateTireSizeTool()` remains the sole calculation/validation path.
- Existing result presenters still supply all five measurements.
- A new presentation adapter updates the primary diameter, tire code, interpretation, rim ratio, and nominal width drawing.
- Live drawing changes only for validated values.
- Primary result precedes explanation.
- Facts render as document rows; the common mistake is a single semantic callout.
- Method and limitation content is collapsed visually but remains in the page HTML.
- Related routes still come from the SEO registry.
- Light/dark themes remain supported.

Files changed:

- `src/pages/tools/tire-size-calculator/index.astro`
- `src/styles/reference-tool.css`
- `src/ui/tool-calculators.ts`
- `V3_MASTER_PLAN.md`

Calculation engines, formula files, validation factories, data models, route registry, and storage were not changed.

## Validation evidence

- Unit/integration suite: 21 files, 106 tests passed.
- Astro diagnostics: 152 files, zero errors, warnings or hints.
- Production static build: 41 pages generated successfully.
- Browser QA: no document-level horizontal overflow at 360, 390, 430, or 1280 px.
- Functional browser vector: `235/40 R18` produced `645.2 mm` overall diameter and `94.0 mm` sidewall through the existing engine.
- Dark-theme CTA text corrected to white after computed-style inspection.

## Migration sequence

1. Approve or adjust this reference screen at real-device scale.
2. Extract its stable primitives (`ToolIntro`, `SizeInput`, `PrimaryAnswer`, `MetricList`, `TruthVisual`, `MethodDisclosure`, `NextTools`) without turning them into one monolithic universal component.
3. Migrate Tire Comparison and Wheel Offset next; they exercise comparison and dual-geometry patterns.
4. Migrate instant converters with an even smaller template.
5. Migrate Fuel, Road Trip and EV as cost/estimate patterns.
6. Rebuild Toolbox and the global shell around job discovery; demote Garage and remove the universal mobile dock if acceptance testing confirms the direction.
7. Migrate Fitment Studio last as the advanced guided pattern.
8. Delete superseded selectors and product-era styles only after route coverage, then repeat formula, SEO, accessibility, performance, light/dark and 360/390/430 acceptance gates.

## Non-goals for this first slice

- No formula, validation range, unit constant, storage schema, or fitment verdict was changed.
- The entire site shell was not migrated from one representative screen.
- The legacy `/en/` duplicate source page was not redesigned; deployment redirects already define root English as canonical, and the route should be retired or generated from the canonical screen during the broader routing cleanup.
- No new framework or runtime dependency was added.
