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
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

export const valid = <T>(value: T): ValidationResult<T> => ({ ok: true, value });
export const invalid = <T = never>(...issues: ValidationIssue[]): ValidationResult<T> => ({ ok: false, issues });
