# Atlas GarageOS production launch runbook

Do not deploy production until `V3_MASTER_PLAN.md` launch gates are green.

## Deployment contract

- Canonical origin: `https://atlasgarageos.com`
- Canonical host: apex domain. Redirect `www.atlasgarageos.com` permanently to apex while preserving path/query.
- Hosting: Cloudflare Pages connected to Git.
- Production branch: `master` unless the repository is intentionally configured otherwise.
- Build command: `pnpm build`
- Build output: `dist`
- Build environment: Node.js 24+, pnpm 11.19.0.
- Runtime services/bindings: none for the current static calculator product.

Atlas is a static Astro site. Source code is not the deploy artifact; Cloudflare builds the repository and serves `dist`.

## Before connecting production

1. Run the full regression suite on a clean dependency install.
2. Run `pnpm build` from a clean checkout; do not deploy a stale local `dist` folder.
3. Test representative 360, 390, 412, 430 px mobile widths plus tablet/desktop.
4. Verify calculation reference vectors and the visual interpretation for high-value tools.
5. Verify `V3_MASTER_PLAN.md` launch gates, especially canonical/hreflang/localization status.
6. Never publish a planned locale until its complete user journey is translated and QA-passed.

## Cloudflare Pages

1. Connect the Atlas GarageOS Git repository to Cloudflare Pages.
2. Use `pnpm build` and output directory `dist`.
3. Add build variables `NODE_VERSION=24` and `PNPM_VERSION=11.19.0` if the platform does not already select compatible versions from the repository.
4. Add `atlasgarageos.com` as the primary custom domain.
5. Redirect `www` to apex with HTTP 301 and preserve path/query.
6. Use SSL/TLS **Full (strict)** and **Always Use HTTPS**.
7. Confirm project security headers do not block any intentionally enabled analytics or social-preview assets.

## Production smoke test

Verify all of the following over HTTPS:

- `/` redirects once to `/en/`.
- `/en/` loads the mobile-first home.
- `/en/tools/` lists every implemented normal tool from the registry.
- `/en/fitment-studio/` loads the advanced Wheel & Tire Compare page.
- `/en/methodology/` loads Accuracy & Methodology.
- Every indexable URL from `/sitemap.xml` returns HTTP 200.
- A nonexistent route returns HTTP 404 with the branded page.
- `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, manifest, and `/_astro/` assets load correctly.
- Shareable Tire Comparison and Wheel Offset query URLs restore their input state while canonical remains the clean page URL.
- No unfinished `/de/`, `/es/`, `/pt-br/`, or `/fr/` URL is linked/indexable before localization QA.

## Analytics

Enable analytics before launch so acquisition decisions are based on real data.

Minimum events/dimensions to verify:
- page views by landing page, country, device and referrer;
- calculator usage by tool id;
- share-link actions;
- outbound methodology/source links where useful.

If Cloudflare Web Analytics is enabled, verify the production Content-Security-Policy allows its script endpoint before declaring the setup complete.

## Google Search Console

1. Add a Domain property for `atlasgarageos.com` and verify with DNS.
2. Submit `https://atlasgarageos.com/sitemap.xml`.
3. Inspect Home, Tire Size Calculator, Tire Size Comparison, Wheel Offset Calculator, Fuel Cost Calculator, Road Trip Cost Calculator, EV Charging Cost Calculator and Wheel & Tire Compare first.
4. Confirm declared and Google-selected canonicals match.
5. Check Page indexing for blocked, duplicate, crawled-not-indexed, and soft-404 groups.
6. Monitor search queries by page and country. Use this data to decide which tool cluster and locale earns the next investment.
7. Monitor Core Web Vitals on mobile first.

## Bing / IndexNow

1. Add the site to Bing Webmaster Tools; import from Search Console where appropriate.
2. Submit the sitemap.
3. Configure IndexNow only after the deployment path is finalized and verify it submits changed/new public URLs rather than draft or parameter-state URLs.

## Localization launch rule

For each new locale, QA the entire route family before adding it to hreflang or the sitemap:
- navigation and language selector;
- localized slug/search intent;
- title/meta/H1/content;
- form labels and validation;
- result labels and live visual labels;
- Quick Facts / Common Mistake / warnings;
- methodology and source language;
- structured data;
- internal links;
- self-canonical and reciprocal hreflang.

Never use forced IP-based redirects.
