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

## Garage and storage ownership

`GarageState` is schema-versioned and supports multiple `VehicleProfile` records and multiple named `SavedSetup` records per vehicle. Each setup references its vehicle by id and has creation/update metadata. Referential integrity and duplicate identifiers are checked by domain factories.

`GarageRepository` is the only persistence boundary. `LocalStorageGarageRepository` owns all browser-storage calls; feature and UI modules only call repository methods. `InMemoryGarageRepository` supports deterministic tests. Serialized values are parsed as unknown and reconstructed through tire, wheel, setup, profile, and garage validators. Corrupt, invalid, missing, older-without-a-migration, or future schemas return a safe empty garage plus an explicit recovery status. `garageMigrations` is the extension point for future stepwise migrations.

## Growth seams

`VehicleProfile` is the shared My Garage identity used by future tools. `VehicleEvent` is a discriminated, extensible base for a later Car Timeline without implementing timeline behavior now. Storage is accessed through repository ports and browser-specific implementations live only in `src/storage`.
