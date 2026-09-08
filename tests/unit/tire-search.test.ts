import { describe, expect, it } from 'vitest';
import { searchTireCandidates } from '../../src/core/tire/search';
import { createTireSize } from '../../src/domain/vehicle';

function baseline() {
  const result = createTireSize({ widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 });
  if (!result.ok) throw new Error('Baseline fixture must be valid');
  return result.value;
}

describe('tire candidate search', () => {
  it('searches a target rim and ranks by absolute diameter difference', () => {
    const result = searchTireCandidates({
      baselineTire: baseline(), targetRimDiameterInches: 19,
      widthRangeMm: { min: 225, max: 245, step: 10 },
      aspectRatioRange: { min: 35, max: 45, step: 5 },
      maximumAbsoluteDiameterDifferencePercent: null,
      maxResults: 20,
    });
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.evaluatedCandidateCount).toBe(9);
    expect(result.value.candidates).toHaveLength(9);
    expect(result.value.candidates.every(({ tire }) => tire.rimDiameterInches === 19)).toBe(true);
    const absoluteDifferences = result.value.candidates.map((item) => Math.abs(item.diameterDifferencePercent));
    expect(absoluteDifferences).toEqual([...absoluteDifferences].sort((a, b) => a - b));
  });

  it('does not invent a tire percentage threshold', () => {
    const unrestricted = searchTireCandidates({
      baselineTire: baseline(), targetRimDiameterInches: 19,
      widthRangeMm: { min: 225, max: 245, step: 10 }, aspectRatioRange: { min: 35, max: 45, step: 5 },
      maximumAbsoluteDiameterDifferencePercent: null, maxResults: 20,
    });
    const restricted = searchTireCandidates({
      baselineTire: baseline(), targetRimDiameterInches: 19,
      widthRangeMm: { min: 225, max: 245, step: 10 }, aspectRatioRange: { min: 35, max: 45, step: 5 },
      maximumAbsoluteDiameterDifferencePercent: 1, maxResults: 20,
    });
    if (!unrestricted.ok || !restricted.ok) throw new Error('Searches must be valid');
    expect(unrestricted.value.candidates).toHaveLength(9);
    expect(restricted.value.candidates.length).toBeLessThan(9);
    expect(restricted.value.candidates.every((item) => Math.abs(item.diameterDifferencePercent) <= 1)).toBe(true);
  });

  it('handles the identical baseline candidate exactly', () => {
    const result = searchTireCandidates({
      baselineTire: baseline(), targetRimDiameterInches: 18,
      widthRangeMm: { min: 225, max: 225, step: 10 }, aspectRatioRange: { min: 45, max: 45, step: 5 },
      maximumAbsoluteDiameterDifferencePercent: null, maxResults: 1,
    });
    if (!result.ok) throw new Error('Search must be valid');
    expect(result.value.candidates[0]).toMatchObject({ diameterDifferenceMm: 0, diameterDifferencePercent: 0, sidewallDifferenceMm: 0, circumferenceDifferenceMm: 0, speedometerDifferencePercent: 0 });
  });
});
