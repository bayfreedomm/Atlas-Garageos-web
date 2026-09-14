# Atlas GarageOS V4.1 implementation notes

This iteration locks the visual contract discussed after the first live V4 mobile review.

## Implemented
- Day / Night / Auto color-mode system.
- Visible one-tap sun/moon theme toggle in the primary header.
- Drawer display selector renamed to Auto / Day / Night.
- Light theme: clean warm-white surfaces with Atlas blue primary actions and orange technical accents.
- Night theme: graphite/navy surfaces rather than pure black; meaning colors remain unchanged.
- Home mobile hero shortened so categories/tools appear earlier.
- Standard tool pages are explicitly input-first: calculator workspace before explanatory visual.
- Mobile tool titles and Fitment hero reduced in size.
- Wheel & Tire Compare subtitle is hidden in the tight mobile header to prevent brand collision.
- Mobile bottom dock reduced in height and the document receives bottom/scroll padding so final controls cannot be trapped beneath it.
- Existing tire / wheel technical visuals now have explicit light-theme treatments as well as their dark treatment.
- Cloudflare pnpm 11 warning source removed from package.json; pnpm-workspace.yaml remains the build-policy source.

## Preserved
- Calculation/domain engines.
- Shareable result URLs.
- Quick Facts, Common Mistake and Important Warning content.
- Tire Comparison true-scale/front-width/difference-lens model.
- Wheel Offset fixed hub-plane cutaway model.
- SEO/canonical/schema structure from V4.0.1.

## Still not claimed complete
- Full EN/DE/ES/PT-BR/FR localized pages.
- Analytics/Search Console/Bing/IndexNow launch wiring.
- Bespoke advanced technical scene for every calculator.
- Final Cloudflare Node 24 `astro check && astro build` verification for this exact archive.
