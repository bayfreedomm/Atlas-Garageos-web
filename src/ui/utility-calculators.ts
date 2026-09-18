import type { FuelEconomyUnit, PowerUnit, PressureUnit, TorqueUnit, UnitSystem, WeightUnit } from '../domain/utility-calculators';
import { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertFuelInputSystemTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { toolIssueText, type PresentedMetric } from './tool-presentation';
import { fuelCostPresentation, fuelEconomyPresentation, powerPresentation, powerToWeightPresentation, pressurePresentation, roadTripPresentation, torquePresentation } from './utility-presentation';
import { formatNumber } from './format-number';
import { CURRENCY_STORAGE_KEY, parseCurrencyLabel, parseUnitSystem, UNIT_SYSTEM_STORAGE_KEY } from './utility-preference';
import { getPageLocale, type UiLocale } from './page-locale';

const value = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));
const textValue = (form: HTMLFormElement, name: string): string => String(new FormData(form).get(name) ?? '');

const UTILITY_TEXT = {
  en: {
    checkHighlighted: 'Check the highlighted inputs to update the estimate.',
    checkInputsTrip: 'Check the highlighted inputs to calculate this trip.',
    costPerDistanceAppears: 'Cost per distance appears here.',
    checkInputsTripReset: 'Check the inputs to calculate this trip.',
    fuelCostAppears: 'Fuel cost appears here.',
    distanceAppears: 'Distance appears here.',
    destination: 'DESTINATION',
    returnToStart: 'RETURN TO START',
    roundTrip: 'Round trip',
    oneWay: 'One way',
    sharedByPeople: (people: number) => `Shared by ${people} people`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Fuel ${fuel} and extras ${extras} of ${total}`,
    checkInputConversion: 'Check the input to update the conversion.',
    drivingCopy: (distance: string) => `${distance} of driving at the entered fuel economy and price.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} required`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} fuel + ${extras} extras across ${distance}.`,
    forFuel: (fuel: string) => `${fuel} for fuel`,
    otherGallonStandard: 'Other gallon standard',
    gallonsNotInterchangeable: 'US and Imperial gallons are not interchangeable.',
    enteredEconomy: 'Entered economy',
    convertedEconomy: 'Converted economy',
    kilopascals: 'Kilopascals',
    conversionOnlyPressure: 'Conversion only—use the vehicle specification.',
    enteredPressure: 'Entered pressure',
    convertedPressure: 'Converted pressure',
    underlyingPower: 'Underlying power',
    mechanicalNotMetric: 'Uses mechanical horsepower, not metric PS.',
    enteredPower: 'Entered power',
    convertedPower: 'Converted power',
    relationship: 'Relationship',
    sameTorque: 'Same torque',
    unitExpressionOnly: 'Only the unit expression changes.',
    enteredTorque: 'Entered torque',
    convertedTorque: 'Converted torque',
    metricEquivalent: 'Metric equivalent',
    ratioOnlyNote: 'Ratio only; traction, gearing, and drag are separate.',
    enteredVehicle: 'Entered vehicle',
    normalizedRatio: 'Normalized ratio',
  },
  de: {
    checkHighlighted: 'Überprüfen Sie die markierten Eingaben, um die Schätzung zu aktualisieren.',
    checkInputsTrip: 'Überprüfen Sie die markierten Eingaben, um diese Fahrt zu berechnen.',
    costPerDistanceAppears: 'Die Kosten pro Strecke erscheinen hier.',
    checkInputsTripReset: 'Überprüfen Sie die Eingaben, um diese Fahrt zu berechnen.',
    fuelCostAppears: 'Die Kraftstoffkosten erscheinen hier.',
    distanceAppears: 'Die Distanz erscheint hier.',
    destination: 'ZIEL',
    returnToStart: 'RÜCKKEHR ZUM START',
    roundTrip: 'Hin- und Rückfahrt',
    oneWay: 'Einfache Fahrt',
    sharedByPeople: (people: number) => `Geteilt durch ${people} Personen`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Kraftstoff ${fuel} und Extras ${extras} von ${total}`,
    checkInputConversion: 'Überprüfen Sie die Eingabe, um die Umrechnung zu aktualisieren.',
    drivingCopy: (distance: string) => `${distance} Fahrt beim eingegebenen Kraftstoffverbrauch und Preis.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} benötigt`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} Kraftstoff + ${extras} Extras über ${distance}.`,
    forFuel: (fuel: string) => `${fuel} für Kraftstoff`,
    otherGallonStandard: 'Anderer Gallonenstandard',
    gallonsNotInterchangeable: 'US- und Imperial-Gallonen sind nicht austauschbar.',
    enteredEconomy: 'Eingegebener Verbrauch',
    convertedEconomy: 'Umgerechneter Verbrauch',
    kilopascals: 'Kilopascal',
    conversionOnlyPressure: 'Nur Umrechnung—verwenden Sie die Fahrzeugangabe.',
    enteredPressure: 'Eingegebener Druck',
    convertedPressure: 'Umgerechneter Druck',
    underlyingPower: 'Zugrunde liegende Leistung',
    mechanicalNotMetric: 'Verwendet mechanische Pferdestärke, nicht metrische PS.',
    enteredPower: 'Eingegebene Leistung',
    convertedPower: 'Umgerechnete Leistung',
    relationship: 'Verhältnis',
    sameTorque: 'Gleiches Drehmoment',
    unitExpressionOnly: 'Nur die Einheit ändert sich.',
    enteredTorque: 'Eingegebenes Drehmoment',
    convertedTorque: 'Umgerechnetes Drehmoment',
    metricEquivalent: 'Metrische Entsprechung',
    ratioOnlyNote: 'Nur ein Verhältnis; Traktion, Übersetzung und Luftwiderstand sind separat zu betrachten.',
    enteredVehicle: 'Eingegebenes Fahrzeug',
    normalizedRatio: 'Normiertes Verhältnis',
  },
  es: {
    checkHighlighted: 'Revise los campos resaltados para actualizar la estimación.',
    checkInputsTrip: 'Revise los campos resaltados para calcular este viaje.',
    costPerDistanceAppears: 'El coste por distancia aparecerá aquí.',
    checkInputsTripReset: 'Revise los datos para calcular este viaje.',
    fuelCostAppears: 'El coste de combustible aparecerá aquí.',
    distanceAppears: 'La distancia aparecerá aquí.',
    destination: 'DESTINO',
    returnToStart: 'REGRESO AL INICIO',
    roundTrip: 'Ida y vuelta',
    oneWay: 'Solo ida',
    sharedByPeople: (people: number) => `Repartido entre ${people} personas`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Combustible ${fuel} y extras ${extras} de ${total}`,
    checkInputConversion: 'Revise el dato para actualizar la conversión.',
    drivingCopy: (distance: string) => `${distance} de conducción con el consumo y precio introducidos.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} necesarios`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} de combustible + ${extras} de extras en ${distance}.`,
    forFuel: (fuel: string) => `${fuel} en combustible`,
    otherGallonStandard: 'Otro estándar de galón',
    gallonsNotInterchangeable: 'Los galones estadounidense e imperial no son intercambiables.',
    enteredEconomy: 'Consumo introducido',
    convertedEconomy: 'Consumo convertido',
    kilopascals: 'Kilopascales',
    conversionOnlyPressure: 'Solo conversión: use la especificación del vehículo.',
    enteredPressure: 'Presión introducida',
    convertedPressure: 'Presión convertida',
    underlyingPower: 'Potencia subyacente',
    mechanicalNotMetric: 'Usa caballos de fuerza mecánicos, no CV métricos.',
    enteredPower: 'Potencia introducida',
    convertedPower: 'Potencia convertida',
    relationship: 'Relación',
    sameTorque: 'Mismo par motor',
    unitExpressionOnly: 'Solo cambia la expresión de la unidad.',
    enteredTorque: 'Par introducido',
    convertedTorque: 'Par convertido',
    metricEquivalent: 'Equivalente métrico',
    ratioOnlyNote: 'Solo es un ratio; la tracción, la relación de transmisión y la resistencia aerodinámica son aparte.',
    enteredVehicle: 'Vehículo introducido',
    normalizedRatio: 'Ratio normalizado',
  },
} as const satisfies Record<UiLocale, {
  checkHighlighted: string; checkInputsTrip: string; costPerDistanceAppears: string; checkInputsTripReset: string;
  fuelCostAppears: string; distanceAppears: string; destination: string; returnToStart: string; roundTrip: string; oneWay: string;
  sharedByPeople: (people: number) => string; fuelAndExtrasOf: (fuel: string, extras: string, total: string) => string;
  checkInputConversion: string; drivingCopy: (distance: string) => string;
  requiredSuffix: (distance: string, fuel: string) => string; fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => string; forFuel: (fuel: string) => string;
  otherGallonStandard: string; gallonsNotInterchangeable: string; enteredEconomy: string; convertedEconomy: string;
  kilopascals: string; conversionOnlyPressure: string; enteredPressure: string; convertedPressure: string;
  underlyingPower: string; mechanicalNotMetric: string; enteredPower: string; convertedPower: string;
  relationship: string; sameTorque: string; unitExpressionOnly: string; enteredTorque: string; convertedTorque: string;
  metricEquivalent: string; ratioOnlyNote: string; enteredVehicle: string; normalizedRatio: string;
}>;

