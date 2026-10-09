import { createBrowserGarageRepository } from '../storage/local-storage-garage-repository';
import type { GarageState, SavedSetup } from '../domain/garage';
import type { UiLocale } from './page-locale';

/**
 * "Load from My Garage" quick-select, used by calculator pages that have no other vehicle
 * awareness (wheel-offset-calculator, tire-size-comparison). It mirrors the UX shape of
 * vehicle-fitment-picker.ts (pick something, click a button, fill the form, dispatch an input
 * event, requestSubmit()) but reads from the visitor's own saved Garage setups instead of the
 * curated vehicle-fitment dataset.
 */

type QuickLoadTarget = 'wheel-offset' | 'tire-comparison';
/** ContentLocale in site-catalog.ts only covers the non-English locales; 'en' is added here
 * because this control's copy is short and page-scoped, so it is kept as its own inline
 * dictionary (the same pattern TireInputGroup.astro already uses) rather than growing the
 * global UiStrings catalog for three lines of text. */
type QuickLoadLocale = UiLocale;

const QUICK_LOAD_LOCALES: readonly QuickLoadLocale[] = ['en', 'de', 'es', 'pt-br', 'fr', 'it', 'pl', 'nl', 'tr'];

interface QuickLoadCopy {
  readonly label: string;
  readonly apply: string;
  readonly emptyHint: string;
  readonly unknownVehicle: string;
}

const COPY: Readonly<Record<QuickLoadLocale, QuickLoadCopy>> = {
  en: {
    label: 'Load from My Garage',
    apply: 'Use this setup',
    emptyHint: 'No saved setups yet — save one from Wheel & Tire Compare.',
    unknownVehicle: 'Unsaved vehicle',
  },
  de: {
    label: 'Aus Meine Garage laden',
    apply: 'Dieses Setup verwenden',
    emptyHint: 'Noch keine gespeicherten Setups — speichern Sie eines im Felgen- & Reifenvergleich.',
    unknownVehicle: 'Nicht gespeichertes Fahrzeug',
  },
  es: {
    label: 'Cargar desde Mi Garaje',
    apply: 'Usar este ajuste',
    emptyHint: 'Aún no hay configuraciones guardadas — guarde una desde el Comparador de Llantas y Neumáticos.',
    unknownVehicle: 'Vehículo sin guardar',
  },
  fr: {
    label: 'Charger depuis Mon garage',
    apply: 'Utiliser cette configuration',
    emptyHint: 'Aucune configuration enregistrée pour l’instant — enregistrez-en une depuis le Comparateur jantes et pneus.',
    unknownVehicle: 'Véhicule non enregistré',
  },
  it: {
    label: 'Carica da Il mio garage',
    apply: 'Usa questa configurazione',
    emptyHint: 'Nessuna configurazione salvata — salvane una da Confronto cerchi e pneumatici.',
    unknownVehicle: 'Veicolo non salvato',
  },
  'pt-br': {
    label: 'Carregar da Minha garagem',
    apply: 'Usar esta configuração',
    emptyHint: 'Ainda não há configurações salvas — salve uma no Comparador de rodas e pneus.',
    unknownVehicle: 'Veículo não salvo',
  },
  pl: {
    label: 'Wczytaj z Mojego garażu',
    apply: 'Użyj tej konfiguracji',
    emptyHint: 'Brak zapisanych konfiguracji — zapisz jedną w narzędziu Porównanie felg i opon.',
    unknownVehicle: 'Niezapisany pojazd',
  },
  nl: {
    label: 'Laden uit Mijn garage',
    apply: 'Deze set-up gebruiken',
    emptyHint: 'Nog geen opgeslagen set-ups — sla er een op via Velgen en banden vergelijken.',
    unknownVehicle: 'Niet-opgeslagen voertuig',
  },
  tr: {
    label: 'Garajım’dan yükle',
    apply: 'Bu kurulumu kullan',
    emptyHint: 'Henüz kayıtlı kurulum yok — Jant ve Lastik Karşılaştırma aracından bir tane kaydedin.',
    unknownVehicle: 'Kaydedilmemiş araç',
  },
};

function resolveLocale(value: string | undefined): QuickLoadLocale {
  return (QUICK_LOAD_LOCALES as readonly string[]).includes(value ?? '') ? value as QuickLoadLocale : 'en';
}

