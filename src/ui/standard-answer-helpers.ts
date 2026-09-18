export interface StandardAnswerContent {
  primary: string;
  secondaryLabel: string;
  secondary: string;
  secondaryNote: string;
  leftLabel: string;
  left: string;
  rightLabel: string;
  right: string;
}

/** Shared render helpers for tools built on the UtilityResultStandard markup
 * (data-standard-answer / data-standard-visual / data-results / data-errors / data-result-summary).
 * Kept separate from ui/utility-calculators.ts so new bespoke tools do not need
 * to touch the generic fuel/pressure/power/torque calculator engine. */

export function syncStandardAnswer(form: HTMLElement, content: StandardAnswerContent): void {
  const answer = form.querySelector<HTMLElement>('[data-standard-answer]');
  const visual = form.querySelector<HTMLElement>('[data-standard-visual]');
  const values: readonly [string, string][] = [
    ['[data-standard-primary]', content.primary],
    ['[data-standard-secondary-label]', content.secondaryLabel],
    ['[data-standard-secondary]', content.secondary],
    ['[data-standard-secondary-note]', content.secondaryNote],
    ['[data-standard-visual-left-label]', content.leftLabel],
    ['[data-standard-visual-left]', content.left],
    ['[data-standard-visual-right-label]', content.rightLabel],
    ['[data-standard-visual-right]', content.right],
  ];
  values.forEach(([selector, value]) => { const node = form.querySelector<HTMLElement>(selector); if (node) node.textContent = value; });
  answer?.classList.remove('is-pending');
  visual?.classList.remove('is-pending');
}

export function resetStandardAnswer(form: HTMLElement, message = 'Check the inputs to update the estimate.'): void {
  form.querySelector('[data-standard-answer]')?.classList.add('is-pending');
  form.querySelector('[data-standard-visual]')?.classList.add('is-pending');
  form.querySelectorAll<HTMLElement>('[data-standard-primary], [data-standard-secondary], [data-standard-visual-left], [data-standard-visual-right]').forEach((node) => { node.textContent = '—'; });
  const context = form.querySelector<HTMLElement>('[data-standard-context]');
  if (context) context.textContent = message;
}

export function renderMetrics(form: HTMLElement, rows: readonly (readonly [string, string])[]): void {
  const metrics = form.querySelector<HTMLDListElement>('[data-results]');
  if (!metrics) return;
  metrics.replaceChildren(...rows.map(([label, value]) => {
    const item = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    item.append(dt, dd);
    return item;
  }));
}

export function setSummary(form: HTMLElement, text: string, pending: boolean): void {
  const summary = form.querySelector<HTMLElement>('[data-result-summary]');
  if (!summary) return;
  summary.textContent = text;
  summary.classList.toggle('is-pending', pending);
}

export function setErrors(form: HTMLElement, messages: readonly string[]): void {
  const errors = form.querySelector<HTMLElement>('[data-errors]');
  if (!errors) return;
  if (!messages.length) { errors.hidden = true; errors.replaceChildren(); return; }
  const list = document.createElement('ul');
  messages.forEach((message) => { const item = document.createElement('li'); item.textContent = message; list.append(item); });
  errors.replaceChildren(list);
  errors.hidden = false;
}