function render(form: HTMLFormElement, result: { readonly ok: true; readonly summary: string; readonly metrics: readonly PresentedMetric[] } | { readonly ok: false; readonly issues: readonly Parameters<typeof toolIssueText>[0][] }): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const errors = form.querySelector<HTMLElement>('[data-errors]')!;
  const summary = form.querySelector<HTMLElement>('[data-result-summary]')!;
  const metrics = form.querySelector<HTMLDListElement>('[data-results]')!;
  if (!result.ok) {
    const list = document.createElement('ul');
    result.issues.forEach((issue) => { const item = document.createElement('li'); item.textContent = toolIssueText(issue); list.append(item); });
    errors.replaceChildren(list); errors.hidden = false; summary.textContent = t.checkHighlighted; summary.classList.add('is-pending'); metrics.replaceChildren(); return;
  }
  errors.hidden = true; errors.replaceChildren(); summary.textContent = result.summary; summary.classList.remove('is-pending');
  summary.classList.remove('is-refreshing'); requestAnimationFrame(() => summary.classList.add('is-refreshing'));
  metrics.replaceChildren(...result.metrics.map((metric) => { const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd'); term.textContent = metric.label; detail.textContent = metric.value; row.append(term, detail); return row; }));
}


function syncFuelPrimary(form: HTMLFormElement, result: { readonly system: UnitSystem; readonly distance: number; readonly fuelRequired: number; readonly fuelCost: number; readonly costPerDistance: number }, currency: string): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const panel = form.querySelector<HTMLElement>('[data-fuel-primary-result]');
  if (!panel) return;
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distanceUnit = result.system === 'metric' ? 'km' : 'mi';
  const cost = `${currency} ${formatNumber(result.fuelCost, 2)}`;
  const fuel = `${formatNumber(result.fuelRequired)} ${fuelUnit}`;
  const rate = `${currency} ${formatNumber(result.costPerDistance, 2)} / ${distanceUnit}`;
  const costNode = panel.querySelector<HTMLElement>('[data-fuel-primary-cost]');
  const fuelNode = panel.querySelector<HTMLElement>('[data-fuel-primary-fuel]');
  const copyNode = panel.querySelector<HTMLElement>('[data-fuel-primary-copy]');
  const rateNode = panel.querySelector<HTMLElement>('[data-fuel-primary-rate]');
  if (costNode) costNode.textContent = cost;
  if (fuelNode) fuelNode.textContent = fuel;
  if (copyNode) copyNode.textContent = t.drivingCopy(`${formatNumber(result.distance)} ${distanceUnit}`);
  if (rateNode) rateNode.textContent = rate;
  panel.classList.remove('is-pending');

  const visual = form.querySelector<HTMLElement>('[data-fuel-technical-visual]');
  if (!visual) return;
  const distanceNode = visual.querySelector<SVGTextElement>('[data-fuel-visual-distance]');
  const visualFuelNode = visual.querySelector<SVGTextElement>('[data-fuel-visual-fuel]');
  const visualCostNode = visual.querySelector<SVGTextElement>('[data-fuel-visual-cost]');
  const captionNode = visual.querySelector<HTMLElement>('[data-fuel-visual-caption]');
  const visualRateNode = visual.querySelector<HTMLElement>('[data-fuel-visual-rate]');
  if (distanceNode) distanceNode.textContent = `${formatNumber(result.distance)} ${distanceUnit}`;
  if (visualFuelNode) visualFuelNode.textContent = fuel;
  if (visualCostNode) visualCostNode.textContent = cost;
  if (captionNode) captionNode.textContent = t.requiredSuffix(`${formatNumber(result.distance)} ${distanceUnit}`, fuel);
  if (visualRateNode) visualRateNode.textContent = rate;
  const car = visual.querySelector<SVGGElement>('[data-fuel-car]');
  const travel = Math.min(1, Math.log10(Math.max(1, result.distance) + 1) / 4);
  if (car) car.setAttribute('transform', `translate(${(-10 + travel * 42).toFixed(1)} 0)`);
  const fill = visual.querySelector<SVGPathElement>('[data-fuel-fill]');
  if (fill) {
    const normalized = Math.min(1, result.fuelRequired / 100);
    const height = 43 * normalized;
    fill.setAttribute('d', `M513 ${134 - height}h43v${height}h-43z`);
  }
}


function resetFuelPrimary(form: HTMLFormElement): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const panel = form.querySelector<HTMLElement>('[data-fuel-primary-result]');
  if (panel) {
    panel.classList.add('is-pending');
    const cost = panel.querySelector<HTMLElement>('[data-fuel-primary-cost]');
    const fuel = panel.querySelector<HTMLElement>('[data-fuel-primary-fuel]');
    const copy = panel.querySelector<HTMLElement>('[data-fuel-primary-copy]');
    const rate = panel.querySelector<HTMLElement>('[data-fuel-primary-rate]');
    if (cost) cost.textContent = '—';
    if (fuel) fuel.textContent = '—';
    if (copy) copy.textContent = t.checkInputsTrip;
    if (rate) rate.textContent = t.costPerDistanceAppears;
  }
}

