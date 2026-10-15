/**
 * Page-specific images for reference pages (tire sizes, tire comparisons, bolt patterns).
 *
 * Each image is Atlas's own technical drawing, so there is no third-party licence to track.
 * One file per entity, shared by all nine locales: the drawing carries numbers and units only.
 * The same file is the page's visible <img>, og:image, twitter:image and the structured-data
 * primaryImageOfPage. Written as SVG by src/pages/img/[family]/[slug].svg.ts and rasterized to PNG by
 * scripts/rasterize-entity-images.mjs once per build.
 *
 * Pure string functions: no DOM, no Astro, no network.
 */
import type { BoltPatternEntry } from '../data/bolt-pattern-catalog';
import type { TireComparisonPair } from '../data/tire-comparisons';
import type { TireSizeEntry } from '../data/tire-size-catalog';
import { tireSizeMetrics } from '../ui/entity-page-model';
import type { EntityLocale } from './entity-routes';

export const ENTITY_IMAGE_WIDTH = 1200;
export const ENTITY_IMAGE_HEIGHT = 630;

export type EntityImageFamily = 'tire' | 'compare' | 'pcd';

export interface PageImage {
  /** Root-relative path, e.g. "/img/tire/205-55-r16.png". */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  /** Third-party photo: shown under the image, as the licence requires. */
  readonly credit?: PhotoCredit;
}

export interface PhotoCredit {
  readonly artist: string;
  readonly license: string;
  readonly licenseUrl: string;
  /** Source file page on Wikimedia Commons. */
  readonly page: string;
}

const W = ENTITY_IMAGE_WIDTH;
const H = ENTITY_IMAGE_HEIGHT;
const INK = '#111d2b';
const MUTED = '#5c6b7a';
const LINE = '#c9d2db';
const SOFT = '#eef2f6';
const BLUE = '#2f7cf6';
const ORANGE = '#f08a24';
const FONT = 'Inter';

const f1 = (n: number): string => n.toFixed(1);
const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (n: number, digits: number): string => n.toFixed(digits);
const text = (x: number, y: number, content: string, size: number, weight: number, fill: string, anchor: 'start' | 'middle' | 'end' = 'start'): string =>
  `<text x="${f1(x)}" y="${f1(y)}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(content)}</text>`;

/** "205/55R16" → "205/55 R16"; flotation sizes are kept as written. */
export const imageNotation = (notation: string): string => notation.replace(/R(\d)/, ' R$1');

const frame = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#ffffff"/>${body}`
  + `<text x="${W - 48}" y="${H - 36}" font-family="${FONT}" font-size="22" font-weight="600" fill="${MUTED}" text-anchor="end">atlasgarageos.com</text></svg>`;

/** Side view of a tire: tread ring, sidewall, rim; radii in true proportion. */
function tireSide(cx: number, cy: number, outerR: number, rimR: number, color: string): string {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const r1 = rimR * 0.28;
    const r2 = rimR * 0.86;
    return `<path d="M${f1(cx + r1 * Math.cos(a))} ${f1(cy + r1 * Math.sin(a))}L${f1(cx + r2 * Math.cos(a))} ${f1(cy + r2 * Math.sin(a))}" stroke="${LINE}" stroke-width="10" stroke-linecap="round"/>`;
  }).join('');
  return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(outerR)}" fill="${SOFT}" stroke="${color}" stroke-width="4"/>`
    + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(outerR - 10)}" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="3 9"/>`
    + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(rimR)}" fill="#ffffff" stroke="${MUTED}" stroke-width="3"/>`
    + spokes
    + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(rimR * 0.22)}" fill="#ffffff" stroke="${MUTED}" stroke-width="3"/>`;
}

const dimV = (x: number, y1: number, y2: number, color: string): string =>
  `<path d="M${f1(x)} ${f1(y1)}V${f1(y2)}M${f1(x - 10)} ${f1(y1)}H${f1(x + 10)}M${f1(x - 10)} ${f1(y2)}H${f1(x + 10)}" stroke="${color}" stroke-width="3"/>`;

export function tireSizeImageSvg(entry: TireSizeEntry): string {
  const m = tireSizeMetrics(entry);
  const cy = 315;
  const outerR = 235;
  const rimR = outerR * (m.rimDiameterMm / m.overallDiameterMm);
  const cx = 330;
  const body = tireSide(cx, cy, outerR, rimR, BLUE)
    + dimV(cx - outerR - 40, cy - outerR, cy + outerR, BLUE)
    + dimV(cx + outerR + 34, cy - outerR, cy - rimR, ORANGE)
    + text(660, 200, imageNotation(entry.notation), 76, 700, INK)
    + text(660, 290, `Ø ${num(m.overallDiameterMm, 1)} mm · ${num(m.overallDiameterMm / 25.4, 1)}″`, 38, 600, BLUE)
    + text(660, 350, `W ${num(m.sectionWidthMm, 0)} mm · ${num(m.sectionWidthMm / 25.4, 1)}″`, 34, 500, INK)
    + text(660, 405, `H ${num(m.sidewallHeightMm, 1)} mm · ${num(m.sidewallHeightMm / 25.4, 1)}″`, 34, 500, ORANGE)
    + text(660, 460, `R${m.rimDiameterInches} · ${num(m.revolutionsPerKilometer, 0)} /km`, 30, 500, MUTED);
  return frame(body);
}

