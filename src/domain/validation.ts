export type ValidationCode =
  | 'required'
  | 'not-a-number'
  | 'not-an-integer'
  | 'out-of-range'
  | 'incompatible-values'
  | 'invalid-format'
  | 'unsupported-version'
  | 'duplicate'
  | 'invalid-reference';

export interface ValidationIssue {
  readonly code: ValidationCode;
  readonly field: string;
  readonly message: string;
  readonly received?: unknown;
  /** Present on `out-of-range` issues so presentation code can build a localized
   * message instead of showing the English `message` fallback. `maximum` omitted
   * means "must be at least `minimum`" (or "greater than zero" when minimum is 0). */
  readonly minimum?: number;
  readonly maximum?: number;
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

export const valid = <T>(value: T): ValidationResult<T> => ({ ok: true, value });
export const invalid = <T = never>(...issues: ValidationIssue[]): ValidationResult<T> => ({ ok: false, issues });
