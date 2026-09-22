# Package 6.0 — Connected decision journeys

Source of truth: Package 5.9 FULL ZIP, extracted directly into a fresh workspace. No other Atlas ZIP, repository or Codex project was used.

## What changed

- Calculator pages in EN/DE/ES now have a prominent, authored next decision with supporting checks. Existing vehicle, tire, PCD and fuel-market entity graphs remain in place.
- Tire Comparison's result-driven guide now has a complete-setup route that carries both tire sizes into Fitment Studio. The existing speedometer, size-inspection and physical-clearance actions remain.
- Tire Size Calculator, Speedometer and Wheel Offset pass validated current values to their next relevant tool. These are visible URL parameters; they are not stored in My Garage.
- Fitment Studio imports bounded tire or wheel parameters, displays an import warning about fields still using example defaults, and separates calculated geometry, user-entered measurements and checks that still require the real vehicle. Existing share links take precedence.
- PCD educational copy was corrected to match its existing adjacent center-to-center lug measurement model.

Canonical tire, offset and PCD calculation code; fuel JSON/history and workflows; Wrangler/Cloudflare configuration; routes and localization coverage; and the dependency graph were preserved. The full Fitment Studio remains an English page, so DE/ES cards label that destination (EN) rather than imply translated pages exist.

## Validation

Frozen-lockfile offline install passed. All 226 unit tests passed; Astro typecheck reported 300 files and zero errors, warnings or hints; the production build generated 230 pages. The build still reports the pre-existing large lazy Three.js chunk advisory. Live browser checks covered EN tire and wheel journeys, EN PCD, DE Wheel Offset, ES PCD and 390px mobile Tire Comparison/Fitment Studio decision panels. No document-level horizontal overflow was found in the sampled mobile pages.

Still unrun: physical-device touch/pinch, forced WebGL context loss, WebKit/Firefox and deployed-network/performance checks. These should be done after deployment; the static local checks do not constitute vehicle fitment approval.
