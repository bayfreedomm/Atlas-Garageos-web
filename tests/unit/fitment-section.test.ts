import { describe, expect, it } from 'vitest';
import { renderFitmentSection, typicalRimWidthInches } from '../../src/ui/fitment-section';

const labels = { current: 'CURRENT', next: 'NEW', aria: 'Cross-section', hub: 'HUB', suspension: 'STRUT', fender: 'FENDER', inner: 'Inner', outer: 'Outer' };

describe('fitment cross-section drawing', () => {
  it('draws both tires to scale with their real overall diameters and widths', () => {
    const svg = renderFitmentSection({ mode: 'tire', current: { label: '205/55R16', tireWidthMm: 205, aspectRatio: 55, rimInches: 16 }, next: { label: '225/45R17', tireWidthMm: 225, aspectRatio: 45, rimInches: 17 }, labels });
    expect(svg).toContain('Ø 631.9 mm');
    expect(svg).toContain('Ø 634.3 mm');
    expect(svg).toContain('>205 mm<');
    expect(svg).toContain('>225 mm<');
    expect(svg).toContain('CURRENT · 205/55R16');
    expect(svg.match(/class="fs-tire"/g)).toHaveLength(4);
    expect(svg).not.toMatch(/NaN|undefined|style=/);
    const box = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg)!;
    const width = Number(box[3]);
    const height = Number(box[4]);
    expect(width).toBeGreaterThan(200);
    expect(height).toBeGreaterThan(400);
  });

  it('uses the locale decimal comma', () => {
    const svg = renderFitmentSection({ mode: 'tire', current: { label: 'a', tireWidthMm: 205, aspectRatio: 55, rimInches: 16 }, next: { label: 'b', tireWidthMm: 225, aspectRatio: 45, rimInches: 17 }, labels, decimalComma: true });
    expect(svg).toContain('Ø 631,9 mm');
  });

  it('moves the rim around the fixed hub face exactly as the offset calculator does', () => {
    const svg = renderFitmentSection({ mode: 'wheel', current: { label: '8J ET40', rimInches: 18, wheelWidthInches: 8, offsetMm: 40 }, next: { label: '8.5J ET35', rimInches: 18, wheelWidthInches: 8.5, offsetMm: 35 }, labels });
    expect(svg).toContain('Inner +1.35 mm');
    expect(svg).toContain('Outer +11.35 mm');
    expect(svg).toContain('class="fs-hubface"');
    expect(svg).not.toContain('class="fs-tire"');
    const narrower = renderFitmentSection({ mode: 'wheel', current: { label: 'a', rimInches: 18, wheelWidthInches: 8, offsetMm: 40 }, next: { label: 'b', rimInches: 18, wheelWidthInches: 8, offsetMm: 50 }, labels });
    expect(narrower).toContain('Inner +10.00 mm');
    expect(narrower).toContain('Outer −10.00 mm');
  });

  it('picks a typical rim width for a tire', () => {
    expect(typicalRimWidthInches(205)).toBe(7);
    expect(typicalRimWidthInches(285)).toBe(9.5);
  });
});
