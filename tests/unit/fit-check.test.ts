import { describe, expect, it } from 'vitest';
import { countByStatus, runFitCheck } from '../../src/features/tools/fit-check';
import { EVIDENCE_LEVELS, weakestEvidence } from '../../src/domain/evidence';
import { evidenceText } from '../../src/localization/evidence-catalog';
import { fitCheckText } from '../../src/localization/fit-check-catalog';

const tire = (widthMm: number, aspectRatio: number, rimDiameterInches: number) => ({ widthMm, aspectRatio, rimDiameterInches });
const ok = <T>(result: { ok: true; value: T } | { ok: false }): T => { if (!result.ok) throw new Error('expected ok'); return result.value; };
const check = (checks: readonly { id: string; status: string; evidence: string }[], id: string) => checks.find((c) => c.id === id)!;

describe('tire fit check', () => {
  it('treats a classic plus-one size as geometrically within the rule of thumb', () => {
    const r = ok(runFitCheck({ current: tire(205, 55, 16), proposed: tire(225, 45, 17) }));
    expect(Math.abs(r.diameterDifferencePercent)).toBeLessThan(1);
    expect(['close', 'within-rule']).toContain(r.verdict);
    expect(check(r.checks, 'diameter').status).toBe('pass');
    expect(r.rimChanges).toBe(true);
  });

  it('flags a large diameter change and a lower-reading speedometer', () => {
    const r = ok(runFitCheck({ current: tire(205, 55, 16), proposed: tire(235, 55, 17) }));
    expect(r.diameterDifferencePercent).toBeGreaterThan(5);
    expect(r.verdict).toBe('large');
    expect(check(r.checks, 'diameter').status).toBe('conflict');
    expect(check(r.checks, 'speedometer').status).toBe('review');
    expect(r.actualAtIndicated100).toBeGreaterThan(105);
  });

  it('never upgrades a doubtful size to a close match', () => {
    const r = ok(runFitCheck({ current: tire(225, 45, 17), proposed: tire(237, 43, 17) }));
    expect(check(r.checks, 'availability-proposed').status).toBe('conflict');
    expect(r.verdict).toBe('review');
  });

  it('always lists what it cannot verify, with the NOT VERIFIED evidence level', () => {
    const r = ok(runFitCheck({ current: tire(225, 45, 17), proposed: tire(225, 45, 17) }));
    for (const id of ['rim-width', 'load-speed', 'clearance', 'approval']) {
      expect(check(r.checks, id)).toMatchObject({ status: 'unknown', evidence: 'unknown' });
    }
    expect(countByStatus(r.checks).unknown).toBe(4);
    expect(r.checks.some((c) => c.evidence === 'oem-verified' || c.evidence === 'official')).toBe(false);
  });

  it('runs the wheel-position engine only with a complete wheel set', () => {
    const without = ok(runFitCheck({ current: tire(225, 45, 17), proposed: tire(225, 40, 18) }));
    expect(without.wheelPosition).toBeNull();
    const withWheels = ok(runFitCheck({ current: tire(225, 45, 17), proposed: tire(225, 40, 18), wheels: { originalWidthInches: 7.5, originalOffsetMm: 45, newWidthInches: 8, newOffsetMm: 40 } }));
    expect(withWheels.wheelPosition?.outerPokeChangeMm).toBeCloseTo(11.35, 2);
    expect(check(withWheels.checks, 'wheel-position').evidence).toBe('calculated');
  });

  it('rejects invalid sizes instead of guessing', () => {
    expect(runFitCheck({ current: tire(0, 45, 17), proposed: tire(225, 45, 17) }).ok).toBe(false);
  });
});

describe('evidence layer', () => {
  it('orders levels and picks the weakest', () => {
    expect(weakestEvidence(['calculated', 'reference'])).toBe('calculated');
    expect(weakestEvidence(['reference', 'unknown', 'calculated'])).toBe('unknown');
  });

  it('has a label and a meaning for every level in every published language', () => {
    for (const locale of ['en', 'de', 'es'] as const) {
      for (const level of EVIDENCE_LEVELS) {
        expect(evidenceText[locale][level].label.length).toBeGreaterThan(3);
        expect(evidenceText[locale][level].meaning.length).toBeGreaterThan(20);
      }
      expect(Object.keys(fitCheckText[locale].verdictTitle)).toHaveLength(4);
    }
  });
});
