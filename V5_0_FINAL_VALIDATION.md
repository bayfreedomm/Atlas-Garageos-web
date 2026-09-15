# AtlasGarageOS V5.0 FINAL — stabilization validation

## Scope
Final stabilization only. No new product features and no calculation-model changes.

## Changes from V5.0 RC2
- Home page no longer renders the fixed mobile bottom dock. The header/hamburger and hero actions remain the navigation paths on Home.
- Inner-page mobile dock is static/fixed with three equal columns (Home / Tools / Compare). Scroll-driven hide/show behavior is no longer initialized.
- Home mobile bottom spacing was reduced now that the dock is absent.
- Mobile tool directories are forced to one clean column, with fixed icon/copy/arrow alignment.
- Theme quick-toggle clears touch focus after a tap and has touch-specific hover/active overrides to prevent iOS sticky blue button state.

## Preserved
- V4.9 root-English URL architecture.
- Existing `/en/...` -> root-path 301 redirect map.
- Dark theme visual treatment.
- Light-theme semantic contrast tokens.
- All `src/core` and `src/domain` calculation files are byte-for-byte unchanged from RC2.

## Validation performed in this environment
- Compared FINAL against RC2: only `SiteLayout.astro`, `MobileDock.astro`, `theme-controller.ts`, and `product-v4.css` changed before adding this report.
- Standalone TypeScript check for `theme-controller.ts` + `theme-preference.ts`: PASS.
- `src/core` and `src/domain` SHA-256 comparison against RC2: PASS, no changes.
- `/en/` source page count: 0.
- Existing 301 redirect map retained in `public/_redirects`.
- CSS braces checked as balanced.

## Environment limitation
A full Astro production build/test was not rerun here because this runtime has Node 22 and no project dependencies installed, while the project declares Node >=24 and pnpm 11.19.0. RC2's calculation code was not modified; this final patch is limited to layout/navigation/theme interaction CSS/TS.
