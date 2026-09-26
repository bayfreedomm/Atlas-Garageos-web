# Atlas GarageOS V3 — Master Product / SEO / Visual Plan

This file is the decision ledger. Do not silently remove a locked decision. Update status after each major implementation pass.

> Current-memory note (2026-09-25): this historical ledger remains important for locked V3 decisions and implementation history. The reconciled current strategy, verified state, accepted roadmap, and session handoff live in `docs/atlas/MASTER_PLAN.md`, `docs/atlas/PROJECT_STATE.md`, `docs/atlas/ROADMAP.md`, `docs/atlas/DECISIONS.md`, and `docs/atlas/HANDOFF.md`. Later checkpoint entries supersede earlier counts or implementation claims only where they explicitly say so.

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

## Optional 3D live-state regression checkpoint — 2026-09-25
- [x] The fourteen result-led tool studios resolve their sibling calculator form rather than assuming the 3D panel is nested inside it.
- [x] Current form values are read when a deferred 3D tab mounts, and already-mounted scenes refresh on input, change, and submit.
- [x] Two-value scene regressions cover every input-driven additional 3D tool; the measurement/map reference explainers remain intentionally static.
- [x] A 390 px live Chromium sweep covers all 23 English tool routes without document overflow; shared mobile Engineering 2D plates retain readable scale through a centered internal pan viewport.
- [x] Canonical calculations and data contracts are unchanged; 267 tests, Astro typecheck, and the 1,927-page production build pass.

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

## Hardened visual QA checkpoint — 2026-09-19
- [x] Isolated uploaded-source audit; mobile intro clipping, narrow vehicle fields, small text-link targets, and stale tire-result presentation corrected without core/domain changes.
- [x] EN/DE/ES route reflow checked across 320–1440px (80 pages, 800 route/width samples); sampled light/dark and input-error recovery inspected.
- [x] Hero WebP delivery with intrinsic dimensions; original PNG retained for social metadata.
- [x] 121 tests passed; Astro check and 80-page production build clean.
- [ ] Actual browser zoom/text scaling, WebKit/Firefox, physical devices, and production performance remain separate acceptance checks; see visual QA report for coverage limits.

## Problem-solving graph v1 checkpoint — 2026-09-22
- [x] Shared EN/DE/ES decision graph connects vehicle, tire-size, bolt-pattern, fuel-market, comparison, and calculator journeys with crawlable HTML links.
- [x] Vehicle pages expose documented tire/PCD references and practical tools without inventing fuel-consumption values.
- [x] Tire and bolt-pattern entities preserve geometry, vehicle context, trust qualifiers, and fitment caveats while adding safe calculator prefills.
- [x] Fuel market pages link to localized fuel-cost and road-trip actions without changing provider, workflow, history, canonical, or hreflang behavior.
- [x] Fixed release coverage remains 30 vehicle records, 20 tire entities, 10 bolt-pattern entities, and 96 pSEO entity URLs.
- [x] Focused graph coverage, full tests, typecheck, production build, and representative mobile light/dark browser QA completed.

## Vehicle comparison + vehicle-specific trip cost checkpoint — 2026-09-22
- [x] One shared EN/DE/ES comparison engine covers sourced identity, tire geometry, wheel/PCD, center bore, fastener and qualified torque fields only.
- [x] Three indexable comparison hubs use deterministic query-state ordering; pair-page generation is intentionally deferred to avoid thin duplicate pages.
- [x] Vehicle decision graphs link into comparison and carry validated identity into localized road-trip calculators.
- [x] No trustworthy vehicle-consumption field exists, so users must enter actual consumption; pending market prices remain blank.
- [x] Model-specific trip-cost pSEO pages are intentionally deferred until materially vehicle-specific consumption data exists.
- [x] Locked counts remain 30 vehicle records, 20 tire entities, 10 PCD entities and 96 existing pSEO entity URLs.

## Cloudflare deploy hardening checkpoint — 2026-09-22
- [x] Root `wrangler.jsonc` defines the `atlas-garageos-web` assets-only Worker, fixed compatibility date, `./dist` assets, Astro trailing-slash handling and custom 404 behavior without a Worker entry file.
- [x] Wrangler is intentionally not pinned into the project dependency graph; Cloudflare invokes Wrangler through its configured `npx wrangler ...` deploy commands, avoiding minimum-release-age lockfile failures.
- [x] Repository config supplies the Worker name, compatibility date and `./dist` assets contract for both production deploy and preview version-upload commands.
- [x] Static Astro output, fuel workflows/data, product logic, entity counts and Package 1–4 features remain unchanged.

