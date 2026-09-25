# Atlas GarageOS — FR / PT-BR Localization Rollout

Status: `PLANNED` — locale routes remain unpublished until the gates below pass.
Updated: 2026-09-25.

## Decision

French (`fr`) and Brazilian Portuguese (`pt-BR`) are the next language families. The repository already contains locale definitions and localized tool-slug candidates for both, but it does not yet contain complete FR/PT-BR content catalogues.

## Wave order

1. Shared platform shell: language switcher, navigation, footer, 404, privacy, contact, methodology.
2. Homepage and tools hub: title, description, hero, categories, search, cards, empty/error states.
3. Highest-value tools: tire size, tire comparison, fit check, fuel cost, road-trip cost, wheel offset, EV charging, vehicle finder.
4. Remaining calculators and entity pages after copy review and responsive visual QA.

## Publish gates

- Every published route has a complete main body in the target language; no title-only or navigation-only translations.
- SEO title, description, canonical, reciprocal `hreflang`, Open Graph text, breadcrumbs, FAQ, warnings, and related links are localized.
- Units, fuel/market wording, currency labels, and safety/fitment limitations are reviewed for the target locale.
- Language switcher links only to an actually published equivalent route; no dead FR/PT-BR links.
- Static build, route-count, sitemap, canonical, and localization tests pass.
- A native-quality review checks terminology, punctuation, numeric formatting, and mobile layout.

## Not allowed

- Publishing machine-translated pages without review.
- Creating language URLs that only duplicate English body copy.
- Indexing incomplete locale waves.
- Treating additional URLs as a substitute for useful localized automotive content.