type RoadTripResult = Extract<ReturnType<typeof calculateRoadTripCostTool>, { readonly ok: true }>['value'];

function syncRoadTripPrimary(form: HTMLFormElement, result: RoadTripResult, currency: string): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const panel = form.querySelector<HTMLElement>('[data-trip-primary]');
  const visual = form.querySelector<HTMLElement>('[data-trip-visual]');
  if (!panel || !visual) return;
  const money = (amount: number): string => `${currency} ${formatNumber(amount, 2)}`;
  const unit = result.system === 'metric' ? 'km' : 'mi';
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distance = `${formatNumber(result.distance)} ${unit}`;
  const fuel = `${formatNumber(result.fuelRequired)} ${fuelUnit}`;
  const direction = result.roundTrip ? t.roundTrip : t.oneWay;
  const set = (selector: string, content: string): void => {
    const node = form.querySelector<HTMLElement>(selector);
    if (node) node.textContent = content;
  };
  set('[data-trip-total]', money(result.totalTripCost));
  set('[data-trip-context]', t.fuelPlusExtrasAcross(money(result.fuelCost), money(result.extraCost), distance));
  set('[data-trip-fuel]', fuel);
  set('[data-trip-fuel-cost]', t.forFuel(money(result.fuelCost)));
  set('[data-trip-direction]', direction);
  set('[data-trip-distance]', distance);
  set('[data-trip-person]', money(result.costPerPerson));
  set('[data-trip-people]', t.sharedByPeople(result.people));
  const person = form.querySelector<HTMLElement>('[data-trip-person-wrap]');
  if (person) person.hidden = result.people <= 1;
  set('[data-trip-visual-distance]', distance);
  set('[data-trip-visual-fuel]', fuel);
  set('[data-trip-visual-total]', money(result.totalTripCost));
  set('[data-trip-visual-fuel-cost]', money(result.fuelCost));
  set('[data-trip-visual-extras]', money(result.extraCost));
  set('[data-trip-end]', result.roundTrip ? t.returnToStart : t.destination);
  const returnLeg = visual.querySelector<HTMLElement>('[data-trip-return]');
  if (returnLeg) returnLeg.hidden = !result.roundTrip;
  const fuelBar = visual.querySelector<HTMLElement>('[data-trip-fuel-bar]');
  const extraBar = visual.querySelector<HTMLElement>('[data-trip-extra-bar]');
  if (fuelBar) fuelBar.style.width = `${result.fuelCost / result.totalTripCost * 100}%`;
  if (extraBar) extraBar.style.width = `${result.extraCost / result.totalTripCost * 100}%`;
  const track = visual.querySelector<HTMLElement>('[data-trip-cost-track]');
  if (track) track.setAttribute('aria-label', t.fuelAndExtrasOf(money(result.fuelCost), money(result.extraCost), money(result.totalTripCost)));
  panel.classList.remove('is-pending');
  visual.classList.remove('is-pending');
}

