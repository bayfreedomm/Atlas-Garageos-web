/**
 * Binds a server-rendered calculator drawing (ToolDrawingFrame.astro) to its form: every input
 * or change re-renders the same pure renderer the server used, so drawing and calculator agree.
 */
import { isDrawingKind, renderToolDrawing, type DrawingKind, type DrawingValues } from './tool-drawings';

export function readFormValues(form: HTMLFormElement): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of new FormData(form)) if (typeof value === 'string') values[key] = value.trim();
  return values;
}

async function resolveExtra(kind: DrawingKind, values: DrawingValues): Promise<DrawingValues> {
  if (kind !== 'vehicle-fitment-finder' || !values.model) return {};
  const { vehicleById } = await import('../data/vehicle-fitment');
  const vehicle = vehicleById(values.model);
  if (!vehicle) return {};
  const [lugs, pcd] = vehicle.boltPattern.split(/x/i);
  return { lugs: lugs ?? '', pcd: pcd ?? '', tire: vehicle.tireSize };
}

export function bindToolDrawing(frame: HTMLElement, form: HTMLFormElement | null | undefined): void {
  const kind = frame.dataset.toolDrawing;
  if (!kind || !isDrawingKind(kind) || frame.dataset.toolDrawingBound === 'true') return;
  frame.dataset.toolDrawingBound = 'true';
  const host = frame.querySelector<HTMLElement>('[data-tool-drawing-host]');
  const reading = frame.querySelector<HTMLElement>('[data-tool-drawing-readout]');
  let labels: Record<string, string> = {};
  try { labels = JSON.parse(frame.dataset.drawingLabels ?? '{}') as Record<string, string>; } catch { labels = {}; }
  const comma = frame.dataset.drawingComma === 'true';
  let version = 0;
  const render = async (): Promise<void> => {
    if (!host) return;
    const current = ++version;
    const values = form ? readFormValues(form) : {};
    const extra = await resolveExtra(kind, values);
    if (current !== version) return;
    const drawing = renderToolDrawing(kind, { ...values, ...extra }, labels, comma);
    host.innerHTML = drawing.svg;
    if (reading) { reading.textContent = drawing.readout; if (reading.parentElement) reading.parentElement.hidden = drawing.readout === ''; }
  };
  let lastKey = '';
  const schedule = (): void => { void render(); };
  form?.addEventListener('input', schedule);
  form?.addEventListener('change', schedule);
  form?.addEventListener('submit', () => window.setTimeout(schedule, 0));
  // Scripts that restore saved or shared values (and the market's default currency) set fields
  // without firing events. When the calculator repaints its results, re-read the form and
  // redraw if anything changed, so the drawing never shows defaults next to a different result.
  if (form) {
    let pending = 0;
    new MutationObserver((records) => {
      if (records.every((record) => frame.contains(record.target))) return;
      if (pending) return;
      pending = window.requestAnimationFrame(() => {
        pending = 0;
        const key = JSON.stringify(readFormValues(form));
        if (key !== lastKey) { lastKey = key; schedule(); }
      });
    }).observe(form, { subtree: true, childList: true, characterData: true });
    lastKey = JSON.stringify(readFormValues(form));
  }
  schedule();
}

/** Binds every drawing frame on the page to the nearest calculator form. */
export function bindAllToolDrawings(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-tool-drawing]').forEach((frame) => {
    // Frames inside the shared visual studio are bound by the studio, which knows its form.
    if (frame.hasAttribute('data-tool-engineering-2d')) return;
    const byId = frame.dataset.drawingForm ? document.getElementById(frame.dataset.drawingForm) : null;
    const form = (byId instanceof HTMLFormElement ? byId : null) ?? frame.closest('form') ?? frame.closest('.tool-machine, main')?.querySelector<HTMLFormElement>('form.calculator-form, .tool-workspace form') ?? null;
    bindToolDrawing(frame, form);
  });
}
