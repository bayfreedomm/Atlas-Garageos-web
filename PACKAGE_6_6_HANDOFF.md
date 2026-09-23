# Atlas GarageOS Package 6.6 — Physically Lit Product Render

Sole source of truth: `Atlas-GarageOS-package-6-5-Shareable-Decision-State-FULL.zip`. This archive is a complete replacement project with `Atlas-GarageOS/` as its root.

## Visible 3D changes

- Three.js now prefilters the procedural studio environment with PMREM before assigning it to the scene. Metal and clearcoat surfaces therefore show broad, controlled reflections instead of a flat single-color response.
- Lighting uses a quieter ambient/hemisphere base, stronger directional key and rim separation, and a restrained front fill. The key shadow map is high-resolution PCF, compatible with the current Three.js release.
- Tire sidewalls use a deterministic fine-grain/radial bump texture in addition to the existing tread relief, making rubber read as a manufactured surface at oblique angles.
- Instrument geometry retains its layered, beveled construction while the blue/orange state materials lose the excessive emissive glow that made them look like toy plastic.

## Preserved contracts

Canonical tire/offset/PCD math; fuel JSON/history and workflows; routes, SEO entities and EN/DE/ES localization; Wrangler/Cloudflare; lazy Three.js, Canvas fallback, touch/reduced-motion, DPR caps and disposal; Package 6.5 shareable URL state.

## Verification

- `pnpm typecheck`: 310 files, 0 errors/warnings/hints.
- `pnpm test`: 36 files, 240 tests passed.
- `pnpm build`: 230 static pages built successfully.
- Existing non-fatal Vite warning about the lazy Three.js chunk remains.

Physical-device pinch, WebKit/Firefox, forced context loss and deployed behavior remain separate acceptance checks.
