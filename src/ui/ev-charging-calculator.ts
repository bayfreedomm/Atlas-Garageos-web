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
  fr: {
    pendingSummary: 'Vérifiez les champs signalés pour mettre à jour l’estimation.',
    endMustExceedStart: 'La charge finale doit être supérieure à la charge de départ.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Recharger de ${start} % à ${end} % coûte environ ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `De ${start} % à ${end} % avec un rendement saisi de ${efficiency} %.`,
    grid: (kwh: string): string => `${kwh} kWh prélevés sur le réseau.`,
    metricBattery: 'Énergie stockée dans la batterie',
    metricGrid: 'Énergie prélevée sur le réseau',
    metricCost: 'Coût estimé',
    metricTime: 'Durée idéale à puissance constante',
  },
  it: {
    pendingSummary: 'Controlla i campi evidenziati per aggiornare la stima.',
    endMustExceedStart: 'La carica finale deve essere superiore a quella iniziale.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Ricaricare dal ${start}% al ${end}% costa circa ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `Dal ${start}% al ${end}% con un’efficienza inserita del ${efficiency}%.`,
    grid: (kwh: string): string => `${kwh} kWh prelevati dalla rete.`,
    metricBattery: 'Energia immessa nella batteria',
    metricGrid: 'Energia prelevata dalla rete',
    metricCost: 'Costo stimato',
    metricTime: 'Tempo ideale a potenza costante',
  },
  'pt-br': {
    pendingSummary: 'Confira os campos destacados para atualizar a estimativa.',
    endMustExceedStart: 'A carga final deve ser maior que a carga inicial.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Carregar de ${start}% a ${end}% custa cerca de ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `De ${start}% a ${end}% com eficiência informada de ${efficiency}%.`,
    grid: (kwh: string): string => `${kwh} kWh retirados da rede.`,
    metricBattery: 'Energia na bateria',
    metricGrid: 'Energia da rede',
    metricCost: 'Custo estimado',
    metricTime: 'Tempo ideal com potência constante',
  },
  pl: {
    pendingSummary: 'Sprawdź zaznaczone pola, aby zaktualizować szacunek.',
    endMustExceedStart: 'Poziom końcowy musi być wyższy niż początkowy.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Ładowanie od ${start}% do ${end}% kosztuje około ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `Od ${start}% do ${end}% przy wpisanej sprawności ${efficiency}%.`,
    grid: (kwh: string): string => `${kwh} kWh pobranych z sieci.`,
    metricBattery: 'Energia do akumulatora',
    metricGrid: 'Energia z sieci',
    metricCost: 'Szacowany koszt',
    metricTime: 'Idealny czas przy stałej mocy',
  },
  nl: {
    pendingSummary: 'Controleer de gemarkeerde velden om de schatting bij te werken.',
    endMustExceedStart: 'Het eindniveau moet hoger zijn dan het startniveau.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `Laden van ${start}% tot ${end}% kost ongeveer ${currency} ${cost}.`,
    context: (start: string, end: string, efficiency: string): string =>
      `Van ${start}% tot ${end}% bij een ingevuld rendement van ${efficiency}%.`,
    grid: (kwh: string): string => `${kwh} kWh van het net afgenomen.`,
    metricBattery: 'Energie in de accu',
    metricGrid: 'Energie van het net',
    metricCost: 'Geschatte kosten',
    metricTime: 'Ideale tijd bij constant vermogen',
  },
  tr: {
    pendingSummary: 'Tahmini güncellemek için işaretli alanları kontrol edin.',
    endMustExceedStart: 'Bitiş şarj seviyesi başlangıç seviyesinden yüksek olmalıdır.',
    summary: (start: string, end: string, currency: string, cost: string): string =>
      `%${start} seviyesinden %${end} seviyesine şarj etmek yaklaşık ${currency} ${cost} tutar.`,
    context: (start: string, end: string, efficiency: string): string =>
      `Girilen %${efficiency} verimle %${start} → %${end}.`,
    grid: (kwh: string): string => `Şebekeden ${kwh} kWh çekilir.`,
    metricBattery: 'Bataryaya giren enerji',
    metricGrid: 'Şebekeden çekilen enerji',
    metricCost: 'Tahmini maliyet',
    metricTime: 'Sabit güçte ideal süre',
  },
} as const;

const numberValue = (form: HTMLFormElement, name: string): number => {
  const raw = String(new FormData(form).get(name) ?? '').trim();
  return raw === '' ? Number.NaN : Number(raw);
};

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
