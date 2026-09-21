/**
 * One normalization function for entity hub search, applied on BOTH sides of the comparison:
 * to the `data-entity-search-text` baked into each card at build time, and to whatever the
 * reader types at filter time.
 *
 * People do not type tire sizes and bolt patterns the way the canonical notation writes them.
 * Folding the separators away lets every spelling of the same thing land on one string:
 *
 *   "205/55R16", "205-55-r16", "205 55 r16", "20555r16"   -> "20555r16"
 *   "5x114.3",   "5x114-3",    "5 114.3",    "5-114-3"    -> "51143"
 *
 * Characters removed: whitespace, hyphens (and the Unicode dashes that a copy-paste from a
 * spec sheet brings along), slashes, dots, and the literal "x" that separates lug count from
 * PCD — "x" has to go, otherwise "5 114.3" could never match "5x114.3".
 *
 * This affects the live client-side filter only. Canonical URLs and slugs are produced by
 * tireSizeSlug()/boltPatternSlug() and are deliberately NOT touched by this: a slug has to
 * stay reversible and unambiguous, whereas this normalization is intentionally lossy.
 */
const SEARCH_NOISE = /[\s\-‐-―/.x]/g;

export function normalizeEntitySearchText(value: string): string {
  return value.toLocaleLowerCase().replace(SEARCH_NOISE, '');
}

/**
 * The searchable string baked onto one hub card: every token a reader might type (the
 * notation, the slug form, the vehicle makes), normalized and kept separated by "|" so one
 * token's tail cannot accidentally join the next token's head.
 */
export function entitySearchText(tokens: readonly string[]): string {
  return tokens.map(normalizeEntitySearchText).join('|');
}
