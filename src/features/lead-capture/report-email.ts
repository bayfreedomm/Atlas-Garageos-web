/**
 * Report email and the small confirmation pages, rendered as plain strings. Pure: the worker
 * passes in the validated request and the links it generated.
 */
import { reportCaptureText } from '../../content/report-capture-text';
import type { AtlasLocale } from '../../localization/locales';
import type { ReportLine, ReportRequest } from './report-request';

export interface ReportEmail { readonly subject: string; readonly html: string; readonly text: string }
export interface ReportLinks { readonly report: string; readonly confirm?: string | undefined; readonly unsubscribe?: string | undefined }

const esc = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const INK = '#1d1d1f';
const MUTED = '#6e6e73';
const LINE = '#e5e5ea';
const BLUE = '#0a66d8';

function table(lines: readonly ReportLine[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px">${lines.map((line) => `<tr><td style="padding:9px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:14px">${esc(line.label)}</td><td align="right" style="padding:9px 0;border-bottom:1px solid ${LINE};color:${INK};font-size:14px;font-weight:600">${esc(line.value)}</td></tr>`).join('')}</table>`;
}

const button = (href: string, label: string, primary: boolean): string =>
  `<a href="${esc(href)}" style="display:inline-block;padding:12px 20px;border-radius:980px;font-size:15px;font-weight:600;text-decoration:none;${primary ? `background:${BLUE};color:#fff` : `border:1px solid ${BLUE};color:${BLUE}`}">${esc(label)}</a>`;

export function renderReportEmail(request: ReportRequest, links: ReportLinks): ReportEmail {
  const t = reportCaptureText[request.tool.locale];
  const title = request.tool.title;
  const results = request.results.length ? `<h2 style="margin:24px 0 6px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:${MUTED}">${esc(t.mailResults)}</h2>${table(request.results)}` : '';
  const inputs = request.inputs.length ? `<h2 style="margin:24px 0 6px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:${MUTED}">${esc(t.mailValues)}</h2>${table(request.inputs)}` : '';
  const confirm = links.confirm ? `<p style="margin:28px 0 12px;color:${INK};font-size:15px">${esc(t.mailConfirmIntro)}</p><p style="margin:0 0 8px">${button(links.confirm, t.mailConfirm, false)}</p>` : '';
  const footer = links.unsubscribe
    ? `<a href="${esc(links.unsubscribe)}" style="color:${MUTED}">${esc(t.mailUnsubscribe)}</a>`
    : esc(t.mailOneOff);
  const html = `<!doctype html><html lang="${request.tool.locale}"><body style="margin:0;padding:0;background:#f5f5f7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"><tr><td style="padding:32px 28px">
<p style="margin:0 0 18px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">Atlas GarageOS</p>
<h1 style="margin:0 0 8px;font-size:24px;line-height:1.2;color:${INK}">${esc(t.mailHeading)}</h1>
<p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:${INK}">${esc(t.mailIntro(title))}</p>
${results}${inputs}
<p style="margin:24px 0 0">${button(links.report, t.mailOpen, true)}</p>
${confirm}
</td></tr></table>
<p style="max-width:560px;margin:16px auto 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.5;color:${MUTED}">${footer}</p>
</td></tr></table></body></html>`;
  const lines = (heading: string, items: readonly ReportLine[]): string => items.length ? `\n${heading}\n${items.map((item) => `- ${item.label}: ${item.value}`).join('\n')}\n` : '';
  const text = [
    t.mailHeading, '', t.mailIntro(title),
    lines(t.mailResults, request.results), lines(t.mailValues, request.inputs),
    `${t.mailOpen}: ${links.report}`,
    links.confirm ? `\n${t.mailConfirmIntro}\n${links.confirm}` : '',
    '', links.unsubscribe ? `${t.mailUnsubscribe}: ${links.unsubscribe}` : t.mailOneOff,
  ].join('\n');
  return Object.freeze({ subject: t.mailSubject(title), html, text });
}

export type ResultPage = 'confirmed' | 'unsubscribed' | 'invalid' | 'ask-confirm' | 'ask-unsubscribe';

/**
 * `ask-*` pages show one button that POSTs back to the same link. Mail scanners that prefetch
 * links with GET therefore never confirm or unsubscribe anyone by themselves.
 */
export function renderResultPage(locale: AtlasLocale, page: ResultPage, homeUrl: string, actionUrl = ''): string {
  const t = reportCaptureText[locale];
  if (page === 'ask-confirm' || page === 'ask-unsubscribe') {
    const label = page === 'ask-confirm' ? t.mailConfirm : t.mailUnsubscribe;
    return shell(locale, label, `<h1>${esc(label)}</h1><form method="post" action="${esc(actionUrl)}"><button type="submit">${esc(label)}</button></form><p style="margin:1.6rem 0 0"><a href="${esc(homeUrl)}">${esc(t.pageBack)}</a></p>`);
  }
  const [title, body] = page === 'confirmed' ? [t.pageConfirmedTitle, t.pageConfirmedBody] : page === 'unsubscribed' ? [t.pageUnsubscribedTitle, t.pageUnsubscribedBody] : [t.pageInvalidTitle, t.pageInvalidBody];
  return shell(locale, title, `<h1>${esc(title)}</h1><p>${esc(body)}</p><a href="${esc(homeUrl)}">${esc(t.pageBack)}</a>`);
}

function shell(locale: AtlasLocale, title: string, content: string): string {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · Atlas GarageOS</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f5f7;color:${INK};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}main{max-width:30rem;margin:1rem;padding:2.5rem 2rem;border-radius:22px;background:#fff;text-align:center}h1{margin:0 0 .6rem;font-size:1.6rem}p{margin:0 0 1.6rem;color:${MUTED};line-height:1.5}a{color:${BLUE};font-weight:600;text-decoration:none}button{font:inherit;font-weight:600;padding:.8rem 1.6rem;border:0;border-radius:980px;background:${BLUE};color:#fff;cursor:pointer}@media(prefers-color-scheme:dark){body{background:#000;color:#f5f5f7}main{background:#1c1c1e}}</style></head>
<body><main>${content}</main></body></html>`;
}
