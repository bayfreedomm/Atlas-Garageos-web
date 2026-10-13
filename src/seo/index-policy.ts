/**
 * Index policy for programmatic pages (server-only: it reads the 8 MB cars dataset, so never
 * import it from a client script).
 *
 * Why this exists (Search Console, Oct 2026: ~6.5K indexed, ~12.2K "Crawled – currently not
 * indexed", examples = localized tire-size pages): the tire catalog publishes 992 sizes in each
 * of 9 languages. Roughly half of them are reference-only sizes — space-saver spares (125/70R17),
 * truck rims (R17.5/R19.5/R22.5), flotation sizes, very wide or very large rims — that no
 * documented vehicle uses and that nobody searches for in Polish or Turkish. Google crawls those
 * localized copies and declines to index them, which spends crawl budget and lowers the share
 * of the site Google considers worth indexing.
 *
 * Policy:
 *   - English keeps every size indexable (it is the x-default and carries the long tail).
 *   - The other 8 languages index a size when it is documented on a real vehicle (Atlas vehicle
 *     references or the ANKUSI OEM wheel data) or sits in the core passenger-car band below.
 *   - Every other localized size page STAYS LIVE (no 404, links keep working, the language
 *     switcher still reaches it) but is served `noindex,follow`, is left out of the sitemap and
 *     is never named in an hreflang cluster.
 *   - INDEX_ALLOWLIST force-keeps specific localized pages indexable (paths that already earn
 *     Search Console clicks/impressions), so working traffic is never cut by the band rules.
 */
import { carModels } from '../data/cars';
import { vehiclesForTireSize, type TireSizeEntry } from '../data/tire-size-catalog';
import { entityAlternates, entityDetailPath, entityHreflang, entityLocales, type EntityLocale, type HreflangAlternate } from './entity-routes';

/** Core passenger-car band indexed in every language (rim inches, section width mm, aspect %). */
export const CORE_TIRE_BAND = Object.freeze({ rimMin: 13, rimMax: 20, widthMin: 155, widthMax: 255, aspectMin: 35, aspectMax: 80 });

/** Localized paths that must stay indexable regardless of the band (e.g. from Search Console). */
export const INDEX_ALLOWLIST: ReadonlySet<string> = new Set<string>([]);

const ANKUSI_SIZE = /(\d{3})\/(\d{2})\s?Z?R\s?(\d{2}(?:\.5)?)/g;

/** Metric sizes that appear as factory fitment in the ANKUSI wheel dataset (column 11). */
const ankusiOemSizes: ReadonlySet<string> = (() => {
  const sizes = new Set<string>();
  for (const model of carModels) {
    for (const row of model.wheels) {
      const field = row[11];
      if (!field) continue;
      for (const match of field.matchAll(ANKUSI_SIZE)) sizes.add(`${match[1]}/${match[2]}R${match[3]}`);
    }
  }
  return sizes;
})();

/** True when a real vehicle is documented on this size (Atlas references or ANKUSI OEM data). */
export function isDocumentedTireSize(entry: TireSizeEntry): boolean {
  return vehiclesForTireSize(entry.notation).length > 0 || (!entry.commercial && !entry.flotation && ankusiOemSizes.has(entry.notation));
}

/** True when the size sits in the core passenger-car band (standard 5-mm width / 5-% aspect steps). */
export function isCoreTireSize(entry: TireSizeEntry): boolean {
  if (entry.commercial || entry.flotation) return false;
  const band = CORE_TIRE_BAND;
  return entry.rimDiameterInches >= band.rimMin && entry.rimDiameterInches <= band.rimMax && Number.isInteger(entry.rimDiameterInches)
    && entry.widthMm >= band.widthMin && entry.widthMm <= band.widthMax && entry.widthMm % 10 === 5
    && entry.aspectRatio >= band.aspectMin && entry.aspectRatio <= band.aspectMax && entry.aspectRatio % 5 === 0;
}

/** Whether a tire-size detail page is indexable in this locale. */
export function isTireSizeIndexable(entry: TireSizeEntry, locale: EntityLocale): boolean {
  if (locale === 'en') return true;
  if (INDEX_ALLOWLIST.has(entityDetailPath('tire-size', locale, entry.slug))) return true;
  return isDocumentedTireSize(entry) || isCoreTireSize(entry);
}

const HREFLANG_TO_LOCALE: ReadonlyMap<string, EntityLocale> = new Map(entityLocales().map((code) => [entityHreflang(code), code]));

export interface PageIndexing {
  /** false → `noindex,follow`, no hreflang tags, not in the sitemap. */
  readonly indexable: boolean;
  /** The hreflang cluster to emit: only languages in which this page is indexable. */
  readonly hreflang: readonly HreflangAlternate[];
}

/** Indexing decision plus the matching hreflang cluster for one tire-size detail page. */
export function tireSizeIndexing(entry: TireSizeEntry, locale: EntityLocale): PageIndexing {
  const indexable = isTireSizeIndexable(entry, locale);
  if (!indexable) return Object.freeze({ indexable, hreflang: Object.freeze([]) });
  const hreflang = entityAlternates('tire-size', entry.slug).filter((alt) => {
    if (alt.hreflang === 'x-default') return true;
    const code = HREFLANG_TO_LOCALE.get(alt.hreflang);
    return code !== undefined && isTireSizeIndexable(entry, code);
  });
  return Object.freeze({ indexable, hreflang: Object.freeze(hreflang) });
}

