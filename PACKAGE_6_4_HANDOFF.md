# Atlas GarageOS Package 6.4 — Native Instrument Geometry

Sole source of truth: `Atlas-GarageOS-package-6-3-Unified-Visual-Studio-FULL.zip`. This is a complete replacement project, with `Atlas-GarageOS/` as the archive root.

## Visible change from 6.3

- Ten of the newer tool scenes no longer present simple primitive stacks. New native Three.js products have machined layered cases, calibrated marks, precision fasteners, believable materials, and tool-specific silhouettes: pressure, fuel, journey, MPG, horsepower, torque, power-to-weight, towing, quarter-mile and sourced vehicle fitment.
- Compression and EV charging have new native cutaway/modular products. Diameter/stroke and charge-window values drive their visible sections.
- The vehicle lookup's selected record drives physical center/lug through-holes; no unsupported model shows a fabricated five-hole pattern.
- Tire load/date/clearance scenes retain the existing native tire product. The WebGL renderer now also draws auxiliary engineering meshes alongside native products, which had previously been ignored.
- Mobile native scenes receive width-aware camera framing so the geometry is not clipped, with the existing numeric HUD below the canvas.
- Original bounded meshes remain for Canvas fallback. No new dependency, full-car model or speculative safety physics was added.

## Unchanged contracts

Canonical tire, wheel offset and PCD calculations; fuel provider JSON/history/workflows; Wrangler/Cloudflare; routes, SEO entities, localization; lazy Three loading, reduced-motion, touch and renderer disposal.

## Verification

Use offline frozen install, typecheck, tests and build as release gates. Browser-check at least one native scene in desktop and 390px mobile, dark/light mode, input update and sourced four-lug geometry. Physical-device pinch, WebKit/Firefox, forced context loss, deployed performance and live GitHub/Cloudflare behavior require separate deployment/device validation.
