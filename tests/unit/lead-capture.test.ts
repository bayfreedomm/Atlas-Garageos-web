import { describe, expect, it } from 'vitest';
import { normalizeEmail, parseReopenQuery, parseReportRequest, reportTools, reportUrl } from '../../src/features/lead-capture/report-request';
import { isReportLine } from '../../src/features/lead-capture/report-lines';
import { renderReportEmail, renderResultPage } from '../../src/features/lead-capture/report-email';
import { reportCaptureText } from '../../src/content/report-capture-text';
import { LOCALE_CODES } from '../../src/localization/locales';

const base = { email: 'Driver@Example.COM', path: '/tools/tire-size-comparison/', query: 'current=205-55-16&new=225-45-17', inputs: [{ label: 'Current width', value: '205 mm' }], results: [{ label: 'Diameter change', value: '+1.7 %' }] };

describe('report requests', () => {
  it('knows every calculator route in every locale', () => {
    const tools = reportTools();
    expect(tools.get('/tools/fuel-cost-calculator/')?.id).toBe('fuel-cost-calculator');
    expect(tools.get('/tr/tools/yakit-maliyeti-hesaplama/')?.locale).toBe('tr');
    expect(tools.get('/fitment-studio/')?.id).toBe('fitment-studio');
    expect(tools.get('/tire-sizes/205-55-r16/')).toBeUndefined();
    expect(tools.size).toBeGreaterThan(9 * 20);
  });

  it('normalizes and validates addresses', () => {
    expect(normalizeEmail(' Driver@Example.COM ')).toBe('Driver@example.com');
    for (const bad of ['', 'a@b', 'no-at.example.com', 'a b@example.com', 'x@-bad.com', 'x'.repeat(65) + '@example.com', 42, null]) expect(normalizeEmail(bad)).toBeNull();
  });

  it('accepts a real request and builds the reopen link on our own origin', () => {
    const parsed = parseReportRequest({ ...base, subscribe: true });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.email).toBe('Driver@example.com');
    expect(parsed.value.subscribe).toBe(true);
    expect(reportUrl('https://atlasgarageos.com', parsed.value)).toBe('https://atlasgarageos.com/tools/tire-size-comparison/?current=205-55-16&new=225-45-17');
  });

  it('rejects foreign paths, link-like text, markup and unknown query keys', () => {
    expect(parseReportRequest({ ...base, path: 'https://evil.example/' })).toEqual({ ok: false, error: 'invalid-tool' });
    expect(parseReportRequest({ ...base, inputs: [{ label: 'Visit', value: 'evil.com now' }] })).toEqual({ ok: false, error: 'invalid-values' });
    expect(parseReportRequest({ ...base, inputs: [{ label: '<b>x</b>', value: '1' }] })).toEqual({ ok: false, error: 'invalid-values' });
    expect(parseReportRequest({ ...base, query: 'redirect=https%3A%2F%2Fevil.example' })).toEqual({ ok: false, error: 'invalid-values' });
    expect(parseReportRequest({ ...base, company: 'Acme bot' })).toEqual({ ok: false, error: 'spam' });
    expect(parseReportRequest({ ...base, inputs: Array.from({ length: 30 }, () => ({ label: 'a', value: '1' })) })).toEqual({ ok: false, error: 'invalid-values' });
  });

  it('validates shared-state queries', () => {
    expect(parseReopenQuery('tool=fuel-cost&state=%7B%22distance%22%3A%22500%22%7D')).toBe('tool=fuel-cost&state=%7B%22distance%22%3A%22500%22%7D');
    expect(parseReopenQuery('tool=x&state=%7B%22a%22%3A%22%3Cscript%3E%22%7D')).toBeNull();
    expect(parseReopenQuery('')).toBe('');
  });

  it('keeps the browser-side line filter in step with the server', () => {
    expect(isReportLine('Overall diameter', '659.7 mm · 25.97″')).toBe(true);
    expect(isReportLine('Kraftstoffkosten', '57,20 €')).toBe(true);
    expect(isReportLine('Price', 'see www.example.org')).toBe(false);
    expect(isReportLine('Contact', 'me@example.com')).toBe(false);
  });
});

describe('report email', () => {
  it('renders in every locale, escapes content and only links to our links', () => {
    for (const locale of LOCALE_CODES) {
      const tool = [...reportTools().values()].find((item) => item.locale === locale && item.id === 'fuel-cost-calculator')!;
      const request = { email: 'a@example.com', tool, inputs: [{ label: 'Distance "A"', value: '500 km' }], results: [{ label: 'Total', value: '57.20 €' }], query: '', subscribe: true };
      const mail = renderReportEmail(request, { report: `https://atlasgarageos.com${tool.path}`, confirm: 'https://atlasgarageos.com/api/confirm?token=abcdefghijklmnopqrstuvwx', unsubscribe: 'https://atlasgarageos.com/api/unsubscribe?token=abcdefghijklmnopqrstuvwx' });
      expect(mail.subject).toContain(tool.title);
      expect(mail.html).toContain('Distance &quot;A&quot;');
      expect(mail.html).toContain(reportCaptureText[locale].mailConfirm);
      const hrefs = [...mail.html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]!);
      expect(hrefs.every((href) => href.startsWith('https://atlasgarageos.com/'))).toBe(true);
      expect(mail.text).toContain('/api/unsubscribe?token=');
    }
  });

  it('one-off reports say nothing else will follow; result pages ask before acting', () => {
    const tool = reportTools().get('/tools/psi-bar-converter/')!;
    const mail = renderReportEmail({ email: 'a@example.com', tool, inputs: [], results: [], query: '', subscribe: false }, { report: 'https://atlasgarageos.com/tools/psi-bar-converter/' });
    expect(mail.html).toContain(reportCaptureText.en.mailOneOff);
    expect(mail.html).not.toContain('/api/');
    const ask = renderResultPage('tr', 'ask-unsubscribe', 'https://atlasgarageos.com/tr/', 'https://atlasgarageos.com/api/unsubscribe?token=x');
    expect(ask).toContain('method="post"');
    expect(ask).toContain(reportCaptureText.tr.mailUnsubscribe);
    expect(renderResultPage('de', 'confirmed', 'https://atlasgarageos.com/de/')).toContain('noindex');
  });
});

import toolPage from '../../src/components/ToolPage.astro?raw';
import reportActions from '../../src/components/ReportActions.astro?raw';
import reportActionsScript from '../../src/ui/report-actions.ts?raw';

describe('report actions on calculator pages', () => {
  it('always offers the PDF and gates the email form behind the backend flag', () => {
    expect(toolPage).toContain('<ReportActions');
    expect(reportActions).toContain('data-report-pdf');
    expect(reportActions).toMatch(/\{EMAIL_REPORTS_ENABLED && \(\s*<button/);
    expect(reportActions).toContain('name="company"');
  });

  it('keeps the tool catalog out of the browser bundle', () => {
    expect(reportActionsScript).not.toContain('report-request');
    expect(reportActionsScript).toContain('report-lines');
  });
});
