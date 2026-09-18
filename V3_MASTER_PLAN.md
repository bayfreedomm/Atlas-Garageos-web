# Atlas GarageOS V3 — Master Product / SEO / Visual Plan

This file is the decision ledger. Do not silently remove a locked decision. Update status after each major implementation pass.

## North star
- Primary growth objective: win valuable automotive calculator queries in Google organic search.
- Secondary channels: shareable results, embeds/backlinks, communities/social, Bing/IndexNow, and later browser extensions when product usage data justifies one.
- Product promise: enter a few values, get a clear answer immediately, then understand what the number means visually.
- Mobile-first. Desktop expands the mobile system; it does not define it.

## Locked product decisions
- Preserve calculation/domain engines unless correctness testing finds a real defect.
- Home is a fast automotive-tool launcher, not a dashboard.
- My Garage is optional save-later memory, not a primary first-visit concept.
- Wheel & Tire Fitment Compare is advanced. `What Fits` remains hidden/experimental until wheel/tire compatibility and real-clearance modeling are strong enough for the claim.
- Do not use green states to imply safety when only non-overlap geometry is known.
- Every important calculator follows: input → answer → visual meaning → quick facts → common mistake/warning → methodology → related tools.

## Visual system — locked
- Dynamic code/SVG first; avoid heavy decorative raster imagery inside calculator pages.
- Technical-premium hybrid: light 3D/axonometric engineering illustration, measurement lines, callouts, cutaways, proportional shapes, restrained shading.
- Current setup = blue/neutral; proposed setup = orange/amber. Warning colors are reserved for caution/risk.
- `NUMBER → SHAPE → MEANING`: changing an input must change a meaningful part of the visual whenever the domain allows it.
- Small real differences use two layers: true-scale drawing + explicitly labeled magnified difference. Never fake geometry just to make a difference visible.
- Multiple views are allowed when each answers a different question (side diameter, front width, wheel cutaway, etc.).
- Do not fake physics. Tire pressure/contact patch, wet/dry grip, tire deformation and similar illustrations must be labeled conceptual unless backed by sufficient data/modeling.
- Page-specific facts only. Avoid generic repeated filler.

## Content system — locked
Every major tool gets:
- 3 concise quick facts.
- 1 Common Mistake where useful.
- 1 Important Warning where safety/interpretation requires it.
- Formula/assumption explanation and limitations.
- Source/methodology transparency.

## Localization — first wave
Planned public locales:
- `/` English — live (V4.9 default-locale URL cleanup; former `/en/...` pages redirect 301 to matching root paths).
- `/de/` German.
- `/es/` Spanish.
- `/pt-br/` Brazilian Portuguese.
- `/fr/` French.

Rules:
- Separate indexable URL per language.
- Search-intent localized slugs, not literal machine-translated slugs.
- Full translation of navigation, forms, results, validation, visuals, facts, warnings, methodology and structured data before publication.
- Self-canonical per locale.
- hreflang/x-default only for versions that actually exist.
- Multilingual sitemap only includes QA-passed published locale pages.
- No forced IP/browser-language redirect.
- `/de/`, `/es/`, `/pt-br/`, and `/fr/` remain unpublished until each translation passes QA.
- IT / JA / PL are later candidates; India is monitored through English first; China is a separate search/distribution ecosystem.

## Search / SEO — locked
- New tools are selected by search demand + weak/beat-able SERP + topic-cluster fit, not by raw tool count.
- Build clusters: Tires & Wheels, Fuel & Trips, Performance, Converters, EV, later high-value ownership/used-car clusters if validated.
- Page quality beats word count: useful calculator, visual explanation, formula, worked interpretation, limitations, sources, related tools.
- Accuracy & Methodology is a permanent trust page.
- Add structured data only when accurate; never fabricate ratings/reviews.
- Shareable calculator state uses query parameters while canonical remains the clean tool URL.

## Distribution — locked
Near-term priority:
1. Google organic.
2. Shareable result URLs.
3. Embed calculators / earned backlinks.
4. Bing Webmaster + IndexNow.
5. Communities/social using useful result links, not spam promotion.
6. Browser extension later, selected from actual Atlas usage data.

Do not build a random unrelated extension merely to place an Atlas link. Any extension must solve a real adjacent automotive browsing job on its own.

