/**
 * "Email me this report" is switched on only after the Cloudflare D1 database (binding `DB`)
 * and the `RESEND_API_KEY` secret exist. Until then calculator pages show only the PDF action.
 * The worker answers 503 without them, so turning this on early cannot send anything.
 */
export const EMAIL_REPORTS_ENABLED = false;
