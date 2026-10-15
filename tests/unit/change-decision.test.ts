import { describe, expect, it } from 'vitest';
import { decisionText } from '../../src/content/decision-text';
import { CHECKLIST_ITEMS, checklistKey, parseMetricTire, parseWheelSize, summarizeChange, vehicleBaseline } from '../../src/features/decision/change-decision';
import { runFitCheck } from '../../src/features/tools/fit-check';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { decisionRows, fill, progressText, ruleSentence } from '../../src/ui/decision-sentences';

const current = { widthMm: 205, aspectRatio: 55, rimDiameterInches: 16 };
const bigger = { widthMm: 225, aspectRatio: 50, rimDiameterInches: 17 };

describe('summarizeChange', () => {
  it('reuses the fit-check engine numbers instead of its own math', () => {
    const summary = summarizeChange(current, bigger)!;
    const engine = runFitCheck({ current, proposed: bigger });
    expect(engine.ok).toBe(true);
    if (!engine.ok) return;
    expect(summary.diameterMm).toBe(engine.value.diameterDifferenceMm);
    expect(summary.diameterPercent).toBe(engine.value.diameterDifferencePercent);
    expect(summary.rideHeightMm).toBe(engine.value.rideHeightDifferenceMm);
    expect(summary.actualAt100).toBe(engine.value.actualAtIndicated100);
    expect(summary.widthMm).toBe(20);
    expect(summary.widthDirection).toBe('up');
    expect(summary.rimChanges).toBe(true);
  });

  it('lists the open points a wider, larger, new-rim change leaves', () => {
    expect(summarizeChange(current, bigger)!.openPoints).toEqual(['rim-width', 'clearance', 'pcd', 'load-speed', 'approval']);
  });

  it('keeps only load/speed and approval open for an identical size', () => {
    const same = summarizeChange(current, current)!;
    expect(same.openPoints).toEqual(['load-speed', 'approval']);
    expect(same.diameterDirection).toBe('same');
    expect(same.diameterWithinRule).toBe(true);
  });

  it('flags a change outside the ±3 % rule of thumb', () => {
    const summary = summarizeChange(current, { widthMm: 235, aspectRatio: 60, rimDiameterInches: 16 })!;
    expect(summary.diameterWithinRule).toBe(false);
    expect(summary.speedometerNeedsReview).toBe(true);
  });

  it('adds wheel-edge movement when all four wheel fields exist', () => {
    const summary = summarizeChange(current, current, { originalWidthInches: 6.5, originalOffsetMm: 40, newWidthInches: 7.5, newOffsetMm: 35 })!;
    expect(summary.wheelPosition).not.toBeNull();
    expect(summary.wheelPosition!.outerMm).toBeGreaterThan(0);
    expect(summary.openPoints).toContain('clearance');
  });

  it('returns null for invalid input', () => {
    expect(summarizeChange(current, { widthMm: Number.NaN, aspectRatio: 50, rimDiameterInches: 17 })).toBeNull();
  });
});

describe('parsers', () => {
  it('reads both wheel notations', () => {
    expect(parseWheelSize('16x6.5 ET40')).toEqual({ widthInches: 6.5, offsetMm: 40 });
    expect(parseWheelSize('6.5Jx16 ET41')).toEqual({ widthInches: 6.5, offsetMm: 41 });
    expect(parseWheelSize('17x7')).toEqual({ widthInches: 7 });
    expect(parseWheelSize('nonsense')).toBeNull();
    expect(parseWheelSize(undefined)).toBeNull();
  });

  it('reads metric tire notations including P, ZR and C', () => {
    expect(parseMetricTire('205/55R16')).toEqual(current);
    expect(parseMetricTire('P225/65R17')).toEqual({ widthMm: 225, aspectRatio: 65, rimDiameterInches: 17 });
    expect(parseMetricTire('245/40ZR18')).toEqual({ widthMm: 245, aspectRatio: 40, rimDiameterInches: 18 });
    expect(parseMetricTire('215/65R16C')).toEqual({ widthMm: 215, aspectRatio: 65, rimDiameterInches: 16 });
    expect(parseMetricTire('33x12.50R15')).toBeNull();
  });

  it('gives every curated vehicle a usable baseline tire', () => {
    for (const vehicle of vehicleFitmentData) {
      const baseline = vehicleBaseline(vehicle);
      expect(baseline.tire, vehicle.id).not.toBeNull();
      expect(summarizeChange(baseline.tire!, baseline.alternative ?? baseline.tire!), vehicle.id).not.toBeNull();
    }
  });

  it('keys ticks by the exact size change', () => {
    expect(checklistKey(current, bigger)).toBe('atlas-checks:205-55-16>225-50-17');
  });
});

describe('decision text', () => {
  it('covers every locale, checklist item and placeholder', () => {
    for (const [locale, t] of Object.entries(decisionText)) {
      for (const item of CHECKLIST_ITEMS) expect(t.items[item].label.length, `${locale} ${item}`).toBeGreaterThan(3);
      expect(t.progress, locale).toMatch(/\{n\}.*\{t\}/);
      expect(t.speed, locale).toContain('{v}');
      expect(t.wheelPosition, locale).toMatch(/\{i\}.*\{o\}|\{o\}.*\{i\}/);
      for (const key of ['widthUp', 'widthDown', 'diameterUp', 'diameterDown', 'rideUp', 'rideDown', 'sidewallUp', 'sidewallDown', 'carPcd', 'carWheel'] as const) expect(t[key], `${locale} ${key}`).toContain('{x}');
    }
    expect(Object.keys(decisionText).sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt-br', 'tr']);
  });

  it('renders plain sentences with no leftover placeholders', () => {
    const summary = summarizeChange(current, bigger, { originalWidthInches: 6.5, originalOffsetMm: 40, newWidthInches: 7.5, newOffsetMm: 35 })!;
    for (const [locale, t] of Object.entries(decisionText)) {
      const rows = decisionRows(summary, t, locale as keyof typeof decisionText);
      expect(rows.map((row) => row.key)).toEqual(['width', 'diameter', 'rideHeight', 'speedometer', 'sidewall', 'wheels']);
      for (const row of rows) expect(row.text, `${locale} ${row.key}`).not.toMatch(/\{\w\}/);
      expect(ruleSentence(summary, t)).toBe(summary.diameterWithinRule ? t.withinRule : t.outsideRule);
    }
    const tr = decisionRows(summary, decisionText.tr, 'tr');
    expect(tr[0]!.text).toBe('Yeni lastik 20 mm daha geniş.');
    expect(progressText(decisionText.tr, 4, 6)).toBe('4/6 tamamlandı');
    expect(fill('{x} and {y}', { x: 'a' })).toBe('a and {y}');
  });
});