## Package 5.2–5.5 WebGL checkpoint — 2026-09-22
- [x] Tire comparison, wheel offset and PCD scenes render through a viewport-lazy Three.js/WebGL chunk while canonical calculation models remain unchanged.
- [x] PBR rubber/metal treatments, studio lighting, contact shadows and HTML measurement callouts replace the Canvas presentation on capable devices.
- [x] Side-by-side and true overlay tire views, fixed offset mounting plane and canonical lug-circle geometry remain live as calculator inputs change.
- [x] The dependency-free Canvas renderer remains the automatic fallback when WebGL cannot initialize.
- [x] Touch rotation, bounded zoom, DPR caps, reduced-motion behavior, teardown/disposal and 390px mobile layout were verified.
- [x] Fuel data/history, Wrangler/Cloudflare config, routes and localization files remained byte-identical to the Package 5.1 source archive.

## Package 5.6 premium geometry + rolling fuel PR checkpoint — 2026-09-22
- [x] Tire sidewalls, shoulders, beads, circumferential grooves and bounded-count tread blocks now read as dimensional geometry rather than a smooth placeholder torus.
- [x] Wheel scenes use layered barrels, lips, tapered spokes, hubs, center caps and recessed lug details; offset comparisons keep one visibly fixed hub-mounting plane.
- [x] PCD scenes use a chamfered layered plate, deep center bore and recessed lug seats while preserving the canonical lug-circle and adjacent-spacing calculations.
- [x] Procedural studio reflections, controlled physical materials, collision-aware HTML callouts and tuned default cameras improve legibility without external assets or new dependencies.
- [x] WebGL context loss now switches to the existing Canvas renderer; event listeners, textures, geometries and materials are disposed on teardown.
- [x] Scheduled fuel workflows rebuild the rolling branch from the current default branch, serialize both providers, publish with an explicit SHA-bound force-with-lease and reuse an existing open PR.
- [x] Fuel workflow lifecycle regression coverage includes first run, repeated run, changed remote branch, closed/merged PR recreation and no-change behavior.
- [x] Canonical tire/offset/PCD math, fuel JSON/history, routes, SEO, localization, Wrangler config and the dependency lockfile remain byte-identical to the Package 5.5 source archive.

## Package 5.7 tire visual proof — 2026-09-22
- [x] Tire Comparison has one result-adjacent Visual Studio with 3D and engineering 2D tabs on EN/DE/ES pages.
- [x] Native smooth tire and restrained ten-spoke wheel geometry passed live visual review, typecheck, 213 tests and the 230-page build.
- [ ] Offset and PCD native product geometry, shared visual workspace and final cross-device 3D acceptance remain for the next package.

## Package 5.8 Offset and PCD visual implementation — 2026-09-22
- [x] Offset geometry now renders native wheel bodies at canonical width and ET positions relative to one fixed mounting plane.
- [x] PCD geometry now has actual center and lug through-holes derived from canonical positions.
- [x] EN/DE/ES Offset and PCD calculators use a single 3D / Engineering 2D workspace adjacent to the result.
- [x] Canvas geometry is deferred until fallback is needed; shared Three geometry disposal is deduplicated.
- [ ] Physical-device pinch, forced context loss, other browser engines and deployed performance remain separate acceptance checks.

## Package 5.9 tire realism and first guided decision — 2026-09-22
- [x] Tire studio framing is tighter; procedural tread relief is less visibly repetitive.
- [x] Front-view measurement guides are hidden at oblique angles where their projected span would mislead; numerical metrics remain visible below the canvas.
- [x] EN/DE/ES tire comparison offers a result-driven next check: speedometer for diameter change, wheel width/ET for width-only change, or load/speed specification when nominal dimensions match.
- [x] Proposed size carries into the localized tire-size calculator; physical clearance remains an explicit final check, never an inferred approval.
- [ ] Actual phone pinch, forced context loss, WebKit/Firefox and deployed performance still require separate device/deployment acceptance.

