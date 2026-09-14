# Atlas GarageOS Localization Rollout

## First-wave locales
- English (`/en/`) — live
- German (`/de/`) — planned
- Spanish (`/es/`) — planned
- Brazilian Portuguese (`/pt-br/`) — planned
- French (`/fr/`) — planned

Do not publish a locale until the full user journey is translated: title/meta, H1/H2, form labels, result labels, validation messages, visual labels, quick facts, warnings, methodology, related links, structured data, and navigation.

## SEO rules
1. Every published locale gets a unique URL and localized search-intent slug.
2. Every localized page uses a self-canonical URL.
3. `hreflang` is emitted only for localized versions that actually exist and are indexable.
4. `x-default` points to the language-neutral entry route.
5. Sitemap includes every published localized URL only after that locale passes QA.
6. No forced IP/browser-language redirect. Offer a language switch instead.
7. Translation is not enough: units, terminology, examples, decimal formatting, tire/tyre vocabulary, gallon standard, and market-specific wording must be localized where relevant.

## Search-intent slug policy
Slugs are based on wording visible in current SERPs, not literal machine translation. Treat the slug registry in `src/localization/locales.ts` as a draft until each locale's keyword pass is completed.
