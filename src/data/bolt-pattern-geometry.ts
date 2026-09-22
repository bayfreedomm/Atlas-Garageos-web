/**
 * Bolt-pattern notation parsing and PCD geometry — the single source of truth for both.
 *
 * This module is deliberately dependency-free (no dataset import, no catalog build) so that
 * client-side bundles — the vehicle fitment picker and finder, which run in the browser —
 * can derive adjacent-hole spacing without pulling the whole catalog in with them, while
 * still using EXACTLY the same parser and the same formula as the statically rendered
 * bolt-pattern entity pages.
 *
 * There used to be two disagreeing sources of truth for hole-to-hole spacing: a hand-typed
 * `spacingMm` field on every vehicle row (which in practice just repeated the PCD), and the
 * correct chord formula on the entity pages. The field is gone; everything derives from
 * `boltPattern` through the functions below.
 */

/** Bolt pattern notation: {lug count}x{PCD in mm}, with an optional one-decimal PCD. */
const BOLT_NOTATION = /^(\d{1,2})x(\d{2,3}(?:\.\d)?)$/;

export interface ParsedBoltPattern {
  readonly lugCount: number;
  readonly pcdMm: number;
}

export function parseBoltPattern(notation: string): ParsedBoltPattern | null {
  const match = BOLT_NOTATION.exec(notation.trim());
  if (!match) return null;
  const lugCount = Number(match[1]);
  const pcdMm = Number(match[2]);
  if (!Number.isFinite(lugCount) || !Number.isFinite(pcdMm)) return null;
  return { lugCount, pcdMm };
}

/**
 * Hole-to-hole (adjacent lug) chord for a PCD circle: c = PCD × sin(π / lugs).
 *
 * This is the number a person actually measures with a ruler between two neighbouring lug
 * holes, and it is what the Bolt Pattern Calculator inverts (spacing → PCD). It is NOT the
 * PCD itself: for 5x114.3 it is ≈67.18 mm, not 114.3 mm.
 *
 * Throws on a non-finite or non-positive lug count rather than returning NaN, because every
 * caller renders or links with the result and a silent NaN would reach a page.
 */
export function adjacentHoleSpacingMm(pcdMm: number, lugCount: number): number {
  if (!Number.isFinite(pcdMm) || !Number.isFinite(lugCount) || lugCount < 2) {
    throw new Error(`Cannot compute adjacent hole spacing for PCD ${pcdMm} mm and ${lugCount} lugs.`);
  }
  return pcdMm * Math.sin(Math.PI / lugCount);
}


/** Inverse of adjacentHoleSpacingMm: recover PCD from an adjacent-hole chord. */
export function pcdFromAdjacentHoleSpacingMm(spacingMm: number, lugCount: number): number {
  if (!Number.isFinite(spacingMm) || spacingMm <= 0 || !Number.isInteger(lugCount) || lugCount < 2) {
    throw new Error(`Cannot compute PCD from spacing ${spacingMm} mm and ${lugCount} lugs.`);
  }
  return spacingMm / Math.sin(Math.PI / lugCount);
}

/**
 * Adjacent-hole spacing straight from a notation string such as "5x114.3".
 * Returns null when the notation cannot be parsed, so a caller in the browser can decline to
 * pre-fill rather than writing NaN into a form field.
 */
export function boltPatternSpacingMm(notation: string): number | null {
  const parsed = parseBoltPattern(notation);
  if (parsed === null) return null;
  return adjacentHoleSpacingMm(parsed.pcdMm, parsed.lugCount);
}

/** Lug-hole positions on a unit circle, first hole at 12 o'clock. */
export function lugPositions(lugCount: number): readonly (readonly [number, number])[] {
  if (!Number.isInteger(lugCount) || lugCount < 2) throw new Error(`Cannot compute lug positions for ${lugCount} lugs.`);
  return Object.freeze(Array.from({ length: lugCount }, (_, index) => {
    const angle = -Math.PI / 2 + (index / lugCount) * Math.PI * 2;
    return Object.freeze([Math.cos(angle), Math.sin(angle)] as const);
  }));
}
