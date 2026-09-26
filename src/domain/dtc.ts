import {
  EVIDENCE_LEVELS,
  EVIDENCE_REUSE_PERMISSIONS,
  EVIDENCE_SOURCE_TYPES,
  evidenceCanBeRepublished,
  type EvidenceLevel,
  type EvidenceRecord,
  type EvidenceReusePermission,
  type EvidenceSourceType,
} from './evidence';
import { invalid, valid, type ValidationIssue, type ValidationResult } from './validation';

declare const dtcCodeBrand: unique symbol;
declare const dtcSlugBrand: unique symbol;

export type DtcCode = string & { readonly [dtcCodeBrand]: true };
export type DtcSlug = string & { readonly [dtcSlugBrand]: true };
export type DtcFamily = 'powertrain' | 'body' | 'chassis' | 'network';

export const DTC_STATUSES = ['draft', 'reviewed', 'published', 'retired'] as const;
export type DtcStatus = (typeof DTC_STATUSES)[number];

export const DTC_ALLOCATIONS = ['standardized', 'manufacturer-specific', 'unknown'] as const;
export type DtcAllocation = (typeof DTC_ALLOCATIONS)[number];

export const DTC_URGENCY_LEVELS = ['stop-safely', 'service-soon', 'monitor', 'unknown'] as const;
export type DtcUrgency = (typeof DTC_URGENCY_LEVELS)[number];

export interface DtcRecord {
  readonly code: DtcCode;
  readonly slug: DtcSlug;
  readonly family: DtcFamily;
  readonly standard: 'SAE-J2012';
  /** Sourced allocation; never guessed from the visible digits alone. */
  readonly allocation: DtcAllocation;
  readonly title: string;
  readonly meaning: string;
  readonly symptoms: readonly string[];
  readonly possibleCauses: readonly string[];
  readonly diagnosticOrder: readonly string[];
  readonly limitations: readonly string[];
  readonly nextActions: readonly string[];
  readonly relatedCodes: readonly DtcCode[];
  readonly urgency: DtcUrgency;
  readonly confidence: EvidenceLevel;
  readonly evidence: readonly EvidenceRecord[];
  readonly reviewedAt: string | null;
  readonly status: DtcStatus;
}

export interface DtcCatalog {
  readonly records: readonly DtcRecord[];
  readonly byCode: ReadonlyMap<DtcCode, DtcRecord>;
}

const DTC_PATTERN = /^[PBCU][0-3][0-9A-F]{3}$/;
const FAMILY_BY_PREFIX: Readonly<Record<string, DtcFamily>> = Object.freeze({
  P: 'powertrain',
  B: 'body',
  C: 'chassis',
  U: 'network',
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const issue = (code: ValidationIssue['code'], field: string, message: string, received?: unknown): ValidationIssue => ({
  code,
  field,
  message,
  ...(received === undefined ? {} : { received }),
});

const nonEmptyText = (value: unknown, field: string, maximum = 2_000): ValidationResult<string> => {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maximum) {
    return invalid(issue('invalid-format', field, `${field} must contain between 1 and ${maximum} characters.`, value));
  }
  return valid(value.trim());
};

const textList = (value: unknown, field: string, maximumItems = 30): ValidationResult<readonly string[]> => {
  if (!Array.isArray(value) || value.length > maximumItems) {
    return invalid(issue('invalid-format', field, `${field} must be an array with at most ${maximumItems} items.`, value));
  }
  const values: string[] = [];
  const issues: ValidationIssue[] = [];
  value.forEach((item, index) => {
    const result = nonEmptyText(item, `${field}[${index}]`, 500);
    if (result.ok) values.push(result.value);
    else issues.push(...result.issues);
  });
  return issues.length > 0 ? invalid(...issues) : valid(Object.freeze(values));
};

const enumValue = <T extends string>(value: unknown, allowed: readonly T[], field: string): ValidationResult<T> =>
  typeof value === 'string' && allowed.includes(value as T)
    ? valid(value as T)
    : invalid(issue('invalid-format', field, `${field} is not an allowed value.`, value));

const isoDate = (value: unknown, field: string): ValidationResult<string> =>
  typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value))
    ? valid(value)
    : invalid(issue('invalid-format', field, `${field} must be a valid ISO date.`, value));

export function createDtcCode(value: unknown): ValidationResult<DtcCode> {
  if (typeof value !== 'string') {
    return invalid(issue('invalid-format', 'code', 'DTC code must be a string.', value));
  }
  const normalized = value.trim().toUpperCase();
  if (!DTC_PATTERN.test(normalized)) {
    return invalid(issue('invalid-format', 'code', 'DTC code must match P/B/C/U + 0-3 + three hexadecimal characters.', value));
  }
  return valid(normalized as DtcCode);
}

export const dtcSlug = (code: DtcCode): DtcSlug => code.toLowerCase() as DtcSlug;

export const dtcFamily = (code: DtcCode): DtcFamily => FAMILY_BY_PREFIX[code.charAt(0)] ?? 'network';