## Package 6.0 connected decision journeys — 2026-09-23
- [x] Calculator pages now lead with one authored next decision and supporting checks in EN/DE/ES; vehicle, tire, bolt-pattern and fuel-market entity pages retain their existing decision graph.
- [x] Tire Comparison carries both sizes into the full Fitment Studio, in addition to its localized speedometer and size-calculator actions.
- [x] Tire Size Calculator, Speedometer and Wheel Offset carry validated working values into their next tools without changing canonical formulas.
- [x] Fitment Studio accepts bounded incoming URL state and clearly distinguishes calculated geometry, user-entered measurements and still-unverified vehicle checks. Imported values do not silently save to My Garage, and a share hash retains precedence.
- [x] PCD instructional text now consistently specifies adjacent lug center-to-center measurement, matching the existing canonical calculator.
- [x] Package 6.0 adds no dependency and leaves canonical math, fuel history/data and Wrangler/Cloudflare configuration untouched.
- [ ] Physical-device touch, forced context loss, WebKit/Firefox and deployed performance remain separate acceptance checks.

## Package 6.1 visual expansion — 2026-09-23
- [x] Tire Comparison, Wheel Offset and PCD keep a high-contrast in-scene numeric HUD visible at every camera angle. Front-view guide lines still hide at misleading oblique angles; their values do not disappear.
- [x] Tire Size Calculator gets a live single-tire 3D scene; Speedometer gets a two-size 3D comparison with indicated/theoretical speed readout.
- [x] Gear Ratio gets proportional tire-diameter geometry, Compression Ratio a bore/stroke/clearance-volume section, and EV Charging a proportional charge-window battery. Illustrative details and non-predictions are labelled explicitly.
- [x] Fitment Studio gets a live 3D workspace switching between tire profiles and the fixed-hub wheel/ET scene, with the calculated tire and wheel values visible together.
- [x] New scenes use the existing lazy Three.js renderer, Canvas fallback, touch/zoom/reduced-motion handling and bounded rendering. No calculation engine or dependency change.
- [x] Guided-decision and related-tool links now have unmistakable button affordance, contrast, hover and keyboard-focus states.
- [ ] Literal 3D scenes for every registered tool are not shipped: fuel-price data, unit converters and vehicle lookup do not have a defensible physical 3D model. Their existing task-specific data/technical visuals remain; no fake 3D meaning is implied.
- [ ] Physical-device pinch, forced context loss, WebKit/Firefox and deployed performance remain separate acceptance checks.

## Package 6.2 complete tool-scene and fuel reliability pass — 2026-09-23
- [x] All 22 published tool routes now have a tool-specific 3D explanation: the eight existing mechanical scenes remain, and 14 new schematic scenes cover fitment, measurement, fuel/trips, unit relationships, power, torque, tire codes, towing, quarter-mile and vehicle lookup. Fitment Studio retains its separate combined 3D workspace.
- [x] New scenes are explicitly explanatory, not physical fitment, safety or vehicle-specific approval. Fuel and other numerically meaningful readouts take validated canonical calculator output or core unit constants where applicable; other props illustrate the relationship without inventing results.
- [x] Tire/speed/fitment HUDs retain diameter, width and sidewall/rim data while oblique 3D callout guides hide. Guided-decision cards retain clear click/focus affordances.
- [x] Three.js remains viewport-lazy, with Canvas fallback, WebGL-loss recovery, bounded zoom/touch handling and theme/disposal behavior. No dependency, canonical formula, Wrangler or route changes.
- [x] Spain's official national fetch has a realistic 75-second timeout; a verified snapshot and one genuine history point were obtained. The US EIA keyless fallback parses only regular and diesel from its official weekly public table, with strict week/number validation; a verified weekly snapshot and one genuine history point were obtained. The keyed EIA path still provides four grades when available.
- [x] Scheduled fuel jobs preserve the rolling-PR publication model, now mark partial provider failures as failures after publishing any successful country snapshot. The site accurately states that scheduled fetches reach production only after PR review/merge/deployment.
- [x] Offline frozen install, 235 tests, typecheck and 230-page production build passed. Representative desktop/mobile WebGL and live data/browser behavior were checked locally.
- [ ] Physical pinch, other browser engines, forced context loss, live GitHub Actions/rolling PR and deployed Cloudflare behavior were not directly verified in this package.

