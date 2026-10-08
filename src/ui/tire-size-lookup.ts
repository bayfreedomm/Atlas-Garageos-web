/**
 * Tire-size lookup box: turns whatever a reader types ("205 55 16", "LT285/70R17",
 * "33x12.5r20", "315/80 R22,5") into a catalog slug, suggests matching published sizes while
 * typing, and opens the size page. Pure parsing lives in parseTireQuery() so it is unit-tested.
 */

/** Normalized slug for a typed size, or null when the text is not recognisable as one. */
export function parseTireQuery(raw: string): string | null {
  const text = raw.toLowerCase().replace(/,/g, '.').replace(/[×*]/g, 'x').replace(/\s+/g, ' ').trim();
  const flotation = /(\d{2})\s*x\s*(\d{1,2}(?:\.\d{1,2})?)\s*[a-z-]*\s*(\d{2}(?:\.5)?)\b/.exec(text);
  if (flotation) {
    const [, diameter = '', width = '', rim = ''] = flotation;
    if (Number(diameter) > Number(rim)) return `${diameter}x${Number(width).toFixed(2).replace('.', '-')}-r${rim.replace('.', '-')}`;
  }
  const metric = /(\d{3})\s*[/\s-]?\s*(\d{2})\s*(?:z?r|-|\s)?\s*f?\s*(\d{2}(?:\.5)?)\s*(c)?\b/.exec(text.replace(/^(lt|p|st)\s*/, ''));
  if (metric) {
    const [, width = '', aspect = '', rim = '', commercial] = metric;
    return `${width}-${aspect}-r${rim.replace('.', '-')}${commercial ? 'c' : ''}`;
  }
  return null;
}

/** Digits-only key used for "starts with" suggestions: "205/55R16" → "2055516". */
export function sizeDigits(text: string): string {
  return text.toLowerCase().replace(/c\b/, '').replace(/[^\d]/g, '');
}

type IndexRow = readonly [slug: string, notation: string];
let indexPromise: Promise<readonly IndexRow[]> | undefined;
const loadIndex = (): Promise<readonly IndexRow[]> =>
  (indexPromise ??= fetch('/tire-size-index.json').then((response) => (response.ok ? response.json() : [])).catch(() => []));

export function initializeTireSizeLookups(): void {
  document.querySelectorAll<HTMLFormElement>('[data-size-lookup]').forEach((form) => {
    const input = form.querySelector<HTMLInputElement>('input');
    const list = form.querySelector<HTMLUListElement>('[data-size-lookup-list]');
    const message = form.querySelector<HTMLElement>('[data-size-lookup-message]');
    const base = form.dataset.base ?? '/tire-sizes/';
    const display = form.dataset.display === 'spaced';
    if (!input || !list || !message) return;
    const label = (notation: string): string => (display ? notation.replace(/R(\d)/, ' R$1').replace(/R(\d{2})\.5/, 'R$1,5') : notation);

    const render = async (): Promise<void> => {
      const digits = sizeDigits(input.value);
      message.hidden = true;
      if (digits.length < 3) { list.replaceChildren(); return; }
      const rows = await loadIndex();
      const matches = rows.filter(([, notation]) => sizeDigits(notation).startsWith(digits)).slice(0, 8);
      list.replaceChildren(...matches.map(([slug, notation]) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `${base}${slug}/`;
        link.textContent = label(notation);
        item.append(link);
        return item;
      }));
    };

    input.addEventListener('input', () => { void render(); });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const rows = await loadIndex();
      const slug = parseTireQuery(input.value);
      const known = new Set(rows.map(([candidate]) => candidate));
      if (slug && known.has(slug)) { window.location.href = `${base}${slug}/`; return; }
      const first = list.querySelector<HTMLAnchorElement>('a');
      if (first) { window.location.href = first.href; return; }
      message.hidden = false;
    });
  });
}