## Launch gates
Do not call the site launch-ready until all gates pass:
- [ ] Correctness / reference-vector audit.
- [ ] Mobile UX audit at representative 360–430 px widths.
- [ ] Technical SEO audit.
- [ ] Localization SEO audit for every published locale.
- [ ] Core Web Vitals / performance audit on deployed build.
- [ ] Build, routing, 404, redirects, canonical, sitemap smoke test.
- [ ] Analytics configured and verified.
- [ ] Google Search Console configured.
- [ ] Bing Webmaster / IndexNow configured.
- [ ] Open Graph/social preview validated.
- [ ] Shareable result URL QA.
- [ ] Accuracy/Methodology/source review.
- [ ] Final regression suite.

## Current implementation status
Completed in the current V3.1 pass:
- [x] Page-specific Quick Facts / Common Mistake / Important Warning registry for all current registered tools.
- [x] ToolPage automatically renders the insight layer.
- [x] Tire Size Comparison technical visual prototype: true-scale side overlay + nominal front width + magnified difference lens.
- [x] Tire comparison visual updates live as valid input values change.
- [x] Wheel Offset technical cutaway prototype with fixed hub mounting face, current/new proportional wheel position and live inner/outer movement.
- [x] Wheel offset visual updates live as valid input values change.
- [x] Tire Size and existing geometry visuals receive live valid-input preview updates.
- [x] Accuracy & Methodology page added and linked.
- [x] Basic WebApplication structured data for calculator pages.
- [x] Basic Open Graph/Twitter text metadata.
- [x] First-wave locale/slug routing registry created; unfinished locales remain unpublished.
- [x] Tire Comparison and Wheel Offset shareable state URLs added.
- [x] Methodology added to indexable sitemap registry.
- [x] Regression suite updated: 105/105 current scenarios pass in independent runner.
- [x] Astro source parser and TypeScript non-Astro source checks pass.

Next implementation pass:
- [ ] Finish localized content architecture and publish DE/ES/PT-BR/FR only after full translation QA.
- [ ] Apply the new technical visual language to Tire Size Calculator and Fitment Compare.
- [ ] Upgrade Fuel / Road Trip visuals from symbolic motion to meaningful distance/fuel/cost diagrams.
- [ ] Replace PSI ring-scaling metaphor with a clearly conceptual pressure/contact-patch explanation.
- [ ] Add shareable state to other high-value calculators.
- [ ] Generate and validate lightweight social preview asset(s).
- [ ] Analytics + Search Console + Bing/IndexNow deployment configuration.
- [ ] SERP-driven next-tool selection and topic-cluster roadmap.

## Parked / experimental
- `What Fits` recommendation UI.
- Wet/dry performance predictions from tire size alone.
- Exact pressure/contact-patch simulation without load/tire-construction data.
- Browser extension until Atlas usage data indicates the best job to solve.
- China localization/distribution in the first wave.

## Tire Size Calculator blank-canvas checkpoint — 2026-09-17
- [x] Tire Size Calculator now uses an independent mobile-first page shell instead of `ToolPage` and the shared legacy header/navigation presentation.
- [x] The calculator follows input → primary answer → live technical visual → compact metrics → meaning → SEO content → related tools.
- [x] Existing tire calculation, validation, domain, route registry, canonical and structured-data behavior remain the source of truth.
- [x] Scope is limited to Tire Size Calculator; Tire Comparison, Wheel Offset, Fitment Studio and the global shell remain unchanged.

## V4 visual implementation checkpoint — 2026-09-14
- Approved dark automotive chrome + bright app-like calculator surface is now implemented in source.
- Mobile bottom navigation is implemented.
- Tire Size live technical anatomy is implemented.
- Tire Comparison and Wheel Offset V3.1 dynamic technical visuals are preserved under the V4 shell.
- Next visual expansion: Fuel Cost, Road Trip, EV Charging, Speedometer, Gear Ratio, Fitment Compare.

