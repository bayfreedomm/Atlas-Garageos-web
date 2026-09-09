import type { FuelEconomyUnit, PowerUnit, PressureUnit, TorqueUnit, UnitSystem, WeightUnit } from '../domain/utility-calculators';
import { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertFuelInputSystemTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { toolIssueText, type PresentedMetric } from './tool-presentation';
import { fuelCostPresentation, fuelEconomyPresentation, powerPresentation, powerToWeightPresentation, pressurePresentation, roadTripPresentation, torquePresentation } from './utility-presentation';
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
    errors.replaceChildren(list); errors.hidden = false; summary.classList.add('is-pending'); metrics.replaceChildren(); return;
  }
  errors.hidden = true; errors.replaceChildren(); summary.textContent = result.summary; summary.classList.remove('is-pending');
  summary.classList.remove('is-refreshing'); requestAnimationFrame(() => summary.classList.add('is-refreshing'));
  metrics.replaceChildren(...result.metrics.map((metric) => { const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd'); term.textContent = metric.label; detail.textContent = metric.value; row.append(term, detail); return row; }));
}

function bindSubmit(form: HTMLFormElement, calculate: () => void): void { form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); }); calculate(); }
function bindInstant(form: HTMLFormElement, calculate: () => void): void { form.addEventListener('input', calculate); form.addEventListener('change', calculate); calculate(); }

function fuelInput(form: HTMLFormElement) { return { system: (textValue(form, 'system') === 'imperial' ? 'imperial' : 'metric') as UnitSystem, distance: value(form, 'distance'), economy: value(form, 'economy'), price: value(form, 'price') }; }

function syncFuelLabels(form: HTMLFormElement): void {
  const us = textValue(form, 'system') === 'imperial';
  const trip = form.dataset.utilityCalculator === 'road-trip';
  const distance = form.querySelector<HTMLElement>('[data-distance-label]');
  const economy = form.querySelector<HTMLElement>('[data-economy-label]');
  const price = form.querySelector<HTMLElement>('[data-price-label]');
  if (distance) distance.textContent = `${trip ? 'One-way distance' : 'Distance'} · ${us ? 'miles' : 'km'}`;
  if (economy) economy.textContent = `Fuel economy · ${us ? 'US MPG' : 'L/100km'}`;
  if (price) price.textContent = `Fuel price · per ${us ? 'US gallon' : 'litre'}`;
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
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="fuel-cost"]').forEach((form) => { initializeFuelPreferences(form); form.addEventListener('change', () => syncFuelLabels(form)); syncFuelLabels(form); bindSubmit(form, () => {
    const result = calculateFuelCostTool(fuelInput(form));
    render(form, result.ok ? { ok: true, ...fuelCostPresentation(result.value, textValue(form, 'currency') || 'USD') } : result);
  }); });
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="road-trip"]').forEach((form) => { initializeFuelPreferences(form); form.addEventListener('change', () => syncFuelLabels(form)); syncFuelLabels(form); bindSubmit(form, () => {
    const base = fuelInput(form); const result = calculateRoadTripCostTool({ ...base, roundTrip: textValue(form, 'tripType') === 'round', extraCost: value(form, 'extraCost'), people: value(form, 'people') });
    render(form, result.ok ? { ok: true, ...roadTripPresentation(result.value, textValue(form, 'currency') || 'USD') } : result);
  }); });
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="fuel-economy"]').forEach((form) => bindInstant(form, () => { const result = convertFuelEconomyTool(value(form, 'value'), textValue(form, 'unit') as FuelEconomyUnit); render(form, result.ok ? { ok: true, ...fuelEconomyPresentation(result.value) } : result); }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="pressure"]').forEach((form) => bindInstant(form, () => { const result = convertPressureTool(value(form, 'value'), textValue(form, 'unit') as PressureUnit); render(form, result.ok ? { ok: true, ...pressurePresentation(result.value) } : result); }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power"]').forEach((form) => bindInstant(form, () => { const result = convertPowerTool(value(form, 'value'), textValue(form, 'unit') as PowerUnit); render(form, result.ok ? { ok: true, ...powerPresentation(result.value) } : result); }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="torque"]').forEach((form) => bindInstant(form, () => { const result = convertTorqueTool(value(form, 'value'), textValue(form, 'unit') as TorqueUnit); render(form, result.ok ? { ok: true, ...torquePresentation(result.value) } : result); }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power-weight"]').forEach((form) => bindSubmit(form, () => { const power = value(form, 'power'); const weight = value(form, 'weight'); const powerUnit = textValue(form, 'powerUnit') as PowerUnit; const weightUnit = textValue(form, 'weightUnit') as WeightUnit; const result = calculatePowerToWeightTool({ power, powerUnit, weight, weightUnit }); render(form, result.ok ? { ok: true, ...powerToWeightPresentation(result.value, power, powerUnit, weight, weightUnit) } : result); }));
}