## Package 6.3 unified visual-studio pass — 2026-09-23
- [x] All 22 published calculator tools expose one 3D Studio / Engineering 2D workspace. The 14 newer scene tools receive a shared tabbed studio; five previously standalone mechanical scenes gain tabs; Tire Comparison, Wheel Offset and PCD retain their established studios.
- [x] Existing tire-size, gearing and EV technical diagrams remain live but now sit inside their 2D tabs. Fuel and road-trip technical breakdowns likewise move into the 2D tab without dropping their live values.
- [x] Speedometer, compression and Fitment Studio receive dedicated engineering section drawings. The 14 newer tools receive topic-specific dark blueprint drawings instead of their old generic pseudo-3D side cards.
- [x] Tire code, tire date and clearance scenes reuse the established native tire product. Toy-like vehicle modules were removed from fuel, route, power-to-weight and towing 3D scenes in favor of technical equipment/measurement geometry.
- [x] Vehicle lookup shows lug holes only for a selected documented record and uses that record's actual lug count. Explanatory text and 2D headings are localized in EN/DE/ES.
- [x] On narrow screens, the tire comparison opens in overlay mode and the persistent numeric HUD moves below the 3D canvas so it no longer covers the product. Side-by-side remains available, and the numeric values persist when the model rotates.
- [x] No canonical calculation, fuel data/history, Wrangler/Cloudflare config, route, or dependency changes were made in this visual pass.
- [ ] Physical pinch, WebKit/Firefox, forced context loss and deployed performance remain separate launch gates.

## Package 6.4 native instrument geometry pass — 2026-09-23
- [x] Ten formerly primitive/symbolic 3D tool scenes now use purpose-built native Three.js geometry: pressure gauge, fuel metering rig, route/timing decks, MPG relationship, turbine output, torque arm, power-to-weight rig, hitch/load cells and sourced vehicle bolt plate.
- [x] Compression and EV charging now render native cylinder and modular battery sections. Bore/stroke and charge-window inputs alter visible geometry; canonical calculations remain in their existing engines.
- [x] Tire load/date/clearance tools keep the established native tire product, while mixed native-product scenes now also render their explanatory clearance meshes. The other high-quality tire, offset and PCD products remain intact.
- [x] The original bounded geometry remains a dependency-free Canvas fallback. New Three geometry stays in the existing lazy WebGL chunk, uses the same camera/touch/reduced-motion/disposal safeguards and adds no dependency.
- [x] Desktop and 390px mobile views were visually checked in dark/light theme; a pressure input change updated both the calculator and WebGL gauge, and a sourced four-lug vehicle rendered four physical openings.
- [ ] This is an engineered explanatory 3D language, not photoreal full-vehicle rendering or a vehicle-specific safety/fitment verdict. Physical-device pinch, other browser engines, forced context loss and deployed performance remain separate acceptance checks.

## Package 6.5 shareable decision state — 2026-09-23
- [x] Every published calculator form now has a localized “Copy share link” action through the shared ToolPage layer; existing tire-comparison and wheel-offset links keep their canonical compact parameter formats.
- [x] Utility calculators, performance/engine calculators, EV, towing, tire reference tools and vehicle lookup serialize their named inputs into a bounded, tool-scoped URL state without sending data to a server.
- [x] Opening a shared URL restores inputs and replays input/change/submit behavior so calculated summaries, technical visuals and native WebGL studios return to the same decision state. Dependent vehicle make/model selects replay in order.
- [x] The feature is additive: canonical formulas, fuel data/history, routes, SEO/localization, Wrangler/Cloudflare and existing Fitment Studio hash sharing remain unchanged.
- [x] No dependency or infrastructure change. Typecheck, 240 tests and the 230-page production build pass.
- [ ] Share/embed widgets, account-backed My Garage history, analytics/Search Console/IndexNow and deployed multi-browser/device acceptance remain separate roadmap blocks.

## Package 6.6 physically lit product-render pass — 2026-09-23
- [x] Three.js now uses a PMREM-filtered studio environment so physical materials receive controlled product-render reflections instead of flat ambient color.
- [x] Key/fill/rim/front lighting is rebalanced for readable bevel highlights, and high-resolution PCF shadows preserve contact depth without the removed/deprecated soft-shadow path.
- [x] Tire sidewalls receive deterministic micro-surface bump detail; existing procedural tread relief, machined wheel layers and canonical geometry remain intact.
- [x] Native instrument accents are restrained so blue/orange measurement states read as anodized indicators rather than emissive toy plastic.
- [x] No dependency, canonical math, fuel data/history, route, localization or Wrangler/Cloudflare changes.
- [ ] Visual review on physical devices, WebKit/Firefox, forced context loss and deployed Cloudflare remain launch acceptance checks.

