/**
 * Vehicle → Change → Meaning → Remaining checks → Decision, on the tire comparison and
 * fit-check forms. Reads the form's own fields, explains the change through
 * features/decision/change-decision.ts (built on runFitCheck — no parallel math) and keeps the
 * before-you-buy ticks per size change in localStorage. Never states that something fits.
 */
import { decisionText } from '../content/decision-text';
import { CHECKLIST_ITEMS, checklistKey, summarizeChange, type ChecklistItem, type VehicleBaseline } from '../features/decision/change-decision';
import type { TireToolInput, WheelOffsetToolInput } from '../features/tools/calculator-tools';
import { decisionRows, fill, progressText, ruleSentence } from './decision-sentences';
import { rememberedBaseline } from './my-vehicle';
import { getPageLocale } from './page-locale';
import { setSelectedVehicle, VEHICLE_CHANGED_EVENT } from './vehicle-storage';

const FORMS = 'form[data-calculator="tire-comparison"], form[data-calculator="tire-fit-check"]';
const STATE_PARAMS = ['tool', 'state', 'current', 'new', 'ow', 'oe', 'nw', 'ne'];

const input = (form: HTMLFormElement, name: string): HTMLInputElement | null => form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
const num = (form: HTMLFormElement, name: string): number => Number(input(form, name)?.value ?? NaN);
const tireOf = (form: HTMLFormElement, prefix: string): TireToolInput => ({ widthMm: num(form, `${prefix}widthMm`), aspectRatio: num(form, `${prefix}aspectRatio`), rimDiameterInches: num(form, `${prefix}rimDiameterInches`) });

function wheelsOf(form: HTMLFormElement): WheelOffsetToolInput | undefined {
  const raw = ['originalWidthInches', 'originalOffsetMm', 'newWidthInches', 'newOffsetMm'].map((name) => input(form, name)?.value.trim() ?? '');
  if (raw.some((value) => value === '' || !Number.isFinite(Number(value)))) return undefined;
  const [ow, oe, nw, ne] = raw.map(Number) as [number, number, number, number];
  return { originalWidthInches: ow, originalOffsetMm: oe, newWidthInches: nw, newOffsetMm: ne };
}

function readTicks(key: string): Set<ChecklistItem> {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw && raw.length < 400 ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return new Set(parsed.filter((item): item is ChecklistItem => (CHECKLIST_ITEMS as readonly unknown[]).includes(item)));
  } catch { /* storage unavailable or corrupt: start empty */ }
  return new Set();
}

function writeTicks(key: string, ticks: ReadonlySet<ChecklistItem>): void {
  try {
    if (ticks.size) window.localStorage.setItem(key, JSON.stringify([...ticks]));
    else window.localStorage.removeItem(key);
  } catch { /* best-effort */ }
}

/** Fill the current size (and wheel) from the remembered car — only on an untouched form. */
function prefillFromCar(form: HTMLFormElement, car: VehicleBaseline): boolean {
  const params = new URLSearchParams(window.location.search);
  if (!car.tire || STATE_PARAMS.some((name) => params.has(name))) return false;
  const tireNames = ['widthMm', 'aspectRatio', 'rimDiameterInches'];
  const untouched = ['original-', 'new-'].every((prefix) => tireNames.every((name) => { const el = input(form, `${prefix}${name}`); return !!el && el.value === el.defaultValue; }));
  if (!untouched) return false;
  const set = (name: string, value: number | undefined): void => { const el = input(form, name); if (el && value !== undefined) el.value = String(value); };
  const next = car.alternative ?? car.tire;
  set('original-widthMm', car.tire.widthMm); set('original-aspectRatio', car.tire.aspectRatio); set('original-rimDiameterInches', car.tire.rimDiameterInches);
  set('new-widthMm', next.widthMm); set('new-aspectRatio', next.aspectRatio); set('new-rimDiameterInches', next.rimDiameterInches);
  if (car.wheel && input(form, 'originalWidthInches')?.value === '') {
    set('originalWidthInches', car.wheel.widthInches);
    if (car.wheel.offsetMm !== undefined) set('originalOffsetMm', car.wheel.offsetMm);
  }
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.requestSubmit();
  return true;
}

