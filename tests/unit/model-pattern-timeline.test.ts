import { describe, expect, it } from 'vitest';
import { publishedCarModels } from '../../src/data/cars';
import { patternTimeline, periodYears } from '../../src/ui/model-pattern-timeline';
import { modelFlowSizes } from '../../src/ui/model-tire-flow';

const model = (make: string, slug: string) => publishedCarModels.find((m) => m.makeSlug === make && m.modelSlug === slug)!;

describe('bolt pattern by year', () => {
  it('splits the Megane into its recorded patterns instead of one pattern for 1999–2027', () => {
    const timeline = patternTimeline(model('renault', 'megane'));
    expect(timeline.length).toBeGreaterThan(1);
    expect(timeline[0]!.pcd).toBe('5x114.3');
    expect(timeline[0]!.from).toBeGreaterThan(2005);
    const old = timeline.find((period) => period.pcd === '4x100');
    expect(old).toBeDefined();
    expect(old!.to).toBeLessThan(timeline[0]!.from + 1);
    expect(periodYears(timeline[0]!)).toMatch(/^\d{4}(–\d{4})?$/);
  });

  it('counts every record exactly once and keeps years ordered', () => {
    for (const m of publishedCarModels.slice(0, 400)) {
      const timeline = patternTimeline(m);
      const withData = m.wheels.filter((row) => row[4] && (row[1] ?? row[2])).length;
      expect(timeline.reduce((sum, period) => sum + period.records, 0)).toBe(withData);
      for (const period of timeline) expect(period.from).toBeLessThanOrEqual(period.to);
    }
  });

  it('names the curated vehicle a standard size belongs to', () => {
    const standard = modelFlowSizes(model('renault', 'megane')).find((size) => size.role === 'standard');
    expect(standard?.source).toMatch(/M[eé]gane/);
  });
});
