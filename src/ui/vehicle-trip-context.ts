import { vehicleFitmentData } from '../data/vehicle-fitment';
import type { EntityLocale } from '../seo/entity-routes';
import { vehicleLink } from './entity-page-model';

export function tripVehicleForId(id: string | null | undefined, _locale?: EntityLocale) {
  if (!id) return undefined;
  return vehicleFitmentData.find((vehicle) => vehicle.id === id);
}

export function initializeVehicleTripContext(): void {
  const id = new URLSearchParams(location.search).get('vehicle');
  document.querySelectorAll<HTMLElement>('[data-vehicle-trip-context]').forEach((root) => {
    const localeValue = root.dataset.locale;
    const locale: EntityLocale = localeValue === 'de' || localeValue === 'es' ? localeValue : 'en';
    const vehicle = tripVehicleForId(id, locale);
    if (!vehicle) return;
    const name = root.querySelector<HTMLElement>('[data-trip-vehicle-name]');
    const link = root.querySelector<HTMLAnchorElement>('[data-trip-vehicle-link]');
    if (!name || !link) return;
    name.textContent = `${vehicle.make} ${vehicle.model}`;
    link.href = vehicleLink(vehicle, locale).href;
    root.hidden = false;
    const form = document.querySelector<HTMLFormElement>('form[data-utility-calculator="road-trip"]');
    const economy = form?.elements.namedItem('economy') as HTMLInputElement | null;
    if (form && economy) {
      form.dataset.vehicleId = vehicle.id;
      economy.value = '';
      economy.placeholder = locale === 'de' ? 'Tatsächlichen Verbrauch eingeben' : locale === 'es' ? 'Introduzca el consumo real' : 'Enter actual consumption';
      form.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}
