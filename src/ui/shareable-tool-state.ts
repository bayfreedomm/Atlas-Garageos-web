import { getPageLocale, type UiLocale } from './page-locale';

const SHARE_LABELS = {
  en: { copied: 'Link copied', prompt: 'Copy this link', share: 'Copy share link' },
  de: { copied: 'Link kopiert', prompt: 'Diesen Link kopieren', share: 'Link zum Teilen kopieren' },
  es: { copied: 'Enlace copiado', prompt: 'Copiar este enlace', share: 'Copiar enlace para compartir' },
  'pt-br': { copied: 'Link copiado', prompt: 'Copie este link', share: 'Copiar link para compartilhar' },
  fr: { copied: 'Lien copié', prompt: 'Copiez ce lien', share: 'Copier le lien de partage' },
  it: { copied: 'Link copiato', prompt: 'Copia questo link', share: 'Copia il link da condividere' },
  pl: { copied: 'Link skopiowany', prompt: 'Skopiuj ten link', share: 'Skopiuj link do udostępnienia' },
  nl: { copied: 'Link gekopieerd', prompt: 'Kopieer deze link', share: 'Deellink kopiëren' },
  tr: { copied: 'Bağlantı kopyalandı', prompt: 'Bu bağlantıyı kopyalayın', share: 'Paylaşım bağlantısını kopyala' },
} as const satisfies Record<UiLocale, { copied: string; prompt: string; share: string }>;

type ShareLocale = keyof typeof SHARE_LABELS;
type ShareState = Record<string, string>;

const INITIALIZED = 'shareStateInitialized';

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

function toolKey(form: HTMLFormElement): string {
  return form.dataset.calculator ?? form.dataset.utilityCalculator ?? 'tool';
}

function namedControls(form: HTMLFormElement): readonly (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] {
  return Array.from(form.elements).filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => {
    return (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)
      && element.name.trim() !== '';
  });
}

function readState(form: HTMLFormElement): ShareState {
  const state: ShareState = {};
  namedControls(form).forEach((control) => {
    if (control instanceof HTMLInputElement && (control.type === 'submit' || control.type === 'button' || control.type === 'reset')) return;
    if (control instanceof HTMLInputElement && (control.type === 'checkbox' || control.type === 'radio')) {
      if (control.checked) state[control.name] = control.value || '1';
      return;
    }
    state[control.name] = control.value;
  });
  return state;
}

function stateUrl(form: HTMLFormElement): string {
  const params = new URLSearchParams();
  params.set('tool', toolKey(form));
  params.set('state', JSON.stringify(readState(form)));
  return currentUrlWith(params);
}

function restoreState(form: HTMLFormElement): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get('tool') !== toolKey(form)) return false;
  const raw = params.get('state');
  if (!raw || raw.length > 5000) return false;
  let state: ShareState;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    state = Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  } catch { return false; }
  const controls = namedControls(form);
  const apply = (): boolean => {
    let changed = false;
    controls.forEach((control) => {
    const incoming = state[control.name];
    if (incoming === undefined) return;
    if (control instanceof HTMLInputElement && (control.type === 'submit' || control.type === 'button' || control.type === 'reset')) return;
    if (control instanceof HTMLInputElement && (control.type === 'checkbox' || control.type === 'radio')) {
      control.checked = incoming === (control.value || '1');
    } else {
      control.value = incoming;
    }
      changed = true;
    });
    return changed;
  };
  const restored = apply();
  if (!restored) return false;
  // Selects such as vehicle make/model are dependent. Replaying their native
  // events in DOM order lets the first selection populate the second before we
  // apply its shared value a second time.
  controls.forEach((control) => {
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  });
  apply();
  controls.filter((control) => control instanceof HTMLSelectElement).forEach((control) => control.dispatchEvent(new Event('change', { bubbles: true })));
  if (form.querySelector<HTMLButtonElement>('button[type="submit"]')) {
    window.setTimeout(() => form.requestSubmit(), 0);
  }
  return true;
}

function addGenericShareButton(form: HTMLFormElement): void {
  if (form.querySelector('[data-share-result]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary share-result-button';
  button.dataset.shareResult = '';
  button.textContent = SHARE_LABELS[getPageLocale() as ShareLocale].share;
  const actions = form.querySelector<HTMLElement>('.form-actions');
  if (actions) actions.append(button);
  else {
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submit) submit.insertAdjacentElement('afterend', button);
    else form.append(button);
  }
  button.addEventListener('click', () => void copy(button, stateUrl(form)));
}

function initializeGenericShare(form: HTMLFormElement): void {
  addGenericShareButton(form);
  // Let the page's calculator initializer bind first; restoring in the next task
  // means every calculator renders the shared result rather than just its inputs.
  window.setTimeout(() => { restoreState(form); }, 0);
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

/** Query string (no "?") that reopens this calculator in its current state; same format as the share button. */
export function shareQueryFor(form: HTMLFormElement): string {
  const output = new URLSearchParams();
  if (form.dataset.calculator === 'tire-comparison') {
    output.set('current', `${value(form, 'original-widthMm')}-${value(form, 'original-aspectRatio')}-${value(form, 'original-rimDiameterInches')}`);
    output.set('new', `${value(form, 'new-widthMm')}-${value(form, 'new-aspectRatio')}-${value(form, 'new-rimDiameterInches')}`);
  } else if (form.dataset.calculator === 'wheel-offset') {
    (['originalWidthInches', 'originalOffsetMm', 'newWidthInches', 'newOffsetMm'] as const).forEach((field, index) => output.set((['ow', 'oe', 'nw', 'ne'] as const)[index]!, value(form, field)));
  } else {
    output.set('tool', toolKey(form));
    output.set('state', JSON.stringify(readState(form)));
  }
  return output.toString();
}

export function initializeShareableToolState(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator], [data-utility-calculator]').forEach((form) => {
    if (form.dataset[INITIALIZED] === 'true') return;
    form.dataset[INITIALIZED] = 'true';
    const calculator = form.dataset.calculator;
    if (calculator === 'tire-comparison') initializeTireComparison(form);
    else if (calculator === 'wheel-offset') initializeWheelOffset(form);
    else {
      if (calculator === 'tire-size') initializeTireSizePrefill(form);
      if (calculator === 'bolt-pattern') initializeBoltPatternPrefill(form);
      initializeGenericShare(form);
    }
  });
}
