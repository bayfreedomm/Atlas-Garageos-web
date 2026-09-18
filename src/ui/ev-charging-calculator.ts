import { calculateEvChargingCostTool } from '../features/tools/ev-charging-tool';
import { formatNumber } from './format-number';
import { getPageLocale } from './page-locale';
import { validationIssueText } from './presentation-model';

const EV_CHARGING_LABELS = {
  en: {
    pendingSummary: 'Check the highlighted inputs to update the estimate.',
    endMustExceedStart: 'End charge must be higher than start charge.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Charging from ${start}% to ${end}% costs about ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `${start}% to ${end}% at ${efficiency}% entered efficiency.`,
    grid: (kwh: string): string => `${kwh} kWh drawn from the grid.`,
    metricBattery: 'Energy into battery',
    metricGrid: 'Energy from grid',
    metricCost: 'Estimated cost',
    metricTime: 'Ideal time at constant power',
  },
  de: {
    pendingSummary: 'Prüfen Sie die markierten Felder, um die Schätzung zu aktualisieren.',
    endMustExceedStart: 'Der Ladeendstand muss höher sein als der Ladestartstand.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Das Laden von ${start} % auf ${end} % kostet etwa ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `${start} % bis ${end} % bei ${efficiency} % eingegebener Effizienz.`,
    grid: (kwh: string): string => `${kwh} kWh aus dem Netz bezogen.`,
    metricBattery: 'Energie in den Akku',
    metricGrid: 'Energie aus dem Netz',
    metricCost: 'Geschätzte Kosten',
    metricTime: 'Ideale Zeit bei konstanter Leistung',
  },
  es: {
    pendingSummary: 'Revise los campos marcados para actualizar la estimación.',
    endMustExceedStart: 'La carga final debe ser mayor que la carga inicial.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Cargar del ${start}% al ${end}% cuesta unos ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `Del ${start}% al ${end}% con una eficiencia introducida del ${efficiency}%.`,
    grid: (kwh: string): string => `${kwh} kWh tomados de la red.`,
    metricBattery: 'Energía hacia la batería',
    metricGrid: 'Energía desde la red',
    metricCost: 'Coste estimado',
    metricTime: 'Tiempo ideal a potencia constante',
  },
} as const;

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
  const t = EV_CHARGING_LABELS[getPageLocale()];
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
        errors.textContent = result.issues
          .map((issue) => (issue.code === 'incompatible-values' && issue.field === 'endPercent' ? t.endMustExceedStart : validationIssueText(issue)))
          .join(' ');
        errors.hidden = false;
        summary.textContent = t.pendingSummary;
        summary.classList.add('is-pending');
        form.querySelector('[data-ev-answer]')?.classList.add('is-pending');
        form.querySelector('[data-ev-visual]')?.classList.add('is-pending');
        metrics.replaceChildren();
        return;
      }
      errors.hidden = true;
      errors.replaceChildren();
      summary.classList.remove('is-pending');
      summary.textContent = t.summary(formatNumber(input.startPercent, 0), formatNumber(input.endPercent, 0), currency, formatNumber(result.value.cost, 2));
      const text = (selector: string, value: string): void => { const node = form.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
      const loss = result.value.gridEnergyKwh - result.value.batteryEnergyKwh;
      text('[data-ev-cost]', `${currency} ${formatNumber(result.value.cost, 2)}`);
      text('[data-ev-context]', t.context(formatNumber(input.startPercent, 0), formatNumber(input.endPercent, 0), formatNumber(input.chargingEfficiency, 0)));
      text('[data-ev-time]', `${formatNumber(result.value.hours, 1)} h`);
      text('[data-ev-grid]', t.grid(formatNumber(result.value.gridEnergyKwh, 1)));
      text('[data-ev-battery-energy]', `${formatNumber(result.value.batteryEnergyKwh, 1)} kWh`);
      text('[data-ev-grid-energy]', `${formatNumber(result.value.gridEnergyKwh, 1)} kWh`);
      text('[data-ev-loss]', `${formatNumber(loss, 1)} kWh`);
      form.querySelector('[data-ev-answer]')?.classList.remove('is-pending');
      form.querySelector('[data-ev-visual]')?.classList.remove('is-pending');
      const rows: [string, string][] = [
        [t.metricBattery, `${formatNumber(result.value.batteryEnergyKwh, 1)} kWh`],
        [t.metricGrid, `${formatNumber(result.value.gridEnergyKwh, 1)} kWh`],
        [t.metricCost, `${currency} ${formatNumber(result.value.cost, 2)}`],
        [t.metricTime, `${formatNumber(result.value.hours, 1)} h`],
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
