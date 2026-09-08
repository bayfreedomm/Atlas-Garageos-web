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

Indexable content uses stable, curated route metadata from `src/seo`. Calculator state is a separate, versioned payload owned by `features/share`; it must not create arbitrary indexable URL combinations. A share decoder treats every field as untrusted and returns validation errors instead of partial domain objects.

## Growth seams

`VehicleProfile` is the shared My Garage identity used by future tools. `VehicleEvent` is a discriminated, extensible base for a later Car Timeline without implementing timeline behavior now. Storage is accessed through repository ports and browser-specific implementations live only in `src/storage`.
