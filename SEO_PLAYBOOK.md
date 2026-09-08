# Atlas GarageOS SEO Playbook

This document is the durable Google-first SEO standard for Atlas GarageOS. Search visibility must be earned through useful product experiences, trustworthy explanations, and technically clean delivery. It is not a milestone changelog or permission to generate pages at scale.

## Technical SEO and crawlability

- Serve important content and navigation as semantic HTML that works before optional interaction code.
- Keep indexable pages reachable through crawlable links; do not depend on form submissions, fragments, or client-only state for discovery.
- Return accurate status codes, avoid redirect chains, and keep production assets cacheable and content-addressed.
- Maintain one self-referencing canonical URL for every indexable page.
- Keep `robots.txt` and XML sitemaps intentional, valid, environment-aware, and limited to canonical indexable URLs.
- Exclude private, transient, duplicate, filtered, and application-state combinations from sitemaps.
- Treat structured data as a factual representation of visible content. Add only schema types supported by the page and current search-engine guidance; never manufacture ratings, products, prices, or FAQs.

## Application state and indexable URLs

Calculator state, shared setups, user measurements, Garage data, and other workspace state are not SEO pages. Atlas currently keeps versioned shared setup data in the URL fragment, separate from the canonical pathname. New state encodings must preserve that separation unless a deliberately authored, useful, canonical page exists.

Indexable URLs describe durable resources or user-valued tasks. Application-state URLs reproduce a workspace. One must not accidentally become the other.

## URL taxonomy and internal linking

Use short, stable, human-readable paths organized around user intent and durable entities. Future families may include tools, vehicles, tire sizes, wheel sizes, comparisons, fitment setups, brands, models, and products, but a family should launch only with a real information architecture and sufficient content.

Internal links should help a person continue a task: from a vehicle to relevant tools, from a tire size to meaningful comparisons, and from a calculated fitment result to supporting explanations or legitimate product discovery. Breadcrumbs and contextual links should reflect actual hierarchy rather than keyword variants.

Implemented indexable tools must be registered in the typed tool registry. Locale routes, canonical URLs, sitemap entries, and related-tool edges derive from that source. The non-indexable root locale entry is the intentional `x-default`; it must not compete with the English flagship canonical.

## Mobile-first and Core Web Vitals

- Design and test the primary experience mobile-first.
- Protect Largest Contentful Paint with compact HTML, minimal blocking assets, and restrained font/media loading.
- Protect Interaction to Next Paint by keeping client JavaScript small and bounding synchronous calculations.
- Protect Cumulative Layout Shift by reserving dimensions for media, controls, results, and sticky navigation.
- Prefer static Astro output, CSS presentation, content-addressed assets, and progressive enhancement.
- Monitor field data by template and device class; laboratory scores guide debugging but do not replace real-user evidence.

## Semantic HTML and accessibility

Use one descriptive page heading, logical heading levels, landmarks, real buttons and links, associated labels, useful alternative text, keyboard operation, visible focus, and text equivalents for color-coded states. Accessible structure improves both product usability and machine understanding; it is not a keyword tactic.

## Content quality threshold

Every indexable page must answer a distinct user need better than a generic parameter substitution. It should provide an accurate tool, original explanation, sourced data, meaningful comparison, or other concrete value. State assumptions and provenance. Keep safety, compatibility, commercial availability, and calculated geometry clearly separated.

Do not publish thin pages, doorway pages, near-duplicate permutations, scraped catalogs, keyword-swapped templates, or generated prose without editorial and data value. If a page would not deserve an internal link or help a person make progress, it should not be indexed.

## Programmatic SEO quality rules

Programmatic generation may begin only after the underlying entity model, source rights, freshness strategy, canonical rules, and template-specific user benefit are established. Each generated page must have:

- A validated entity or comparison with a stable identifier
- Accurate, maintained source data and visible provenance
- Substantial page-specific utility beyond a title and changed numbers
- Deterministic canonical and localization behavior
- Useful internal links based on real relationships
- Index/noindex rules for empty, invalid, low-confidence, or duplicate states
- Quality sampling before launch and ongoing indexation review

Generation volume is never a success metric by itself.

## Page strategies

### Vehicle pages

Center on a verified vehicle identity, supported fitment or ownership tasks, clearly sourced specifications, and links to relevant tools. Do not imply OEM data exists until it is licensed, maintained, and attributable.

### Tire-size pages

Explain the size, calculated dimensions, comparison implications, and applicable tools. Future products may attach only through accurate catalog relationships, market availability, and commercial disclosure.

### Comparison pages

Provide a stable, useful comparison with transparent formulas, units, assumptions, and differences. Avoid indexing arbitrary user-entered combinations unless they become deliberately curated resources.

### Tool pages

Lead with a fast working tool, then provide concise instructions, methodology, limitations, examples, and relevant next steps. Do not bury the utility beneath SEO copy.

### Product pages

Require real brand/model identity, current market and retailer information, source/freshness metadata, and a clear distinction between purchase availability and fitment compatibility.

## Localization and hreflang

- Give each localized indexable page its own stable URL.
- Keep language independent from units and currency.
- Use reciprocal `hreflang` annotations for every available locale and an intentional `x-default` URL.
- Localize content, metadata, navigation, number formats, and market context; do not publish machine-translated shells with no review or local value.
- Canonicalize within the same language version unless an explicitly equivalent consolidation strategy requires otherwise.
- Include only live, canonical localized URLs in locale-aware sitemaps.

## Search Console and indexation feedback loop

Track sitemap discovery, indexed-versus-submitted counts, canonical selection, crawl errors, rich-result validity, query/page performance, device differences, and Core Web Vitals. Review changes by page template rather than reacting to isolated URLs.

Investigate unexpected index growth, duplicate canonical choices, crawled-not-indexed clusters, declining useful-query engagement, and pages with impressions but poor task completion. Feed findings back into templates, internal linking, data quality, and index rules. Do not respond by multiplying low-value pages.

## Launch and monitoring standard

Before an indexable template launches, verify rendered HTML, canonical, robots directives, sitemap inclusion, localized alternates, structured data if any, mobile usability, performance, accessibility, and representative content quality. After launch, monitor crawl and indexation behavior, compare it with intended coverage, and remove or improve pages that do not meet the standard.
