import { describe, expect, it } from 'vitest';
import { DRAWING_DEFAULTS, isDrawingKind, renderToolDrawing, type DrawingKind } from '../../src/ui/tool-drawings';

const kinds = Object.keys(DRAWING_DEFAULTS) as DrawingKind[];
const STATIC: ReadonlySet<DrawingKind> = new Set(['measure-my-car', 'fitment-map', 'vehicle-fitment-finder']);

// A second valid input per input-driven drawing; the drawing must change with it.
const changed: Partial<Record<DrawingKind, Record<string, string>>> = {
  'psi-bar-converter': { value: '44' },
  'hp-kw-converter': { value: '300' },
  'nm-lb-ft-converter': { value: '450' },
  'mpg-l100km-converter': { value: '45' },
  'power-to-weight-calculator': { power: '300' },
  'towing-capacity-calculator': { gcwr: '20000' },
  'quarter-mile-calculator': { power: '450' },
  'fuel-cost-calculator': { distance: '900' },
  'road-trip-cost-calculator': { distance: '800', people: '3' },
  'tire-load-speed-rating': { loadIndex: '98', speedRating: 'W' },
  'tire-date-code-decoder': { code: '3024' },
  speedometer: { 'new-rimDiameterInches': '20', 'new-aspectRatio': '35' },
  compression: { chamber: '40' },
  'bolt-pattern': { lugCount: '4', spacing: '70.7' },
  'fitment-setup': { 'proposed-wheelOffsetMm': '20' },
  'ev-charge': { endPercent: '95' },
};

describe('tool drawings', () => {
  it('renders every kind as a self-contained svg without placeholder glyphs', () => {
    for (const kind of kinds) {
      expect(isDrawingKind(kind)).toBe(true);
      const { svg } = renderToolDrawing(kind, undefined);
      expect(svg, kind).toMatch(/^<svg[\s>]/);
      expect(svg, kind).toContain('</svg>');
      expect(svg, kind).not.toMatch(/¤|NaN|undefined|Infinity/);
    }
  });

  it('changes every input-driven drawing when a valid value changes', () => {
    for (const kind of kinds.filter((item) => !STATIC.has(item))) {
      const next = changed[kind];
      expect(next, kind).toBeDefined();
      const a = renderToolDrawing(kind, undefined);
      const b = renderToolDrawing(kind, next);
      expect(b.svg, kind).not.toBe(a.svg);
    }
  });

  it('falls back to a calm state instead of NaN for empty or invalid values', () => {
    for (const kind of kinds) {
      const blank = Object.fromEntries(Object.keys(DRAWING_DEFAULTS[kind]).map((key) => [key, '']));
      const { svg, readout } = renderToolDrawing(kind, blank);
      expect(`${svg}${readout}`, kind).not.toMatch(/NaN|undefined|Infinity/);
      expect(readout, kind).toBe('');
    }
    for (const code of ['12', 'ab', '99999']) {
      const { svg, readout } = renderToolDrawing('tire-date-code-decoder', { code });
      expect(`${svg}${readout}`, code).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it('keeps the bolt-pattern and compression geometry truthful', () => {
    // 5 lugs, 67.1 mm adjacent spacing → PCD = 67.1 / sin(36°) ≈ 114.2 mm
    expect(renderToolDrawing('bolt-pattern', undefined).readout).toMatch(/114[.,][12]/);
    // 86×86 bore/stroke, 48+4 cc → Vs ≈ 499.6 cc, CR ≈ 10.6
    expect(renderToolDrawing('compression', undefined).readout).toMatch(/10[.,]6/);
  });

  it('uses the decimal comma only when asked and escapes labels', () => {
    const comma = renderToolDrawing('psi-bar-converter', { value: '32.5' }, {}, true);
    expect(comma.svg).toMatch(/\d,\d/);
    const escaped = renderToolDrawing('towing-capacity-calculator', undefined, { trailer: '<b>&' });
    expect(escaped.svg).not.toContain('<b>&');
  });
});
