# Architecture

## Dependency direction

`ui / Astro -> features -> domain + core`

`storage -> domain` and `seo / localization -> domain identifiers only`

The arrows never point back toward Astro or the browser. `core` contains deterministic calculations and validation with no side effects. `domain` holds durable product concepts. `features` composes use cases. Adapters own external state.

## Canonical units and signs

All length calculations use millimetres internally. Inches are converted at the boundary using exactly `25.4 mm/in`. Distance conversion uses `1 mile = 1.609344 km`.

- Diameter difference: `new - current`.
- Ride-height difference: half the diameter difference.
- Inner-position change: positive means the inner wheel edge moves farther inward, reducing geometric inner clearance.
- Outer-poke change: positive means the outer wheel edge moves farther outward.
- Speedometer difference: percentage change in actual speed at the same wheel rotational speed; a larger new tire is positive.

These are geometric comparisons only. No safety, rubbing, legality, load, pressure, suspension, brake, or body-clearance conclusion is implied.

## Validation

Domain factories are the only supported construction path for tires, wheels, and setups. Plausibility bounds reject corrupt or nonsensical inputs early; they are not safe-fitment thresholds. Errors include a stable code, field, and readable message. Share and storage adapters must pass untrusted values through the same factories.

## URLs and SEO

Indexable content uses stable, curated route metadata from `src/seo`. Calculator state is a separate, versioned payload owned by `features/share`; it must not create arbitrary indexable URL combinations. Shared state uses `#setup=<encoded-v1-payload>`. A fragment is not sent to the server and therefore does not alter the canonical pathname or create a server-visible SEO route. The canonical URL remains the clean route without the fragment. A share decoder treats every field as untrusted and returns validation errors instead of partial domain objects.

V1 links emitted from Milestone 2 use compact numeric tuples, but the decoder also accepts the verbose V1 shape emitted by Milestone 1. A decoded shared workspace is transient: opening it never writes to storage. Only the explicit “Save shared setup” action may persist its proposed setup.

## Locale routes and tool registry

English indexable experiences live below `/en/`. The root is a non-indexable locale entry that redirects to `/en/`; it is the `x-default` alternate, not a duplicate content page. Language remains a path concern while unit system and currency remain independent preferences.

`src/seo/tool-registry.ts` is the single source for implemented tool identity, locale slug, route kind, metadata, category, indexability, and related-tool edges. Canonicals and the XML sitemap are derived from this registry, so application fragments, queries, unfinished roadmap tools, and the root redirect cannot enter the indexable route set accidentally. Tool relationships are intentional task continuations, not a sitewide keyword list.

Tool pages share `SiteLayout.astro` and `ToolPage.astro`. Each page supplies unique metadata, one H1, working utility or a controlled entry into the relevant flagship flow, original explanatory content, limitations, contextual related links, and a Fitment Studio continuation. Visible breadcrumbs are paired with factual `BreadcrumbList` data; the shared shell emits factual `WebSite` data. No calculator, FAQ, rating, product, or offer schema is invented.

## Traffic-first utility calculation boundary

Small automotive utilities follow `ui -> features/tools -> domain + core/units`. Domain factories validate finite positive or non-negative quantities before core functions receive them. `core/units/automotive.ts` contains deterministic fuel, trip, pressure, economy, power, torque, and power-to-weight calculations without display rounding or browser concerns. Feature functions translate untrusted form numbers into validated branded quantities; UI modules own currency labels, human-readable summaries, and rounding.

Fuel tools keep metric and US inputs explicit. Currency remains an independent display label and no exchange-rate behavior is implied. Fuel economy distinguishes US and Imperial gallons. Power uses mechanical horsepower explicitly and never silently aliases PS. Traffic, weather, load, and driving style remain outside the deterministic estimate.

The `SeoPageModel` seam validates deliberate future tire-size, comparison, and vehicle pathnames but creates no routes by itself. A page becomes indexable only after a real implementation is registered and meets the SEO playbook quality threshold.

## Garage and storage ownership

`GarageState` is schema-versioned and supports multiple `VehicleProfile` records and multiple named `SavedSetup` records per vehicle. V2 adds one `VehicleClearanceProfile` per vehicle. Each clearance profile stores a validated baseline setup snapshot, an optional saved-setup reference, user-measured inner/outer clearance, optional user-selected targets, and update metadata. Referential integrity and duplicate identifiers are checked by domain factories.

