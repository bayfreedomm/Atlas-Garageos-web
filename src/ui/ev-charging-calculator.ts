import { calculateEvChargingCostTool } from '../features/tools/ev-charging-tool';
import { formatNumber } from './format-number';

const numberValue = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));

function paintBattery(form: HTMLFormElement, startPercent: number, endPercent: number): void {
  const fillStart = form.querySelector<SVGRectElement>('[data-fill-start]');
  const fillEnd = form.querySelector<SVGRectElement>('[data-fill-end]');
  const width = 116;
  if (fillStart) fillStart.setAttribute('width', String(Math.max(0, (startPercent / 100) * width)));
  if (fillEnd) fillEnd.setAttribute('width', String(Math.max(0, (endPercent / 100) * width)));
  const label = form.querySelector<SVGTextElement>('[data-battery-label]');
  if (label) label.textContent = `${Math.round(startPercent)}% → ${Math.round(endPercent)}%`;
}

export function initializeEvChargingCalculators(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="ev-charging"]').forEach((form) => {
    const errors = form.querySelector<HTMLElement>('[data-errors]')!;
    const summary = form.querySelector<HTMLElement>('[data-result-summary]')!;
    const metrics = form.querySelector<HTMLDListElement>('[data-results]')!;

    const calculate = (): void => {
      const input = {
        batteryCapacityKwh: numberValue(form, 'batteryCapacityKwh'),
        startPercent: numberValue(form, 'startPercent'),
        endPercent: numberValue(form, 'endPercent'),
        pricePerKwh: numberValue(form, 'pricePerKwh'),
        chargerPowerKw: numberValue(form, 'chargerPowerKw'),
      };
      paintBattery(form, input.startPercent, input.endPercent);
      const result = calculateEvChargingCostTool(input);
      if (!result.ok) {
        errors.textContent = result.issues.map((issue: { message: string }) => issue.message).join(' ');
        errors.hidden = false;
        summary.classList.add('is-pending');
        metrics.replaceChildren();
        return;
      }
      errors.hidden = true;
      errors.replaceChildren();
      summary.classList.remove('is-pending');
      summary.textContent = `Charging from ${formatNumber(input.startPercent, 0)}% to ${formatNumber(input.endPercent, 0)}% costs about ${formatNumber(result.value.cost, 2)}.`;
      const rows: [string, string][] = [
        ['Energy added', `${formatNumber(result.value.energyAddedKwh, 1)} kWh`],
        ['Estimated cost', formatNumber(result.value.cost, 2)],
        ['Charging time', `${formatNumber(result.value.hours, 1)} h`],
      ];
      metrics.replaceChildren(
        ...rows.map(([label, val]) => {
          const item = document.createElement('div');
          const dt = document.createElement('dt');
          const dd = document.createElement('dd');
          dt.textContent = label;
          dd.textContent = val;
          item.append(dt, dd);
          return item;
        }),
      );
    };

    form.addEventListener('input', calculate);
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    calculate();
  });
}