## V4.1 checkpoint — mobile review corrections
- [x] Day / Night / Auto theme contract.
- [x] Header quick theme toggle.
- [x] Compact mobile home hero.
- [x] Input/result before explanatory art on standard tool pages.
- [x] Smaller mobile tool/Fitment headings.
- [x] Bottom navigation no longer leaves final content inaccessible beneath the fixed dock.
- [x] Light/dark technical visual surface treatments.
- [ ] Cloudflare clean Node 24 build for V4.1 archive.

## V4.2 checkpoint — visual meaning + mobile polish
- [x] Theme toggle icon contrast corrected.
- [x] V4 explicitly owns blue brand tokens in Day and Night modes; legacy V3 amber no longer recolors primary navigation state.
- [x] Primary calculator CTA text contrast locked to white.
- [x] Mobile dock reduced and scroll/focus auto-hide added to reduce content obstruction.
- [x] Small-phone home/tool-directory density improved and redundant directory outer-card treatment removed.
- [x] Tire Size Comparison upgraded with true-scale side view, nominal-width front view, on-vehicle static geometry, magnified-difference lens and wet/dry context non-claims.
- [x] Wheel Offset upgraded to a coherent wheel-well cutaway with suspension/fender/brake/hub context plus live outer-stance magnification.
- [x] V4.2 TypeScript/Astro/CSS source validation passed.
- [ ] Cloudflare clean Node 24 `astro check && astro build` for V4.2 archive.

## V4.5 checkpoint — Garage-first brand + light-theme contrast + homepage visual reset
- [x] `Garage` is now the dominant word in the visible wordmark; `Atlas` is secondary provenance and `OS` is a quiet suffix.
- [x] Homepage hero copy now explains the platform scope at first glance: automotive calculators, fitment, fuel/trips and EV.
- [x] Cartoon-like vehicle hero illustration replaced by an engineering-console visual with wheel/tire geometry and live tool readouts.
- [x] Light theme no longer reuses luminous night orange/yellow for small text; a darker contrast-safe semantic orange is used instead.
- [x] Key light-mode orange labels, technical measurements, warning/mistake cards and hero readouts received explicit contrast treatment.
- [x] Blue remains the primary navigation/action color in both themes.
- [ ] Clean Node 24 + pnpm `astro check && astro build` for V4.5 archive.

## V4.10 checkpoint — Road Trip Cost Calculator
- [x] Primary complete trip cost precedes interpretation, live route/cost diagram, and detailed figures.
- [x] Existing metric/US fuel, one-way/round-trip, one-time extras, and whole-person split remain in the established domain model; core/domain calculation code unchanged.
- [x] Road Trip inputs update the answer, interpretation, and proportional cost visual together; the route shows one or two legs without claiming a geographic scale.
- [x] The Road Trip page places its method/details before quick facts and common mistake, followed by related tools. V4.9 root-English routes stay unchanged.
- [x] 106 tests, Astro typecheck, and static production build passed for V4.10; deployed HTTP and mobile browser QA remain separate launch gates.

## V5.0 RC1 checkpoint — scope locked
- [x] Global semantic light-theme contrast tokens and an audited 4.5:1 minimum for targeted small text roles.
- [x] MPG/L100km, Gear Ratio, EV Charging, PSI, power, torque, and power-to-weight aligned to the shared V4 result hierarchy without core/domain changes.
- [x] Desktop header, mobile drawer, bottom dock, Fitment escape routes, footer, and related-tool navigation audited.
- [x] Browser QA at 390px, tablet, and desktop completed with no document-level horizontal overflow in the sampled release-critical pages.
- [x] Root-English routes, 20 legacy `/en/...` 301 rules, canonical, hreflang, sitemap, manifest, and internal links verified.
- [x] 106 tests passed; typecheck and production build clean. RC1 requires only deployed HTTP checks and the planned physical-device acceptance pass.

## V5.1 checkpoint — Tire Size shared-shell return
- [x] User-directed reversal of the 2026-09-17 independent Tire Size shell: the public root-English Tire Size Calculator now uses the same `ToolPage` shell, navigation, insights and content hierarchy as the other calculators.
- [x] The live technical tire visual and the established calculation/domain behavior are preserved.
- [x] Tire Size receives page-specific mobile density only: smaller intro typography, compact three-part size inputs, a shorter action button and tighter result/visual spacing.
- [x] 390 px browser QA shows no document-level horizontal overflow; 107 tests, Astro typecheck and the static production build pass.
