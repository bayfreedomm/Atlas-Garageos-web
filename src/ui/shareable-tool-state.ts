import { getPageLocale } from './page-locale';

const SHARE_LABELS = {
  en: { copied: 'Link copied', prompt: 'Copy this link' },
  de: { copied: 'Link kopiert', prompt: 'Diesen Link kopieren' },
  es: { copied: 'Enlace copiado', prompt: 'Copiar este enlace' },
} as const;

const value = (form: HTMLFormElement, name: string): string => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '';
const setValue = (form: HTMLFormElement, name: string, next: string): void => {
  const field = form.elements.namedItem(name) as HTMLInputElement | null;
  if (field && next !== '') field.value = next;
};

function parseTireToken(token: string | null): readonly [string, string, string] | null {
  if (!token) return null;
  const parts = token.split('-');
  if (parts.length !== 3 || parts.some((part) => part.trim() === '' || !Number.isFinite(Number(part)))) return null;
  return [parts[0]!, parts[1]!, parts[2]!] as const;
}

function currentUrlWith(params: URLSearchParams): string {
  const url = new URL(window.location.href);
  url.search = params.toString();
  url.hash = '';
  return url.toString();
}

async function copy(button: HTMLButtonElement, url: string): Promise<void> {
  const labels = SHARE_LABELS[getPageLocale()];
  try {
    await navigator.clipboard.writeText(url);
    const original = button.textContent;
    button.textContent = labels.copied;
    window.setTimeout(() => { button.textContent = original; }, 1600);
  } catch {
    window.prompt(labels.prompt, url);
  }
}

function initializeTireComparison(form: HTMLFormElement): void {
  const params = new URLSearchParams(window.location.search);
  const current = parseTireToken(params.get('current'));
  const next = parseTireToken(params.get('new'));
  if (current) {
    setValue(form, 'original-widthMm', current[0]);
    setValue(form, 'original-aspectRatio', current[1]);
    setValue(form, 'original-rimDiameterInches', current[2]);
  }
  if (next) {
    setValue(form, 'new-widthMm', next[0]);
    setValue(form, 'new-aspectRatio', next[1]);
    setValue(form, 'new-rimDiameterInches', next[2]);
  }
  if (current || next) form.dispatchEvent(new Event('input', { bubbles: true }));
  form.querySelector<HTMLButtonElement>('[data-share-result]')?.addEventListener('click', () => {
    const output = new URLSearchParams();
    output.set('current', `${value(form, 'original-widthMm')}-${value(form, 'original-aspectRatio')}-${value(form, 'original-rimDiameterInches')}`);
    output.set('new', `${value(form, 'new-widthMm')}-${value(form, 'new-aspectRatio')}-${value(form, 'new-rimDiameterInches')}`);
    void copy(form.querySelector<HTMLButtonElement>('[data-share-result]')!, currentUrlWith(output));
  });
}

function initializeWheelOffset(form: HTMLFormElement): void {
  const params = new URLSearchParams(window.location.search);
  const fields = ['originalWidthInches', 'originalOffsetMm', 'newWidthInches', 'newOffsetMm'] as const;
  const keys = ['ow', 'oe', 'nw', 'ne'] as const;
  let restored = false;
  fields.forEach((field, index) => {
    const incoming = params.get(keys[index]!);
    if (incoming !== null && incoming.trim() !== '' && Number.isFinite(Number(incoming))) { setValue(form, field, incoming); restored = true; }
  });
  if (restored) form.dispatchEvent(new Event('input', { bubbles: true }));
  form.querySelector<HTMLButtonElement>('[data-share-result]')?.addEventListener('click', () => {
    const output = new URLSearchParams();
    fields.forEach((field, index) => output.set(keys[index]!, value(form, field)));
    void copy(form.querySelector<HTMLButtonElement>('[data-share-result]')!, currentUrlWith(output));
  });
}

function initializeTireSizePrefill(form: HTMLFormElement): void {
  const params = new URLSearchParams(window.location.search);
  const token = parseTireToken(params.get('size'));
  if (!token) return;
  setValue(form, 'widthMm', token[0]);
  setValue(form, 'aspectRatio', token[1]);
  setValue(form, 'rimDiameterInches', token[2]);
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.requestSubmit();
}

function initializeBoltPatternPrefill(form: HTMLFormElement): void {
  const params = new URLSearchParams(window.location.search);
  const lugs = params.get('lugs');
  const spacing = params.get('spacing');
  if (!lugs && !spacing) return;
  if (lugs && Number.isFinite(Number(lugs))) setValue(form, 'lugCount', lugs);
  if (spacing && Number.isFinite(Number(spacing))) setValue(form, 'spacing', spacing);
  setValue(form, 'spacingUnit', 'mm');
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.requestSubmit();
}

export function initializeShareableToolState(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-comparison"]').forEach(initializeTireComparison);
  document.querySelectorAll<HTMLFormElement>('[data-calculator="wheel-offset"]').forEach(initializeWheelOffset);
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-size"]').forEach(initializeTireSizePrefill);
  document.querySelectorAll<HTMLFormElement>('[data-calculator="bolt-pattern"]').forEach(initializeBoltPatternPrefill);
}
