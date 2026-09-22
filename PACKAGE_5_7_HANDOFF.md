# Package 5.7 — Tire Visual Studio handoff

## Source and scope

This full project is derived only from `Atlas-GarageOS-package-5-6-premium-WebGL-fuel-workflow-FULL.zip`. The completed work in this package is the tire comparison visual proof. Offset and PCD visual upgrades are **not** part of this package.

## Completed tire work

- The tire comparison result now leads into one Visual Studio workspace with `3D Studio` and `Engineering 2D` tabs on EN, DE and ES pages.
- The Three.js tire uses a smooth lathed profile and an indexed tread surface with grooves and restrained texture. The wheel has layered metal, a ten-spoke alternating signature, a five-sided center cap and subtle sidewall ribs.
- Canonical calculator dimensions drive the geometry. The existing Canvas implementation remains the fallback.
- The WebGL viewer remains viewport-lazy. Drag, bounded zoom, two-pointer pinch, reduced motion, DPR cap, context-loss fallback and cleanup remain in place.
- The user reviewed and liked the live tire view, then requested a slightly more original wheel. The final ten-spoke variation was visually checked in the local preview.

## Validation at handoff

- `astro check`: 289 files, 0 errors, 0 warnings, 0 hints.
- `vitest run`: 31 files, 213 tests passed.
- `astro build`: 230 pages built.
- Browser QA for the tire page included desktop and 390px layouts, dark/light modes, side-by-side/overlay, tab switching, live input changes and drag. The final variation was visually inspected in the local preview with no browser error or warning logs.
- A build warning remains for a lazy Three.js chunk over 500 KB. This is not a build failure.
- Physical-device pinch and deployed performance were not measured.

## Next visual gate

1. Upgrade Wheel Offset to native Three.js product geometry. Keep a fixed hub mounting plane and map wheel width/ET directly from the existing `WheelOffset3DModel`. Preserve the current Canvas fallback and the canonical math.
2. Upgrade PCD to a plate with genuine center and lug openings, driven by `Pcd3DModel` lug positions and bore. Preserve existing calculations and fallback.
3. Bring Offset and PCD into the same single Visual Studio pattern when the integration supports it cleanly, including EN/DE/ES text.
4. Inspect all three views on mobile and desktop, dark and light, reduced motion, context loss, interaction and performance. Run install, typecheck, tests and build from the lockfile before the next full ZIP.

Do not call Package 5.7 the completion of the entire 3D visual gate. The subsequent product roadmap starts with Guided Decision Flows only after Offset, PCD and cross-device visual QA are complete.
