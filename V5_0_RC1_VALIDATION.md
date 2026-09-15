# Atlas GarageOS V5.0 RC1 Validation

Date: 2026-09-15

## Scope and baseline

V5.0 RC1 is a release-hardening pass, not a feature release. The available V4.10 source was used as the file baseline because a standalone V4.11 ZIP was not present. The two recorded V4.11 changes were carried forward: Fitment Studio escape navigation and resilient Related Tools cards.

## What changed

- Added a semantic light-theme contrast system for accent, warning, danger, helper, information, background, and border roles. The dark-theme palette remains independently defined.
- Standardized MPG ↔ L/100km, Gear Ratio, EV Charging, PSI, power, torque, and power-to-weight results around: primary answer → meaning → visual → details → mistake/warning → related tools.
- Kept all standardized results live: input changes update the primary value, meaning, visual values, and details together.
- Added proportional tire-diameter meaning to Gear Ratio and clarified its direct-drive limitation. Its wide RPM table now scrolls inside the component instead of widening mobile pages.
- Added EV cost/time priority plus battery, grid-energy, and efficiency-loss values around the existing charge-window visual.
- Added desktop Home / Tools / Wheel & Tire Compare navigation and an All Tools breadcrumb to Fitment Studio. Hamburger, mobile dock, footer, and Related Tools routes remain available.
- Added responsive containment for calculator grids, buttons, inputs, result cards, tables, and Related Tools.
- Kept the existing Atlas-small / Garage-dominant / OS-small wordmark. No new logo concept was introduced.

## What did not change

- No files under `src/core` or `src/domain` changed compared with the V4.10 baseline.
- No formulas, validation ranges, business rules, locale plans, or unpublished language routes were added.
- English remains at root URLs. No `/en/` pages are generated.
- The existing 20 one-step `/en/...` 301 rules remain in `public/_redirects`.
- The V4.7 homepage direction and Garage-dominant brand hierarchy remain intact.

## Automated verification

- `pnpm test`: 21 files, 106 tests passed.
- `pnpm typecheck`: 132 files, 0 errors, 0 warnings, 0 hints.
- `pnpm build`: successful static production build; 21 pages generated (20 index routes plus 404).
- Internal route/asset audit: 0 broken internal links in generated HTML.
- SEO shell audit: 0 generated pages missing canonical, English hreflang, x-default hreflang, or manifest link.
- URL audit: no generated `/en/` directory; 20 legacy `/en/...` redirect rules retained.
- Source integrity audit: 0 changed files under `src/core` and `src/domain`.

## Browser QA

- Widths tested: 390×844, 768×1024, and 1440×1000.
- Pages sampled at every width: Home, Tools, MPG, Gear Ratio, EV Charging, Road Trip, and Fitment Studio.
- Horizontal document overflow: none after the Gear Ratio table containment fix.
- Navigation: mobile dock and hamburger present below desktop breakpoint; desktop navigation present at 1440 px; Fitment Studio exposes direct Home, Tools, Compare, breadcrumb, footer, and related-tool routes.
- Light-theme contrast: 180 rendered instances across warning, common mistake, keep-in-mind, eyebrow/accent, helper, detail, and related-tool text were measured; none fell below 4.5:1 in the audited set.
- Dark-theme regression: standardized result cards, visuals, navigation, and white-on-blue primary actions checked after the semantic-token changes.
- Live behavior checked by changing MPG, Gear Ratio tire diameter, and EV electricity price; primary answer, meaning, visual values, and details updated together.

## Known remaining release checks

- Cloudflare deployment is not part of this source pass. Live 200/301 responses, caching, and production headers still need deployment verification.
- The planned 5–10 minute physical-device review remains the RC1 acceptance step. Create RC2 only for a reproducible bug found there; otherwise promote this candidate to V5.0 final.
