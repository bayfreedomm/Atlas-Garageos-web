import { describe, expect, it } from 'vitest';
import { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool, nearEquivalentSizesTool, speedometerTableTool } from '../../src/features/tools/calculator-tools';
import { speedometerMetrics, tireCalculatorMetrics, tireComparisonMetrics, wheelOffsetMetrics } from '../../src/ui/tool-presentation';

const original = { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 };
const proposed = { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 };

describe('indexable calculator flows', () => {
  it('maps the tire calculator from validated core geometry', () => {
    const result = calculateTireSizeTool(original);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.overallDiameterMm).toBeCloseTo(659.7, 10);
    expect(tireCalculatorMetrics(result.value).map(({ label }) => label)).toEqual(['Overall diameter', 'Sidewall height', 'Circumference', 'Revolutions per mile', 'Revolutions per kilometer']);
  });

  it('runs the tire comparison flow without a fitment verdict', () => {
    const result = compareTireSizesTool(original, proposed);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.diameterDifferenceMm).toBeCloseTo(10.9, 10);
    expect(result.value.sidewallDifferenceMm).toBeCloseTo(-7.25, 10);
    expect(JSON.stringify(tireComparisonMetrics(result.value)).toLowerCase()).not.toContain('safe');
  });

  it('runs wheel-offset comparison through the canonical wheel-position engine', () => {
    const result = calculateWheelOffsetTool({ originalWidthInches: 8, originalOffsetMm: 40, newWidthInches: 8.5, newOffsetMm: 35 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ innerPositionChangeMm: 1.3499999999999996, outerPokeChangeMm: 11.35 });
    expect(wheelOffsetMetrics(result.value)).toHaveLength(2);
  });

  it('keeps speed units presentational while reusing tire diameter math', () => {
    const metric = calculateSpeedometerTool(original, proposed, 100, 'km/h');
    const imperial = calculateSpeedometerTool(original, proposed, 60, 'mph');
    expect(metric.ok && imperial.ok).toBe(true);
    if (!metric.ok || !imperial.ok) return;
    expect(metric.value.actualSpeed).toBeCloseTo(101.652, 3);
    expect(imperial.value.actualSpeed / imperial.value.indicatedSpeed).toBeCloseTo(metric.value.actualSpeed / metric.value.indicatedSpeed, 10);
    expect(speedometerMetrics(imperial.value)[1]?.value).toContain('mph');
  });

  it('suggests near-equivalent sizes at nearby rim diameters within a small diameter tolerance', () => {
    const result = nearEquivalentSizesTool(original);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Every suggestion must be a different rim size than the input (17", 19", or 20" for an 18" input),
    // stay within the documented ~3% diameter tolerance, and never repeat the same rim twice.
    const rims = result.value.map((candidate) => candidate.tire.rimDiameterInches);
    expect(new Set(rims).size).toBe(rims.length);
    for (const candidate of result.value) {
      expect(candidate.tire.rimDiameterInches).not.toBe(original.rimDiameterInches);
      expect(Math.abs(candidate.diameterDifferencePercent)).toBeLessThanOrEqual(3);
    }
    expect([...rims]).toEqual([...rims].sort((a, b) => a - b));
  });

  it('spreads the speedometer offset across a realistic range of indicated speeds', () => {
    const kmh = speedometerTableTool(original, proposed, 'km/h');
    const mph = speedometerTableTool(original, proposed, 'mph');
    expect(kmh.ok && mph.ok).toBe(true);
    if (!kmh.ok || !mph.ok) return;
    expect(kmh.value.map((row) => row.indicatedSpeed)).toEqual([30, 50, 70, 90, 110, 130]);
    expect(mph.value.map((row) => row.indicatedSpeed)).toEqual([20, 30, 40, 50, 65, 80]);
    // The offset ratio (actual/indicated) must be identical at every row and match the
    // single-point calculateSpeedometerTool result for the same tire pair and unit.
    const single = calculateSpeedometerTool(original, proposed, kmh.value[0]!.indicatedSpeed, 'km/h');
    expect(single.ok).toBe(true);
    if (!single.ok) return;
    const expectedFactor = single.value.actualSpeed / single.value.indicatedSpeed;
    for (const row of kmh.value) expect(row.actualSpeed / row.indicatedSpeed).toBeCloseTo(expectedFactor, 3);
  });

  it('returns structured validation errors for invalid tool input', () => {
    expect(calculateTireSizeTool({ ...original, widthMm: 0 })).toMatchObject({ ok: false, issues: [{ field: 'tire.widthMm' }] });
    expect(calculateSpeedometerTool(original, proposed, 0, 'km/h')).toMatchObject({ ok: false, issues: [{ field: 'indicatedSpeed' }] });
    expect(nearEquivalentSizesTool({ ...original, widthMm: 0 })).toMatchObject({ ok: false, issues: [{ field: 'tire.widthMm' }] });
    expect(speedometerTableTool({ ...original, widthMm: 0 }, proposed, 'km/h')).toMatchObject({ ok: false, issues: [{ field: 'original.widthMm' }] });
  });
});
