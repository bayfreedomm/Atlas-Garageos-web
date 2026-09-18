import { describe, expect, it } from 'vitest';
import globalCss from '../../src/styles/global.css?raw';
import productV3Css from '../../src/styles/product-v3.css?raw';
import productV4Css from '../../src/styles/product-v4.css?raw';

/**
 * Guardrail against the exact failure mode that caused most of the CSS bugs in this project's
 * history: global.css, product-v3.css and product-v4.css are three eras of the same stylesheet,
 * loaded together on every page (see SiteLayout.astro), and a selector defined in more than one
 * of them silently starts a "which line wins" cascade fight — the .related-card / .related-grid
 * bugs both came from exactly this. product-v4.css is the authoritative layer going forward (see
 * the comment at its top), so NEW overlapping selectors should not be introduced.
 *
 * This is a ratchet, not a full lint: MAX_KNOWN_OVERLAPS is the current count of legacy
 * duplicate selectors (as of the last time this baseline was updated) — cleaning one up should
 * lower this number, and it must never be raised just to make a new duplicate pass. If this test
 * fails, either the new selector isn't actually needed in more than one file, or (if it truly must
 * override an older declaration) the old declaration belongs in this same file, not a fresh one in
 * global.css or product-v3.css.
 */
const MAX_KNOWN_OVERLAPS = 200;

const FILES: Readonly<Record<string, string>> = {
  'global.css': globalCss,
  'product-v3.css': productV3Css,
  'product-v4.css': productV4Css,
};

function extractTopLevelSelectors(css: string): readonly string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors: string[] = [];
  const ruleOpenRegex = /([^{}]+)\{/g;
  let match: RegExpExecArray | null;
  while ((match = ruleOpenRegex.exec(withoutComments)) !== null) {
    const raw = match[1]!.trim();
    if (raw.startsWith('@')) continue; // skip @media/@supports/@keyframes headers, not selectors
    selectors.push(raw);
  }
  return selectors;
}

function splitAndNormalize(combinedSelectors: readonly string[]): ReadonlySet<string> {
  const out = new Set<string>();
  for (const combined of combinedSelectors) {
    for (const part of combined.split(',')) {
      const normalized = part.trim().replace(/\s+/g, ' ');
      if (normalized) out.add(normalized);
    }
  }
  return out;
}

describe('CSS selector overlap across the three stylesheet eras', () => {
  it('does not grow beyond the known baseline of duplicate selectors', () => {
    const fileNames = Object.keys(FILES);
    const perFile = new Map<string, ReadonlySet<string>>();
    for (const name of fileNames) perFile.set(name, splitAndNormalize(extractTopLevelSelectors(FILES[name]!)));

    const overlapping = new Set<string>();
    for (let i = 0; i < fileNames.length; i++) {
      for (let j = i + 1; j < fileNames.length; j++) {
        const a = perFile.get(fileNames[i]!)!;
        const b = perFile.get(fileNames[j]!)!;
        for (const selector of a) if (b.has(selector)) overlapping.add(selector);
      }
    }

    if (overlapping.size > MAX_KNOWN_OVERLAPS) {
      const extra = overlapping.size - MAX_KNOWN_OVERLAPS;
      throw new Error(
        `Found ${overlapping.size} selectors defined in more than one of global.css/product-v3.css/` +
        `product-v4.css — ${extra} more than the recorded baseline of ${MAX_KNOWN_OVERLAPS}. ` +
        `A new overlapping selector usually means a spacing/sizing fix was added as a fresh override ` +
        `instead of editing the existing declaration in place, which is exactly how the .related-card ` +
        `and .directory-identity bugs happened. Put the change in the file that already owns that ` +
        `selector (product-v4.css for anything sizing/spacing — see its header comment) instead of a new file.`,
      );
    }
    expect(overlapping.size).toBeLessThanOrEqual(MAX_KNOWN_OVERLAPS);
  });
});