function resetRoadTripPrimary(form: HTMLFormElement): void {
  const t = UTILITY_TEXT[getPageLocale()];
  form.querySelector('[data-trip-primary]')?.classList.add('is-pending');
  form.querySelector('[data-trip-visual]')?.classList.add('is-pending');
  for (const selector of ['[data-trip-total]', '[data-trip-fuel]', '[data-trip-direction]', '[data-trip-person]', '[data-trip-visual-distance]', '[data-trip-visual-fuel]', '[data-trip-visual-total]', '[data-trip-visual-fuel-cost]', '[data-trip-visual-extras]']) {
    const node = form.querySelector<HTMLElement>(selector);
    if (node) node.textContent = '—';
  }
  const context = form.querySelector<HTMLElement>('[data-trip-context]');
  if (context) context.textContent = t.checkInputsTripReset;
  for (const [selector, content] of [['[data-trip-fuel-cost]', t.fuelCostAppears], ['[data-trip-distance]', t.distanceAppears], ['[data-trip-end]', t.destination]] as const) {
    const node = form.querySelector<HTMLElement>(selector);
    if (node) node.textContent = content;
  }
  const returnLeg = form.querySelector<HTMLElement>('[data-trip-return]');
  if (returnLeg) returnLeg.hidden = true;
  const person = form.querySelector<HTMLElement>('[data-trip-person-wrap]');
  if (person) person.hidden = true;
  for (const selector of ['[data-trip-fuel-bar]', '[data-trip-extra-bar]']) {
    const bar = form.querySelector<HTMLElement>(selector);
    if (bar) bar.style.width = '0%';
  }
}

