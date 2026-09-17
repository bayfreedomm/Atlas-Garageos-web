import { calculateTireSizeTool, type TireToolInput } from '../features/tools/calculator-tools';
import { formatNumber } from './format-number';
import { toolIssueText } from './tool-presentation';

const inputNumber = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));
const setText = (root: ParentNode, selector: string, value: string): void => {
  const node = root.querySelector<HTMLElement>(selector);
  if (node) node.textContent = value;
};

function readInput(form: HTMLFormElement): TireToolInput {
  return { widthMm: inputNumber(form, 'widthMm'), aspectRatio: inputNumber(form, 'aspectRatio'), rimDiameterInches: inputNumber(form, 'rimDiameterInches') };
}

function updateDiagram(form: HTMLFormElement, input: TireToolInput, overallDiameterMm: number, sidewallHeightMm: number): void {
  const visual = form.querySelector<HTMLElement>('[data-tire-diagram]');
  if (!visual) return;
  const diameterScale = Math.min(1.08, Math.max(.76, overallDiameterMm / 645.2));
  const rimScale = Math.min(1.2, Math.max(.72, input.rimDiameterInches / 18));
  visual.querySelector<SVGGElement>('[data-tire-wheel]')?.setAttribute('transform', `translate(192 128) scale(${diameterScale.toFixed(3)})`);
  visual.querySelector<SVGCircleElement>('[data-tire-rim]')?.setAttribute('r', (52 * rimScale / diameterScale).toFixed(1));
  const tireRadius = 89 * diameterScale;
  const rimRadius = 52 * rimScale;
  visual.querySelector<SVGPathElement>('[data-diameter-line]')?.setAttribute('d', `M54 ${(128 - tireRadius).toFixed(1)}v${(tireRadius * 2).toFixed(1)}`);
  visual.querySelector<SVGPathElement>('[data-width-line]')?.setAttribute('d', `M${(192 - tireRadius * .9).toFixed(1)} 24h${(tireRadius * 1.8).toFixed(1)}`);
  visual.querySelector<SVGPathElement>('[data-sidewall-line]')?.setAttribute('d', `M192 ${(128 - tireRadius).toFixed(1)}v${Math.max(12, tireRadius - rimRadius).toFixed(1)}`);
  visual.querySelector<SVGPathElement>('[data-rim-line]')?.setAttribute('d', `M192 ${(128 - rimRadius).toFixed(1)}v${(rimRadius * 2).toFixed(1)}`);
  setText(visual, '[data-diameter-text]', `${overallDiameterMm.toFixed(1)} mm diameter`);
  setText(visual, '[data-width-text]', `${input.widthMm} mm width`);
  setText(visual, '[data-sidewall-text]', `${sidewallHeightMm.toFixed(1)} mm`);
  setText(visual, '[data-rim-text]', `${input.rimDiameterInches} in rim`);
}

function render(form: HTMLFormElement): void {
  const input = readInput(form);
  const result = calculateTireSizeTool(input);
  const errors = form.querySelector<HTMLElement>('[data-errors]');
  if (!result.ok) {
    if (errors) {
      errors.replaceChildren(...result.issues.map((issue) => {
        const line = document.createElement('p');
        line.textContent = toolIssueText(issue);
        return line;
      }));
      errors.hidden = false;
    }
    return;
  }

  if (errors) { errors.hidden = true; errors.replaceChildren(); }
  const code = `${input.widthMm} / ${input.aspectRatio} R${input.rimDiameterInches}`;
  setText(form, '[data-compact-code]', code);
  setText(form, '[data-size-code]', code);
  setText(form, '[data-overall-diameter]', `${result.value.overallDiameterMm.toFixed(1)} mm`);
  setText(form, '[data-sidewall]', `${result.value.sidewallHeightMm.toFixed(1)} mm`);
  setText(form, '[data-circumference]', `${formatNumber(result.value.circumferenceMm)} mm`);
  setText(form, '[data-revs-km]', formatNumber(result.value.revolutionsPerKilometer));
  const meaning = document.querySelector<HTMLElement>('[data-meaning]');
  if (meaning) meaning.textContent = `A ${input.widthMm}/${input.aspectRatio} R${input.rimDiameterInches} tire is ${result.value.overallDiameterMm.toFixed(1)} mm tall overall. Its ${result.value.sidewallHeightMm.toFixed(1)} mm sidewall sits between the road and the ${input.rimDiameterInches}-inch rim.`;
  updateDiagram(form, input, result.value.overallDiameterMm, result.value.sidewallHeightMm);
}

export function initializeTireSizeCalculator(): void {
  document.querySelectorAll<HTMLFormElement>('[data-tire-calculator]').forEach((form) => {
    form.addEventListener('submit', (event) => { event.preventDefault(); render(form); });
    form.addEventListener('input', () => requestAnimationFrame(() => {
      const code = `${inputNumber(form, 'widthMm') || '—'} / ${inputNumber(form, 'aspectRatio') || '—'} R${inputNumber(form, 'rimDiameterInches') || '—'}`;
      setText(form, '[data-compact-code]', code);
    }));
    render(form);
  });
}
