import { vehicleFitmentData, vehicleMakes, vehiclesByMake, vehicleById, type VehicleFitment } from '../data/vehicle-fitment';
import { indexedVehicleMakes, indexedModelsForMake } from '../data/vehicle-model-index';
import { boltPatternSpacingMm } from '../data/bolt-pattern-geometry';
import { setSummary, renderMetrics } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const UNVERIFIED_PREFIX = 'name:';

interface VehicleFinderText {
  readonly selectMake: string;
  readonly selectModelFirst: string;
  readonly selectModel: string;
  readonly pendingSummary: string;
  readonly summary: (v: VehicleFitment) => string;
  readonly tireSize: string;
  readonly boltPattern: string;
  readonly wheelSize: string;
  readonly centerBore: string;
  readonly torque: string;
  readonly fastener: string;
  readonly lugNut: string;
  readonly wheelBolt: string;
  readonly generation: string;
  readonly confidence: { readonly high: string; readonly medium: string; readonly low: string };
  readonly sourcesLabel: string;
  readonly notesLabel: string;
  readonly disclaimer: string;
  readonly openTireTool: string;
  readonly openBoltTool: string;
  readonly prefilled: string;
  readonly notPrefilled: string;
  readonly unverifiedSummary: (make: string, model: string) => string;
}

const TEXT: Record<'en' | 'de' | 'es', VehicleFinderText> = {
  en: {
    selectMake: 'Select a make',
    selectModelFirst: 'Select a make first',
    selectModel: 'Select a model',
    pendingSummary: 'Pick a make and model to see reference fitment data.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, bolt pattern ${v.boltPattern}.`,
    tireSize: 'OEM tire size',
    boltPattern: 'Bolt pattern',
    wheelSize: 'OEM wheel size',
    centerBore: 'Center bore',
    torque: 'Wheel torque',
    fastener: 'Fastener type',
    lugNut: 'Lug nut',
    wheelBolt: 'Wheel bolt',
    generation: 'Generation / years',
    confidence: { high: 'High confidence', medium: 'Medium confidence — cross-check before use', low: 'Low confidence — verify before use' },
    sourcesLabel: 'Sources:',
    notesLabel: 'Note:',
    disclaimer: 'Reference data, not a manufacturer feed — always confirm against your own vehicle’s manual or door-jamb sticker before buying parts or torquing wheels.',
    openTireTool: 'Open in Tire Size Calculator',
    openBoltTool: 'Open in Bolt Pattern Calculator',
    prefilled: 'Prefilled from this vehicle',
    notPrefilled: 'Enter your own size',
    unverifiedSummary: (make: string, model: string): string => `We don't have a verified reference fitment for the ${make} ${model} yet — check your door-jamb sticker or owner's manual and enter the size directly below.`,
  },
  de: {
    selectMake: 'Marke auswählen',
    selectModelFirst: 'Zuerst eine Marke auswählen',
    selectModel: 'Modell auswählen',
    pendingSummary: 'Wählen Sie Marke und Modell, um Referenzwerte zur Bereifung zu sehen.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, Lochkreis ${v.boltPattern}.`,
    tireSize: 'Werksseitige Reifengröße',
    boltPattern: 'Lochkreis',
    wheelSize: 'Werksseitige Felgengröße',
    centerBore: 'Nabenbohrung',
    torque: 'Anzugsdrehmoment',
    fastener: 'Befestigungsart',
    lugNut: 'Radmutter',
    wheelBolt: 'Radschraube',
    generation: 'Generation / Baujahre',
    confidence: { high: 'Hohe Verlässlichkeit', medium: 'Mittlere Verlässlichkeit — vor Nutzung gegenprüfen', low: 'Geringe Verlässlichkeit — vor Nutzung prüfen' },
    sourcesLabel: 'Quellen:',
    notesLabel: 'Hinweis:',
    disclaimer: 'Referenzdaten, keine Herstellerdatenbank — prüfen Sie vor Teilekauf oder dem Anziehen der Räder immer das Handbuch oder den Aufkleber an der Fahrertür Ihres Fahrzeugs.',
    openTireTool: 'Im Reifengrößen-Rechner öffnen',
    openBoltTool: 'Im Lochkreis-Rechner öffnen',
    prefilled: 'Aus diesem Fahrzeug vorausgefüllt',
    notPrefilled: 'Eigene Größe eingeben',
    unverifiedSummary: (make: string, model: string): string => `Für den ${make} ${model} haben wir noch keine geprüfte Referenz-Bereifung — prüfen Sie den Aufkleber an der Fahrertür oder das Handbuch und geben Sie die Größe unten direkt ein.`,
  },
  es: {
    selectMake: 'Seleccione una marca',
    selectModelFirst: 'Seleccione primero una marca',
    selectModel: 'Seleccione un modelo',
    pendingSummary: 'Elija una marca y un modelo para ver los datos de referencia.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, patrón de birlos ${v.boltPattern}.`,
    tireSize: 'Medida de neumático OEM',
    boltPattern: 'Patrón de birlos',
    wheelSize: 'Medida de llanta OEM',
    centerBore: 'Diámetro de buje',
    torque: 'Par de apriete',
    fastener: 'Tipo de fijación',
    lugNut: 'Tuerca de rueda',
    wheelBolt: 'Birlo de rueda',
    generation: 'Generación / años',
    confidence: { high: 'Confianza alta', medium: 'Confianza media — verifique antes de usar', low: 'Confianza baja — verifique antes de usar' },
    sourcesLabel: 'Fuentes:',
    notesLabel: 'Nota:',
    disclaimer: 'Datos de referencia, no un feed del fabricante — confirme siempre con el manual de su vehículo o la etiqueta del pilar de la puerta antes de comprar piezas o apretar las ruedas.',
    openTireTool: 'Abrir en la Calculadora de Tamaño de Neumático',
    openBoltTool: 'Abrir en la Calculadora de Patrón de Birlos',
    prefilled: 'Rellenado con los datos de este vehículo',
    notPrefilled: 'Introduzca su propia medida',
    unverifiedSummary: (make: string, model: string): string => `Todavía no tenemos una referencia de ajuste verificada para el ${make} ${model} — consulte la etiqueta del pilar de la puerta o el manual del propietario e introduzca la medida directamente abajo.`,
  },
} as const;

