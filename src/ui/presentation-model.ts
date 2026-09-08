import type { CombinedFitmentCandidate } from '../core/fitment/combined-candidate';
import type { FitmentMapCell } from '../core/fitment/map';
import type { GarageState } from '../domain/garage';
import type { FitmentComparisonResult } from '../domain/vehicle';
import type { ValidationIssue } from '../domain/validation';
import { formatNumber } from './format-number';

export type ProductSection = 'garage' | 'fitment' | 'tools';

function compactMetric(value: number): string {
  return String(Number(value.toFixed(3)));
}

const FIELD_NAMES: Readonly<Record<string, string>> = Object.freeze({
  widthMm: 'tire width',
  aspectRatio: 'tire profile',
  rimDiameterInches: 'rim diameter',
  wheelWidthInches: 'wheel width',
  widthInches: 'wheel width',
  diameterInches: 'wheel diameter',
  offsetMm: 'wheel offset',
  indicatedSpeed: 'indicated speed',
  measuredInnerClearanceMm: 'inner clearance',
  measuredOuterClearanceMm: 'outer clearance',
  minimumDesiredInnerClearanceMm: 'desired inner clearance',
  minimumDesiredOuterClearanceMm: 'desired outer clearance',
});

export function validationIssueText(issue: ValidationIssue): string {
  const parts = issue.field.split('.');
  const field = parts.at(-1) ?? issue.field;
  const context = parts[0] === 'current' || parts[0] === 'original' ? 'Original' : parts[0] === 'proposed' || parts[0] === 'new' ? 'New' : parts[0] === 'tire' ? 'Tire' : '';
  const label = `${context} ${FIELD_NAMES[field] ?? field}`.trim();
  if (issue.code === 'not-a-number') return `Enter a valid ${label.toLowerCase()}.`;
  if (issue.code === 'not-an-integer') return `${label} must be a whole number.`;
  const message = issue.message.replace(field, FIELD_NAMES[field] ?? field);
  return `${label}: ${message}`;
}

export function measurementErrorGuidance(issues: readonly ValidationIssue[]) {
  const needsMeasurement = issues.some(({ field }) => field.includes('measuredInnerClearanceMm') || field.includes('measuredOuterClearanceMm'));
  return needsMeasurement
    ? Object.freeze({ message: 'We need your inner and outer clearance measurements first.', ctaLabel: 'Measure my car', href: '#measure-flow' })
    : null;
}

export function fitmentComparisonSummary(result: FitmentComparisonResult): string {
  const diameterDirection = result.diameterDifferenceMm >= 0 ? 'larger' : 'smaller';
  const outerDirection = result.wheelOuterPokeChangeMm >= 0 ? 'farther outward' : 'less outward';
  const innerDirection = result.wheelInnerPositionChangeMm >= 0 ? 'farther inward' : 'less inward';
  return `The new tire is ${formatNumber(Math.abs(result.diameterDifferenceMm))} mm ${diameterDirection} overall. The wheel reaches ${formatNumber(Math.abs(result.wheelOuterPokeChangeMm))} mm ${outerDirection} and ${formatNumber(Math.abs(result.wheelInnerPositionChangeMm))} mm ${innerDirection}.`;
}

export const PRODUCT_NAVIGATION = Object.freeze([
  { id: 'garage', label: 'Garage', href: '#garage' },
  { id: 'fitment', label: 'Fitment', href: '#fitment' },
  { id: 'tools', label: 'Tools', href: '#tools' },
] as const);

export function wizardProgress(step: number, total = 5) {
  const current = Math.min(total, Math.max(1, Math.trunc(step)));
  return Object.freeze({ current, total, percent: (current / total) * 100, canGoBack: current > 1, canContinue: current < total });
}

export function resultCardModel(candidate: CombinedFitmentCandidate) {
  const state = candidate.wheelGeometry.state;
  const hasUserTargets = candidate.explanation.constraints.length > 0;
  return Object.freeze({
    rank: candidate.rank,
    wheelPrimary: `${candidate.setup.wheel.diameterInches} × ${candidate.setup.wheel.widthInches}J`,
    wheelOffset: `ET${candidate.setup.wheel.offsetMm}`,
    tireSize: `${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio} R${candidate.setup.tire.rimDiameterInches}`,
    state,
    stateLabel: state.toUpperCase(),
    stateSummary:
      state === 'green'
        ? hasUserTargets
          ? 'Meets the supplied geometric targets'
          : 'No calculated wheel overlap in the supplied measurements'
        : hasUserTargets
          ? 'Misses at least one supplied target without calculated overlap'
          : 'No calculated overlap, but less measured clearance remains',
  });
}

export function mapCellPresentation(cell: FitmentMapCell, selected: boolean) {
  const stateLabel = cell.state.toUpperCase();
  const symbol = cell.state === 'green' ? '✓' : cell.state === 'yellow' ? '!' : '×';
  return Object.freeze({
    stateLabel,
    symbol,
    selected,
    ariaLabel: `${cell.wheelWidthInches}J ET${cell.offsetMm}: ${stateLabel}; projected inner ${compactMetric(cell.projectedInnerClearanceMm)} mm; projected outer ${compactMetric(cell.projectedOuterClearanceMm)} mm`,
  });
}

export function activeGaragePresentation(state: GarageState) {
  const vehicle = state.vehicles.find((item) => item.id === state.activeVehicleId) ?? null;
  const clearance = state.clearanceProfiles.find((item) => item.vehicleId === state.activeVehicleId) ?? null;
  const setups = Object.freeze(state.savedSetups.filter((item) => item.vehicleId === state.activeVehicleId));
  const currentSetup = vehicle?.activeSetup ?? clearance?.baselineSetup ?? setups.at(-1)?.setup ?? null;
  return Object.freeze({ vehicle, clearance, setups, currentSetup, isMeasured: clearance !== null });
}