export function createEvidenceRecord(value: unknown, field = 'evidence'): ValidationResult<EvidenceRecord> {
  if (!isRecord(value)) return invalid(issue('invalid-format', field, `${field} must be an object.`, value));

  const id = nonEmptyText(value.id, `${field}.id`, 160);
  const sourceType = enumValue(value.sourceType, EVIDENCE_SOURCE_TYPES, `${field}.sourceType`);
  const level = enumValue(value.level, EVIDENCE_LEVELS, `${field}.level`);
  const publisher = nonEmptyText(value.publisher, `${field}.publisher`, 200);
  const title = nonEmptyText(value.title, `${field}.title`, 400);
  const locator = nonEmptyText(value.locator, `${field}.locator`, 1_000);
  const scope = nonEmptyText(value.scope, `${field}.scope`, 1_000);
  const retrievedAt = isoDate(value.retrievedAt, `${field}.retrievedAt`);
  const reusePermission = enumValue(value.reusePermission, EVIDENCE_REUSE_PERMISSIONS, `${field}.reusePermission`);
  const reviewNote = nonEmptyText(value.reviewNote, `${field}.reviewNote`, 1_000);
  const permissionLocator = value.permissionLocator === null
    ? valid<string | null>(null)
    : nonEmptyText(value.permissionLocator, `${field}.permissionLocator`, 1_000);
  const results = [id, sourceType, level, publisher, title, locator, scope, retrievedAt, reusePermission, reviewNote, permissionLocator];
  const issues = results.flatMap((result) => result.ok ? [] : result.issues);
  if (
    !id.ok || !sourceType.ok || !level.ok || !publisher.ok || !title.ok || !locator.ok
    || !scope.ok || !retrievedAt.ok || !reusePermission.ok || !reviewNote.ok || !permissionLocator.ok
  ) return invalid(...issues);

  return valid(Object.freeze({
    id: id.value,
    sourceType: sourceType.value as EvidenceSourceType,
    level: level.value as EvidenceLevel,
    publisher: publisher.value,
    title: title.value,
    locator: locator.value,
    scope: scope.value,
    retrievedAt: retrievedAt.value,
    reusePermission: reusePermission.value as EvidenceReusePermission,
    permissionLocator: permissionLocator.value,
    reviewNote: reviewNote.value,
  }));
}

export function createDtcRecord(value: unknown, field = 'record'): ValidationResult<DtcRecord> {
  if (!isRecord(value)) return invalid(issue('invalid-format', field, `${field} must be an object.`, value));

  const code = createDtcCode(value.code);
  const title = nonEmptyText(value.title, `${field}.title`, 200);
  const allocation = enumValue(value.allocation, DTC_ALLOCATIONS, `${field}.allocation`);
  const meaning = nonEmptyText(value.meaning, `${field}.meaning`, 2_000);
  const symptoms = textList(value.symptoms, `${field}.symptoms`);
  const possibleCauses = textList(value.possibleCauses, `${field}.possibleCauses`);
  const diagnosticOrder = textList(value.diagnosticOrder, `${field}.diagnosticOrder`);
  const limitations = textList(value.limitations, `${field}.limitations`);
  const nextActions = textList(value.nextActions, `${field}.nextActions`);
  const urgency = enumValue(value.urgency, DTC_URGENCY_LEVELS, `${field}.urgency`);
  const confidence = enumValue(value.confidence, EVIDENCE_LEVELS, `${field}.confidence`);
  const status = enumValue(value.status, DTC_STATUSES, `${field}.status`);
  const reviewedAt = value.reviewedAt === null ? valid<string | null>(null) : isoDate(value.reviewedAt, `${field}.reviewedAt`);

  const relatedCodes: DtcCode[] = [];
  const relationIssues: ValidationIssue[] = [];
  if (!Array.isArray(value.relatedCodes) || value.relatedCodes.length > 30) {
    relationIssues.push(issue('invalid-format', `${field}.relatedCodes`, 'relatedCodes must be an array with at most 30 items.', value.relatedCodes));
  } else {
    value.relatedCodes.forEach((rawCode, index) => {
      const result = createDtcCode(rawCode);
      if (result.ok) relatedCodes.push(result.value);
      else relationIssues.push(...result.issues.map((item) => ({ ...item, field: `${field}.relatedCodes[${index}]` })));
    });
  }

  const evidence: EvidenceRecord[] = [];
  const evidenceIssues: ValidationIssue[] = [];
  if (!Array.isArray(value.evidence) || value.evidence.length > 50) {
    evidenceIssues.push(issue('invalid-format', `${field}.evidence`, 'evidence must be an array with at most 50 items.', value.evidence));
  } else {
    value.evidence.forEach((entry, index) => {
      const result = createEvidenceRecord(entry, `${field}.evidence[${index}]`);
      if (result.ok) evidence.push(result.value);
      else evidenceIssues.push(...result.issues);
    });
  }

  const baseResults = [code, allocation, title, meaning, symptoms, possibleCauses, diagnosticOrder, limitations, nextActions, urgency, confidence, status, reviewedAt];
  const issues = [...baseResults.flatMap((result) => result.ok ? [] : result.issues), ...relationIssues, ...evidenceIssues];
  if (
    !code.ok || !allocation.ok || !title.ok || !meaning.ok || !symptoms.ok || !possibleCauses.ok || !diagnosticOrder.ok
    || !limitations.ok || !nextActions.ok || !urgency.ok || !confidence.ok || !status.ok || !reviewedAt.ok
    || relationIssues.length > 0 || evidenceIssues.length > 0
  ) return invalid(...issues);
  if (new Set(relatedCodes).size !== relatedCodes.length) {
    return invalid(issue('duplicate', `${field}.relatedCodes`, 'relatedCodes cannot contain duplicates.', relatedCodes));
  }
  if (relatedCodes.includes(code.value)) {
    return invalid(issue('invalid-reference', `${field}.relatedCodes`, 'A DTC cannot reference itself.', code.value));
  }

  return valid(Object.freeze({
    code: code.value,
    slug: dtcSlug(code.value),
    family: dtcFamily(code.value),
    standard: 'SAE-J2012',
    allocation: allocation.value,
    title: title.value,
    meaning: meaning.value,
    symptoms: symptoms.value,
    possibleCauses: possibleCauses.value,
    diagnosticOrder: diagnosticOrder.value,
    limitations: limitations.value,
    nextActions: nextActions.value,
    relatedCodes: Object.freeze(relatedCodes),
    urgency: urgency.value,
    confidence: confidence.value,
    evidence: Object.freeze(evidence),
    reviewedAt: reviewedAt.value,
    status: status.value,
  }));
}