interface StandardAnswerContent { primary: string; secondaryLabel: string; secondary: string; secondaryNote: string; leftLabel: string; left: string; rightLabel: string; right: string; }

function syncStandardAnswer(form: HTMLFormElement, content: StandardAnswerContent): void {
  const answer = form.querySelector<HTMLElement>('[data-standard-answer]');
  const visual = form.querySelector<HTMLElement>('[data-standard-visual]');
  if (!answer || !visual) return;
  const values: readonly [string, string][] = [
    ['[data-standard-primary]', content.primary], ['[data-standard-secondary-label]', content.secondaryLabel],
    ['[data-standard-secondary]', content.secondary], ['[data-standard-secondary-note]', content.secondaryNote],
    ['[data-standard-visual-left-label]', content.leftLabel], ['[data-standard-visual-left]', content.left],
    ['[data-standard-visual-right-label]', content.rightLabel], ['[data-standard-visual-right]', content.right],
  ];
  values.forEach(([selector, value]) => { const node = form.querySelector<HTMLElement>(selector); if (node) node.textContent = value; });
  const summary = form.querySelector<HTMLElement>('[data-result-summary]');
  const context = form.querySelector<HTMLElement>('[data-standard-context]');
  if (summary && context) context.textContent = summary.textContent;
  answer.classList.remove('is-pending'); visual.classList.remove('is-pending');
}

function resetStandardAnswer(form: HTMLFormElement): void {
  const t = UTILITY_TEXT[getPageLocale()];
  form.querySelector('[data-standard-answer]')?.classList.add('is-pending');
  form.querySelector('[data-standard-visual]')?.classList.add('is-pending');
  form.querySelectorAll<HTMLElement>('[data-standard-primary], [data-standard-secondary], [data-standard-visual-left], [data-standard-visual-right]').forEach((node) => { node.textContent = '—'; });
  const context = form.querySelector<HTMLElement>('[data-standard-context]');
  if (context) context.textContent = t.checkInputConversion;
}

function bindInstant(form: HTMLFormElement, calculate: () => void): void { form.addEventListener('input', calculate); form.addEventListener('change', calculate); calculate(); }

