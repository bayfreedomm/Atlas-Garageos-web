/**
 * The label/value rule shared by the browser (which drops lines that fail it) and the worker
 * (which rejects requests containing them). Kept tiny so calculator pages do not bundle the
 * tool catalog.
 */
export interface ReportLine { readonly label: string; readonly value: string }

export const MAX_LINES = 24;

// Labels and values are what the page shows next to an input or result. Short, no markup and
// no link-shaped text, so a report can never carry someone else's message.
const LINE_TEXT = /^[\p{L}\p{N}\p{Sc} .,/+_%()·×→≈~±'’"“”«»:−–°″′²³-]{1,80}$/u;
const LINK_LIKE = /:\/\/|www\.|@|\.(?:com|net|org|io|ru|cn|xyz|top|info|biz)\b/i;

/** True when a label/value pair can travel in a report (the browser drops the rest before sending). */
export function isReportLine(label: string, value: string): boolean {
  const l = label.replace(/\s+/g, ' ').trim();
  const v = value.replace(/\s+/g, ' ').trim();
  return LINE_TEXT.test(l) && LINE_TEXT.test(v) && !LINK_LIKE.test(l) && !LINK_LIKE.test(v);
}