## Package 6.7 cross-audit and performance correction — 2026-09-23
- [x] Re-audited the complete 22-tool 3D coverage contract, localized EN/DE/ES scene copy, native-vs-Canvas fallback pairing, 229 generated HTML artifacts, 66 localized tool routes, and source debug markers.
- [x] Low-power devices now use a 1024px PCF shadow map while desktop/high-power devices keep 1536px; this prevents the physically lit pass from turning into a mobile GPU tax.
- [x] Final typecheck, 240-test regression suite and 230-page static build pass with no type diagnostics. The only build note remains the existing non-fatal lazy Three.js chunk warning.
- [ ] Real-device WebKit/Firefox, forced context loss and deployed Cloudflare visual/performance checks remain outside this environment.

## Package 6.8 visual-studio usability and physical-detail pass — 2026-09-23
- [x] All 22 tool studios share localized front/profile/studio camera presets and an accessible expanded inspection view; existing 3D/engineering-2D tabs remain.
- [x] Measurement values live in a persistent rail below the 3D canvas so the product remains visible through rotation and camera changes. Projection guides hide only when their span is misleadingly collapsed.
- [x] Tire comparison framing is closer; sidewall microtexture affects the actual tire body, and native wheel scenes gain a vented brake disc and caliper. Offset and instrument materials use restrained metal/rubber finishes.
- [x] Canvas fallback gains bounded two-finger pinch and a low-power DPR cap. The Three renderer sizes from the canvas bounds, preserving round wheels when the measurement rail changes the stage aspect.
- [x] No dependency, canonical math, fuel JSON/history, route, localization catalog, or Wrangler/Cloudflare config change.
- [ ] Physical mobile touch, WebKit/Firefox, forced context loss, accessibility assistive-technology review and deployed GPU/performance checks remain launch gates. Schematic tool scenes are still explanatory, not photoreal physical replicas.

## Traffic foundation audit + sourced tire-reference expansion — 2026-09-25
- [x] Full static inventory and rendered-output SEO audit completed before the change: 413 source/project files across 139 directories, 237 indexable URLs, no orphan pages, no broken internal targets, no sitemap gaps, and reciprocal published hreflang sets.
- [x] The existing production tire reference is now the source for tire-size entity generation instead of being limited to availability checks; documented vehicle-only OEM sizes are merged without duplication.
- [x] Tire-size entity coverage expands from 20 to 582 sourced sizes in EN/DE/ES. Each page retains calculated geometry, proportional cross-section, real near-diameter alternatives, calculator hand-offs, provenance limits and fitment caveats; a missing vehicle relationship is never presented as a compatibility conclusion.
- [x] Earlier 20-size / 96-entity-URL checkpoints remain historical records and are superseded by 582 tire entities and 1,782 tire/PCD entity URLs for this implementation state.
- [ ] Search Console indexation and query performance, deployed Core Web Vitals, the existing 855 KB minified lazy Three.js chunk, and the 272 KB shared CSS asset remain separate measured follow-up work.

## Performance, fit-check layout and durable data checkpoint — 2026-09-25
- [x] Visual studios now open on their lightweight engineering 2D view. The existing interactive 3D product remains available on demand, but its Three.js chunk no longer competes with first-page interaction merely because the studio is above the fold.
- [x] The desktop tire fit-check workspace is no longer capped at the old single-tool width; evidence checks use a balanced two-column layout while narrow screens retain one column.
- [x] Fuel history is append-only: an existing day/week is not overwritten and no rolling point limit deletes older observations. Latest snapshots remain independently replaceable.
- [x] A repository-level data vault documents revision/provenance contracts for vehicle fitment and fuel observations, with JSON schemas and a D1/R2 growth path. The current small static projections remain in `src/data` until a reviewed migration is needed.
- [x] Primary blue and light-theme muted text were darkened to meet normal-text contrast without changing the established navy/blue/orange brand language.
- [ ] Deployed Core Web Vitals, physical-device GPU behavior, the shared CSS payload and production D1/R2 provisioning remain measured infrastructure follow-ups.