function setupLabel(state: GarageState, setup: SavedSetup, copy: QuickLoadCopy): string {
  const vehicleName = state.vehicles.find((vehicle) => vehicle.id === setup.vehicleId)?.displayName;
  return `${setup.name} — ${vehicleName ?? copy.unknownVehicle}`;
}

function setFieldValue(form: HTMLFormElement, name: string, next: string): void {
  const field = form.elements.namedItem(name) as HTMLInputElement | null;
  if (field) field.value = next;
}

/** A saved setup is a single point-in-time spec, not a before/after pair, so only the "new"
 * side of the comparison is prefilled here; the "original" side is left for the visitor to
 * fill in themselves (their current, unsaved wheel or tire). */
// Unlike vehicle-fitment-picker.ts (which fills every field the target form needs and can
// safely call requestSubmit()), a saved Garage setup only ever fills the "new"/proposed side —
// the "original"/current side is intentionally left for the visitor to fill in themselves. If
// this called requestSubmit() right away, most visitors would immediately see the calculator's
// validation error for the still-empty original fields, which reads as the feature being broken
// on first use. So this only dispatches `input` (any live-updating summary/3D preview reacts to
// the new values) and leaves submission to the visitor once the rest of the form is filled in.
function applyToWheelOffsetForm(setup: SavedSetup): void {
  const form = document.querySelector<HTMLFormElement>('[data-calculator="wheel-offset"]');
  if (!form) return;
  setFieldValue(form, 'newWidthInches', String(setup.setup.wheel.widthInches));
  setFieldValue(form, 'newOffsetMm', String(setup.setup.wheel.offsetMm));
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.querySelector<HTMLInputElement>('[name="originalWidthInches"]')?.focus();
}

function applyToTireComparisonForm(setup: SavedSetup): void {
  const form = document.querySelector<HTMLFormElement>('[data-calculator="tire-comparison"]');
  if (!form) return;
  setFieldValue(form, 'new-widthMm', String(setup.setup.tire.widthMm));
  setFieldValue(form, 'new-aspectRatio', String(setup.setup.tire.aspectRatio));
  setFieldValue(form, 'new-rimDiameterInches', String(setup.setup.tire.rimDiameterInches));
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.querySelector<HTMLInputElement>('[name="original-widthMm"]')?.focus();
}

function renderEmpty(root: HTMLElement, copy: QuickLoadCopy): void {
  root.replaceChildren();
  const hint = document.createElement('p');
  hint.className = 'garage-quick-load__hint';
  hint.textContent = copy.emptyHint;
  root.append(hint);
  root.hidden = false;
}

function renderPicker(root: HTMLElement, target: QuickLoadTarget, state: GarageState, copy: QuickLoadCopy): void {
  root.replaceChildren();

  const label = document.createElement('p');
  label.className = 'garage-quick-load__label';
  label.textContent = copy.label;

  const row = document.createElement('div');
  row.className = 'garage-quick-load__row';

  const select = document.createElement('select');
  select.className = 'garage-quick-load__select';
  select.setAttribute('aria-label', copy.label);
  for (const setup of state.savedSetups) {
    select.append(new Option(setupLabel(state, setup, copy), setup.id));
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'garage-quick-load__apply';
  button.textContent = copy.apply;
  button.addEventListener('click', () => {
    const setup = state.savedSetups.find((candidate) => candidate.id === select.value);
    if (!setup) return;
    if (target === 'wheel-offset') applyToWheelOffsetForm(setup);
    else applyToTireComparisonForm(setup);
  });

  row.append(select, button);
  root.append(label, row);
  root.hidden = false;
}

export function initializeGarageQuickLoad(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('[data-garage-quick-load]').forEach((root) => {
    const target = root.dataset.gqlTarget as QuickLoadTarget | undefined;
    if (target !== 'wheel-offset' && target !== 'tire-comparison') return;
    const copy = COPY[resolveLocale(root.dataset.gqlLocale)];

    void createBrowserGarageRepository().load().then(({ state }) => {
      if (state.savedSetups.length === 0) renderEmpty(root, copy);
      else renderPicker(root, target, state, copy);
    });
  });
}
