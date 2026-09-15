import { calculateEvChargingCostTool } from '../features/tools/ev-charging-tool';
import { formatNumber } from './format-number';

const numberValue = (form: HTMLFormElement, name: string): number => {
  const raw = String(new FormData(form).get(name) ?? '').trim();
  return raw === '' ? Number.NaN : Number(raw);
};

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
        chargingEfficiency: numberValue(form, 'chargingEfficiency'),
      };
      const currency = String(new FormData(form).get('currency') ?? 'USD');
      paintBattery(form, input.startPercent, input.endPercent);
      const result = calculateEvChargingCostTool(input);
      if (!result.ok) {
        errors.textContent = result.issues.map((issue: { message: string }) => issue.message).join(' ');
        errors.hidden = false;
        summary.textContent = 'Check the highlighted inputs to update the estimate.';
        summary.classList.add('is-pending');
        form.querySelector('[data-ev-answer]')?.classList.add('is-pending');
        form.querySelector('[data-ev-visual]')?.classList.add('is-pending');
        metrics.replaceChildren();
        return;
      }
      errors.hidden = true;
      errors.replaceChildren();
      summary.classList.remove('is-pending');
      summary.textContent = `Charging from ${formatNumber(input.startPercent, 0)}% to ${formatNumber(input.endPercent, 0)}% costs about ${currency} ${formatNumber(result.value.cost, 2)}.`;
      const text = (selector: string, value: string): void => { const node = form.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
      const loss = result.value.gridEnergyKwh - result.value.batteryEnergyKwh;
      text('[data-ev-cost]', `${currency} ${formatNumber(result.value.cost, 2)}`);
      text('[data-ev-context]', `${formatNumber(input.startPercent, 0)}% to ${formatNumber(input.endPercent, 0)}% at ${formatNumber(input.chargingEfficiency, 0)}% entered efficiency.`);
      text('[data-ev-time]', `${formatNumber(result.value.hours, 1)} h`);
      text('[data-ev-grid]', `${formatNumber(result.value.gridEnergyKwh, 1)} kWh drawn from the grid.`);
      text('[data-ev-battery-energy]', `${formatNumber(result.value.batteryEnergyKwh, 1)} kWh`);
      text('[data-ev-grid-energy]', `${formatNumber(result.value.gridEnergyKwh, 1)} kWh`);
      text('[data-ev-loss]', `${formatNumber(loss, 1)} kWh`);
      form.querySelector('[data-ev-answer]')?.classList.remove('is-pending');
      form.querySelector('[data-ev-visual]')?.classList.remove('is-pending');
      const rows: [string, string][] = [
        ['Energy into battery', `${formatNumber(result.value.batteryEnergyKwh, 1)} kWh`],
        ['Energy from grid', `${formatNumber(result.value.gridEnergyKwh, 1)} kWh`],
        ['Estimated cost', `${currency} ${formatNumber(result.value.cost, 2)}`],
        ['Ideal time at constant power', `${formatNumber(result.value.hours, 1)} h`],
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
    form.addEventListener('change', calculate);
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    calculate();
  });
}
