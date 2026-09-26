/**
 * Atlas data-trust layer: every result Atlas shows carries the level of evidence behind it.
 *
 * The levels are ordered from strongest to weakest. They are deliberately NOT interchangeable:
 * "geometrically compatible" (calculated) is not "verified OEM fitment", a curated reference list
 * is not an official record, and an owner report is not a recall. UI code must pick the level that
 * matches where a number actually came from — never a stronger one.
 *
 * Current Atlas datasets map as follows:
 * - data/vehicle-fitment.ts        → 'reference' (hand-researched, not a licensed OEM feed)
 * - data/production-tire-sizes.ts  → 'reference' (third-party size index, not exhaustive)
 * - geometry engines (core/…)       → 'calculated'
 * - user-measured clearances        → 'measured'
 * - anything Atlas cannot check     → 'unknown'
 * 'oem-verified', 'official', 'manufacturer' and 'community' are reserved for data sources that
 * are not integrated yet (e.g. government recall feeds) — nothing may claim them today.
 */
export const EVIDENCE_LEVELS = [
  'oem-verified',
  'official',
  'manufacturer',
  'reference',
  'community',
  'measured',
  'calculated',
  'estimated',
  'unknown',
] as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/**
 * Reuse is deliberately separate from evidence strength. A source can be technically
 * authoritative while its text/data still cannot be republished by Atlas.
 */
export const EVIDENCE_REUSE_PERMISSIONS = [
  'public-domain',
  'licensed',
  'permission-granted',
  'citation-only',
  'unknown',
  'prohibited',
] as const;

export type EvidenceReusePermission = (typeof EVIDENCE_REUSE_PERMISSIONS)[number];

export const EVIDENCE_SOURCE_TYPES = [
  'official-standard',
  'government-regulation',
  'manufacturer-service-information',
  'official-recall-communication',
  'vetted-technical-reference',
  'measured-observation',
  'owner-report',
  'community-report',
] as const;

export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export interface EvidenceRecord {
  readonly id: string;
  readonly sourceType: EvidenceSourceType;
  readonly level: EvidenceLevel;
  readonly publisher: string;
  readonly title: string;
  /** Stable URL, DOI, standard identifier, bulletin number, or other durable locator. */
  readonly locator: string;
  readonly scope: string;
  readonly retrievedAt: string;
  readonly reusePermission: EvidenceReusePermission;
  readonly permissionLocator: string | null;
  readonly reviewNote: string;
}

/** Lower is stronger. Useful when a result combines inputs: it is only as strong as its weakest one. */
export const evidenceRank = (level: EvidenceLevel): number => EVIDENCE_LEVELS.indexOf(level);

export const weakestEvidence = (levels: readonly EvidenceLevel[]): EvidenceLevel =>
  levels.reduce<EvidenceLevel>((weakest, level) => (evidenceRank(level) > evidenceRank(weakest) ? level : weakest), 'oem-verified');

export const evidenceCanBeRepublished = (evidence: EvidenceRecord): boolean =>
  evidence.reusePermission === 'public-domain'
  || evidence.reusePermission === 'licensed'
  || evidence.reusePermission === 'permission-granted';
