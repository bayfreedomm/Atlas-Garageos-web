# V4.10 — Road Trip Cost Calculator

- The total journey cost is the primary result. Fuel used/cost, one-way or round-trip distance, and a per-person split when sharing sit beside it.
- Inputs update the result, interpretation, route schematic, and proportional fuel/extras cost bar immediately. Invalid input clears stale results and shows validation errors.
- The existing domain model remains authoritative: the entered distance is one way; round trip doubles driving distance; extras are added once; cost per person divides the complete total. No core/domain calculation files changed.
- The route is explicitly schematic, not a map or distance scale. Cost segments are proportional to the calculated total.
- The page follows answer → meaning → visual → details/method → common mistake → related tools. Garage-first branding, homepage direction, light-theme contrast, and root-English routes remain intact.

## Verification

- `pnpm test`: 106 passed (including return-trip/extra-cost regression).
- `pnpm typecheck`: 0 errors, 0 warnings.
- `pnpm build`: 21 static pages generated. No `/en/` page generated; legacy `/en/` redirects remain one-step 301 rules.
- Live Cloudflare HTTP responses and mobile visual inspection require a deployed/browser QA pass.
