import type { EvidenceLevel } from '../domain/evidence';
import { evidenceText } from '../localization/evidence-catalog';
import type { UiLocale } from './page-locale';

/**
 * A small uppercase label that says how much a result can be trusted (see domain/evidence.ts).
 * The explanation is included for assistive tech and as a tooltip, so the badge is never just a
 * colour: its text alone carries the meaning.
 */
export function createEvidenceBadge(level: EvidenceLevel, locale: UiLocale): HTMLElement {
  const text = evidenceText[locale][level];
  const badge = document.createElement('span');
  badge.className = `evidence-badge evidence-badge--${level}`;
  badge.dataset.evidence = level;
  badge.title = text.meaning;
  badge.textContent = text.label;
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = ` — ${text.meaning}`;
  badge.append(sr);
  return badge;
}

/** "What the labels mean" list for the levels actually used on a page, strongest first. */
export function createEvidenceLegend(levels: readonly EvidenceLevel[], locale: UiLocale): HTMLElement {
  const list = document.createElement('dl');
  list.className = 'evidence-legend';
  for (const level of levels) {
    const term = document.createElement('dt');
    term.append(createEvidenceBadge(level, locale));
    const description = document.createElement('dd');
    description.textContent = evidenceText[locale][level].meaning;
    list.append(term, description);
  }
  return list;
}
