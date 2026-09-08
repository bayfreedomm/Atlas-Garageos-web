import { describe, expect, it } from 'vitest';
import { activeGaragePresentation, mapCellPresentation, PRODUCT_NAVIGATION, resultCardModel, validationIssueText, wizardProgress } from '../../src/ui/presentation-model';
import type { CombinedFitmentCandidate } from '../../src/core/fitment/combined-candidate';
import type { GarageState } from '../../src/domain/garage';

describe('responsive presentation models', () => {
  it('defines stable product navigation and clamps wizard progression', () => {
    expect(PRODUCT_NAVIGATION.map(({ id }) => id)).toEqual(['garage', 'fitment', 'tools']);
    expect(wizardProgress(0)).toEqual({ current: 1, total: 5, percent: 20, canGoBack: false, canContinue: true });
    expect(wizardProgress(7)).toEqual({ current: 5, total: 5, percent: 100, canGoBack: true, canContinue: false });
  });

  it('maps result cards without calling green safe', () => {
    const candidate = { rank: 1, setup: { wheel: { diameterInches: 19, widthInches: 8.5, offsetMm: 35 }, tire: { widthMm: 235, aspectRatio: 40, rimDiameterInches: 19 } }, wheelGeometry: { state: 'green' }, explanation: { constraints: [] } } as unknown as CombinedFitmentCandidate;
    const model = resultCardModel(candidate);
    expect(model).toMatchObject({ wheelPrimary: '19 × 8.5J', wheelOffset: 'ET35', tireSize: '235/40 R19', stateLabel: 'GREEN' });
    expect(model.stateSummary).toBe('No calculated wheel overlap in the supplied measurements');
    expect(JSON.stringify(model).toLowerCase()).not.toContain('safe');
  });

  it('gives map cells color-independent status and selection text', () => {
    const cell = { wheelWidthInches: 8.5, offsetMm: 35, state: 'yellow', projectedInnerClearanceMm: 4, projectedOuterClearanceMm: 8 } as Parameters<typeof mapCellPresentation>[0];
    expect(mapCellPresentation(cell, true)).toEqual({ stateLabel: 'YELLOW', symbol: '!', selected: true, ariaLabel: '8.5J ET35: YELLOW; projected inner 4 mm; projected outer 8 mm' });
  });

  it('rounds map metrics for readable assistive labels', () => {
    const cell = { wheelWidthInches: 8.5, offsetMm: 20, state: 'red', projectedInnerClearanceMm: 41.65, projectedOuterClearanceMm: -4.350000000000001 } as Parameters<typeof mapCellPresentation>[0];
    expect(mapCellPresentation(cell, false).ariaLabel).toContain('projected outer -4.35 mm');
  });

  it('renders field-specific validation copy without internal paths', () => {
    expect(validationIssueText({ code: 'out-of-range', field: 'current.widthMm', message: 'widthMm must be between 80 and 500.' })).toBe('Original tire width: tire width must be between 80 and 500.');
  });

  it('filters Garage content to the active vehicle', () => {
    const state = { schemaVersion: 2, activeVehicleId: 'car-2', vehicles: [{ id: 'car-1' }, { id: 'car-2', displayName: 'Project car' }], savedSetups: [{ id: 'one', vehicleId: 'car-1' }, { id: 'two', vehicleId: 'car-2' }], clearanceProfiles: [{ vehicleId: 'car-1' }] } as unknown as GarageState;
    const model = activeGaragePresentation(state);
    expect(model.vehicle?.id).toBe('car-2');
    expect(model.setups.map(({ id }) => id)).toEqual(['two']);
    expect(model.isMeasured).toBe(false);
  });
});
