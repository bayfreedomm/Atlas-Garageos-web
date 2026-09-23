# Atlas GarageOS Package 6.3 — Unified Visual Studio

Source of truth: `Atlas-GarageOS-package-6-2-Complete-3D-Fuel-FULL.zip` only. This archive is a complete replacement project, not a patch. Its top-level folder is `Atlas-GarageOS/`.

## What changed

- All 22 tool calculators now present 3D Studio and Engineering 2D as modes of one visual workspace. Tire Comparison, Wheel Offset and PCD retain their established geometry and canonical models.
- The five former standalone 3D tools (Tire Size, Speedometer, Gear Ratio, Compression Ratio, EV Charging) now have matching 2D modes. Existing live Tire Size, Gear Ratio and EV technical diagrams were retained and moved into those tabs; Speedometer and Compression Ratio gained engineering section diagrams. Fitment Studio also has a tabbed engineering view.
- The 14 Package 6.2 scene tools now use a shared tabbed workspace with category-specific technical drawings. Fuel and Road Trip's existing live breakdowns are inside the 2D tab.
- Tire load/date and measurement/fitment scenes reuse the existing native tire product. Fuel, journey, power-to-weight and towing scenes no longer include the small toy-like vehicle module. Vehicle lookup lug geometry is derived from the selected documented record rather than a fixed five-hole illustration.
- On narrow screens the 3D HUD is below the canvas, preserving readable measurements without covering the geometry. Tire Comparison defaults to overlay on narrow screens while preserving the side-by-side control. The numeric HUD remains visible when the camera rotates.
- The new explanatory details and 2D headings have EN/DE/ES copy. Keyboard arrow/Home/End navigation is supported on the newly added tab groups.

## Preserved

Canonical tire, offset and PCD calculations; all fuel provider data/history/workflows; Wrangler/Cloudflare configuration; routes and SEO entity counts; existing localization; Three.js lazy loading and Canvas fallback; reduced-motion and rendering safeguards. No new dependency.

## Verification

Run `pnpm install --offline --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before shipping. Browser-check representative desktop and 390px mobile screens, including a rotated tire with persistent numeric metrics and EN/DE/ES tabs. Physical touch pinch, WebKit/Firefox, forced WebGL context loss, live Cloudflare deployment and live GitHub workflow behavior remain unverified and are separate deployment acceptance gates.
