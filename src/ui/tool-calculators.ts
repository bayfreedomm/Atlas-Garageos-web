import { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool, type TireToolInput } from '../features/tools/calculator-tools';
import { speedometerMetrics, speedometerSummary, tireCalculatorMetrics, tireCalculatorSummary, tireComparisonMetrics, tireComparisonSummary, toolIssueText, wheelOffsetMetrics, wheelOffsetSummary, type PresentedMetric } from './tool-presentation';
import { tireScaleMapping, wheelOffsetVisualMapping } from './fitment-visualizer-model';

const numberValue = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));
const tireValue = (form: HTMLFormElement, prefix: string): TireToolInput => ({ widthMm: numberValue(form, `${prefix}widthMm`), aspectRatio: numberValue(form, `${prefix}aspectRatio`), rimDiameterInches: numberValue(form, `${prefix}rimDiameterInches`) });

function renderMetrics(container: HTMLDListElement, metrics: readonly PresentedMetric[]): void {
  container.replaceChildren(...metrics.map((metric) => {
    const wrapper = document.createElement('div');
    const term = document.createElement('dt'); term.textContent = metric.label;
    const value = document.createElement('dd'); value.textContent = metric.value;
    wrapper.append(term, value); return wrapper;
  }));
}

function renderIssues(container: HTMLElement, issues: readonly Parameters<typeof toolIssueText>[0][]): void {
  const list = document.createElement('ul');
  for (const issue of issues) { const item = document.createElement('li'); item.textContent = toolIssueText(issue); list.append(item); }
  container.replaceChildren(list); container.hidden = false;
}

function setSummary(form: HTMLFormElement, summary: string): void {
  const element = form.querySelector<HTMLElement>('[data-result-summary]');
  if (element) { element.textContent = summary; element.classList.remove('is-pending'); }
}

function setTireVisual(form: HTMLFormElement, input: TireToolInput, currentDiameterMm: number, proposed?: TireToolInput, proposedDiameterMm?: number): void {
  const visual = form.querySelector<HTMLElement>('[data-fitment-visualizer]');
  if (!visual) return;
  const model = proposed && proposedDiameterMm !== undefined
    ? tireScaleMapping({ currentDiameterMm, currentRimDiameterInches: input.rimDiameterInches, proposedDiameterMm, proposedRimDiameterInches: proposed.rimDiameterInches })
    : tireScaleMapping({ currentDiameterMm, currentRimDiameterInches: input.rimDiameterInches });
  visual.querySelector<SVGCircleElement>('[data-current-tire]')?.setAttribute('r', String(model.currentTireRadius));
  visual.querySelector<SVGCircleElement>('[data-current-rim]')?.setAttribute('r', String(model.currentRimRadius));
  visual.querySelector<SVGCircleElement>('[data-new-tire]')?.setAttribute('r', String(model.proposedTireRadius));
  visual.querySelector<SVGCircleElement>('[data-new-rim]')?.setAttribute('r', String(model.proposedRimRadius));
  const widthBlock = visual.querySelector<SVGRectElement>('[data-current-width]');
  const widthPixels = Math.min(78, Math.max(38, input.widthMm / 4));
  widthBlock?.setAttribute('x', String(257 - widthPixels / 2));
  widthBlock?.setAttribute('width', String(widthPixels));
  const widthLabel = visual.querySelector<SVGTextElement>('[data-current-width-label]');
  if (widthLabel) widthLabel.textContent = `${input.widthMm} MM WIDE`;
  const currentLabel = visual.querySelector<HTMLElement>('[data-current-tire-label]');
  const proposedLabel = visual.querySelector<HTMLElement>('[data-new-tire-label]');
  if (currentLabel) currentLabel.textContent = `${input.widthMm}/${input.aspectRatio} R${input.rimDiameterInches} · ${currentDiameterMm.toFixed(1)} mm`;
  if (proposedLabel && proposed && proposedDiameterMm !== undefined) proposedLabel.textContent = `${proposed.widthMm}/${proposed.aspectRatio} R${proposed.rimDiameterInches} · ${proposedDiameterMm.toFixed(1)} mm`;
  const summary = visual.querySelector<HTMLElement>('[data-visual-summary]');
  if (summary) summary.textContent = proposed && proposedDiameterMm !== undefined ? 'Both outlines use the same scale.' : 'Diameter, rim and tread width respond to your numbers.';
}

