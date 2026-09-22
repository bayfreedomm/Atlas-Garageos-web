import { pcdFromAdjacentHoleSpacingMm } from '../data/bolt-pattern-geometry';
import { buildPcd3DModel, buildTireComparison3DModel, buildWheelOffset3DModel, type Pcd3DModel, type TireComparison3DModel, type WheelOffset3DModel } from '../lib/visualization/parametric-3d-model';
import { Canvas3DRenderer } from '../lib/visualization/canvas-3d';
import { pcdScene, tireComparisonScene, wheelOffsetScene, type VisualizationPalette } from '../lib/visualization/scene-builders';
import { visualization3DLocale, visualization3DText } from '../localization/visualization-3d';

const mounted = new WeakSet<HTMLElement>();
const MM_PER_INCH = 25.4;

type Mode = 'tire' | 'offset' | 'pcd';

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function signed(value: number, digits = 1): string { return `${value > 0 ? '+' : ''}${value.toFixed(digits)}`; }
function css(panel: HTMLElement, name: string, fallback: string): string {
  const value = getComputedStyle(panel).getPropertyValue(name).trim();
  return value || fallback;
}
function palette(panel: HTMLElement): VisualizationPalette {
  return {
    current: css(panel, '--p3d-current', '#2e9dff'),
    proposed: css(panel, '--p3d-proposed', '#ff8a22'),
    metal: css(panel, '--p3d-metal', '#8fa2b1'),
    hub: css(panel, '--p3d-hub', '#415563'),
    guide: css(panel, '--p3d-guide', '#8295a4'),
    accent: css(panel, '--p3d-accent', '#7ed6ff'),
    warning: css(panel, '--p3d-warning', '#ffc35b'),
  };
}

function setMetric(panel: HTMLElement, key: string, value: string): void {
  const node = panel.querySelector<HTMLElement>(`[data-p3d-value="${key}"]`);
  if (node) node.textContent = value;
}

function setUnavailable(panel: HTMLElement, unavailable: boolean): void {
  panel.classList.toggle('is-unavailable', unavailable);
  const fallback = panel.querySelector<HTMLElement>('[data-p3d-fallback]');
  if (fallback) fallback.hidden = !unavailable;
}

function currentTireModel(form: HTMLFormElement): TireComparison3DModel | null {
  return buildTireComparison3DModel(
    { widthMm: numberValue(form, 'original-widthMm'), aspectRatio: numberValue(form, 'original-aspectRatio'), rimDiameterInches: numberValue(form, 'original-rimDiameterInches') },
    { widthMm: numberValue(form, 'new-widthMm'), aspectRatio: numberValue(form, 'new-aspectRatio'), rimDiameterInches: numberValue(form, 'new-rimDiameterInches') },
  );
}

function currentOffsetModel(form: HTMLFormElement): WheelOffset3DModel | null {
  return buildWheelOffset3DModel({
    originalWidthInches: numberValue(form, 'originalWidthInches'),
    originalOffsetMm: numberValue(form, 'originalOffsetMm'),
    newWidthInches: numberValue(form, 'newWidthInches'),
    newOffsetMm: numberValue(form, 'newOffsetMm'),
  });
}

function currentPcdModel(panel: HTMLElement, form: HTMLFormElement | null): Pcd3DModel | null {
  if (form) {
    const lugCount = numberValue(form, 'lugCount');
    const spacingEntered = numberValue(form, 'spacing');
    const unit = String(new FormData(form).get('spacingUnit') ?? 'mm') === 'in' ? 'in' : 'mm';
    const spacingMm = unit === 'in' ? spacingEntered * MM_PER_INCH : spacingEntered;
    if (!Number.isFinite(spacingMm) || spacingMm <= 0 || !Number.isInteger(lugCount)) return null;
    try { return buildPcd3DModel(lugCount, pcdFromAdjacentHoleSpacingMm(spacingMm, lugCount)); } catch { return null; }
  }
  const lugCount = Number(panel.dataset.lugCount);
  const pcdMm = Number(panel.dataset.pcdMm);
  const centerBoreRaw = panel.dataset.centerBoreMm;
  const centerBoreMm = centerBoreRaw ? Number(centerBoreRaw) : null;
  return buildPcd3DModel(lugCount, pcdMm, centerBoreMm);
}

