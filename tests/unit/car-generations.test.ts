import { describe, expect, it } from 'vitest';
import { carModelByKey } from '../../src/data/cars';
import { CAR_GENERATIONS, GENERATION_SOURCES, generationSummaries } from '../../src/data/car-generations';
import { generationView } from '../../src/ui/car-generation-view';
import { carModelLocaleMeta } from '../../src/ui/car-locale';

const NOW = 2026;
const summary = (key: string, label: string) => {
  const [make, model] = key.split('/') as [string, string];
  return generationSummaries(carModelByKey(make, model)!, NOW).find((s) => s.generation.label === label)!;
};

describe('car generations', () => {
  it('every table entry has a published model, two sources and sane years', () => {
    for (const [key, generations] of Object.entries(CAR_GENERATIONS)) {
      const [make, model] = key.split('/') as [string, string];
      expect(carModelByKey(make, model), key).toBeDefined();
      expect(GENERATION_SOURCES[key]?.length, key).toBe(2);
      expect(GENERATION_SOURCES[key]!.some((url) => url.startsWith('https://en.wikipedia.org/')), key).toBe(true);
      expect(GENERATION_SOURCES[key]!.some((url) => url.startsWith('https://de.wikipedia.org/')), key).toBe(true);
      for (const g of generations) if (g.to !== undefined) expect(g.from, `${key} ${g.label}`).toBeLessThanOrEqual(g.to);
    }
  });

  it('never counts one wheel record in two generations', () => {
    for (const key of Object.keys(CAR_GENERATIONS)) {
      const [make, modelSlug] = key.split('/') as [string, string];
      const model = carModelByKey(make, modelSlug)!;
      const total = generationSummaries(model, NOW).reduce((sum, s) => sum + s.records, 0);
      expect(total, key).toBeLessThanOrEqual(model.wheels.length);
    }
  });

  it('names the expected pattern for well-known generations', () => {
    expect(summary('opel/corsa', 'F')).toMatchObject({ pcd: '4x108', clear: true });
    expect(summary('renault/megane', '4')).toMatchObject({ pcd: '5x114.3', clear: true });
    expect(summary('renault/megane', '2')).toMatchObject({ pcd: '4x100', clear: true });
    expect(summary('volkswagen/passat', 'B8')).toMatchObject({ pcd: '5x112', clear: true });
  });

  it('keeps performance hubs out of the headline pattern', () => {
    expect(summary('honda/civic', '11').pcd).toBe('5x114.3');
    expect(summary('hyundai/i20', '3').pcd).toBe('4x100');
  });

  it('does not claim one pattern when regular versions disagree', () => {
    const focus = generationView(carModelByKey('ford', 'focus')!, 'tr', NOW)!;
    const two = focus.rows.find((row) => row.name.endsWith(' 2'))!;
    expect(two.pcd).toBeUndefined();
    expect(two.patterns.length).toBeGreaterThan(1);
    expect(focus.faqs.some((faq) => faq.q.includes('Focus 2 '))).toBe(false);
  });

  it('puts the generation names searched for into titles', () => {
    expect(carModelLocaleMeta(carModelByKey('renault', 'megane')!, 'tr').title).toMatch(/^Renault Megane 4, 3, 2 bijon aralığı/);
    expect(carModelLocaleMeta(carModelByKey('opel', 'corsa')!, 'de').title).toContain('Corsa F');
  });
});