function setWheelVisual(form: HTMLFormElement, inner: number, outer: number): void {
  const visual = form.querySelector<HTMLElement>('[data-fitment-visualizer]');
  if (!visual) return;
  const model = wheelOffsetVisualMapping(inner, outer);
  const proposed = visual.querySelector<SVGRectElement>('[data-new-wheel]');
  proposed?.setAttribute('x', String(model.proposedX)); proposed?.setAttribute('width', String(model.proposedWidth));
  const innerLabel = visual.querySelector<HTMLElement>('[data-inner-label]'); const outerLabel = visual.querySelector<HTMLElement>('[data-outer-label]');
  if (innerLabel) innerLabel.textContent = `${Math.abs(inner).toFixed(2)} mm ${inner >= 0 ? 'farther inward' : 'less inward'}`;
  if (outerLabel) outerLabel.textContent = `${Math.abs(outer).toFixed(2)} mm ${outer >= 0 ? 'farther outward' : 'less outward'}`;
  const summary = visual.querySelector<HTMLElement>('[data-visual-summary]');
  if (summary) summary.textContent = 'The new wheel moves around the fixed hub plane.';
}

export function initializeToolCalculators(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-size"]').forEach((form) => {
    const results = form.querySelector<HTMLDListElement>('[data-results]')!;
    const errors = form.querySelector<HTMLElement>('[data-errors]')!;
    const calculate = () => {
      const input = { widthMm: numberValue(form, 'widthMm'), aspectRatio: numberValue(form, 'aspectRatio'), rimDiameterInches: numberValue(form, 'rimDiameterInches') };
      const result = calculateTireSizeTool(input);
      if (!result.ok) { results.replaceChildren(); renderIssues(errors, result.issues); return; }
      errors.hidden = true; errors.replaceChildren(); setSummary(form, tireCalculatorSummary(result.value)); setTireVisual(form, input, result.value.overallDiameterMm); renderMetrics(results, tireCalculatorMetrics(result.value));
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); }); calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-comparison"]').forEach((form) => {
    bindCalculator(form, () => {
      const original = tireValue(form, 'original-'); const proposed = tireValue(form, 'new-');
      const result = compareTireSizesTool(original, proposed);
      if (result.ok) { setSummary(form, tireComparisonSummary(result.value)); setTireVisual(form, original, result.value.current.overallDiameterMm, proposed, result.value.proposed.overallDiameterMm); }
      return result.ok ? { ok: true as const, metrics: tireComparisonMetrics(result.value) } : result;
    });
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="wheel-offset"]').forEach((form) => {
    bindCalculator(form, () => {
      const result = calculateWheelOffsetTool({ originalWidthInches: numberValue(form, 'originalWidthInches'), originalOffsetMm: numberValue(form, 'originalOffsetMm'), newWidthInches: numberValue(form, 'newWidthInches'), newOffsetMm: numberValue(form, 'newOffsetMm') });
      if (result.ok) { setSummary(form, wheelOffsetSummary(result.value)); setWheelVisual(form, result.value.innerPositionChangeMm, result.value.outerPokeChangeMm); }
      return result.ok ? { ok: true as const, metrics: wheelOffsetMetrics(result.value) } : result;
    });
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="speedometer"]').forEach((form) => {
    bindCalculator(form, () => {
      const unit = new FormData(form).get('unit') === 'mph' ? 'mph' : 'km/h';
      const result = calculateSpeedometerTool(tireValue(form, 'original-'), tireValue(form, 'new-'), numberValue(form, 'indicatedSpeed'), unit);
      if (result.ok) setSummary(form, speedometerSummary(result.value));
      return result.ok ? { ok: true as const, metrics: speedometerMetrics(result.value) } : result;
    });
  });
}

function bindCalculator(form: HTMLFormElement, calculate: () => { readonly ok: true; readonly metrics: readonly PresentedMetric[] } | { readonly ok: false; readonly issues: readonly Parameters<typeof toolIssueText>[0][] }): void {
  const results = form.querySelector<HTMLDListElement>('[data-results]')!;
  const errors = form.querySelector<HTMLElement>('[data-errors]')!;
  const run = () => {
    const result = calculate();
    if (!result.ok) { results.replaceChildren(); renderIssues(errors, result.issues); return; }
    errors.hidden = true; errors.replaceChildren(); renderMetrics(results, result.metrics);
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); run(); }); run();
}