`GarageRepository` is the only persistence boundary. `LocalStorageGarageRepository` owns all browser-storage calls; feature and UI modules only call repository methods. `InMemoryGarageRepository` supports deterministic tests. Serialized values are parsed as unknown and reconstructed through tire, wheel, setup, clearance-profile, vehicle-profile, and garage validators. Corrupt, invalid, missing, older-without-a-migration, or future schemas return a safe empty garage plus an explicit recovery status. The first real migration upgrades V1 to V2 by preserving vehicles and saved setups and adding an empty `clearanceProfiles` collection. `garageMigrations` remains the stepwise extension point.

## Fitment geometry profile and map

Clearance measurements are explicitly `source: userMeasured`; they are not OEM specifications. A profile belongs to a garage vehicle and snapshots the exact baseline setup used when the measurements were taken.

Wheel position signs remain the same as Milestone 1: positive inner change means the candidate moves farther inward; positive outer-poke change means it moves farther outward. Projection uses:

- `projected inner clearance = measured inner clearance - inner position change`
- `projected outer clearance = measured outer clearance - outer poke change`

Map states are geometry-only:

- Green: no projected overlap and every supplied user target is met. With no targets, green means only that projected clearances are non-negative; no extra margin is invented.
- Yellow: both projected clearances are non-negative, but at least one supplied target is missed.
- Red: at least one projected clearance is negative, indicating calculated geometric overlap from the supplied measurements.

Green never means road-safe, and yellow is not a danger verdict. The map models wheel width/offset geometry. Tire sidewall bulge, tire manufacturer/model variation, stretch, suspension travel, alignment, body shape, brake and legal constraints are not modeled because no reliable source data exists in this milestone.

Nearest-green ranking uses Manhattan distance measured in the map's own grid steps: `|width difference| / width step + |offset difference| / offset step`. Deterministic tie-breakers prefer unchanged width, then unchanged offset, then ascending width and offset. There are no hidden weights.

## What Fits search

`core/fitment/search` is a pure TypeScript query engine over the Fitment Map. It constructs the requested width/offset grid through `createFitmentMap`, then ranks the non-red cells; it does not maintain a second copy of wheel-position or clearance geometry. Red cells are counted as rejected geometric overlaps and never appear as recommendations. Green and yellow keep exactly the map meanings above, so a recommendation remains a transparent geometric result rather than a safety verdict.

Every ranking mode is explicit in the input and produces structured explanation data for the UI:

- `nearestToCandidate`: `|width - target width| / width step + |offset - target offset| / offset step`.
- `maximizeClearance`: maximize `min(projected inner clearance, projected outer clearance)`.
- `minimizeGeometryChange`: minimize `|inner position change| + |outer-poke change|` relative to the measured baseline.
- `targetOuterClearance`: minimize `|projected outer clearance - requested outer clearance|`.

Equal scores use one shared deterministic order: smallest absolute width change from the baseline, smallest absolute offset change, ascending width, then ascending offset. Search ranges are validated and capped before expansion, and the result count is capped, keeping the browser workload bounded and predictable. There are no implicit mode switches, safety margins, or hidden weights.

The UI treats search results as transient. Inspecting or loading a candidate changes only the current comparison workspace. Persistence still occurs solely through the user's explicit Garage save action and the existing repository boundary; Milestone 4 does not change the Garage schema.

## Tire candidate foundation and combined seam

`core/tire/search` enumerates validated tire sizes for a requested rim diameter and orders them by absolute diameter difference from a baseline tire. It reports diameter, circumference, sidewall, and speedometer differences by calling the existing tire geometry functions. An absolute diameter-percentage limit is applied only when the caller supplies one; the core invents no compatibility or safety threshold.

`core/fitment/combined-candidate` defines the shared result contract for a wheel recommendation and a tire-size candidate. It introduces no new geometry; the bounded orchestration described below composes the independent engines through this typed seam.

## Guided measurement and FitmentGoal

`features/fitment-explorer` is the boundary between untrusted UI fields and the combined core. It requires both inner and outer measurements, constructs the baseline through the existing domain factories, preserves measurement source as `userMeasured`, validates optional targets, and only then creates a combined-search request. Without both measurements, projected clearance and combined exploration do not run. Empty optional targets remain `null`; no default margin is substituted.

`FitmentGoal` expresses user intent without presenting a safety verdict or relying on style presets. Its mapping to wheel ranking is explicit:

- `closestToCurrent` → minimize absolute inner-position change plus absolute outer-poke change.
- `moreOuterPresence` → maximize outer-poke change among non-red wheel candidates.
- `moreInnerClearance` → maximize projected inner clearance.
- `balancedClearance` → maximize the smaller of projected inner and projected outer clearance.
- `targetOuterClearance` → minimize absolute distance from the user's required outer-clearance target; the target is mandatory for this goal.

