import { describe, expect, it } from 'vitest';
import { parseJourneyPrefill } from '../../src/ui/journey-prefill';

const current = { tireWidthMm: 225, tireAspectRatio: 45, rimDiameterInches: 18, wheelWidthInches: 8, wheelOffsetMm: 40 };
const proposed = { tireWidthMm: 235, tireAspectRatio: 40, rimDiameterInches: 19, wheelWidthInches: 8.5, wheelOffsetMm: 35 };

describe('journey prefill', () => {
  it('carries validated tire sizes without inventing wheel dimensions', () => {
    const result = parseJourneyPrefill('?current=205-55-16&new=215-50-17', current, proposed);
    expect(result?.source).toBe('tire');
    expect(result?.current.rimDiameterInches).toBe(16);
    expect(result?.proposed.wheelWidthInches).toBe(8.5);
  });

  it('carries wheel width and ET without altering tire input', () => {
    const result = parseJourneyPrefill('?ow=7.5&oe=45&nw=8&ne=35', current, proposed);
    expect(result?.source).toBe('wheel');
    expect(result?.proposed.wheelOffsetMm).toBe(35);
    expect(result?.current.tireWidthMm).toBe(225);
  });

  it('rejects incomplete, out-of-domain and oversized URL state', () => {
    expect(parseJourneyPrefill('?current=225-45-18', current, proposed)).toBeNull();
    expect(parseJourneyPrefill('?ow=100&oe=40&nw=8&ne=35', current, proposed)).toBeNull();
    expect(parseJourneyPrefill(`?current=${'9'.repeat(400)}`, current, proposed)).toBeNull();
  });
});
