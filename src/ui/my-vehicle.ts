/**
 * "This is my car": remembers a curated vehicle in the shared vehicle store
 * (vehicle-storage.ts, the same key the header selector and fitment picker use) and resolves it
 * back to the sizes calculators start from. Only the id is trusted; sizes always come from the
 * curated dataset, never from storage.
 */
import { vehicleById } from '../data/vehicle-fitment';
import { vehicleBaseline, type VehicleBaseline } from '../features/decision/change-decision';
import { getSelectedVehicle, setSelectedVehicle, VEHICLE_CHANGED_EVENT } from './vehicle-storage';

export function rememberedBaseline(): VehicleBaseline | null {
  const saved = getSelectedVehicle();
  const vehicle = saved?.id ? vehicleById(saved.id) : undefined;
  return vehicle ? vehicleBaseline(vehicle) : null;
}

export function initializeMyVehicleRemember(): void {
  document.querySelectorAll<HTMLElement>('[data-my-vehicle-remember]').forEach((root) => {
    const button = root.querySelector<HTMLButtonElement>('button');
    const label = root.querySelector<HTMLElement>('[data-my-vehicle-label]');
    const icon = root.querySelector<HTMLElement>('.my-vehicle-remember__icon');
    const { vehicleId: id, vehicleMake: make, vehicleModel: model } = root.dataset;
    if (!button || !label || !id || !make || !model || !vehicleById(id)) return;
    const sync = (): void => {
      const on = getSelectedVehicle()?.id === id;
      button.setAttribute('aria-pressed', String(on));
      root.classList.toggle('is-remembered', on);
      label.textContent = (on ? button.dataset.labelOn : button.dataset.labelOff) ?? '';
      if (icon) icon.textContent = on ? '✓' : '＋';
    };
    button.addEventListener('click', () => {
      setSelectedVehicle(getSelectedVehicle()?.id === id ? null : { make, model, id });
    });
    window.addEventListener(VEHICLE_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    sync();
  });
}