function fuelInput(form: HTMLFormElement) { return { system: (textValue(form, 'system') === 'imperial' ? 'imperial' : 'metric') as UnitSystem, distance: value(form, 'distance'), economy: value(form, 'economy'), price: value(form, 'price') }; }

const FUEL_LABEL_TEXT: Readonly<Record<string, { distance: string; oneWay: string; economy: string; price: string; gallon: string; litre: string }>> = {
  en: { distance: 'Distance', oneWay: 'One-way distance', economy: 'Fuel economy', price: 'Fuel price', gallon: 'US gallon', litre: 'litre' },
  de: { distance: 'Distanz', oneWay: 'Distanz (einfach)', economy: 'Kraftstoffverbrauch', price: 'Kraftstoffpreis', gallon: 'US-Gallone', litre: 'Liter' },
  es: { distance: 'Distancia', oneWay: 'Distancia de ida', economy: 'Consumo', price: 'Precio del combustible', gallon: 'galón estadounidense', litre: 'litro' },
};

function syncFuelLabels(form: HTMLFormElement): void {
  const us = textValue(form, 'system') === 'imperial';
  const trip = form.dataset.utilityCalculator === 'road-trip';
  const distance = form.querySelector<HTMLElement>('[data-distance-label]');
  const economy = form.querySelector<HTMLElement>('[data-economy-label]');
  const price = form.querySelector<HTMLElement>('[data-price-label]');
  const lang = document.documentElement.lang || 'en';
  const t = FUEL_LABEL_TEXT[lang] ?? FUEL_LABEL_TEXT.en!;
  if (distance) distance.textContent = `${trip ? t.oneWay : t.distance} · ${us ? 'miles' : 'km'}`;
  if (economy) economy.textContent = `${t.economy} · ${us ? 'US MPG' : 'L/100km'}`;
  if (price) price.textContent = `${t.price} · ${lang === 'en' ? 'per' : lang === 'de' ? 'pro' : 'por'} ${us ? t.gallon : t.litre}`;
}

function initializeFuelPreferences(form: HTMLFormElement): void {
  const system = form.querySelector<HTMLSelectElement>('[name="system"]');
  const currency = form.querySelector<HTMLSelectElement>('[name="currency"]');
  const setConvertedValues = (from: UnitSystem, target: UnitSystem): void => {
    const result = convertFuelInputSystemTool({ ...fuelInput(form), system: from }, target);
    if (!result.ok) return;
    for (const [name, next] of [['distance', result.value.distance], ['economy', result.value.economy], ['price', result.value.price]] as const) {
      const field = form.elements.namedItem(name) as HTMLInputElement | null;
      if (field) field.value = String(Number(next.toFixed(name === 'distance' ? 1 : 2)));
    }
  };
  const initialSystem = parseUnitSystem(system?.value);
  try {
    if (system) {
      const savedSystem = parseUnitSystem(localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY));
      if (savedSystem !== initialSystem) setConvertedValues(initialSystem, savedSystem);
      system.value = savedSystem;
      system.dataset.previousSystem = savedSystem;
    }
    if (currency) currency.value = parseCurrencyLabel(localStorage.getItem(CURRENCY_STORAGE_KEY));
  } catch { /* Storage can be unavailable; form defaults remain valid. */ }
  system?.addEventListener('change', () => {
    const target = parseUnitSystem(system.value);
    const previous = parseUnitSystem(system.dataset.previousSystem);
    if (previous !== target) setConvertedValues(previous, target);
    system.dataset.previousSystem = target;
    try { localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, target); } catch { /* no-op */ }
  });
  currency?.addEventListener('change', () => { try { localStorage.setItem(CURRENCY_STORAGE_KEY, parseCurrencyLabel(currency.value)); } catch { /* no-op */ } });
}