export function initializeDecisionPanels(): void {
  const locale = getPageLocale();
  const t = decisionText[locale];
  document.querySelectorAll<HTMLFormElement>(FORMS).forEach((form) => {
    const panel = form.querySelector<HTMLElement>('[data-decision-panel]');
    const bar = form.querySelector<HTMLElement>('[data-my-vehicle-bar]');
    let car = rememberedBaseline();

    const syncBar = (filled: boolean): void => {
      if (!bar) return;
      bar.hidden = !car;
      const name = bar.querySelector<HTMLElement>('[data-my-vehicle-name]');
      if (name) name.textContent = car?.label ?? '';
      const note = bar.querySelector<HTMLElement>('[data-my-vehicle-filled]');
      if (note && filled) note.hidden = false;
      if (note && !car) note.hidden = true;
    };
    bar?.querySelector('[data-my-vehicle-forget]')?.addEventListener('click', () => setSelectedVehicle(null));

    let key = '';
    const boxes = panel ? [...panel.querySelectorAll<HTMLInputElement>('[data-decision-item]')] : [];
    const progress = panel?.querySelector<HTMLElement>('[data-decision-progress]');
    const barFill = panel?.querySelector<HTMLElement>('[data-decision-bar]');
    const showProgress = (): void => {
      const done = boxes.filter((box) => box.checked).length;
      if (progress) progress.textContent = progressText(t, done, boxes.length);
      if (barFill) barFill.style.width = `${boxes.length ? (done / boxes.length) * 100 : 0}%`;
      panel?.classList.toggle('is-complete', done === boxes.length && boxes.length > 0);
    };
    const loadTicks = (): void => {
      const ticks = readTicks(key);
      boxes.forEach((box) => { box.checked = ticks.has(box.dataset.decisionItem as ChecklistItem); });
      showProgress();
    };
    const saveTicks = (): void => {
      writeTicks(key, new Set(boxes.filter((box) => box.checked).map((box) => box.dataset.decisionItem as ChecklistItem)));
      showProgress();
    };
    // Ticks are not calculator input: keep them away from the form's input/change listeners.
    boxes.forEach((box) => { box.addEventListener('input', (event) => event.stopPropagation()); box.addEventListener('change', (event) => { event.stopPropagation(); saveTicks(); }); });
    panel?.querySelector('[data-decision-clear]')?.addEventListener('click', () => { boxes.forEach((box) => { box.checked = false; }); saveTicks(); });

    const hint = (item: ChecklistItem, text: string): void => {
      const node = panel?.querySelector<HTMLElement>(`[data-decision-hint="${item}"]`);
      if (node) node.textContent = text;
    };

    const render = (): void => {
      if (!panel) return;
      const current = tireOf(form, 'original-');
      const proposed = tireOf(form, 'new-');
      const summary = summarizeChange(current, proposed, wheelsOf(form));
      panel.hidden = !summary;
      if (!summary) return;
      const rowsNode = panel.querySelector<HTMLElement>('[data-decision-rows]');
      if (rowsNode) {
        rowsNode.replaceChildren(...decisionRows(summary, t, locale).map((row) => {
          const wrap = document.createElement('div');
          wrap.className = `decision-panel__row decision-panel__row--${row.tone}`;
          const dt = document.createElement('dt'); dt.textContent = row.label;
          const dd = document.createElement('dd'); dd.textContent = row.text;
          wrap.append(dt, dd);
          return wrap;
        }));
      }
      const rule = panel.querySelector<HTMLElement>('[data-decision-rule]');
      if (rule) { rule.textContent = ruleSentence(summary, t); rule.dataset.tone = summary.diameterWithinRule ? 'neutral' : 'attention'; }
      const open = panel.querySelector<HTMLElement>('[data-decision-open]');
      if (open) open.replaceChildren(...summary.openPoints.map((point) => { const li = document.createElement('li'); li.textContent = t.points[point]; return li; }));
      hint('pcd', car ? fill(t.carPcd, { x: car.boltPattern }) : t.items.pcd.hint);
      hint('offset', car ? fill(t.carWheel, { x: car.wheelText }) : t.items.offset.hint);
      const speedLink = panel.querySelector<HTMLAnchorElement>('[data-decision-link="speedometer"]');
      if (speedLink) {
        const url = new URL(speedLink.getAttribute('href') ?? '', window.location.origin);
        url.search = new URLSearchParams({ current: `${current.widthMm}-${current.aspectRatio}-${current.rimDiameterInches}`, new: `${proposed.widthMm}-${proposed.aspectRatio}-${proposed.rimDiameterInches}` }).toString();
        speedLink.setAttribute('href', `${url.pathname}${url.search}`);
      }
      const nextKey = checklistKey(current, proposed);
      if (nextKey !== key) { key = nextKey; loadTicks(); }
    };

    let pending = false;
    const schedule = (): void => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; render(); });
    };
    form.addEventListener('input', schedule);
    form.addEventListener('submit', schedule);
    window.addEventListener(VEHICLE_CHANGED_EVENT, () => { car = rememberedBaseline(); syncBar(false); schedule(); });

    syncBar(false);
    // URL state is restored in the next task (shareable-tool-state.ts); decide after it.
    window.setTimeout(() => {
      if (car) syncBar(prefillFromCar(form, car));
      render();
    }, 0);
  });
}
