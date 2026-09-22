import { describe, expect, it } from 'vitest';
import { guidedTireDecision } from '../../src/ui/guided-tire-decision';

const proposed = { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 };
const original = { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 };

describe('guided tire decision', () => {
  it('prioritizes speedometer when diameter changes and carries the proposed size', () => {
    const guide = guidedTireDecision('en', original, proposed, 10.9);
    expect(guide.primaryHref).toBe('/tools/speedometer-error-calculator/?current=225-45-18&new=235-40-19');
    expect(guide.secondaryHref).toBe('/tools/tire-size-calculator/?size=235-40-19');
    expect(guide.setupHref).toBe('/fitment-studio/?current=225-45-18&new=235-40-19#compare');
    expect(guide.observation).toContain('larger nominal diameter');
  });

  it('prioritizes wheel geometry when only width changes', () => {
    const guide = guidedTireDecision('de', original, proposed, 0);
    expect(guide.primaryHref).toBe('/de/tools/felgen-et-rechner/');
    expect(guide.observation).toContain('breiter');
  });

  it('does not infer fitment from equal nominal dimensions', () => {
    const guide = guidedTireDecision('es', proposed, proposed, 0);
    expect(guide.primaryHref).toBe('/es/tools/indice-carga-velocidad-neumatico/');
    expect(guide.reason).toContain('no prueban compatibilidad');
  });
});
