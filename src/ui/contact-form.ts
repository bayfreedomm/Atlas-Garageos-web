/**
 * Contact page form.
 *
 * The site is a static build with no application server, so there is nowhere to POST a
 * contact form to. Rather than faking a "sent!" state that silently does nothing, submitting
 * the form builds a `mailto:` link from the visitor's own input and hands off to their email
 * app — the message that actually leaves is the one they see and can edit before sending.
 * The subject line carries the picked category so replies can be triaged before opening them.
 */
const SUPPORT_EMAIL = 'atlas.supportdesk@gmail.com';

export function initializeContactForm(): void {
  document.querySelectorAll<HTMLElement>('[data-contact-page]').forEach((root) => {
    if (root.dataset.ready === 'true') return;
    root.dataset.ready = 'true';

    const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
    const nameInput = root.querySelector<HTMLInputElement>('[data-contact-name]');
    const emailInput = root.querySelector<HTMLInputElement>('[data-contact-email]');
    const subjectSelect = root.querySelector<HTMLSelectElement>('[data-contact-subject]');
    const messageInput = root.querySelector<HTMLTextAreaElement>('[data-contact-message]');
    const note = root.querySelector<HTMLElement>('[data-contact-note]');
    const copyButton = root.querySelector<HTMLButtonElement>('[data-contact-copy]');

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const name = nameInput?.value.trim() ?? '';
      const email = emailInput?.value.trim() ?? '';
      const subjectLabel = subjectSelect?.selectedOptions[0]?.textContent?.trim() ?? '';
      const message = messageInput?.value.trim() ?? '';

      const subjectLine = subjectLabel ? `Atlas GarageOS — ${subjectLabel}` : 'Atlas GarageOS — Contact';
      const bodyLines = [
        name ? `Name: ${name}` : null,
        email ? `Email: ${email}` : null,
        '',
        message,
      ].filter((line): line is string => line !== null);

      // Some mail clients (notably desktop Outlook) truncate or reject `mailto:` links past
      // roughly 2000 characters. The message field is capped with `maxlength`, but this guards
      // the encoded total (subject + body, where non-ASCII characters expand under encodeURIComponent)
      // so a long name/email/subject combination can never silently produce a broken link.
      const MAX_MAILTO_LENGTH = 1900;
      const buildMailto = (b: string) =>
        `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(b)}`;
      let body = bodyLines.join('\n');
      let mailto = buildMailto(body);
      while (mailto.length > MAX_MAILTO_LENGTH && body.length > 100) {
        body = body.slice(0, -100) + '…';
        mailto = buildMailto(body);
      }
      window.location.href = mailto;
      if (note) note.hidden = false;
    });

    copyButton?.addEventListener('click', () => {
      const defaultLabel = copyButton.dataset.defaultLabel ?? copyButton.textContent ?? '';
      const copiedLabel = copyButton.dataset.copiedLabel ?? defaultLabel;
      navigator.clipboard?.writeText(SUPPORT_EMAIL)
        .then(() => {
          copyButton.textContent = copiedLabel;
          window.setTimeout(() => { copyButton.textContent = defaultLabel; }, 1800);
        })
        .catch(() => { /* Clipboard permission denied or unavailable — the mailto link and visible address still work. */ });
    });
  });
}
