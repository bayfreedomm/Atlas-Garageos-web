import { describe, expect, it } from 'vitest';
import { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool } from '../../src/features/tools/calculator-tools';
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

  it('returns structured validation errors for invalid tool input', () => {
    expect(calculateTireSizeTool({ ...original, widthMm: 0 })).toMatchObject({ ok: false, issues: [{ field: 'tire.widthMm' }] });
    expect(calculateSpeedometerTool(original, proposed, 0, 'km/h')).toMatchObject({ ok: false, issues: [{ field: 'indicatedSpeed' }] });
  });
});