function tireMetrics(panel: HTMLElement, model: TireComparison3DModel): void {
  setMetric(panel, 'current', `${model.current.overallDiameterMm.toFixed(1)} mm`);
  setMetric(panel, 'proposed', `${model.proposed.overallDiameterMm.toFixed(1)} mm`);
  setMetric(panel, 'width', `${model.current.widthMm.toFixed(0)} → ${model.proposed.widthMm.toFixed(0)} mm`);
  setMetric(panel, 'sidewall', `${model.current.sidewallMm.toFixed(1)} → ${model.proposed.sidewallMm.toFixed(1)} mm`);
  setMetric(panel, 'rim', `${(model.current.rimDiameterMm / MM_PER_INCH).toFixed(0)} → ${(model.proposed.rimDiameterMm / MM_PER_INCH).toFixed(0)} in`);
  setMetric(panel, 'diameterDelta', `${signed(model.diameterDifferenceMm)} mm`);
  setMetric(panel, 'circumferenceDelta', `${signed(model.circumferenceDifferenceMm)} mm`);
  setMetric(panel, 'speedometerDelta', `${signed(model.speedometerDifferencePercent, 2)}%`);
}
function offsetMetrics(panel: HTMLElement, model: WheelOffset3DModel): void {
  setMetric(panel, 'currentOffset', `ET${model.originalOffsetMm}`);
  setMetric(panel, 'newOffset', `ET${model.newOffsetMm}`);
  setMetric(panel, 'width', `${(model.originalWidthMm / MM_PER_INCH).toFixed(1)}J → ${(model.newWidthMm / MM_PER_INCH).toFixed(1)}J`);
  setMetric(panel, 'innerDelta', `${signed(model.innerPositionChangeMm, 2)} mm`);
  setMetric(panel, 'outerDelta', `${signed(model.outerPokeChangeMm, 2)} mm`);
}
function pcdMetrics(panel: HTMLElement, model: Pcd3DModel): void {
  setMetric(panel, 'pcd', `${model.pcdMm.toFixed(model.pcdMm % 1 ? 1 : 0)} mm`);
  setMetric(panel, 'lugCount', String(model.lugCount));
  setMetric(panel, 'holeSpacing', `${model.adjacentSpacingMm.toFixed(2)} mm`);
  setMetric(panel, 'centerBore', model.centerBoreMm ? `${model.centerBoreMm.toFixed(1)} mm` : '—');
}

export function mountParametric3DPanel(panel: HTMLElement): void {
  if (mounted.has(panel)) return;
  mounted.add(panel);
  const canvas = panel.querySelector<HTMLCanvasElement>('canvas[data-p3d-canvas]');
  if (!canvas) return;
  const mode = (panel.dataset.mode ?? '') as Mode;
  if (mode !== 'tire' && mode !== 'offset' && mode !== 'pcd') return;
  const locale = visualization3DLocale(panel.dataset.locale);
  const text = visualization3DText[locale];
  const form = panel.closest<HTMLFormElement>('form');

  let renderer: Canvas3DRenderer;
  try { renderer = new Canvas3DRenderer(canvas); }
  catch { setUnavailable(panel, true); return; }

  panel.classList.add('is-ready');
  setUnavailable(panel, false);
  let tireView: 'side-by-side' | 'overlay' = 'side-by-side';

  if (mode === 'tire') renderer.configureView({ yaw: -0.88, pitch: 0.3, zoom: 1.02 }, true);
  else if (mode === 'offset') renderer.configureView({ yaw: -0.56, pitch: 0.38, zoom: 1.02 }, true);
  else renderer.configureView({ yaw: -0.42, pitch: 0.7, zoom: 1.08 }, true);

  const refreshTheme = (): void => {
    renderer.setTheme(css(panel, '--p3d-background', '#09151f'), css(panel, '--p3d-grid', '#294252'));
  };
  const refresh = (): void => {
    const colors = palette(panel);
    if (mode === 'tire') {
      if (!form) return;
      const model = currentTireModel(form);
      if (!model) { setUnavailable(panel, true); return; }
      setUnavailable(panel, false);
      renderer.setScene(tireComparisonScene(model, colors, tireView));
      tireMetrics(panel, model);
      return;
    }
    if (mode === 'offset') {
      if (!form) return;
      const model = currentOffsetModel(form);
      if (!model) { setUnavailable(panel, true); return; }
      setUnavailable(panel, false);
      renderer.setScene(wheelOffsetScene(model, colors));
      offsetMetrics(panel, model);
      return;
    }
    const model = currentPcdModel(panel, form);
    if (!model) { setUnavailable(panel, true); return; }
    setUnavailable(panel, false);
    renderer.setScene(pcdScene(model, colors));
    pcdMetrics(panel, model);
  };

  panel.querySelector<HTMLButtonElement>('[data-p3d-reset]')?.addEventListener('click', () => renderer.reset());
  panel.querySelector<HTMLButtonElement>('[data-p3d-zoom-in]')?.addEventListener('click', () => renderer.zoomBy(1.14));
  panel.querySelector<HTMLButtonElement>('[data-p3d-zoom-out]')?.addEventListener('click', () => renderer.zoomBy(.88));
  panel.querySelectorAll<HTMLButtonElement>('[data-p3d-tire-view]').forEach((button) => {
    button.addEventListener('click', () => {
      tireView = button.dataset.p3dTireView === 'overlay' ? 'overlay' : 'side-by-side';
      panel.querySelectorAll<HTMLButtonElement>('[data-p3d-tire-view]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      refresh();
    });
  });

  if (form) {
    const queuedRefresh = (): void => { requestAnimationFrame(refresh); };
    form.addEventListener('input', queuedRefresh);
    form.addEventListener('change', queuedRefresh);
    form.addEventListener('submit', queuedRefresh);
  }

  const themeObserver = new MutationObserver(() => { refreshTheme(); refresh(); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  refreshTheme();
  refresh();

  // Teardown when Astro navigation or DOM replacement removes this panel.
  const removalObserver = new MutationObserver(() => {
    if (document.contains(panel)) return;
    renderer.destroy();
    themeObserver.disconnect();
    removalObserver.disconnect();
  });
  removalObserver.observe(document.body, { childList: true, subtree: true });

  canvas.setAttribute('aria-label', `${mode === 'tire' ? text.tireTitle : mode === 'offset' ? text.offsetTitle : text.pcdTitle}. ${text.dragHint}`);
}
