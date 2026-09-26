import { describe, expect, it } from 'vitest';
import {
  createDtcCatalog,
  createDtcCode,
  createDtcRecord,
  dtcPublicationIssues,
  publishableDtcRecords,
} from '../../src/domain/dtc';
import { dtcRecords } from '../../src/data/dtc-records';

const evidence = {
  id: 'source-1',
  sourceType: 'official-standard',
  level: 'official',
  publisher: 'Example standards publisher',
  title: 'Licensed diagnostic reference',
  locator: 'doi:example/dtc',
  scope: 'Synthetic test fixture only.',
  retrievedAt: '2026-09-26T00:00:00.000Z',
  reusePermission: 'licensed',
  permissionLocator: 'license:test-only',
  reviewNote: 'Fixture verifies the publication gate; it is not production DTC data.',
} as const;

const record = (code: string, overrides: Record<string, unknown> = {}) => ({
  code,
  allocation: 'standardized',
  title: `Synthetic ${code}`,
  meaning: 'Synthetic meaning used only to validate the domain boundary.',
  symptoms: ['Synthetic symptom'],
  possibleCauses: ['Synthetic cause'],
  diagnosticOrder: ['Confirm the code with an appropriate scan tool.'],
  limitations: ['A code does not identify a failed part by itself.'],
  nextActions: ['Use vehicle-specific service information before replacing parts.'],
  relatedCodes: [],
  urgency: 'unknown',
  confidence: 'official',
  evidence: [evidence],
  reviewedAt: '2026-09-26T00:00:00.000Z',
  status: 'published',
  ...overrides,
});

describe('DTC normalization and trust boundary', () => {
  it('normalizes canonical five-character codes and accepts hexadecimal suffixes', () => {
    expect(createDtcCode(' p0420 ')).toMatchObject({ ok: true, value: 'P0420' });
    expect(createDtcCode('p0a80')).toMatchObject({ ok: true, value: 'P0A80' });
  });

  it('rejects malformed and out-of-family values', () => {
    for (const value of ['0420', 'P-0420', 'P4420', 'X0420', 'P04G0', '', null]) {
      expect(createDtcCode(value).ok).toBe(false);
    }
  });

  it('derives route-safe slugs and families from validated codes', () => {
    const result = createDtcRecord(record('U0100'));
    expect(result.ok && result.value).toMatchObject({ code: 'U0100', slug: 'u0100', family: 'network', standard: 'SAE-J2012' });
  });
});

describe('DTC publication gate', () => {
  it('keeps every production record publishable and route-safe', () => {
    expect(dtcRecords.length).toBeGreaterThanOrEqual(16);
    for (const item of dtcRecords) {
      expect(dtcPublicationIssues(item)).toEqual([]);
      expect(item.slug).toBe(item.code.toLowerCase());
    }
  });

  it('blocks records without confirmed reusable authoritative evidence', () => {
    const result = createDtcRecord(record('P0420', {
      evidence: [{ ...evidence, reusePermission: 'citation-only' }],
    }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(dtcPublicationIssues(result.value).map((entry) => entry.field)).toContain('evidence');
  });

  it('does not guess standardized versus manufacturer-specific allocation from the code digits', () => {
    const result = createDtcRecord(record('P1420', { allocation: 'unknown' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(dtcPublicationIssues(result.value).map((entry) => entry.field)).toContain('allocation');
  });

  it('blocks thin pages even when a code and source are present', () => {
    const result = createDtcRecord(record('P0300', {
      diagnosticOrder: [],
      limitations: [],
      nextActions: [],
    }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(dtcPublicationIssues(result.value).map((entry) => entry.field)).toEqual(expect.arrayContaining(['diagnosticOrder', 'limitations', 'nextActions']));
  });

  it('keeps drafts out of the public collection', () => {
    const catalog = createDtcCatalog([
      record('P0420'),
      record('P0300', { status: 'draft', reviewedAt: null }),
    ]);
    expect(catalog.ok).toBe(true);
    if (!catalog.ok) return;
    expect(publishableDtcRecords(catalog.value).map(({ code }) => code)).toEqual(['P0420']);
  });

  it('rejects duplicate codes and dangling relationships at catalog load time', () => {
    expect(createDtcCatalog([record('P0420'), record('p0420')]).ok).toBe(false);
    expect(createDtcCatalog([record('P0420', { relatedCodes: ['P0300'] })]).ok).toBe(false);
  });

  it('accepts a complete relationship only when both records exist', () => {
    const catalog = createDtcCatalog([
      record('P0420', { relatedCodes: ['P0300'] }),
      record('P0300', { relatedCodes: ['P0420'] }),
    ]);
    expect(catalog.ok).toBe(true);
  });
});
