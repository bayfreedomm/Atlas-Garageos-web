# Atlas GarageOS V5.0 FINAL STABLE validation

Scope: one stabilization only. No new feature work.

## Changed
- Removed the fixed mobile bottom dock from the shared SiteLayout and Fitment Studio.
- Removed the obsolete dock component and dock behavior module.
- Removed mobile body/footer spacing that existed only to reserve room for the fixed dock.
- Kept the existing header, hamburger navigation, breadcrumbs / “All tools” links, theme system, calculators, SEO routing, redirects, and visual design unchanged.

## Why
The fixed dock was covering calculator content on iPhone/Safari. The site already has a mobile hamburger navigation and tool-return links, so the dock was redundant and was the source of the overlap regression.

## Static validation
- No `MobileDock` imports or rendered `<MobileDock>` usages remain under `src/`.
- No calculation files under `src/core` or `src/domain` were edited by this stabilization.
- English root URL architecture and `/en/...` redirect files were not edited.

## Environment limitation
The project requires Node >=24 and pnpm 11.19.0. This container currently has Node 22 and no pnpm, so the full Astro build/test suite was not rerun here.
