import { describe, expect, it } from 'vitest';
import { toolRegistry } from '../../src/seo/tool-registry';
import { toolNextDecision } from '../../src/ui/tool-next-decision';

describe('tool next decisions', () => {
  it('gives every registered tool a localized, crawlable next step', () => {
    for (const tool of toolRegistry) {
      for (const locale of ['en', 'de', 'es'] as const) {
        const model = toolNextDecision(tool.id, locale);
        expect(model.actions).toHaveLength(1);
        expect(model.actions[0]?.href).toMatch(/^\//);
        expect(model.actions[0]?.detail.length).toBeGreaterThan(25);
        expect(model.actions[0]?.href).not.toContain('undefined');
      }
    }
  });

  it('keeps the wheel journey about measurement, not automatic fitment', () => {
    const model = toolNextDecision('wheel-offset-calculator', 'en');
    expect(model.actions[0]?.href).toBe('/tools/measure-my-car/');
    expect(model.actions[0]?.detail).toContain('Measure real');
    const german = toolNextDecision('wheel-offset-calculator', 'de');
    expect(german.supportingActions?.find((action) => action.id === 'support-fitment-studio')?.href).toBe('/fitment-studio/');
  });
});