function formatTorque(vehicle: VehicleFitment): string {
  if (vehicle.torqueNm === undefined) return '—';
  const lbFt = vehicle.torqueLbFt !== undefined ? ` (${vehicle.torqueLbFt} lb-ft)` : '';
  return `${vehicle.torqueNm} Nm${lbFt}`;
}

export function initializeVehicleFitmentFinder(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="vehicle-finder"]').forEach((form) => {
    const t = TEXT[getPageLocale()];
    const makeSelect = form.querySelector<HTMLSelectElement>('[data-vehicle-make]');
    const modelSelect = form.querySelector<HTMLSelectElement>('[data-vehicle-model]');
    const meta = form.querySelector<HTMLElement>('[data-vehicle-meta]');
    const confidenceEl = form.querySelector<HTMLElement>('[data-vehicle-confidence]');
    const sourcesEl = form.querySelector<HTMLElement>('[data-vehicle-sources]');
    const notesEl = form.querySelector<HTMLElement>('[data-vehicle-notes]');
    const actions = form.querySelector<HTMLElement>('[data-vehicle-actions]');
    const tireLink = form.querySelector<HTMLAnchorElement>('[data-vehicle-tire-link]');
    const boltLink = form.querySelector<HTMLAnchorElement>('[data-vehicle-bolt-link]');
    if (!makeSelect || !modelSelect) return;

    // Make list combines the curated fitment dataset with the broader NHTSA-sourced
    // name index, so a visitor can find and pick their model even when we don't
    // (yet) have a verified tire/bolt-pattern reference for it.
    const allMakes = Object.freeze([...new Set([...vehicleMakes(), ...indexedVehicleMakes()])].sort((a, b) => a.localeCompare(b)));
    makeSelect.replaceChildren(
      new Option(t.selectMake, ''),
      ...allMakes.map((make) => new Option(make, make)),
    );
    modelSelect.replaceChildren(new Option(t.selectModelFirst, ''));
    modelSelect.disabled = true;

    const setPrefilledLabel = (prefilled: boolean): void => {
      const tireSmall = tireLink?.querySelector('small'); if (tireSmall) tireSmall.textContent = prefilled ? t.prefilled : t.notPrefilled;
      const boltSmall = boltLink?.querySelector('small'); if (boltSmall) boltSmall.textContent = prefilled ? t.prefilled : t.notPrefilled;
    };

    const renderEmpty = (): void => {
      setSummary(form, t.pendingSummary, true);
      renderMetrics(form, []);
      if (meta) meta.hidden = true;
      if (actions) actions.hidden = true;
    };

    const renderUnverified = (make: string, model: string): void => {
      setSummary(form, t.unverifiedSummary(make, model), false);
      renderMetrics(form, []);
      if (meta) meta.hidden = true;
      setPrefilledLabel(false);
      if (tireLink) tireLink.href = tireLink.dataset.baseHref ?? '';
      if (boltLink) boltLink.href = boltLink.dataset.baseHref ?? '';
      if (actions) actions.hidden = false;
    };

    const renderVehicle = (vehicle: VehicleFitment): void => {
      setSummary(form, t.summary(vehicle), false);
      renderMetrics(form, [
        [t.generation, vehicle.generation],
        [t.tireSize, vehicle.tireSize],
        [t.boltPattern, vehicle.boltPattern],
        [t.wheelSize, vehicle.wheelSize],
        ...(vehicle.centerBoreMm !== undefined ? [[t.centerBore, `${vehicle.centerBoreMm} mm`] as const] : []),
        [t.torque, formatTorque(vehicle)],
        [t.fastener, vehicle.fastenerType === 'lug-nut' ? t.lugNut : t.wheelBolt],
      ]);
      if (confidenceEl) { confidenceEl.textContent = t.confidence[vehicle.confidence]; confidenceEl.dataset.confidence = vehicle.confidence; }
      if (sourcesEl) sourcesEl.textContent = `${t.sourcesLabel} ${vehicle.sources.join(', ')}`;
      if (notesEl) {
        if (vehicle.notes) { notesEl.hidden = false; notesEl.textContent = `${t.notesLabel} ${vehicle.notes}`; }
        else notesEl.hidden = true;
      }
      if (meta) meta.hidden = false;
      setPrefilledLabel(true);
      if (tireLink) {
        const spacing = vehicle.tireSize.match(/^(\d+)\/(\d+)R(\d+(?:\.\d+)?)/);
        if (spacing) {
          const params = new URLSearchParams({ size: `${spacing[1]}-${spacing[2]}-${spacing[3]}` });
          tireLink.href = `${tireLink.dataset.baseHref ?? ''}?${params.toString()}`;
        }
      }
      if (boltLink) {
        // `spacing` is the hole-to-hole chord the calculator inverts, derived from the bolt
        // pattern via the shared geometry function — never the raw PCD.
        const boltSpacing = boltPatternSpacingMm(vehicle.boltPattern);
        if (boltSpacing === null) boltLink.hidden = true;
        else {
          boltLink.hidden = false;
          const params = new URLSearchParams({ lugs: String(vehicle.lugCount), spacing: boltSpacing.toFixed(2) });
          boltLink.href = `${boltLink.dataset.baseHref ?? ''}?${params.toString()}`;
        }
      }
      if (actions) actions.hidden = false;
    };

    makeSelect.addEventListener('change', () => {
      const make = makeSelect.value;
      renderEmpty();
      if (!make) { modelSelect.replaceChildren(new Option(t.selectModelFirst, '')); modelSelect.disabled = true; return; }
      const verified = vehiclesByMake(make);
      const verifiedModelNames = new Set(verified.map((vehicle) => vehicle.model.toLowerCase()));
      // Name-only entries (no verified fitment yet) fill in the rest of the model list
      // so the make/model picker itself isn't limited to the curated 30 vehicles —
      // only the actual spec lookup is.
      const unverifiedModels = indexedModelsForMake(make).filter((model) => !verifiedModelNames.has(model.toLowerCase()));
      modelSelect.replaceChildren(
        new Option(t.selectModel, ''),
        ...verified.map((vehicle) => new Option(`${vehicle.model} (${vehicle.generation})`, vehicle.id)),
        ...unverifiedModels.map((model) => new Option(model, `${UNVERIFIED_PREFIX}${model}`)),
      );
      modelSelect.disabled = false;
    });

    modelSelect.addEventListener('change', () => {
      const value = modelSelect.value;
      if (value.startsWith(UNVERIFIED_PREFIX)) { renderUnverified(makeSelect.value, value.slice(UNVERIFIED_PREFIX.length)); return; }
      const vehicle = vehicleById(value);
      if (!vehicle) { renderEmpty(); return; }
      renderVehicle(vehicle);
    });

    renderEmpty();
  });
}

// Re-exported so pages/tests can introspect the dataset size without a second import path.
export const vehicleFitmentCount = vehicleFitmentData.length;
