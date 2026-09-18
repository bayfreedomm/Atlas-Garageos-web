import type { SetupInput } from '../compare/compare-setups';
import { compareSetupInputs } from '../compare/compare-setups';
import type { ValidationResult } from '../../domain/validation';
import { invalid, valid } from '../../domain/validation';

export interface SetupShareV1 {
  readonly v: 1;
  readonly current: SetupInput;
  readonly proposed: SetupInput;
}

type CompactSetup = readonly [number, number, number, number, number];

interface CompactSetupShareV1 {
  readonly v: 1;
  readonly c: CompactSetup;
  readonly n: CompactSetup;
}

export const MAX_SETUP_SHARE_LENGTH = 4_096;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function readSetup(value: unknown): SetupInput | undefined {
  if (!isRecord(value)) return undefined;
  const fields = ['tireWidthMm', 'tireAspectRatio', 'rimDiameterInches', 'wheelWidthInches', 'wheelOffsetMm'] as const;
  if (!fields.every((field) => typeof value[field] === 'number')) return undefined;
  return Object.fromEntries(fields.map((field) => [field, value[field]])) as unknown as SetupInput;
}

export function encodeSetupShare(payload: SetupShareV1): string {
  const tuple = (setup: SetupInput): CompactSetup => [
    setup.tireWidthMm,
    setup.tireAspectRatio,
    setup.rimDiameterInches,
    setup.wheelWidthInches,
    setup.wheelOffsetMm,
  ];
  const compact: CompactSetupShareV1 = { v: 1, c: tuple(payload.current), n: tuple(payload.proposed) };
  return encodeURIComponent(JSON.stringify(compact));
}

function readCompactSetup(value: unknown): SetupInput | undefined {
  if (!Array.isArray(value) || value.length !== 5 || !value.every((entry) => typeof entry === 'number')) return undefined;
  return {
    tireWidthMm: value[0]!,
    tireAspectRatio: value[1]!,
    rimDiameterInches: value[2]!,
    wheelWidthInches: value[3]!,
    wheelOffsetMm: value[4]!,
  };
}

export function decodeSetupShare(encoded: string): ValidationResult<SetupShareV1> {
  if (encoded.length > MAX_SETUP_SHARE_LENGTH) {
    return invalid({ code: 'out-of-range', field: 'share', message: `Share setup must be no more than ${MAX_SETUP_SHARE_LENGTH} characters.`, received: encoded.length, maximum: MAX_SETUP_SHARE_LENGTH });
  }
  let value: unknown;
  try {
    value = JSON.parse(decodeURIComponent(encoded));
  } catch {
    return invalid({ code: 'invalid-format', field: 'share', message: 'Share setup is not valid encoded JSON.' });
  }
  if (!isRecord(value)) return invalid({ code: 'invalid-format', field: 'share', message: 'Share setup must be an object.' });
  if (value.v !== 1) return invalid({ code: 'unsupported-version', field: 'v', message: 'Share setup version is not supported.', received: value.v });
  // Accept both the compact V1 representation and Milestone 1's verbose V1.
  const current = readCompactSetup(value.c) ?? readSetup(value.current);
  const proposed = readCompactSetup(value.n) ?? readSetup(value.proposed);
  if (!current || !proposed) return invalid({ code: 'invalid-format', field: 'share', message: 'Share setup fields are incomplete or invalid.' });
  const comparison = compareSetupInputs(current, proposed);
  if (!comparison.ok) return invalid(...comparison.issues);
  return valid({ v: 1, current, proposed });
}

export const createSetupShareHash = (payload: SetupShareV1): string => `#setup=${encodeSetupShare(payload)}`;

export function decodeSetupShareHash(hash: string): ValidationResult<SetupShareV1> | undefined {
  const match = /^#setup=(.+)$/.exec(hash);
  return match?.[1] === undefined ? undefined : decodeSetupShare(match[1]);
}