const PUBLISHABLE_SOURCE_TYPES: readonly EvidenceSourceType[] = [
  'official-standard',
  'government-regulation',
  'manufacturer-service-information',
  'official-recall-communication',
  'vetted-technical-reference',
];

export function dtcPublicationIssues(record: DtcRecord): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (record.status !== 'published') issues.push(issue('invalid-format', 'status', 'Only records explicitly marked published may create indexable pages.', record.status));
  if (record.allocation === 'unknown') issues.push(issue('required', 'allocation', 'A published DTC must have a sourced standardized or manufacturer-specific allocation.'));
  if (record.reviewedAt === null) issues.push(issue('required', 'reviewedAt', 'A published DTC must have an automotive review date.'));
  if (record.confidence === 'unknown' || record.confidence === 'estimated' || record.confidence === 'community') {
    issues.push(issue('invalid-format', 'confidence', 'A published DTC needs evidence stronger than community, estimated, or unknown.', record.confidence));
  }
  if (record.limitations.length === 0) issues.push(issue('required', 'limitations', 'A published DTC must state its diagnostic limitations.'));
  if (record.nextActions.length === 0) issues.push(issue('required', 'nextActions', 'A published DTC must provide a safe next action.'));
  if (record.diagnosticOrder.length === 0) issues.push(issue('required', 'diagnosticOrder', 'A published DTC must provide an evidence-led diagnostic order.'));
  if (!record.evidence.some((entry) => PUBLISHABLE_SOURCE_TYPES.includes(entry.sourceType) && evidenceCanBeRepublished(entry))) {
    issues.push(issue('required', 'evidence', 'A published DTC needs at least one authoritative source with confirmed reuse permission.'));
  }
  return Object.freeze(issues);
}

export function createDtcCatalog(value: unknown): ValidationResult<DtcCatalog> {
  if (!Array.isArray(value)) return invalid(issue('invalid-format', 'records', 'DTC catalog must be an array.', value));
  const records: DtcRecord[] = [];
  const issues: ValidationIssue[] = [];
  value.forEach((entry, index) => {
    const result = createDtcRecord(entry, `records[${index}]`);
    if (result.ok) records.push(result.value);
    else issues.push(...result.issues);
  });
  if (issues.length > 0) return invalid(...issues);

  const byCode = new Map<DtcCode, DtcRecord>();
  records.forEach((record, index) => {
    if (byCode.has(record.code)) issues.push(issue('duplicate', `records[${index}].code`, `Duplicate DTC code: ${record.code}.`, record.code));
    byCode.set(record.code, record);
  });
  records.forEach((record, index) => {
    record.relatedCodes.forEach((relatedCode) => {
      if (!byCode.has(relatedCode)) issues.push(issue('invalid-reference', `records[${index}].relatedCodes`, `Unknown related DTC: ${relatedCode}.`, relatedCode));
    });
  });
  if (issues.length > 0) return invalid(...issues);

  return valid(Object.freeze({
    records: Object.freeze(records),
    byCode,
  }));
}

export const publishableDtcRecords = (catalog: DtcCatalog): readonly DtcRecord[] =>
  Object.freeze(catalog.records.filter((record) => dtcPublicationIssues(record).length === 0));
