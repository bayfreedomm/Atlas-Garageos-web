import { Canvas3DRenderer, type Scene3D, type View3D } from '../lib/visualization/canvas-3d';
import { sceneForTool } from '../lib/visualization/tool-3d-scenes';
import type { VisualizationPalette } from '../lib/visualization/scene-builders';
import { additional3DToolIds, tool3DText, type Additional3DToolId, type Tool3DLocale } from '../localization/tool-3d-catalog';
import { studioCameraView, type StudioCamera } from '../lib/visualization/studio-camera';
import { mountStudioFocus } from './studio-focus';

interface Renderer {
  setTheme(background: string, grid: string): void;
  setScene(scene: Scene3D): void;
  configureView(view: View3D, applyCurrent?: boolean): void;
  setView(yaw: number, pitch: number, zoom?: number): void;
  reset(): void;
  zoomBy(factor: number): void;
  destroy(): void;
}
const mounted = new WeakSet<HTMLElement>();
const css = (panel: HTMLElement, key: string, fallback: string) => getComputedStyle(panel).getPropertyValue(key).trim() || fallback;
const palette = (panel: HTMLElement): VisualizationPalette => ({
  current: css(panel, '--p3d-current', '#2e9dff'), proposed: css(panel, '--p3d-proposed', '#ff8a22'),
  metal: css(panel, '--p3d-metal', '#8fa2b1'), hub: css(panel, '--p3d-hub', '#415563'),
  guide: css(panel, '--p3d-guide', '#8295a4'), accent: css(panel, '--p3d-accent', '#7ed6ff'),
  warning: css(panel, '--p3d-warning', '#ffc35b'),
});

export async function mountTool3D(panel: HTMLElement): Promise<void> {
  if (mounted.has(panel)) return;
  // Digits after a dash do not camel-case in DOMStringMap (`data-tool-3d`
  // is not `dataset.tool3d`). Read these attributes explicitly.
  const id = panel.getAttribute('data-tool-3d') as Additional3DToolId;
  const localeAttribute = panel.getAttribute('data-tool-3d-locale');
  const locale: Tool3DLocale = localeAttribute === 'de' || localeAttribute === 'es' ? localeAttribute : 'en';
  if (!(additional3DToolIds as readonly string[]).includes(id)) return;
  const initialCanvas = panel.querySelector<HTMLCanvasElement>('[data-tool-3d-canvas]');
  const stage = panel.querySelector<HTMLElement>('.parametric-3d__stage');
  if (!initialCanvas || !stage) return;
  mounted.add(panel);
  let canvas = initialCanvas;
  const events = new AbortController();
  const form = panel.closest('.tool-machine')?.querySelector<HTMLFormElement>('.tool-workspace form') ?? null;
  let renderer: Renderer;
  try {
    const { Three3DRenderer } = await import('../lib/visualization/three-3d');
    renderer = new Three3DRenderer(canvas, stage);
    panel.dataset.renderer = 'webgl';
  } catch {
    const next = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(next); canvas = next;
    try { renderer = new Canvas3DRenderer(canvas); panel.dataset.renderer = 'canvas'; }
    catch { panel.classList.add('is-unavailable'); panel.querySelector<HTMLElement>('[data-tool-3d-fallback]')?.removeAttribute('hidden'); return; }
  }

  const opening = { yaw: -.55, pitch: .26, zoom: 1.08 };
  renderer.configureView(opening, true);
  let selectedCamera: StudioCamera | null = 'studio';
  const setCameraSelection = (preset: StudioCamera | null): void => {
    selectedCamera = preset;
    panel.querySelectorAll<HTMLButtonElement>('[data-tool-3d-camera]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-tool-3d-camera') === preset));
    });
  };
  const closeFocus = mountStudioFocus(panel, panel.querySelector<HTMLButtonElement>('[data-tool-3d-focus]'), events.signal);
  const refreshTheme = () => renderer.setTheme(css(panel, '--p3d-background', '#09151f'), css(panel, '--p3d-grid', '#294252'));
  const refresh = () => {
    const values: Record<string, string> = {};
    if (form) for (const [key, value] of new FormData(form)) if (typeof value === 'string') values[key] = value;
    const result = sceneForTool(id, values, palette(panel), locale, panel.dataset.renderer === 'canvas');
    renderer.setScene(result.scene);
    const readout = panel.querySelector<HTMLElement>('[data-tool-3d-readout]');
    const detail = panel.querySelector<HTMLElement>('[data-tool-3d-detail]');
    if (readout) readout.textContent = locale !== 'en' && (id === 'fitment-map' || id === 'measure-my-car') ? tool3DText(locale, id).title : result.readout;
    if (detail) detail.textContent = locale === 'en' ? result.detail : tool3DText(locale, id).title;
  };
  const queued = () => { requestAnimationFrame(refresh); };
  panel.querySelector('[data-tool-3d-reset]')?.addEventListener('click', () => { renderer.reset(); setCameraSelection('studio'); }, { signal: events.signal });
  panel.querySelector('[data-tool-3d-zoom-in]')?.addEventListener('click', () => renderer.zoomBy(1.14), { signal: events.signal });
  panel.querySelector('[data-tool-3d-zoom-out]')?.addEventListener('click', () => renderer.zoomBy(.88), { signal: events.signal });
  panel.querySelectorAll<HTMLButtonElement>('[data-tool-3d-camera]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.getAttribute('data-tool-3d-camera') as StudioCamera;
      const view = studioCameraView(opening, preset);
      renderer.setView(view.yaw, view.pitch, view.zoom);
      setCameraSelection(preset);
    }, { signal: events.signal });
  });
  stage.addEventListener('pointerdown', (event) => { if (event.target instanceof HTMLCanvasElement) setCameraSelection(null); }, { signal: events.signal });
  for (const name of ['input', 'change', 'submit']) form?.addEventListener(name, queued, { signal: events.signal });
  const selectionObserver = new MutationObserver(queued);
  if (id === 'vehicle-fitment-finder' && form) selectionObserver.observe(form, { childList: true, subtree: true });
  stage.addEventListener('p3d:webgl-lost', () => {
    renderer.destroy();
    const next = canvas.cloneNode(false) as HTMLCanvasElement;
    canvas.replaceWith(next); canvas = next;
    try {
      renderer = new Canvas3DRenderer(canvas);
      panel.dataset.renderer = 'canvas';
      renderer.configureView(opening, true);
      if (selectedCamera && selectedCamera !== 'studio') {
        const view = studioCameraView(opening, selectedCamera);
        renderer.setView(view.yaw, view.pitch, view.zoom);
      }
      refreshTheme(); refresh();
    }
    catch { panel.classList.add('is-unavailable'); panel.querySelector<HTMLElement>('[data-tool-3d-fallback]')?.removeAttribute('hidden'); }
  }, { once: true, signal: events.signal });
  const themeObserver = new MutationObserver(() => { refreshTheme(); refresh(); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const removalObserver = new MutationObserver(() => {
    if (document.contains(panel)) return;
    renderer.destroy(); closeFocus(); events.abort(); themeObserver.disconnect(); selectionObserver.disconnect(); removalObserver.disconnect();
  });
  removalObserver.observe(document.body, { childList: true, subtree: true });
  refreshTheme(); refresh();
  panel.classList.add('is-ready');
  canvas.setAttribute('aria-label', `${panel.getAttribute('aria-label') ?? '3D'}. ${locale === 'de' ? 'Ziehen zum Drehen.' : locale === 'es' ? 'Arrastra para girar.' : 'Drag to rotate.'}`);
}