export function tireComparisonImageSvg(pair: TireComparisonPair): string {
  const a = tireSizeMetrics(pair.a);
  const b = tireSizeMetrics(pair.b);
  const largest = Math.max(a.overallDiameterMm, b.overallDiameterMm);
  const scale = 400 / largest;
  const ground = 500;
  const ra = (a.overallDiameterMm / 2) * scale;
  const rb = (b.overallDiameterMm / 2) * scale;
  const diff = (b.overallDiameterMm / a.overallDiameterMm - 1) * 100;
  const sign = diff >= 0 ? '+' : '−';
  const body = `<path d="M60 ${ground}H${W - 60}" stroke="${LINE}" stroke-width="2"/>`
    + tireSide(330, ground - ra, ra, (a.rimDiameterMm / 2) * scale, BLUE)
    + tireSide(870, ground - rb, rb, (b.rimDiameterMm / 2) * scale, ORANGE)
    + `<path d="M120 ${f1(ground - 2 * ra)}H${W - 120}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="8 8"/>`
    + `<path d="M120 ${f1(ground - 2 * rb)}H${W - 120}" stroke="${ORANGE}" stroke-width="2" stroke-dasharray="8 8"/>`
    + text(330, 560, imageNotation(pair.a.notation), 40, 700, BLUE, 'middle')
    + text(870, 560, imageNotation(pair.b.notation), 40, 700, ORANGE, 'middle')
    + text(600, 70, `Ø ${sign}${num(Math.abs(diff), 1)} %`, 46, 700, INK, 'middle');
  return frame(body);
}

export function boltPatternImageSvg(entry: BoltPatternEntry): string {
  const cx = 330;
  const cy = 315;
  const r = 165;
  const holes = Array.from({ length: entry.lugCount }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / entry.lugCount;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  });
  const [h0, h1] = [holes[0]!, holes[1]!];
  const spacing = entry.pcdMm * Math.sin(Math.PI / entry.lugCount);
  const body = `<circle cx="${cx}" cy="${cy}" r="${r + 75}" fill="${SOFT}" stroke="${LINE}" stroke-width="3"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="3" stroke-dasharray="10 10"/>`
    + `<circle cx="${cx}" cy="${cy}" r="62" fill="#ffffff" stroke="${MUTED}" stroke-width="3"/>`
    + holes.map(([x, y]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="24" fill="#ffffff" stroke="${INK}" stroke-width="4"/>`).join('')
    + `<path d="M${cx - r} ${cy}H${cx + r}" stroke="${BLUE}" stroke-width="3"/>`
    + `<path d="M${f1(h0[0])} ${f1(h0[1])}L${f1(h1[0])} ${f1(h1[1])}" stroke="${ORANGE}" stroke-width="3"/>`
    + text(660, 220, entry.notation.replace('x', ' × '), 84, 700, INK)
    + text(660, 300, `PCD ${num(entry.pcdMm, 1)} mm · ${num(entry.pcdMm / 25.4, 2)}″`, 38, 600, BLUE)
    + text(660, 360, `${entry.lugCount} × ${num(spacing, 1)} mm`, 34, 500, ORANGE);
  return frame(body);
}

const ALT: Readonly<Record<EntityLocale, { tire: string; compare: string; pcd: string }>> = {
  en: { tire: 'tire size diagram: diameter, width and sidewall', compare: 'tire size comparison diagram', pcd: 'bolt pattern diagram' },
  de: { tire: 'Reifengröße als Zeichnung: Durchmesser, Breite und Flanke', compare: 'Reifengrößen im Vergleich (Zeichnung)', pcd: 'Lochkreis als Zeichnung' },
  es: { tire: 'diagrama de la medida: diámetro, ancho y flanco', compare: 'diagrama comparativo de medidas', pcd: 'diagrama del patrón de birlos' },
  fr: { tire: 'schéma de la dimension : diamètre, largeur et flanc', compare: 'schéma comparatif des dimensions', pcd: 'schéma de l’entraxe' },
  it: { tire: 'schema della misura: diametro, larghezza e spalla', compare: 'schema di confronto delle misure', pcd: 'schema della foratura' },
  'pt-br': { tire: 'diagrama da medida: diâmetro, largura e flanco', compare: 'diagrama comparativo das medidas', pcd: 'diagrama da furação' },
  pl: { tire: 'schemat rozmiaru: średnica, szerokość i profil', compare: 'schemat porównania rozmiarów', pcd: 'schemat rozstawu śrub' },
  nl: { tire: 'tekening van de bandenmaat: diameter, breedte en wang', compare: 'vergelijkingstekening van bandenmaten', pcd: 'tekening van de steekmaat' },
  tr: { tire: 'lastik ebadı çizimi: çap, genişlik ve yanak', compare: 'lastik ebadı karşılaştırma çizimi', pcd: 'bijon aralığı çizimi' },
};

const image = (family: EntityImageFamily, slug: string, alt: string): PageImage =>
  Object.freeze({ src: `/img/${family}/${slug}.png`, width: W, height: H, alt });

export const tireSizeImage = (entry: TireSizeEntry, locale: EntityLocale): PageImage =>
  image('tire', entry.slug, `${imageNotation(entry.notation)} — ${ALT[locale].tire}`);
export const tireComparisonImage = (pair: TireComparisonPair, locale: EntityLocale): PageImage =>
  image('compare', pair.slug, `${imageNotation(pair.a.notation)} vs ${imageNotation(pair.b.notation)} — ${ALT[locale].compare}`);
export const boltPatternImage = (entry: BoltPatternEntry, locale: EntityLocale): PageImage =>
  image('pcd', entry.slug, `${entry.notation} — ${ALT[locale].pcd}`);
