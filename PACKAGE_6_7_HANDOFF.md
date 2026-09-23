# Atlas GarageOS Package 6.7 — Cross-Audit Correction

Sole source of truth: `Atlas-GarageOS-package-6-6-Physically-Lit-3D-FULL.zip`. This archive is a complete replacement project with `Atlas-GarageOS/` as its root.

## Audit performed

- Verified the 22-tool 3D coverage contract and native-vs-Canvas fallback expectations through the complete test suite.
- Checked EN/DE/ES visual catalog entries and the generated tool route set.
- Scanned 229 generated HTML artifacts; all 66 localized tool pages contained the expected calculator/visual signals.
- Scanned production source/tests for TODO/FIXME, ignored TypeScript diagnostics, unsafe `any` escapes and error logging markers; none were found.
- Rebuilt after the physically lit render changes and confirmed the static output remains 230 pages.

## Correction included

The physically lit renderer now chooses a 1024px PCF shadow map on hardware with four or fewer logical cores and 1536px otherwise. The product-render lighting, PMREM reflections, tire sidewall bump detail and restrained state materials from Package 6.6 remain intact.

## Gates

- `pnpm test`: 36 files, 240 tests passed.
- `pnpm typecheck`: 310 files, 0 errors/warnings/hints.
- `pnpm build`: 230 pages built successfully.
- Existing non-fatal Vite warning: the lazy Three.js chunk is above the default 500 kB suggestion threshold.

Physical-device, WebKit/Firefox, forced context-loss and deployed visual/performance acceptance are still required before calling the 3D pass fully launch-verified.
