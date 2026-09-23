# Atlas GarageOS Package 6.5 — Shareable Decision State

Sole source of truth: `Atlas-GarageOS-package-6-4-Native-Instrument-Geometry-FULL.zip`. This archive is a complete replacement project with `Atlas-GarageOS/` as its root.

## What changed

- The shared ToolPage runtime now adds a localized share action to every calculator form that did not already have one.
- A link carries the current tool key and a bounded JSON state of named controls in the URL. No form values are transmitted to a server.
- Shared links restore values and replay calculator events so summaries, diagrams and lazy WebGL studios recalculate on arrival.
- Dependent controls, including vehicle make → model, replay in order and are applied again after option lists are populated.
- Tire Comparison and Wheel Offset keep their existing compact canonical query contracts; Tire Size and Bolt Pattern keep their existing prefill contracts and gain the common share action.

## Preserved contracts

Canonical tire/offset/PCD math; fuel JSON/history and workflows; routes, SEO entity pages and EN/DE/ES localization; Wrangler/Cloudflare; lazy Three.js, Canvas fallback, mobile/touch/reduced-motion and disposal safeguards; existing Fitment Studio share hash.

## Verification

- `pnpm typecheck`: 310 files, 0 errors/warnings/hints.
- `pnpm test`: 36 files, 240 tests passed.
- `pnpm build`: 230 static pages built successfully.
- The only build note is the existing non-fatal Vite chunk-size warning for the lazy Three.js bundle.

Physical-device pinch, WebKit/Firefox, forced context loss, deployed Cloudflare behavior and live share-link testing on the production domain remain deployment acceptance checks.
