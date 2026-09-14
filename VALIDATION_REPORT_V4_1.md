# V4.1 validation report

Local source-level validation completed in the available environment:

- Theme TypeScript (`theme-controller.ts`, `theme-preference.ts`) type-checked with TypeScript 5.8 using ES2022 + DOM + DOM.Iterable: PASS.
- `global.css`: tinycss2 parse errors: 0.
- `product-v3.css`: tinycss2 parse errors: 0.
- `product-v4.css`: tinycss2 parse errors: 0.
- `package.json`: valid JSON.
- ThemeQuickToggle component wiring present in SiteLayout and Fitment page.
- Day/Night labels present in ThemeControl.
- Mobile bottom content padding present.
- Input-first tool ordering rule present.

Full project `astro check && astro build` cannot be executed in this container because the project requires Node >=24 / pnpm 11 and this runtime has Node 22 with no registry access. Cloudflare's clean Node 24 build remains the release gate.
