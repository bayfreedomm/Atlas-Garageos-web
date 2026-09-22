# Atlas GarageOS — Package 5 Parametric 3D v1

## Scope
Dependency-free parametric 3D enhancement for the existing tire comparison, wheel-offset and PCD experiences. No new routes, no new runtime dependency, no fuel/deploy changes.

## Architecture
- Lazy-loaded Canvas 2D projected 3D renderer with procedural meshes.
- Event-driven rendering only; no continuous animation loop.
- Device pixel ratio capped at 1.75.
- Pointer/touch rotation plus zoom buttons/wheel and reset.
- Existing numeric/2D answer remains primary and accessible.
- EN/DE/ES labels are centralized in `src/localization/visualization-3d.ts`.

## Data / calculation sources
- Tire geometry consumes the existing `compareTireSizesTool` canonical calculation path.
- Wheel offset consumes the existing `calculateWheelOffsetTool` / `compareWheelPosition` path.
- PCD uses `bolt-pattern-geometry.ts`; `lugPositions` was moved into that dependency-free geometry module and remains re-exported from the catalog.
- The bolt calculator now uses a canonical inverse helper `pcdFromAdjacentHoleSpacingMm` instead of repeating the formula inline.

## Verification performed in this environment
- Strict TypeScript check passed for all changed/new `.ts` implementation files using `tsc` with strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes.
- Standalone runtime checks passed for tire, offset and PCD model outputs.
- Procedural scene builders produced finite non-empty meshes for tire side-by-side, tire overlay, offset and PCD scenes.
- Catalog compilation confirms 30 vehicles / 20 tire entities / 10 PCD entities / 0 excluded entries.
- No page route files added or removed; the 230-page static baseline should therefore remain unchanged when the normal Astro build runs.
- `package.json`, `wrangler.jsonc`, fuel workflows and the two mutable fuel JSON files were not changed in this implementation tree.

## Environment limitation
The sandbox cannot reach npm and does not have the project's Node 24 + pnpm 11 dependency tree installed, so the full `pnpm test` / `pnpm run build` gate could not be executed here. The implementation deliberately adds no npm dependency to avoid reopening the Cloudflare supply-chain issue.
