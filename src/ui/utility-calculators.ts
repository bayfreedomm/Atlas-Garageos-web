import type { FuelEconomyUnit, PowerUnit, PressureUnit, TorqueUnit, UnitSystem, WeightUnit } from '../domain/utility-calculators';
import { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertFuelInputSystemTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { toolIssueText, type PresentedMetric } from './tool-presentation';
import { fuelCostPresentation, fuelEconomyPresentation, powerPresentation, powerToWeightPresentation, pressurePresentation, roadTripPresentation, torquePresentation } from './utility-presentation';
import { formatNumber } from './format-number';
import { CURRENCY_STORAGE_KEY, parseCurrencyLabel, parseUnitSystem, UNIT_SYSTEM_STORAGE_KEY } from './utility-preference';

const value = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));
const textValue = (form: HTMLFormElement, name: string): string => String(new FormData(form).get(name) ?? '');

function render(form: HTMLFormElement, result: { readonly ok: true; readonly summary: string; readonly metrics: readonly PresentedMetric[] } | { readonly ok: false; readonly issues: readonly Parameters<typeof toolIssueText>[0][] }): void {
  const errors = form.querySelector<HTMLElement>('[data-errors]')!;
  const summary = form.querySelector<HTMLElement>('[data-result-summary]')!;
  const metrics = form.querySelector<HTMLDListElement>('[data-results]')!;
  if (!result.ok) {
    const list = document.createElement('ul');
    result.issues.forEach((issue) => { const item = document.createElement('li'); item.textContent = toolIssueText(issue); list.append(item); });
    errors.replaceChildren(list); errors.hidden = false; summary.textContent = 'Check the highlighted inputs to update the estimate.'; summary.classList.add('is-pending'); metrics.replaceChildren(); return;
  }
  errors.hidden = true; errors.replaceChildren(); summary.textContent = result.summary; summary.classList.remove('is-pending');
  summary.classList.remove('is-refreshing'); requestAnimationFrame(() => summary.classList.add('is-refreshing'));
  metrics.replaceChildren(...result.metrics.map((metric) => { const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd'); term.textContent = metric.label; detail.textContent = metric.value; row.append(term, detail); return row; }));
}


function syncFuelPrimary(form: HTMLFormElement, result: { readonly system: UnitSystem; readonly distance: number; readonly fuelRequired: number; readonly fuelCost: number; readonly costPerDistance: number }, currency: string): void {
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
  if (copyNode) copyNode.textContent = `${formatNumber(result.distance)} ${distanceUnit} of driving at the entered fuel economy and price.`;
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
  if (captionNode) captionNode.textContent = `${formatNumber(result.distance)} ${distanceUnit} · ${fuel} required`;
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
  const panel = form.querySelector<HTMLElement>('[data-fuel-primary-result]');
  if (panel) {
    panel.classList.add('is-pending');
    const cost = panel.querySelector<HTMLElement>('[data-fuel-primary-cost]');
    const fuel = panel.querySelector<HTMLElement>('[data-fuel-primary-fuel]');
    const copy = panel.querySelector<HTMLElement>('[data-fuel-primary-copy]');
    const rate = panel.querySelector<HTMLElement>('[data-fuel-primary-rate]');
    if (cost) cost.textContent = '—';
    if (fuel) fuel.textContent = '—';
    if (copy) copy.textContent = 'Check the highlighted inputs to calculate this trip.';
    if (rate) rate.textContent = 'Cost per distance appears here.';
  }
}

type RoadTripResult = Extract<ReturnType<typeof calculateRoadTripCostTool>, { readonly ok: true }>['value'];

function syncRoadTripPrimary(form: HTMLFormElement, result: RoadTripResult, currency: string): void {
  const panel = form.querySelector<HTMLElement>('[data-trip-primary]');
  const visual = form.querySelector<HTMLElement>('[data-trip-visual]');
  if (!panel || !visual) return;
  const money = (amount: number): string => `${currency} ${formatNumber(amount, 2)}`;
  const unit = result.system === 'metric' ? 'km' : 'mi';
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distance = `${formatNumber(result.distance)} ${unit}`;
  const fuel = `${formatNumber(result.fuelRequired)} ${fuelUnit}`;
  const direction = result.roundTrip ? 'Round trip' : 'One way';
  const set = (selector: string, content: string): void => {
    const node = form.querySelector<HTMLElement>(selector);
    if (node) node.textContent = content;
  };
  set('[data-trip-total]', money(result.totalTripCost));
  set('[data-trip-context]', `${money(result.fuelCost)} fuel + ${money(result.extraCost)} extras across ${distance}.`);
  set('[data-trip-fuel]', fuel);
  set('[data-trip-fuel-cost]', `${money(result.fuelCost)} for fuel`);
  set('[data-trip-direction]', direction);
  set('[data-trip-distance]', distance);
  set('[data-trip-person]', money(result.costPerPerson));
  set('[data-trip-people]', `Shared by ${result.people} people`);
  const person = form.querySelector<HTMLElement>('[data-trip-person-wrap]');
  if (person) person.hidden = result.people <= 1;
  set('[data-trip-visual-distance]', distance);
  set('[data-trip-visual-fuel]', fuel);
  set('[data-trip-visual-total]', money(result.totalTripCost));
  set('[data-trip-visual-fuel-cost]', money(result.fuelCost));
  set('[data-trip-visual-extras]', money(result.extraCost));
  set('[data-trip-end]', result.roundTrip ? 'RETURN TO START' : 'DESTINATION');
  const returnLeg = visual.querySelector<HTMLElement>('[data-trip-return]');
  if (returnLeg) returnLeg.hidden = !result.roundTrip;
  const fuelBar = visual.querySelector<HTMLElement>('[data-trip-fuel-bar]');
  const extraBar = visual.querySelector<HTMLElement>('[data-trip-extra-bar]');
  if (fuelBar) fuelBar.style.width = `${result.fuelCost / result.totalTripCost * 100}%`;
  if (extraBar) extraBar.style.width = `${result.extraCost / result.totalTripCost * 100}%`;
  const track = visual.querySelector<HTMLElement>('[data-trip-cost-track]');
  if (track) track.setAttribute('aria-label', `Fuel ${money(result.fuelCost)} and extras ${money(result.extraCost)} of ${money(result.totalTripCost)}`);
  panel.classList.remove('is-pending');
  visual.classList.remove('is-pending');
}

function resetRoadTripPrimary(form: HTMLFormElement): void {
  form.querySelector('[data-trip-primary]')?.classList.add('is-pending');
  form.querySelector('[data-trip-visual]')?.classList.add('is-pending');
  for (const selector of ['[data-trip-total]', '[data-trip-fuel]', '[data-trip-direction]', '[data-trip-person]', '[data-trip-visual-distance]', '[data-trip-visual-fuel]', '[data-trip-visual-total]', '[data-trip-visual-fuel-cost]', '[data-trip-visual-extras]']) {
    const node = form.querySelector<HTMLElement>(selector);
    if (node) node.textContent = '—';
  }
  const context = form.querySelector<HTMLElement>('[data-trip-context]');
  if (context) context.textContent = 'Check the inputs to calculate this trip.';
  for (const [selector, content] of [['[data-trip-fuel-cost]', 'Fuel cost appears here.'], ['[data-trip-distance]', 'Distance appears here.'], ['[data-trip-end]', 'DESTINATION']] as const) {
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
  form.querySelector('[data-standard-answer]')?.classList.add('is-pending');
  form.querySelector('[data-standard-visual]')?.classList.add('is-pending');
  form.querySelectorAll<HTMLElement>('[data-standard-primary], [data-standard-secondary], [data-standard-visual-left], [data-standard-visual-right]').forEach((node) => { node.textContent = '—'; });
  const context = form.querySelector<HTMLElement>('[data-standard-context]');
  if (context) context.textContent = 'Check the input to update the conversion.';
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
    const from = unit === 'l100km' ? `${formatNumber(entered)} L/100km` : `${formatNumber(entered)} ${unit === 'us-mpg' ? 'US MPG' : 'Imp MPG'}`;
    const primary = unit === 'l100km' ? `${formatNumber(result.value.usMpg)} US MPG` : `${formatNumber(result.value.litersPer100Km)} L/100km`;
    const secondary = unit === 'imperial-mpg' ? `${formatNumber(result.value.usMpg)} US MPG` : `${formatNumber(result.value.imperialMpg)} Imp MPG`;
    syncStandardAnswer(form, { primary, secondaryLabel: 'Other gallon standard', secondary, secondaryNote: 'US and Imperial gallons are not interchangeable.', leftLabel: 'Entered economy', left: from, rightLabel: 'Converted economy', right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="pressure"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as PressureUnit; const result = convertPressureTool(entered, unit);
    render(form, result.ok ? { ok: true, ...pressurePresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const primary = unit === 'psi' ? `${formatNumber(result.value.bar, 3)} bar` : `${formatNumber(result.value.psi)} PSI`;
    syncStandardAnswer(form, { primary, secondaryLabel: 'Kilopascals', secondary: `${formatNumber(result.value.kpa)} kPa`, secondaryNote: 'Conversion only—use the vehicle specification.', leftLabel: 'Entered pressure', left: `${formatNumber(entered)} ${unit}`, rightLabel: 'Converted pressure', right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as PowerUnit; const result = convertPowerTool(entered, unit);
    render(form, result.ok ? { ok: true, ...powerPresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const primary = unit === 'hp' ? `${formatNumber(result.value.kilowatts)} kW` : `${formatNumber(result.value.mechanicalHorsepower)} hp`;
    syncStandardAnswer(form, { primary, secondaryLabel: 'Underlying power', secondary: `${formatNumber(result.value.watts)} W`, secondaryNote: 'Uses mechanical horsepower, not metric PS.', leftLabel: 'Entered power', left: `${formatNumber(entered)} ${unit}`, rightLabel: 'Converted power', right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="torque"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as TorqueUnit; const result = convertTorqueTool(entered, unit);
    render(form, result.ok ? { ok: true, ...torquePresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const primary = unit === 'nm' ? `${formatNumber(result.value.poundFeet)} lb-ft` : `${formatNumber(result.value.newtonMeters)} Nm`;
    syncStandardAnswer(form, { primary, secondaryLabel: 'Relationship', secondary: 'Same torque', secondaryNote: 'Only the unit expression changes.', leftLabel: 'Entered torque', left: `${formatNumber(entered)} ${unit}`, rightLabel: 'Converted torque', right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power-weight"]').forEach((form) => bindInstant(form, () => {
    const power = value(form, 'power'); const weight = value(form, 'weight'); const powerUnit = textValue(form, 'powerUnit') as PowerUnit; const weightUnit = textValue(form, 'weightUnit') as WeightUnit; const result = calculatePowerToWeightTool({ power, powerUnit, weight, weightUnit });
    render(form, result.ok ? { ok: true, ...powerToWeightPresentation(result.value, power, powerUnit, weight, weightUnit) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    syncStandardAnswer(form, { primary: `${formatNumber(result.value.mechanicalHorsepowerPerTonne)} hp/t`, secondaryLabel: 'Metric equivalent', secondary: `${formatNumber(result.value.kilowattsPerTonne)} kW/t`, secondaryNote: 'Ratio only; traction, gearing, and drag are separate.', leftLabel: 'Entered vehicle', left: `${formatNumber(power)} ${powerUnit} · ${formatNumber(weight)} ${weightUnit}`, rightLabel: 'Normalized ratio', right: `${formatNumber(result.value.wattsPerKilogram)} W/kg` });
  }));
}
