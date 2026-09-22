# Package 5.8 — Offset and PCD Visual Studio

## Source

Built only from the user-supplied `Atlas-GarageOS-package-5-7-Tire-Visual-Studio-FULL.zip`. This archive is a complete source project, excluding generated `node_modules`, `.astro` and `dist` folders.

## Visual changes

- Wheel Offset uses native Three.js wheel barrels, lips, hub and ten-spoke face. The mounting plane is fixed at scene z = 0; both wheel centers and widths come from the existing canonical `WheelOffset3DModel`. Rim diameter is explicitly illustrative because the calculator has no rim-diameter input.
- PCD uses a bevelled extruded plate with actual through-holes at every canonical lug position and a through-bore. When no bore size is supplied, the visual opening is labelled illustrative.
- EN/DE/ES Offset and PCD calculators each have one result-adjacent 3D Studio / Engineering 2D workspace. Offset's existing cutaway was retained and its static copy localized. PCD's existing live equation appears in the 2D tab. Entity PCD pages retain their standalone 3D panel.
- WebGL scenes no longer construct Canvas fallback meshes on every update. They build them when Canvas is selected, including after WebGL context loss. Shared geometry and material disposal is deduplicated.
- EN/DE/ES engineering callouts use localized labels with the same measured endpoints.
- The Tire design and canonical calculation code remain intact.

## Validation

- `pnpm install --frozen-lockfile`, `pnpm test`, and `pnpm build` (which includes `astro check`) passed before packaging. Final test count: 217 across 31 files; 293 files typechecked with no diagnostics; 230 static pages built.
- Browser review covered EN desktop Offset/PCD and 390px Offset/PCD, tab switching, live ET updates and no mobile horizontal overflow on tested pages.
- Actual physical-device pinch, forced WebGL context loss, WebKit/Firefox and deployed performance remain unmeasured in this local environment. Existing reduced-motion, touch, DPR cap and fallback code paths were preserved and reviewed.
- The Three.js lazy chunk still triggers a size advisory above 500 KB. Main-page loading remains viewport-lazy.

## Next product phase

The visual implementation is ready for user acceptance. After acceptance, begin Guided Decision Flows using Goal → Data → Guide → Tool → Visualization → Decision. Then expand the entity graph and glossary, search distribution, fuel history and sharing, My Garage, and data-backed VIN/TCO/EV/B2B work in that order.