export function initializeUtilityCalculators(): void {
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="fuel-cost"]').forEach((form) => {
    initializeFuelPreferences(form);
    const calculate = (): void => {
      syncFuelLabels(form);
      const result = calculateFuelCostTool(fuelInput(form));
      const currency = textValue(form, 'currency') || 'USD';
      render(form, result.ok ? { ok: true, ...fuelCostPresentation(result.value, currency) } : result);
      if (result.ok) syncFuelPrimary(form, result.value, currency); else resetFuelPrimary(form);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="road-trip"]').forEach((form) => {
    initializeFuelPreferences(form);
    const calculate = (): void => {
      syncFuelLabels(form);
      const base = fuelInput(form);
      const result = calculateRoadTripCostTool({ ...base, roundTrip: textValue(form, 'tripType') === 'round', extraCost: value(form, 'extraCost'), people: value(form, 'people') });
      const currency = textValue(form, 'currency') || 'USD';
      render(form, result.ok ? { ok: true, ...roadTripPresentation(result.value, currency) } : result);
      if (result.ok) syncRoadTripPrimary(form, result.value, currency); else resetRoadTripPrimary(form);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="fuel-economy"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as FuelEconomyUnit; const result = convertFuelEconomyTool(entered, unit);
    render(form, result.ok ? { ok: true, ...fuelEconomyPresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const from = unit === 'l100km' ? `${formatNumber(entered)} L/100km` : `${formatNumber(entered)} ${unit === 'us-mpg' ? 'US MPG' : 'Imp MPG'}`;
    const primary = unit === 'l100km' ? `${formatNumber(result.value.usMpg)} US MPG` : `${formatNumber(result.value.litersPer100Km)} L/100km`;
    const secondary = unit === 'imperial-mpg' ? `${formatNumber(result.value.usMpg)} US MPG` : `${formatNumber(result.value.imperialMpg)} Imp MPG`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.otherGallonStandard, secondary, secondaryNote: t.gallonsNotInterchangeable, leftLabel: t.enteredEconomy, left: from, rightLabel: t.convertedEconomy, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="pressure"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as PressureUnit; const result = convertPressureTool(entered, unit);
    render(form, result.ok ? { ok: true, ...pressurePresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const primary = unit === 'psi' ? `${formatNumber(result.value.bar, 3)} bar` : `${formatNumber(result.value.psi)} PSI`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.kilopascals, secondary: `${formatNumber(result.value.kpa)} kPa`, secondaryNote: t.conversionOnlyPressure, leftLabel: t.enteredPressure, left: `${formatNumber(entered)} ${unit}`, rightLabel: t.convertedPressure, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as PowerUnit; const result = convertPowerTool(entered, unit);
    render(form, result.ok ? { ok: true, ...powerPresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const primary = unit === 'hp' ? `${formatNumber(result.value.kilowatts)} kW` : `${formatNumber(result.value.mechanicalHorsepower)} hp`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.underlyingPower, secondary: `${formatNumber(result.value.watts)} W`, secondaryNote: t.mechanicalNotMetric, leftLabel: t.enteredPower, left: `${formatNumber(entered)} ${unit}`, rightLabel: t.convertedPower, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="torque"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as TorqueUnit; const result = convertTorqueTool(entered, unit);
    render(form, result.ok ? { ok: true, ...torquePresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const primary = unit === 'nm' ? `${formatNumber(result.value.poundFeet)} lb-ft` : `${formatNumber(result.value.newtonMeters)} Nm`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.relationship, secondary: t.sameTorque, secondaryNote: t.unitExpressionOnly, leftLabel: t.enteredTorque, left: `${formatNumber(entered)} ${unit}`, rightLabel: t.convertedTorque, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power-weight"]').forEach((form) => bindInstant(form, () => {
    const power = value(form, 'power'); const weight = value(form, 'weight'); const powerUnit = textValue(form, 'powerUnit') as PowerUnit; const weightUnit = textValue(form, 'weightUnit') as WeightUnit; const result = calculatePowerToWeightTool({ power, powerUnit, weight, weightUnit });
    render(form, result.ok ? { ok: true, ...powerToWeightPresentation(result.value, power, powerUnit, weight, weightUnit) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    syncStandardAnswer(form, { primary: `${formatNumber(result.value.mechanicalHorsepowerPerTonne)} hp/t`, secondaryLabel: t.metricEquivalent, secondary: `${formatNumber(result.value.kilowattsPerTonne)} kW/t`, secondaryNote: t.ratioOnlyNote, leftLabel: t.enteredVehicle, left: `${formatNumber(power)} ${powerUnit} · ${formatNumber(weight)} ${weightUnit}`, rightLabel: t.normalizedRatio, right: `${formatNumber(result.value.wattsPerKilogram)} W/kg` });
  }));
}
