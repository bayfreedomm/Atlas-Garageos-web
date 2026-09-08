import { preflightCombinedSearch, searchCombinedFitment, type CombinedSearchPreflight, type CombinedSearchRequest, type CombinedSearchResult } from '../../core/fitment/combined-search';
import type { NumericRange } from '../../core/units/numeric-range';
import { createVehicleClearanceProfile } from '../../domain/clearance';
import { createFitmentGoal } from '../../domain/fitment-goal';
import type { ValidationIssue, ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';
import { createSetupFromInput, type SetupInput } from '../compare/compare-setups';

export interface FitmentExplorerInput {
  readonly vehicleId: string;
  readonly baselineSetupId: string | null;
  readonly baselineSetup: SetupInput;
  readonly measuredInnerClearanceMm: number | null;
  readonly measuredOuterClearanceMm: number | null;
  readonly desiredInnerClearanceMm: number | null;
  readonly desiredOuterClearanceMm: number | null;
  readonly goal: unknown;
  readonly wheelWidthRangeInches: NumericRange;
  readonly wheelOffsetRangeMm: NumericRange;
  readonly targetRimDiameterInches: number;
  readonly tireWidthRangeMm: NumericRange;
  readonly tireAspectRatioRange: NumericRange;
  readonly maximumAbsoluteDiameterDifferencePercent: number | null;
  readonly maxResults: number;
  readonly nowIso: string;
}

export function createCombinedSearchRequest(input: FitmentExplorerInput): ValidationResult<CombinedSearchRequest> {
  const issues: ValidationIssue[] = [];
  if (input.measuredInnerClearanceMm === null) issues.push({ code: 'required', field: 'measuredInnerClearanceMm', message: 'Measure inner clearance before searching.' });
  if (input.measuredOuterClearanceMm === null) issues.push({ code: 'required', field: 'measuredOuterClearanceMm', message: 'Measure outer/fender clearance before searching.' });
  const setup = createSetupFromInput(input.baselineSetup, 'baseline');
  const goal = createFitmentGoal(input.goal);
  if (!setup.ok) issues.push(...setup.issues);
  if (!goal.ok) issues.push(...goal.issues);
  if (issues.length > 0 || !setup.ok || !goal.ok || input.measuredInnerClearanceMm === null || input.measuredOuterClearanceMm === null) return invalid(...issues);
  const profile = createVehicleClearanceProfile({
    vehicleId: input.vehicleId,
    baselineSetupId: input.baselineSetupId,
    baselineSetup: setup.value,
    measuredInnerClearanceMm: input.measuredInnerClearanceMm,
    measuredOuterClearanceMm: input.measuredOuterClearanceMm,
    minimumDesiredInnerClearanceMm: input.desiredInnerClearanceMm,
    minimumDesiredOuterClearanceMm: input.desiredOuterClearanceMm,
    updatedAt: input.nowIso,
  });
  if (!profile.ok) return profile;
  return valid({
    clearanceProfile: profile.value,
    goal: goal.value,
    wheelWidthRangeInches: input.wheelWidthRangeInches,
    wheelOffsetRangeMm: input.wheelOffsetRangeMm,
    targetRimDiameterInches: input.targetRimDiameterInches,
    tireWidthRangeMm: input.tireWidthRangeMm,
    tireAspectRatioRange: input.tireAspectRatioRange,
    maximumAbsoluteDiameterDifferencePercent: input.maximumAbsoluteDiameterDifferencePercent,
    desiredInnerClearanceMm: input.desiredInnerClearanceMm,
    desiredOuterClearanceMm: input.desiredOuterClearanceMm,
    maxResults: input.maxResults,
  });
}

export function preflightFitmentExplorer(input: FitmentExplorerInput): ValidationResult<CombinedSearchPreflight> {
  const request = createCombinedSearchRequest(input);
  return request.ok ? preflightCombinedSearch(request.value) : request;
}

export function searchFitmentExplorer(input: FitmentExplorerInput): ValidationResult<CombinedSearchResult> {
  const request = createCombinedSearchRequest(input);
  return request.ok ? searchCombinedFitment(request.value) : request;
}
