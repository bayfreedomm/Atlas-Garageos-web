import type { ValidationResult } from './validation';
import { invalid, valid } from './validation';

export const FITMENT_GOALS = [
  'closestToCurrent',
  'moreOuterPresence',
  'moreInnerClearance',
  'balancedClearance',
  'targetOuterClearance',
] as const;

export type FitmentGoal = typeof FITMENT_GOALS[number];

export function createFitmentGoal(value: unknown): ValidationResult<FitmentGoal> {
  if (typeof value !== 'string' || !FITMENT_GOALS.includes(value as FitmentGoal)) {
    return invalid({ code: 'invalid-format', field: 'goal', message: `goal must be one of: ${FITMENT_GOALS.join(', ')}.`, received: value });
  }
  return valid(value as FitmentGoal);
}