Future labels such as “stock-like” or “flush” may map to this API only when their numeric parameters are exposed. They must not introduce hidden thresholds.

## Bounded combined wheel and tire search

`core/fitment/combined-search` composes the existing What Fits and tire candidate engines. Wheel geometry still comes only from the Fitment Map path; tire metrics still come only from the tire geometry path. Each tire and wheel is reconstructed as one validated `VehicleSetup`, which enforces matching rim diameters.

Preflight counts the raw Cartesian space before either engine enumerates candidates. The exported `COMBINED_SEARCH_LIMITS` configuration permits at most 100 wheel candidates, 500 tire candidates, 25,000 combined candidates, and 100 returned results. These are synchronous browser-performance guards, not fitment or safety rules. An oversized request returns a structured range error asking the caller to narrow its ranges. A Web Worker remains unnecessary while supported searches stay within this measured, explicit bound.

RED wheel-overlap candidates are counted and excluded before wheel/tire composition. Optional diameter constraints are applied only when supplied. The candidate result contains the validated setup, complete wheel-clearance geometry, complete tire deltas, geometric state, ordered criteria, evaluated explicit constraints, and lightweight provenance.

Combined ordering is lexicographic rather than a weighted score:

- `closestToCurrent`: geometry change, absolute tire-diameter percentage, deterministic tie-breaks.
- `moreOuterPresence`: outer presence descending, tire-diameter percentage, geometry change, deterministic tie-breaks.
- `moreInnerClearance`: projected inner clearance descending, tire-diameter percentage, geometry change, deterministic tie-breaks.
- `balancedClearance`: minimum projected clearance descending, tire-diameter percentage, geometry change, deterministic tie-breaks.
- `targetOuterClearance`: absolute distance from the explicit outer target, tire-diameter percentage, geometry change, deterministic tie-breaks.

Final ties use absolute baseline wheel-width difference, absolute baseline offset difference, ascending width, ascending offset, absolute baseline tire-width difference, absolute baseline aspect-ratio difference, ascending tire width, then ascending aspect ratio.

## UI state and provenance

The guided development flow is organized as current setup, inner measurement, outer measurement, optional targets, review, goal/ranges, search, inspect, compare, explicit Garage save, and share. Fitment Map remains an advanced presentation over the same independent data model. UI controllers render cards or tables from core results; neither representation is encoded in core APIs, so a mobile-first production layout can replace them without changing calculations.

Result provenance is intentionally small and extensible: physical gaps are `USER MEASURED`, optional constraints are `USER TARGET`, and projections plus tire/wheel deltas are `CALCULATED`. The vocabulary already allows later official, community, and estimate sources without building a heavy provenance framework now.

Combined search state and inspected candidates are transient. Vehicle selection updates only `activeVehicleId`; clearance profiles and explicitly saved setups remain keyed to that vehicle. Garage lists are filtered to the active vehicle, and saving a recommendation uses the active vehicle through `GarageService`. No schema migration is required.

## Product shell and presentation boundary

The Milestone 6 product shell is a static Astro page enhanced by the existing TypeScript controller. `src/ui/presentation-model.ts` owns testable navigation, wizard-progress, result-card, map-cell accessibility, and active-Garage view models. It may format already-calculated values for display, but it cannot calculate fitment or reinterpret domain state. Responsive layout, badges, sticky mobile actions, the bottom navigation, and the diameter illustration live in CSS and semantic HTML.

The diameter illustration is deliberately schematic: its line lengths scale only from the canonical overall-diameter results and it makes no clearance claim. Map and result status is always expressed with text and symbols as well as color. GREEN retains its geometry-only meaning and is never presented as a safety verdict.

The built stylesheet uses Astro's root-relative hashed asset URL under `/_astro/`. That URL is correct for an HTTP deployment and production preview. Opening `dist/index.html` directly through `file://` cannot resolve the site-root URL and is not a supported production serving mode; the production base configuration must not be changed to disguise that local-file limitation.

## Growth seams

`VehicleProfile` is the shared My Garage identity used by future tools. `VehicleEvent` is a discriminated, extensible base for a later Car Timeline without implementing timeline behavior now. Storage is accessed through repository ports and browser-specific implementations live only in `src/storage`.

Future OEM and commerce data belongs behind a dedicated data/provider boundary outside `core`: provider adapters may resolve sourced `Vehicle`, `TireSize`, `WheelSpec`, `TireBrand`, `TireModel`, `Product`, and `RetailerOffer` records into validated domain-facing contracts. Source, market, license, freshness, and commercial relationship metadata must travel with those records. Core calculations continue to receive only validated numeric domain values and never import catalogs, providers, network clients, or SEO models.
