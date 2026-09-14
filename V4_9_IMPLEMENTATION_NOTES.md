# V4.9 default English URL cleanup

- Published English pages now use root URLs (`/`, `/tools/`, `/fitment-studio/`, and the individual tool pages).
- The old `/en/...` pages have one-to-one, single-step 301 rules in `public/_redirects`; the root-to-`/en/` 302 rule is removed.
- Registry URLs, localization's English path helper, navigation, internal links, breadcrumbs, canonicals, hreflang, sitemap, and web manifest now use root URLs. Draft languages remain unpublished.
- `src/core` and domain calculations were not changed.

## Validation

- `pnpm test`: 21 test files and 105 tests passed.
- `pnpm typecheck`: 0 errors, warnings, or hints.
- `pnpm build`: 21 static pages built successfully (20 root English pages plus 404).
- Generated-output audit: all 20 English pages have self-canonical, English and x-default hreflang at their root URL, valid internal links, sitemap entries, and matching direct 301 rules. No `/en/` pages or unfinished locale directories were generated.

The 200/301 behavior is established by Astro's static output plus Cloudflare Pages `_redirects` configuration. It still needs an HTTP smoke check on a Cloudflare Pages deployment; Astro's local preview does not execute Cloudflare redirect rules.
