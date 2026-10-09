import { vehicleFitmentData } from '../data/vehicle-fitment';
import type { EntityLocale } from '../seo/entity-routes';
import { vehicleLink } from './entity-page-model';

const ENTITY_LOCALE_VALUES: readonly EntityLocale[] = ['en', 'de', 'es', 'pt-br', 'fr', 'it', 'pl', 'nl', 'tr'];

const ACTUAL_CONSUMPTION_PLACEHOLDER: Readonly<Record<EntityLocale, string>> = {
  en: 'Enter actual consumption',
  de: 'Tatsächlichen Verbrauch eingeben',
  es: 'Introduzca el consumo real',
  fr: 'Saisissez la consommation réelle',
  it: 'Inserisci il consumo reale',
  'pt-br': 'Digite o consumo real',
  pl: 'Wpisz rzeczywiste spalanie',
  nl: 'Vul het werkelijke verbruik in',
  tr: 'Gerçek tüketimi girin',
};

export function tripVehicleForId(id: string | null | undefined, _locale?: EntityLocale) {
  if (!id) return undefined;
  return vehicleFitmentData.find((vehicle) => vehicle.id === id);
}

export function initializeVehicleTripContext(): void {
  const id = new URLSearchParams(location.search).get('vehicle');
  document.querySelectorAll<HTMLElement>('[data-vehicle-trip-context]').forEach((root) => {
    const localeValue = root.dataset.locale;
    const locale: EntityLocale = (ENTITY_LOCALE_VALUES as readonly string[]).includes(localeValue ?? '') ? localeValue as EntityLocale : 'en';
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
      economy.placeholder = ACTUAL_CONSUMPTION_PLACEHOLDER[locale];
      form.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}
