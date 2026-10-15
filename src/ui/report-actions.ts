/**
 * PDF download (the browser's own "Save as PDF", laid out by the print stylesheet) and the
 * optional "email me this report" form. No dependency, no third-party script.
 */
import { isReportLine, MAX_LINES, type ReportLine } from '../features/lead-capture/report-lines';
import { shareQueryFor } from './shareable-tool-state';

interface Messages { readonly sending: string; readonly sent: string; readonly sentConfirm: string; readonly errorInvalid: string; readonly errorRate: string; readonly errorUnavailable: string; readonly errorGeneric: string; readonly send: string }

const clip = (text: string): string => text.replace(/\s+/g, ' ').trim().slice(0, 80).trim();

function calculatorForm(): HTMLFormElement | null {
  return document.querySelector<HTMLFormElement>('.tool-machine form[data-calculator], .tool-machine form[data-utility-calculator], .tool-machine form.calculator-form, .tool-workspace form');
}

function labelText(control: Element): string {
  const label = control.closest('label') ?? (control.id ? document.querySelector(`label[for="${CSS.escape(control.id)}"]`) : null);
  if (!label) return '';
  const copy = label.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('input, select, textarea, button, output').forEach((node) => node.remove());
  return clip(copy.textContent ?? '');
}

/** Visible inputs with their on-page labels, in form order. */
export function inputLines(form: HTMLFormElement): ReportLine[] {
  const lines: ReportLine[] = [];
  for (const control of Array.from(form.elements)) {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement) || !control.name) continue;
    if (control instanceof HTMLInputElement && ['hidden', 'submit', 'button', 'reset', 'checkbox', 'radio'].includes(control.type)) continue;
    if (control.closest('[hidden]') || control.getClientRects().length === 0) continue;
    // Fieldset legends ("Original tire" / "New tire") keep repeated labels apart.
    const legend = clip(control.closest('fieldset')?.querySelector('legend')?.textContent ?? '');
    const own = labelText(control);
    const label = legend && own ? clip(`${legend} · ${own}`) : own;
    const value = clip(control instanceof HTMLSelectElement ? control.selectedOptions[0]?.textContent ?? control.value : control.value);
    if (label && value && isReportLine(label, value)) lines.push({ label, value });
  }
  return lines.slice(0, MAX_LINES);
}

/** Result rows (<dt>/<dd> pairs) the calculator currently shows. */
export function resultLines(): ReportLine[] {
  const lines: ReportLine[] = [];
  document.querySelectorAll<HTMLElement>('.tool-machine dl').forEach((list) => {
    if (list.closest('[hidden]') || list.getClientRects().length === 0) return;
    list.querySelectorAll('dt').forEach((term) => {
      const detail = term.nextElementSibling;
      if (!detail || detail.tagName !== 'DD') return;
      const label = clip(term.textContent ?? '');
      const value = clip(detail.textContent ?? '');
      if (label && value && isReportLine(label, value) && !lines.some((line) => line.label === label)) lines.push({ label, value });
    });
  });
  return lines.slice(0, MAX_LINES);
}

function reopenUrl(form: HTMLFormElement | null): string {
  const query = form ? shareQueryFor(form) : '';
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
}

function printReport(section: HTMLElement, locale: string): void {
  const form = calculatorForm();
  const date = section.querySelector<HTMLElement>('[data-report-print-date]');
  const url = section.querySelector<HTMLElement>('[data-report-print-url]');
  if (date) date.textContent = new Date().toLocaleString(locale === 'pt-br' ? 'pt-BR' : locale, { dateStyle: 'long', timeStyle: 'short' });
  if (url) url.textContent = reopenUrl(form);
  document.body.classList.add('is-printing-report');
  const done = (): void => { document.body.classList.remove('is-printing-report'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
  // Some mobile browsers never fire afterprint.
  window.setTimeout(done, 60_000);
}

async function sendReport(form: HTMLFormElement, locale: string, messages: Messages): Promise<void> {
  const status = form.querySelector<HTMLElement>('[data-report-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const emailInput = form.elements.namedItem('email') as HTMLInputElement | null;
  const say = (text: string, tone: 'ok' | 'error' | 'busy'): void => { if (status) { status.textContent = text; status.dataset.tone = tone; } };
  if (!emailInput || !emailInput.value.trim() || !emailInput.checkValidity()) { say(messages.errorInvalid, 'error'); emailInput?.focus(); return; }
  const calculator = calculatorForm();
  const body = {
    email: emailInput.value.trim(),
    company: (form.elements.namedItem('company') as HTMLInputElement | null)?.value ?? '',
    subscribe: (form.elements.namedItem('subscribe') as HTMLInputElement | null)?.checked === true,
    path: window.location.pathname,
    query: calculator ? shareQueryFor(calculator) : '',
    inputs: calculator ? inputLines(calculator) : [],
    results: resultLines(),
    locale,
  };
  say(messages.sending, 'busy');
  if (submit) submit.disabled = true;
  try {
    const response = await fetch('/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = (await response.json().catch(() => ({}))) as { confirmation?: boolean; error?: string };
    if (response.ok) { say(data.confirmation ? messages.sentConfirm : messages.sent, 'ok'); form.reset(); return; }
    say(response.status === 429 ? messages.errorRate : response.status === 503 ? messages.errorUnavailable : data.error === 'invalid-email' ? messages.errorInvalid : messages.errorGeneric, 'error');
  } catch {
    say(messages.errorGeneric, 'error');
  } finally {
    if (submit) submit.disabled = false;
  }
}

export function initializeReportActions(): void {
  document.querySelectorAll<HTMLElement>('[data-report-actions]').forEach((section) => {
    if (section.dataset.reportBound === 'true') return;
    section.dataset.reportBound = 'true';
    const locale = section.dataset.reportLocale ?? 'en';
    let messages: Messages | null = null;
    try { messages = JSON.parse(section.dataset.reportMessages ?? 'null') as Messages; } catch { messages = null; }
    section.querySelector('[data-report-pdf]')?.addEventListener('click', () => printReport(section, locale));
    const toggle = section.querySelector<HTMLButtonElement>('[data-report-email-toggle]');
    const form = section.querySelector<HTMLFormElement>('[data-report-email]');
    if (toggle && form) {
      toggle.addEventListener('click', () => {
        form.hidden = !form.hidden;
        toggle.setAttribute('aria-expanded', String(!form.hidden));
        if (!form.hidden) form.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
      });
      form.addEventListener('submit', (event) => { event.preventDefault(); if (messages) void sendReport(form, locale, messages); });
    }
  });
}
