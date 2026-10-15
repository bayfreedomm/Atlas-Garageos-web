import type { APIRoute } from 'astro';
import { boltPatternCatalog } from '../../../data/bolt-pattern-catalog';
import { tireComparisonPairs } from '../../../data/tire-comparisons';
import { tireSizeCatalog } from '../../../data/tire-size-catalog';
import { boltPatternImageSvg, tireComparisonImageSvg, tireSizeImageSvg } from '../../../seo/entity-images';

/**
 * One SVG per reference entity (src/seo/entity-images.ts). scripts/rasterize-entity-images.mjs
 * turns each into the PNG the pages link (/img/{family}/{slug}.png) right after `astro build`,
 * in parallel and with a bundled font, then removes the SVG.
 */
export function getStaticPaths() {
  return [
    ...tireSizeCatalog.map((entry) => ({ params: { family: 'tire', slug: entry.slug }, props: { svg: () => tireSizeImageSvg(entry) } })),
    ...tireComparisonPairs.map((pair) => ({ params: { family: 'compare', slug: pair.slug }, props: { svg: () => tireComparisonImageSvg(pair) } })),
    ...boltPatternCatalog.map((entry) => ({ params: { family: 'pcd', slug: entry.slug }, props: { svg: () => boltPatternImageSvg(entry) } })),
  ];
}

export const GET: APIRoute = ({ props }) => new Response((props as { svg: () => string }).svg(), { headers: { 'Content-Type': 'image/svg+xml' } });
