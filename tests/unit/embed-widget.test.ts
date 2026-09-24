import { describe, expect, it } from 'vitest';
import headers from '../../public/_headers?raw';
import embedPage from '../../src/components/EmbedTireComparison.astro?raw';
import embedPanel from '../../src/components/EmbedCodePanel.astro?raw';

/** Rules in public/_headers as { pattern: lines[] } (comments and blank lines dropped). */
function rules(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  let current: string | null = null;
  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) { current = raw.trim(); map.set(current, []); continue; }
    if (current) map.get(current)!.push(raw.trim());
  }
  return map;
}

describe('embeddable calculator', () => {
  const parsed = rules(headers);

  it('keeps framing forbidden site-wide', () => {
    const all = parsed.get('/*') ?? [];
    expect(all).toContain('X-Frame-Options: DENY');
    expect(all.some((line) => line.startsWith('Content-Security-Policy:') && line.includes("frame-ancestors 'none'"))).toBe(true);
  });

  it('allows framing only for /embed/ paths, by detaching (not re-adding) the two headers', () => {
    for (const pattern of ['/embed/*', '/de/embed/*', '/es/embed/*']) {
      expect(parsed.get(pattern)).toEqual(['! X-Frame-Options', '! Content-Security-Policy']);
    }
    const framingExceptions = [...parsed.entries()].filter(([, lines]) => lines.some((line) => line.startsWith('! X-Frame-Options')));
    expect(framingExceptions.map(([pattern]) => pattern).sort()).toEqual(['/de/embed/*', '/embed/*', '/es/embed/*']);
  });

  it('keeps the embed page out of search and credits the full tool', () => {
    expect(embedPage).toContain('noindex,follow');
    expect(embedPage).toContain('rel="canonical"');
    expect(embedPage).toContain('data-embed-full-link');
  });

  it('ships a snippet whose resize listener only trusts our origin', () => {
    expect(embedPanel).toContain('e.origin!==');
    expect(embedPanel).toContain('atlas-garageos:embed-height');
    expect(embedPanel).toContain('f.contentWindow===e.source');
  });
});
