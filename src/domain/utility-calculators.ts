import { invalid, valid, type ValidationIssue, type ValidationResult } from './validation';
import type { UnitSystem } from './preferences';
export type { UnitSystem } from './preferences';

declare const positiveQuantityBrand: unique symbol;
declare const nonNegativeQuantityBrand: unique symbol;

export type PositiveQuantity = number & { readonly [positiveQuantityBrand]: true };
export type NonNegativeQuantity = number & { readonly [nonNegativeQuantityBrand]: true };
export type FuelEconomyUnit = 'us-mpg' | 'imperial-mpg' | 'l100km';
export type PressureUnit = 'psi' | 'bar' | 'kpa';
export type PowerUnit = 'hp' | 'kw';
export type TorqueUnit = 'nm' | 'lb-ft';
export type WeightUnit = 'kg' | 'lb';

const numberIssue = (field: string, value: unknown): ValidationIssue => ({ code: 'not-a-number', field, message: `${field} must be a finite number.`, received: value });
const MINIMUM_POSITIVE_QUANTITY = 1e-9;
const MAXIMUM_QUANTITY = 1e9;
const rangeIssue = (field: string, value: number, minimum: number): ValidationIssue => ({ code: 'out-of-range', field, message: `${field} must be between ${minimum} and ${MAXIMUM_QUANTITY}.`, received: value, minimum, maximum: MAXIMUM_QUANTITY });

export function createPositiveQuantity(value: number, field: string): ValidationResult<PositiveQuantity> {
  if (!Number.isFinite(value)) return invalid(numberIssue(field, value));
  if (value < MINIMUM_POSITIVE_QUANTITY || value > MAXIMUM_QUANTITY) return invalid(rangeIssue(field, value, MINIMUM_POSITIVE_QUANTITY));
  return valid(value as PositiveQuantity);
}

export function createNonNegativeQuantity(value: number, field: string): ValidationResult<NonNegativeQuantity> {
  if (!Number.isFinite(value)) return invalid(numberIssue(field, value));
  if (value < 0 || value > MAXIMUM_QUANTITY) return invalid(rangeIssue(field, value, 0));
  return valid(value as NonNegativeQuantity);
}

export interface FuelCostCalculationInput {
  readonly system: UnitSystem;
  readonly distance: PositiveQuantity;
  readonly economy: PositiveQuantity;
  readonly price: PositiveQuantity;
}

export interface RoadTripCalculationInput extends FuelCostCalculationInput {
  readonly roundTrip: boolean;
  readonly extraCost: NonNegativeQuantity;
  readonly people: PositiveQuantity;
}

export interface PowerToWeightCalculationInput {
  readonly power: PositiveQuantity;
  readonly powerUnit: PowerUnit;
  readonly weight: PositiveQuantity;
  readonly weightUnit: WeightUnit;
}

export function collectValid<T extends Record<string, ValidationResult<unknown>>>(results: T): readonly ValidationIssue[] {
  return Object.values(results).flatMap((result) => result.ok ? [] : result.issues);
}
