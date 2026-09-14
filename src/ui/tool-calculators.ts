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
  const currentLabel = visual.querySelector<HTMLElement>('[data-current-tire-label]');
  const proposedLabel = visual.querySelector<HTMLElement>('[data-new-tire-label]');
  if (currentLabel) currentLabel.textContent = `${input.widthMm}/${input.aspectRatio} R${input.rimDiameterInches} · ${currentDiameterMm.toFixed(1)} mm`;
  if (proposedLabel && proposed && proposedDiameterMm !== undefined) proposedLabel.textContent = `${proposed.widthMm}/${proposed.aspectRatio} R${proposed.rimDiameterInches} · ${proposedDiameterMm.toFixed(1)} mm`;
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
}


function signed(value: number, digits = 1): string {
  const rounded = Math.abs(value).toFixed(digits).replace(/\.0$/, '');
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${rounded}`;
}

function setLineX(path: SVGPathElement | null, left: number, right: number, y: number): void {
  path?.setAttribute('d', `M${left.toFixed(1)} ${y}H${right.toFixed(1)}`);
}

function setTireComparisonTechnicalVisual(
  form: HTMLFormElement,
  original: TireToolInput,
  proposed: TireToolInput,
  result: Extract<ReturnType<typeof compareTireSizesTool>, { ok: true }>['value'],
): void {
  const visual = form.querySelector<HTMLElement>('[data-tire-tech-visual]');
  if (!visual) return;

  const maxDiameter = Math.max(result.current.overallDiameterMm, result.proposed.overallDiameterMm);
  const sideScale = 76 / maxDiameter;
  const currentRadius = result.current.overallDiameterMm * sideScale;
  const proposedRadius = result.proposed.overallDiameterMm * sideScale;
  const currentRimRadius = original.rimDiameterInches * 25.4 * sideScale;
  const proposedRimRadius = proposed.rimDiameterInches * 25.4 * sideScale;
  visual.querySelector<SVGCircleElement>('[data-current-side-tire]')?.setAttribute('r', currentRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-new-side-tire]')?.setAttribute('r', proposedRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-current-side-rim]')?.setAttribute('r', currentRimRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-new-side-rim]')?.setAttribute('r', proposedRimRadius.toFixed(2));

  const currentTop = 116 - currentRadius;
  const currentBottom = 116 + currentRadius;
  const proposedTop = 116 - proposedRadius;
  const proposedBottom = 116 + proposedRadius;
  visual.querySelector<SVGPathElement>('[data-current-diameter-line]')?.setAttribute('d', `M76 ${currentTop.toFixed(1)}V${currentBottom.toFixed(1)}`);
  visual.querySelector<SVGPathElement>('[data-new-diameter-line]')?.setAttribute('d', `M284 ${proposedTop.toFixed(1)}V${proposedBottom.toFixed(1)}`);
  const currentDiameterText = visual.querySelector<SVGTextElement>('[data-current-diameter-text]');
  const proposedDiameterText = visual.querySelector<SVGTextElement>('[data-new-diameter-text]');
  if (currentDiameterText) currentDiameterText.textContent = `${result.current.overallDiameterMm.toFixed(1)} mm`;
  if (proposedDiameterText) proposedDiameterText.textContent = `${result.proposed.overallDiameterMm.toFixed(1)} mm`;

  const maxWidth = Math.max(original.widthMm, proposed.widthMm);
  const maxFrontPixels = 104;
  const currentPixels = original.widthMm / maxWidth * maxFrontPixels;
  const proposedPixels = proposed.widthMm / maxWidth * maxFrontPixels;
  const updateFront = (prefix: 'current' | 'new', center: number, pixels: number): void => {
    const body = visual.querySelector<SVGRectElement>(`[data-${prefix}-front-body]`);
    const tread = visual.querySelector<SVGRectElement>(`[data-${prefix}-front-tread]`);
    if (body) { body.setAttribute('x', (-pixels / 2).toFixed(1)); body.setAttribute('width', pixels.toFixed(1)); }
    if (tread) { tread.setAttribute('x', (-pixels / 2 + 4).toFixed(1)); tread.setAttribute('width', Math.max(10, pixels - 8).toFixed(1)); }
    setLineX(visual.querySelector<SVGPathElement>(`[data-${prefix}-width-line]`), center - pixels / 2, center + pixels / 2, 29);
  };
  updateFront('current', 105, currentPixels);
  updateFront('new', 255, proposedPixels);
  const currentWidthText = visual.querySelector<SVGTextElement>('[data-current-width-text]');
  const proposedWidthText = visual.querySelector<SVGTextElement>('[data-new-width-text]');
  if (currentWidthText) currentWidthText.textContent = `${original.widthMm} mm`;
  if (proposedWidthText) proposedWidthText.textContent = `${proposed.widthMm} mm`;
  const currentSizeLabel = visual.querySelector<SVGTextElement>('[data-current-size-label]');
  const proposedSizeLabel = visual.querySelector<SVGTextElement>('[data-new-size-label]');
  if (currentSizeLabel) currentSizeLabel.textContent = `${original.widthMm}/${original.aspectRatio} R${original.rimDiameterInches}`;
  if (proposedSizeLabel) proposedSizeLabel.textContent = `${proposed.widthMm}/${proposed.aspectRatio} R${proposed.rimDiameterInches}`;

  const widthDifference = proposed.widthMm - original.widthMm;
  const setText = (selector: string, value: string): void => { const node = visual.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
  setText('[data-diff-diameter]', `${signed(result.diameterDifferenceMm)} mm`);
  setText('[data-diff-width]', `${signed(widthDifference, 0)} mm`);
  setText('[data-diff-sidewall]', `${signed(result.sidewallDifferenceMm)} mm`);
  setText('[data-diff-ride]', `${signed(result.rideHeightDifferenceMm)} mm`);
  const maxima = Math.max(Math.abs(result.diameterDifferenceMm), Math.abs(widthDifference), Math.abs(result.sidewallDifferenceMm), Math.abs(result.rideHeightDifferenceMm), 1);
  const setBar = (selector: string, value: number): void => {
    const node = visual.querySelector<HTMLElement>(selector);
    if (!node) return;
    node.style.setProperty('--difference-size', `${Math.max(7, Math.abs(value) / maxima * 100).toFixed(1)}%`);
    node.dataset.direction = value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero';
  };
  setBar('[data-diff-diameter-bar]', result.diameterDifferenceMm);
  setBar('[data-diff-width-bar]', widthDifference);
  setBar('[data-diff-sidewall-bar]', result.sidewallDifferenceMm);
  setBar('[data-diff-ride-bar]', result.rideHeightDifferenceMm);
  const sideMeaning = visual.querySelector<HTMLElement>('[data-side-meaning]');
  if (sideMeaning) sideMeaning.textContent = `New diameter is ${Math.abs(result.diameterDifferenceMm).toFixed(1)} mm ${result.diameterDifferenceMm >= 0 ? 'taller' : 'shorter'}; static ride height changes by about ${Math.abs(result.rideHeightDifferenceMm).toFixed(1)} mm.`;
  const widthMeaning = visual.querySelector<HTMLElement>('[data-width-meaning]');
  if (widthMeaning) widthMeaning.textContent = widthDifference === 0 ? 'Both tires have the same nominal section width.' : `The new tire is ${Math.abs(widthDifference)} mm ${widthDifference > 0 ? 'wider' : 'narrower'} by nominal section width.`;
}


function setWheelOffsetTechnicalVisual(
  form: HTMLFormElement,
  originalWidthInches: number,
  originalOffsetMm: number,
  newWidthInches: number,
  newOffsetMm: number,
  innerPositionChangeMm: number,
  outerPokeChangeMm: number,
): void {
  const visual = form.querySelector<HTMLElement>('[data-offset-tech-visual]');
  if (!visual) return;
  const hubX = 210;
  const scale = 0.52;
  const position = (widthInches: number, offsetMm: number) => {
    const widthPx = widthInches * 25.4 * scale;
    const centerX = hubX - offsetMm * scale;
    return { widthPx, centerX, left: centerX - widthPx / 2, right: centerX + widthPx / 2 };
  };
  const current = position(originalWidthInches, originalOffsetMm);
  const next = position(newWidthInches, newOffsetMm);
  const setWheel = (prefix: 'current' | 'new', model: ReturnType<typeof position>, y: number): void => {
    const body = visual.querySelector<SVGRectElement>(`[data-${prefix}-offset-body]`);
    if (body) { body.setAttribute('x', model.left.toFixed(1)); body.setAttribute('width', model.widthPx.toFixed(1)); }
    visual.querySelector<SVGPathElement>(`[data-${prefix}-centerline]`)?.setAttribute('d', `M${model.centerX.toFixed(1)} ${y - 11}v77`);
  };
  setWheel('current', current, 63);
  setWheel('new', next, 139);

  const setArrow = (kind: 'inner' | 'outer', from: number, to: number, value: number): void => {
    const y = 218;
    const a = Math.min(from, to); const b = Math.max(from, to);
    visual.querySelector<SVGPathElement>(`[data-${kind}-arrow]`)?.setAttribute('d', `M${a.toFixed(1)} ${y}H${b.toFixed(1)}`);
    const leftHead = visual.querySelector<SVGPathElement>(`[data-${kind}-head-left]`);
    const rightHead = visual.querySelector<SVGPathElement>(`[data-${kind}-head-right]`);
    leftHead?.setAttribute('d', `M${a.toFixed(1)} ${y-4}l-7 4 7 4`);
    rightHead?.setAttribute('d', `M${b.toFixed(1)} ${y-4}l7 4-7 4`);
    const text = visual.querySelector<SVGTextElement>(`[data-${kind}-delta]`);
    if (text) { text.setAttribute('x', ((a+b)/2).toFixed(1)); text.textContent = `${Math.abs(value).toFixed(2)} mm`; }
  };
  setArrow('inner', current.left, next.left, innerPositionChangeMm);
  setArrow('outer', current.right, next.right, outerPokeChangeMm);

  const setText = (selector: string, value: string): void => { const node = visual.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
  setText('[data-original-wheel-spec]', `${originalWidthInches}J · ET${originalOffsetMm}`);
  setText('[data-new-wheel-spec]', `${newWidthInches}J · ET${newOffsetMm}`);
  setText('[data-inner-value]', `${signed(innerPositionChangeMm, 2)} mm`);
  setText('[data-outer-value]', `${signed(outerPokeChangeMm, 2)} mm`);
  setText('[data-inner-copy]', innerPositionChangeMm >= 0 ? 'farther inward' : 'more inner clearance');
  setText('[data-outer-copy]', outerPokeChangeMm >= 0 ? 'farther outward' : 'less outward');
  setText('[data-inner-meaning]', innerPositionChangeMm === 0 ? 'Inner edge stays in the same position.' : `Inner edge moves ${Math.abs(innerPositionChangeMm).toFixed(2)} mm ${innerPositionChangeMm > 0 ? 'toward the suspension' : 'away from the suspension'}.`);
  setText('[data-outer-meaning]', outerPokeChangeMm === 0 ? 'Outer edge stays in the same position.' : `Outer edge moves ${Math.abs(outerPokeChangeMm).toFixed(2)} mm ${outerPokeChangeMm > 0 ? 'toward the fender' : 'inward'}.`);
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
    const preview = () => {
      const input = { widthMm: numberValue(form, 'widthMm'), aspectRatio: numberValue(form, 'aspectRatio'), rimDiameterInches: numberValue(form, 'rimDiameterInches') };
      const result = calculateTireSizeTool(input);
      if (result.ok) setTireVisual(form, input, result.value.overallDiameterMm);
    };
    form.addEventListener('input', () => requestAnimationFrame(preview));
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); }); calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-comparison"]').forEach((form) => {
    const preview = (): void => {
      const original = tireValue(form, 'original-'); const proposed = tireValue(form, 'new-');
      const result = compareTireSizesTool(original, proposed);
      if (result.ok) setTireComparisonTechnicalVisual(form, original, proposed, result.value);
    };
    bindCalculator(form, () => {
      const original = tireValue(form, 'original-'); const proposed = tireValue(form, 'new-');
      const result = compareTireSizesTool(original, proposed);
      if (result.ok) { setSummary(form, tireComparisonSummary(result.value)); setTireVisual(form, original, result.value.current.overallDiameterMm, proposed, result.value.proposed.overallDiameterMm); setTireComparisonTechnicalVisual(form, original, proposed, result.value); }
      return result.ok ? { ok: true as const, metrics: tireComparisonMetrics(result.value) } : result;
    });
    form.addEventListener('input', () => requestAnimationFrame(preview));
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="wheel-offset"]').forEach((form) => {
    const preview = (): void => {
      const result = calculateWheelOffsetTool({ originalWidthInches: numberValue(form, 'originalWidthInches'), originalOffsetMm: numberValue(form, 'originalOffsetMm'), newWidthInches: numberValue(form, 'newWidthInches'), newOffsetMm: numberValue(form, 'newOffsetMm') });
      if (result.ok) { setWheelVisual(form, result.value.innerPositionChangeMm, result.value.outerPokeChangeMm); setWheelOffsetTechnicalVisual(form, numberValue(form, 'originalWidthInches'), numberValue(form, 'originalOffsetMm'), numberValue(form, 'newWidthInches'), numberValue(form, 'newOffsetMm'), result.value.innerPositionChangeMm, result.value.outerPokeChangeMm); }
    };
    bindCalculator(form, () => {
      const result = calculateWheelOffsetTool({ originalWidthInches: numberValue(form, 'originalWidthInches'), originalOffsetMm: numberValue(form, 'originalOffsetMm'), newWidthInches: numberValue(form, 'newWidthInches'), newOffsetMm: numberValue(form, 'newOffsetMm') });
      if (result.ok) { setSummary(form, wheelOffsetSummary(result.value)); setWheelVisual(form, result.value.innerPositionChangeMm, result.value.outerPokeChangeMm); setWheelOffsetTechnicalVisual(form, numberValue(form, 'originalWidthInches'), numberValue(form, 'originalOffsetMm'), numberValue(form, 'newWidthInches'), numberValue(form, 'newOffsetMm'), result.value.innerPositionChangeMm, result.value.outerPokeChangeMm); }
      return result.ok ? { ok: true as const, metrics: wheelOffsetMetrics(result.value) } : result;
    });
    form.addEventListener('input', () => requestAnimationFrame(preview));
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
