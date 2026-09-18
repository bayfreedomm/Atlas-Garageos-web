/**
 * Cross-page "remembered vehicle" storage, shared by every inline vehicle-fitment picker
 * (see vehicle-fitment-picker.ts). Kept as its own tiny module, with no DOM/UI code, so any
 * tool page can read what vehicle the visitor picked elsewhere without depending on a header
 * widget or any particular page's markup.
 */

const STORAGE_KEY = 'atlas_selected_vehicle';

export interface SavedVehicle {
  readonly make: string;
  readonly model: string;
  /** Present only for a verified vehicle-fitment.ts entry; absent for a name-only (unverified) pick. */
  readonly id?: string;
}

export function getSelectedVehicle(): SavedVehicle | null {
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

export function setSelectedVehicle(vehicle: SavedVehicle | null): void {
  try {
    if (vehicle) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort; the picker still works for the current page load without persistence.
  }
}
