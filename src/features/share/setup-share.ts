import type { SetupInput } from '../compare/compare-setups';
import { compareSetupInputs } from '../compare/compare-setups';
import type { ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';

export interface SetupShareV1 {
  readonly v: 1;
  readonly current: SetupInput;
  readonly proposed: SetupInput;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function readSetup(value: unknown): SetupInput | undefined {
  if (!isRecord(value)) return undefined;
  const fields = ['tireWidthMm', 'tireAspectRatio', 'rimDiameterInches', 'wheelWidthInches', 'wheelOffsetMm'] as const;
  if (!fields.every((field) => typeof value[field] === 'number')) return undefined;
  return Object.fromEntries(fields.map((field) => [field, value[field]])) as unknown as SetupInput;
}

export function encodeSetupShare(payload: SetupShareV1): string {
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodeSetupShare(encoded: string): ValidationResult<SetupShareV1> {
  let value: unknown;
  try {
    value = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return invalid({ code: 'invalid-format', field: 'share', message: 'Share setup is not valid encoded JSON.' });
  }
  if (!isRecord(value)) return invalid({ code: 'invalid-format', field: 'share', message: 'Share setup must be an object.' });
  if (value.v !== 1) return invalid({ code: 'unsupported-version', field: 'v', message: 'Share setup version is not supported.', received: value.v });
  const current = readSetup(value.current);
  const proposed = readSetup(value.proposed);
  if (!current || !proposed) return invalid({ code: 'invalid-format', field: 'share', message: 'Share setup fields are incomplete or invalid.' });
  const comparison = compareSetupInputs(current, proposed);
  if (!comparison.ok) return invalid(...comparison.issues);
  return valid({ v: 1, current, proposed });
}
