import { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool, type TireToolInput } from '../features/tools/calculator-tools';
import { speedometerMetrics, tireCalculatorMetrics, tireComparisonMetrics, toolIssueText, wheelOffsetMetrics, type PresentedMetric } from './tool-presentation';

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

export function initializeToolCalculators(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-size"]').forEach((form) => {
    const results = form.querySelector<HTMLDListElement>('[data-results]')!;
    const errors = form.querySelector<HTMLElement>('[data-errors]')!;
    const calculate = () => {
      const result = calculateTireSizeTool({ widthMm: numberValue(form, 'widthMm'), aspectRatio: numberValue(form, 'aspectRatio'), rimDiameterInches: numberValue(form, 'rimDiameterInches') });
      if (!result.ok) { results.replaceChildren(); renderIssues(errors, result.issues); return; }
      errors.hidden = true; errors.replaceChildren(); renderMetrics(results, tireCalculatorMetrics(result.value));
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); }); calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-comparison"]').forEach((form) => {
    bindCalculator(form, () => {
      const result = compareTireSizesTool(tireValue(form, 'original-'), tireValue(form, 'new-'));
      return result.ok ? { ok: true as const, metrics: tireComparisonMetrics(result.value) } : result;
    });
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="wheel-offset"]').forEach((form) => {
    bindCalculator(form, () => {
      const result = calculateWheelOffsetTool({ originalWidthInches: numberValue(form, 'originalWidthInches'), originalOffsetMm: numberValue(form, 'originalOffsetMm'), newWidthInches: numberValue(form, 'newWidthInches'), newOffsetMm: numberValue(form, 'newOffsetMm') });
      return result.ok ? { ok: true as const, metrics: wheelOffsetMetrics(result.value) } : result;
    });
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="speedometer"]').forEach((form) => {
    bindCalculator(form, () => {
      const unit = new FormData(form).get('unit') === 'mph' ? 'mph' : 'km/h';
      const result = calculateSpeedometerTool(tireValue(form, 'original-'), tireValue(form, 'new-'), numberValue(form, 'indicatedSpeed'), unit);
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
