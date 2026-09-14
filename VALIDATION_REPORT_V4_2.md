# V4.2 validation report

Validation performed on the V4.2 source package in the available container:

- Runtime TypeScript source (`src/**/*.ts`) type-check using TypeScript 6.0.3 strict project settings: PASS.
- Astro syntax parse using `@astrojs/compiler` 2.13.1: 44 files parsed, 0 parse diagnostics.
- `global.css`: tinycss2 parse errors: 0.
- `product-v3.css`: tinycss2 parse errors: 0.
- `product-v4.css`: tinycss2 parse errors: 0.
- Tire Comparison dynamic JS selectors matched against component data hooks: PASS.
- Wheel Offset dynamic JS selectors matched against component data hooks: PASS.
- V4.2 does not modify calculation/domain formula modules.

Full local `astro check && astro build` is not available in this Linux container because the archived dependency tree came from Windows and contains only the Windows Rolldown native binding. The actual release gate remains Cloudflare's clean Linux Node 24 / pnpm 11 build, which installs the correct platform binding from the lockfile.
