# Production launch runbook

## Deployment contract

- Canonical origin: `https://atlasgarageos.com`
- Canonical host: apex domain; `www.atlasgarageos.com` redirects permanently to the apex host.
- Hosting type: Cloudflare Pages connected to the Git repository.
- Production branch: `master`
- Build command: `pnpm build`
- Build output directory: `dist`
- Build environment variables: `NODE_VERSION=24` and `PNPM_VERSION=11.19.0`.
- Runtime environment variables: none.
- Runtime services or bindings: none.
- Node compatibility: Node.js 24 or later, matching `package.json`.

The application is a static Astro build. Root-relative `/_astro/` assets are intended to be served over HTTP(S); do not add a `file://` base-path workaround.

## Cloudflare dashboard steps

Prerequisite: this local repository currently has no GitHub or GitLab remote. Without using a terminal, open GitHub Desktop, choose **File → Add Local Repository**, select the Atlas GarageOS folder, then choose **Publish repository**. Confirm that commit `milestone-7-production-launch-readiness` appears on the hosted `master` branch before continuing.

1. Open **Workers & Pages**, choose **Create application**, then **Pages** and **Connect to Git**.
2. Select the Atlas GarageOS repository and use `master` as the production branch.
3. Choose the Astro framework preset if offered. Set the build command to `pnpm build` and the output directory to `dist`.
4. Under build environment variables, add `NODE_VERSION` with value `24` and `PNPM_VERSION` with value `11.19.0`. These pin the versions required by `package.json`; do not add runtime secrets or application variables.
5. Deploy the project. In **Custom domains**, add `atlasgarageos.com` as the primary domain.
6. In **Bulk Redirects**, create a list entry from `www.atlasgarageos.com` to `https://atlasgarageos.com` with status `301`, **Preserve query string**, **Subpath matching**, **Preserve path suffix**, and **Include subdomains** enabled. Create a Bulk Redirect Rule using that list. In DNS, ensure `www` has a proxied record; Cloudflare's documented placeholder is an `A` record to `192.0.2.1`. Keep the apex domain as the only canonical host.
7. In **SSL/TLS**, use **Full (strict)**. Keep **Always Use HTTPS** enabled. Do not enable HSTS preload from the dashboard; the project sends a one-year HSTS header without the preload directive.
8. After deployment, verify `/`, `/en/fitment-studio/`, all six `/en/tools/` routes, `/404-test`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, and `/_astro/` assets. Confirm that `/404-test` returns HTTP 404 and the branded page, while `/` redirects once to `/en/fitment-studio/`.

The repository's `public/_headers` supplies production security and caching headers. `public/_redirects` supplies the root locale redirect. The `www` redirect belongs at the zone level so it also covers requests before Pages route handling.

## Google Search Console checklist

1. Add a **Domain property** for `atlasgarageos.com` and complete DNS verification.
2. Submit `https://atlasgarageos.com/sitemap.xml` under **Sitemaps**.
3. Use **URL Inspection** first for the Fitment Studio, Tire Size Calculator, Tire Size Comparison, and Wheel Offset Calculator URLs. Confirm the declared and Google-selected canonicals match.
4. Inspect the remaining three tool URLs, then confirm the root redirect is not indexed and a test 404 is excluded.
5. Check **Page indexing** for blocked, duplicate, crawled-not-indexed, and soft-404 groups after Google has crawled the site.
6. Monitor **Core Web Vitals** by mobile and desktop after field data becomes available. No analytics or tracking script is required for Search Console readiness.
