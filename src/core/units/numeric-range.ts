import type { ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';

export interface NumericRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export function countNumericRangeValues(range: NumericRange, field: string, maxValues = 100): ValidationResult<number> {
  const issue = (message: string): ValidationResult<number> => invalid({ code: 'out-of-range', field, message, received: range });
  if (![range.min, range.max, range.step].every(Number.isFinite)) return issue(`${field} values must be finite numbers.`);
  if (range.step <= 0) return issue(`${field} step must be greater than zero.`);
  if (range.max < range.min) return issue(`${field} maximum must be greater than or equal to its minimum.`);
  const count = Math.floor((range.max - range.min) / range.step + 1e-9) + 1;
  if (count > maxValues) return issue(`${field} may contain at most ${maxValues} values.`);
  return valid(count);
}

export function createNumericRangeValues(range: NumericRange, field: string, maxValues = 100): ValidationResult<readonly number[]> {
  const count = countNumericRangeValues(range, field, maxValues);
  if (!count.ok) return count;
  const decimals = Math.min(8, Math.max(0, String(range.step).split('.')[1]?.length ?? 0));
  return valid(Object.freeze(Array.from({ length: count.value }, (_, index) => Number((range.min + index * range.step).toFixed(decimals)))));
}
