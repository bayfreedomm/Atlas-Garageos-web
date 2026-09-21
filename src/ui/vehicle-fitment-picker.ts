import { vehicleMakes, vehiclesByMake, vehicleById, type VehicleFitment } from '../data/vehicle-fitment';
import { indexedVehicleMakes, indexedModelsForMake } from '../data/vehicle-model-index';
import { boltPatternSpacingMm } from '../data/bolt-pattern-geometry';
import { getSelectedVehicle, setSelectedVehicle } from './vehicle-storage';

const UNVERIFIED_PREFIX = 'name:';
const ANY_YEAR = '';
const TIRE_TOKEN = /^(\d+)\/(\d+)R(\d+(?:\.\d+)?)/;
/** vehicle-fitment.ts stores a free-text generation range like "2019–2024 (XII / E210, LE)", not
 * discrete years — this pulls every 4-digit year mentioned in it, so "Year" can be offered as a
 * real filter without inventing per-year data we don't have. */
const YEAR_TOKEN = /\b(19|20)\d{2}\b/g;

type PickerTarget = 'tire-size' | 'bolt-pattern';

const setFieldValue = (form: HTMLFormElement, name: string, next: string): void => {
  const field = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  if (field) field.value = next;
};

function yearsInGeneration(generation: string): readonly number[] {
  const matches = generation.match(YEAR_TOKEN);
  if (!matches || matches.length === 0) return [];
  const years = matches.map(Number);
  const min = Math.min(...years);
  const max = Math.max(...years);
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

function applyToTireSizeForm(vehicle: VehicleFitment): boolean {
  const form = document.querySelector<HTMLFormElement>('[data-calculator="tire-size"]');
  const match = vehicle.tireSize.match(TIRE_TOKEN);
  if (!form || !match) return false;
  setFieldValue(form, 'widthMm', match[1]!);
  setFieldValue(form, 'aspectRatio', match[2]!);
  setFieldValue(form, 'rimDiameterInches', match[3]!);
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.requestSubmit();
  return true;
}

function applyToBoltPatternForm(vehicle: VehicleFitment): boolean {
  const form = document.querySelector<HTMLFormElement>('[data-calculator="bolt-pattern"]');
  if (!form) return false;
  // The calculator's "spacing" field is the measured hole-to-hole chord, NOT the PCD. It is
  // derived here from the bolt pattern through the one shared function so the pre-filled
  // number is the same one the bolt-pattern entity pages and the diagram show.
  const spacing = boltPatternSpacingMm(vehicle.boltPattern);
  if (spacing === null) return false;
  setFieldValue(form, 'lugCount', String(vehicle.lugCount));
  setFieldValue(form, 'spacing', spacing.toFixed(2));
  setFieldValue(form, 'spacingUnit', 'mm');
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.requestSubmit();
  return true;
}

function hasFieldFor(target: PickerTarget, vehicle: VehicleFitment): boolean {
  return target === 'tire-size' ? TIRE_TOKEN.test(vehicle.tireSize) : true;
}

function fieldSummary(target: PickerTarget, vehicle: VehicleFitment): string {
  return target === 'tire-size' ? `OEM tire size ${vehicle.tireSize}` : `Bolt pattern ${vehicle.boltPattern}`;
}

export function initializeVehicleFitmentPicker(): void {
  document.querySelectorAll<HTMLElement>('[data-vehicle-fitment-picker]').forEach((root) => {
    const target = root.dataset.vfpTarget as PickerTarget | undefined;
    const makeSelect = root.querySelector<HTMLSelectElement>('[data-vfp-make]');
    const yearSelect = root.querySelector<HTMLSelectElement>('[data-vfp-year]');
    const modelSelect = root.querySelector<HTMLSelectElement>('[data-vfp-model]');
    const resultEl = root.querySelector<HTMLElement>('[data-vfp-result]');
    const resultValueEl = root.querySelector<HTMLElement>('[data-vfp-result-value]');
    const resultNoteEl = root.querySelector<HTMLElement>('[data-vfp-result-note]');
    const applyButton = root.querySelector<HTMLButtonElement>('[data-vfp-apply]');
    if (!target || !makeSelect || !yearSelect || !modelSelect || !resultEl || !resultValueEl || !resultNoteEl || !applyButton) return;

    const allMakes = Object.freeze([...new Set([...vehicleMakes(), ...indexedVehicleMakes()])].sort((a, b) => a.localeCompare(b)));
    makeSelect.replaceChildren(new Option('Choose a make', ''), ...allMakes.map((make) => new Option(make, make)));

    const populateYears = (make: string, selectValue?: string): void => {
      if (!make) { yearSelect.replaceChildren(new Option('Any year', ANY_YEAR)); yearSelect.disabled = true; return; }
      const years = new Set<number>();
      for (const vehicle of vehiclesByMake(make)) for (const year of yearsInGeneration(vehicle.generation)) years.add(year);
      const sorted = [...years].sort((a, b) => b - a);
      yearSelect.replaceChildren(new Option('Any year', ANY_YEAR), ...sorted.map((year) => new Option(String(year), String(year))));
      yearSelect.disabled = sorted.length === 0;
      if (selectValue !== undefined) yearSelect.value = selectValue;
    };

    const populateModels = (make: string, year: string, selectValue?: string): void => {
      if (!make) { modelSelect.replaceChildren(new Option('Choose a make first', '')); modelSelect.disabled = true; return; }
      const verified = vehiclesByMake(make).filter((vehicle) => year === ANY_YEAR || yearsInGeneration(vehicle.generation).includes(Number(year)));
      const verifiedModelNames = new Set(verified.map((vehicle) => vehicle.model.toLowerCase()));
      // A year filter only narrows the curated dataset — the broader name-only index carries no
      // year data at all, so it stays out once a specific year is chosen rather than showing models
      // we can't actually confirm cover that year.
      const unverifiedModels = year === ANY_YEAR ? indexedModelsForMake(make).filter((model) => !verifiedModelNames.has(model.toLowerCase())) : [];
      modelSelect.replaceChildren(
        new Option('Choose a model', ''),
        ...verified.map((vehicle) => new Option(vehicle.model, vehicle.id)),
        ...unverifiedModels.map((model) => new Option(model, `${UNVERIFIED_PREFIX}${model}`)),
      );
      modelSelect.disabled = false;
      if (selectValue) modelSelect.value = selectValue;
    };

    let currentVehicle: VehicleFitment | null = null;

    const showEmpty = (): void => {
      currentVehicle = null;
      resultEl.hidden = true;
      applyButton.hidden = true;
    };

    const showUnverified = (make: string, model: string): void => {
      currentVehicle = null;
      resultEl.hidden = false;
      resultEl.dataset.vfpState = 'unverified';
      resultValueEl.textContent = `${make} ${model}`;
      resultNoteEl.textContent = "We don't have verified fitment data for this vehicle yet — check your door-jamb sticker or owner's manual.";
      applyButton.hidden = true;
    };

    const showVehicle = (vehicle: VehicleFitment): void => {
      resultEl.hidden = false;
      resultEl.dataset.vfpState = 'verified';
      if (hasFieldFor(target, vehicle)) {
        currentVehicle = vehicle;
        resultValueEl.textContent = fieldSummary(target, vehicle);
        resultNoteEl.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.generation})`;
        applyButton.hidden = false;
      } else {
        currentVehicle = null;
        resultValueEl.textContent = `${vehicle.make} ${vehicle.model}`;
        resultNoteEl.textContent = 'No verified data for this calculator yet.';
        applyButton.hidden = true;
      }
    };

    makeSelect.addEventListener('change', () => { populateYears(makeSelect.value); populateModels(makeSelect.value, ANY_YEAR); showEmpty(); });
    yearSelect.addEventListener('change', () => { populateModels(makeSelect.value, yearSelect.value); showEmpty(); });

    modelSelect.addEventListener('change', () => {
      const value = modelSelect.value;
      const make = makeSelect.value;
      if (!make || !value) { showEmpty(); return; }
      if (value.startsWith(UNVERIFIED_PREFIX)) {
        const model = value.slice(UNVERIFIED_PREFIX.length);
        showUnverified(make, model);
        return;
      }
      const vehicle = vehicleById(value);
      if (!vehicle) { showEmpty(); return; }
      showVehicle(vehicle);
    });

    applyButton.addEventListener('click', () => {
      if (!currentVehicle) return;
      setSelectedVehicle({ make: currentVehicle.make, model: currentVehicle.model, id: currentVehicle.id });
      if (target === 'tire-size') applyToTireSizeForm(currentVehicle);
      else applyToBoltPatternForm(currentVehicle);
    });

    // Restore whatever vehicle was picked on another page, so the picker (and its result) shows it
    // immediately — but never auto-submit the main calculator form on page load, only on an explicit
    // click, so we never silently overwrite a value the visitor already typed.
    const saved = getSelectedVehicle();
    if (saved) {
      makeSelect.value = saved.make;
      populateYears(saved.make);
      if (saved.id) {
        const vehicle = vehicleById(saved.id);
        const years = vehicle ? yearsInGeneration(vehicle.generation) : [];
        if (years.length > 0) yearSelect.value = String(years[0]);
        populateModels(saved.make, yearSelect.value, saved.id);
        if (vehicle) showVehicle(vehicle); else showEmpty();
      } else {
        populateModels(saved.make, ANY_YEAR, `${UNVERIFIED_PREFIX}${saved.model}`);
        showUnverified(saved.make, saved.model);
      }
    } else {
      populateYears('');
      populateModels('', ANY_YEAR);
      showEmpty();
    }
  });
}
