import { vehicleMakes, vehiclesByMake, vehicleById } from '../data/vehicle-fitment';
import { indexedVehicleMakes, indexedModelsForMake } from '../data/vehicle-model-index';

const STORAGE_KEY = 'atlas_selected_vehicle';
const UNVERIFIED_PREFIX = 'name:';
/** Fired on `window` whenever the header's selected vehicle changes (including clear). Detail is `SavedVehicle | null`. */
export const VEHICLE_CHANGED_EVENT = 'atlas:vehicle-changed';

export interface SavedVehicle {
  readonly make: string;
  readonly model: string;
  /** Present only for a verified vehicle-fitment.ts entry; absent for a name-only (unverified) pick. */
  readonly id?: string;
}

function readSavedVehicle(): SavedVehicle | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' && parsed !== null &&
      'make' in parsed && 'model' in parsed &&
      typeof (parsed as { make: unknown }).make === 'string' &&
      typeof (parsed as { model: unknown }).model === 'string'
    ) {
      const id = (parsed as { id?: unknown }).id;
      return { make: (parsed as { make: string }).make, model: (parsed as { model: string }).model, ...(typeof id === 'string' ? { id } : {}) };
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — behave as if nothing is saved.
  }
  return null;
}

function writeSavedVehicle(vehicle: SavedVehicle | null): void {
  try {
    if (vehicle) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort; the widget still works for the current page load without persistence.
  }
  window.dispatchEvent(new CustomEvent<SavedVehicle | null>(VEHICLE_CHANGED_EVENT, { detail: vehicle }));
}

/** Reusable read for any page (calculators) that wants to prefill from the header's saved vehicle. */
export function getSelectedVehicle(): SavedVehicle | null {
  return readSavedVehicle();
}

export function initializeVehicleSelectorWidget(): void {
  document.querySelectorAll<HTMLDetailsElement>('[data-vehicle-selector]').forEach((root) => {
    const makeSelect = root.querySelector<HTMLSelectElement>('[data-vs-make]');
    const modelSelect = root.querySelector<HTMLSelectElement>('[data-vs-model]');
    const badge = root.querySelector<HTMLElement>('[data-vs-badge]');
    const clearButton = root.querySelector<HTMLButtonElement>('[data-vs-clear]');
    const form = root.querySelector<HTMLFormElement>('[data-vs-form]');
    if (!makeSelect || !modelSelect || !badge) return;

    const allMakes = Object.freeze([...new Set([...vehicleMakes(), ...indexedVehicleMakes()])].sort((a, b) => a.localeCompare(b)));
    makeSelect.replaceChildren(new Option('Choose a make', ''), ...allMakes.map((make) => new Option(make, make)));

    const populateModels = (make: string, selectValue?: string): void => {
      if (!make) { modelSelect.replaceChildren(new Option('Choose a make first', '')); modelSelect.disabled = true; return; }
      const verified = vehiclesByMake(make);
      const verifiedModelNames = new Set(verified.map((vehicle) => vehicle.model.toLowerCase()));
      const unverifiedModels = indexedModelsForMake(make).filter((model) => !verifiedModelNames.has(model.toLowerCase()));
      modelSelect.replaceChildren(
        new Option('Choose a model', ''),
        ...verified.map((vehicle) => new Option(vehicle.model, vehicle.id)),
        ...unverifiedModels.map((model) => new Option(model, `${UNVERIFIED_PREFIX}${model}`)),
      );
      modelSelect.disabled = false;
      if (selectValue) modelSelect.value = selectValue;
    };

    const updateBadge = (saved: SavedVehicle | null): void => {
      badge.textContent = saved ? `${saved.make} ${saved.model}` : 'Select vehicle';
      root.classList.toggle('vehicle-selector--set', !!saved);
      if (clearButton) clearButton.hidden = !saved;
    };

    const applySaved = (saved: SavedVehicle | null): void => {
      updateBadge(saved);
      if (saved) {
        makeSelect.value = saved.make;
        populateModels(saved.make, saved.id ?? `${UNVERIFIED_PREFIX}${saved.model}`);
      } else {
        makeSelect.value = '';
        populateModels('');
      }
    };

    makeSelect.addEventListener('change', () => populateModels(makeSelect.value));

    modelSelect.addEventListener('change', () => {
      const value = modelSelect.value;
      const make = makeSelect.value;
      if (!make || !value) return;
      if (value.startsWith(UNVERIFIED_PREFIX)) {
        writeSavedVehicle({ make, model: value.slice(UNVERIFIED_PREFIX.length) });
      } else {
        const vehicle = vehicleById(value);
        if (!vehicle) return;
        writeSavedVehicle({ make: vehicle.make, model: vehicle.model, id: vehicle.id });
      }
      updateBadge(readSavedVehicle());
      root.open = false;
    });

    clearButton?.addEventListener('click', (event) => {
      event.preventDefault();
      writeSavedVehicle(null);
      applySaved(null);
    });

    form?.addEventListener('submit', (event) => event.preventDefault());

    applySaved(readSavedVehicle());
  });

  // Close-on-outside-click / Escape, matching the language dropdown's pattern.
  document.addEventListener('click', (event) => {
    document.querySelectorAll<HTMLDetailsElement>('[data-vehicle-selector][open]').forEach((el) => {
      if (!el.contains(event.target as Node)) el.open = false;
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll<HTMLDetailsElement>('[data-vehicle-selector][open]').forEach((el) => { el.open = false; });
  });
}