## Visual truthfulness cleanup checkpoint — 2026-09-25
- [x] The Package 6.2–6.3 universal “3D + Engineering 2D on every tool” rule is superseded. Visuals are now selected by explanatory value, not route-count coverage.
- [x] Fourteen utility, reference and guided-entry routes no longer render the shared schematic Visual Studio. Their existing calculation-specific result cards, fuel/trip breakdowns and guided workspaces remain the primary explanation.
- [x] The generic side illustration is also suppressed on those result-led routes so one calculation is not presented through two competing visual metaphors.
- [x] Spatial and mechanical tools retain their purpose-built tire, wheel, offset, PCD, speed, gearing, compression, EV and fitment visualizations where geometry or state genuinely benefits from a visual model.
- [x] This pass changes presentation only: canonical calculations, validation, routes, SEO copy, localization, fuel/vehicle data and Cloudflare configuration remain unchanged.
- [ ] Remaining retained 2D/3D scenes require a separate page-by-page visual polish and real-device acceptance pass; a scene is not considered valuable merely because it is interactive.

## Complete relevant-visual restoration checkpoint — 2026-09-25
- [x] The removal of the shared visual-studio mount from fourteen result-led tools is superseded: every published calculator again has a related visual surface.
- [x] Those fourteen routes open on their tool-specific Engineering 2D explanation and keep the heavier interactive 3D view optional, preserving the earlier first-paint performance decision.
- [x] Tools with native tire, offset, PCD, speed, gearing, compression, EV or fit-check studios keep those purpose-built visuals; the page shell avoids rendering a redundant side illustration beside a full studio.
- [x] Visual coverage is tested against the complete published `kind: 'tool'` registry so a future tool cannot silently ship without a visual family assignment.

## Tool-specific 2D explainer correction — 2026-09-25
- [x] The seven repeated abstract blueprint families are replaced by fourteen tool-specific 2D explainers.
- [x] Torque, power-to-weight, fuel economy, pressure, power, tire codes, DOT date, towing, quarter-mile, fitment and measurement views now label the relationship they explain.
- [x] Every restored route retains a visual; the correction improves meaning instead of removing coverage.
- [x] Live calculator readouts and optional 3D tabs remain intact.

## Visual-meaning polish group 1 — 2026-09-26
- [x] MPG/L·100 km, hp/kW, Nm/lb-ft and power-to-weight Engineering 2D drawings now carry authoritative converted values inside calculation-specific geometry instead of relying on generic boxes or unlabeled shapes.
- [x] Gear Ratio replaces plain rings with recognizable proportional tire/wheel assemblies and a live installed-axle → effective-axle relationship shared across EN/DE/ES.
- [x] Live value hooks and the shared conversion functions are covered by regression tests; canonical calculation functions remain unchanged.
- [x] Desktop and 390 px Chromium checks show no document overflow or console warning/error. Physical-device, WebKit/Firefox and deployed performance remain separate acceptance gates.

## Rendered-output SEO integrity checkpoint — 2026-09-26
- [x] A repeatable `pnpm audit:seo` release gate now inspects every generated HTML document rather than inferring correctness only from source templates.
- [x] The 1,927-page production output contains 1,923 indexable canonical pages and exactly 1,923 sitemap URLs; the 404 and three embed outputs are intentionally noindex and excluded.
- [x] Unique per-language title/description checks, route-matching canonicals, self/reciprocal hreflang with `x-default`, valid JSON-LD, indexable H1 and robots/sitemap contracts all pass.
- [x] Shared entity metadata and the remaining page-specific outliers were tightened; the build now reports zero titles over 75 characters and zero descriptions over 180 characters.
- [ ] Search Console/Bing submission, Google-selected canonical/index coverage, deployed redirect/404/Open Graph smoke tests and real-user Core Web Vitals remain external launch gates; local technical correctness does not guarantee ranking.

## Atlas Diagnostics visible-product checkpoint — 2026-09-26
- [x] The earlier domain-only OBD foundation is now connected to a real `/obd-codes/` product surface with code validation, system-family feedback and reviewed-guide routing.
- [x] Sixteen generic guides publish original Atlas meaning, symptoms, possible causes, diagnostic order, limitations, related codes and visible SAE/EPA source context; they do not claim a vehicle-specific diagnosis.
- [x] Diagnostics is discoverable from the homepage, desktop navigation, drawer and footer, and every published guide is projected into the sitemap with TechArticle structured data.
- [x] Catalog and sitemap regression tests, 352-file Astro check, 1,944-page production build and the 1,940-URL rendered SEO audit pass with zero metadata-length advisories.
- [ ] Expand toward broad high-intent coverage, localized Diagnostics, warning-light and symptom entities. Bulk proprietary imports and vehicle-specific service content still require compatible rights and stronger review.
