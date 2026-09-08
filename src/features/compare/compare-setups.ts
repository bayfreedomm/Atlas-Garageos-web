import { compareFitment } from '../../core/fitment/compare';
import { createTireSize, createVehicleSetup, createWheelSpec, type FitmentComparisonResult } from '../../domain/vehicle';
import type { ValidationIssue, ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';

export interface SetupInput {
  readonly tireWidthMm: number;
  readonly tireAspectRatio: number;
  readonly rimDiameterInches: number;
  readonly wheelWidthInches: number;
  readonly wheelOffsetMm: number;
}

function buildSetup(input: SetupInput, prefix: string) {
  const tire = createTireSize({
    widthMm: input.tireWidthMm,
    aspectRatio: input.tireAspectRatio,
    rimDiameterInches: input.rimDiameterInches,
  });
  const wheel = createWheelSpec({
    diameterInches: input.rimDiameterInches,
    widthInches: input.wheelWidthInches,
    offsetMm: input.wheelOffsetMm,
  });
  const issues: ValidationIssue[] = [];
  if (!tire.ok) issues.push(...tire.issues.map((issue) => ({ ...issue, field: `${prefix}.${issue.field}` })));
  if (!wheel.ok) issues.push(...wheel.issues.map((issue) => ({ ...issue, field: `${prefix}.${issue.field}` })));
  if (!tire.ok || !wheel.ok) return invalid(...issues);
  return createVehicleSetup(tire.value, wheel.value);
}

export function compareSetupInputs(current: SetupInput, proposed: SetupInput): ValidationResult<FitmentComparisonResult> {
  const currentSetup = buildSetup(current, 'current');
  const proposedSetup = buildSetup(proposed, 'proposed');
  const issues: ValidationIssue[] = [];
  if (!currentSetup.ok) issues.push(...currentSetup.issues);
  if (!proposedSetup.ok) issues.push(...proposedSetup.issues);
  if (!currentSetup.ok || !proposedSetup.ok) return invalid(...issues);
  return valid(compareFitment(currentSetup.value, proposedSetup.value));
}
