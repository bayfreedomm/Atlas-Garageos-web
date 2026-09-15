# AtlasGarageOS V5.0 RC2 Validation

## Scope
Bug-fix only. No new product features.

## Fixed
- Mobile bottom dock no longer auto-reappears 850 ms after downward scrolling.
- Home-page dock starts hidden near the top so it does not cover the `Find a tool` search panel below the hero.
- Dock appears when the user scrolls upward and at the end of the page.
- Dock is explicitly centered on mobile and its three items use a stable flex alignment.
- Theme quick-toggle overrides generic button hover/active styling so iOS touch hover cannot leave the light-theme toggle filled blue.

## Preserved
- V4.9 root-English URL architecture and `/en/...` redirects.
- V5.0 RC1 calculator/domain/core logic.
- Garage-dominant wordmark and V7 photographic homepage hero.
- Dark/light semantic color token system.

## Code impact
- `src/ui/mobile-dock.ts`
- `src/styles/product-v4.css`
- no changes under `src/core/` or `src/domain/`

# RC2
