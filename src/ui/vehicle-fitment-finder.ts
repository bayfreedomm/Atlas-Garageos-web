import { vehicleFitmentData, vehicleMakes, vehiclesByMake, vehicleById, vehicleNote, type VehicleFitment } from '../data/vehicle-fitment';
import { indexedVehicleMakes, indexedModelsForMake } from '../data/vehicle-model-index';
import { boltPatternSpacingMm } from '../data/bolt-pattern-geometry';
import { setSummary, renderMetrics } from './standard-answer-helpers';
import { getPageLocale, type UiLocale } from './page-locale';
import { formatPlain } from './locale-format';
import { torquePresentation, type TorqueLocale } from './vehicle-torque';

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
  readonly optionalSizes: string;
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

const TEXT: Record<UiLocale, VehicleFinderText> = {
  en: {
    selectMake: 'Select a make',
    selectModelFirst: 'Select a make first',
    selectModel: 'Select a model',
    pendingSummary: 'Pick a make and model to see reference fitment data.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, bolt pattern ${v.boltPattern}.`,
    tireSize: 'Referenced tire size',
    boltPattern: 'Bolt pattern',
    wheelSize: 'Referenced wheel size',
    centerBore: 'Center bore',
    optionalSizes: 'Factory option sizes',
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
    unverifiedSummary: (make: string, model: string): string => `We don't have a documented Atlas fitment entry for the ${make} ${model} yet — check your door-jamb sticker or owner's manual and enter the size directly below.`,
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
    optionalSizes: 'Werksoptionale Größen',
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
    unverifiedSummary: (make: string, model: string): string => `Für den ${make} ${model} hat Atlas noch keinen dokumentierten Referenzeintrag — prüfen Sie den Aufkleber an der Fahrertür oder das Handbuch und geben Sie die Größe unten direkt ein.`,
  },
  es: {
    selectMake: 'Seleccione una marca',
    selectModelFirst: 'Seleccione primero una marca',
    selectModel: 'Seleccione un modelo',
    pendingSummary: 'Elija una marca y un modelo para ver los datos de referencia.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, patrón de birlos ${v.boltPattern}.`,
    tireSize: 'Medida de neumático de referencia',
    boltPattern: 'Patrón de birlos',
    wheelSize: 'Medida de llanta de referencia',
    centerBore: 'Diámetro de buje',
    optionalSizes: 'Medidas opcionales',
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
    unverifiedSummary: (make: string, model: string): string => `Atlas todavía no tiene una entrada de ajuste documentada para el ${make} ${model} — consulte la etiqueta del pilar de la puerta o el manual e introduzca la medida directamente abajo.`,
  },
  fr: {
    selectMake: 'Choisissez une marque',
    selectModelFirst: 'Choisissez d’abord une marque',
    selectModel: 'Choisissez un modèle',
    pendingSummary: 'Choisissez une marque et un modèle pour voir les données de montage de référence.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, entraxe ${v.boltPattern}.`,
    tireSize: 'Taille de pneu de référence',
    boltPattern: 'Entraxe (PCD)',
    wheelSize: 'Taille de jante de référence',
    centerBore: 'Alésage central',
    optionalSizes: 'Tailles proposées en option d’usine',
    torque: 'Couple de serrage des roues',
    fastener: 'Type de fixation',
    lugNut: 'Écrou de roue',
    wheelBolt: 'Boulon de roue',
    generation: 'Génération / années',
    confidence: { high: 'Fiabilité élevée', medium: 'Fiabilité moyenne — à recouper avant usage', low: 'Fiabilité faible — à vérifier avant usage' },
    sourcesLabel: 'Sources :',
    notesLabel: 'Remarque :',
    disclaimer: 'Données de référence, pas un flux du constructeur — vérifiez toujours dans le manuel de votre véhicule ou sur l’étiquette du montant de porte avant d’acheter des pièces ou de serrer vos roues.',
    openTireTool: 'Ouvrir dans le calculateur de taille de pneus',
    openBoltTool: 'Ouvrir dans le calculateur d’entraxe',
    prefilled: 'Prérempli avec ce véhicule',
    notPrefilled: 'Saisissez votre propre taille',
    unverifiedSummary: (make: string, model: string): string => `Atlas n’a pas encore de fiche de montage documentée pour ${make} ${model} — consultez l’étiquette du montant de porte ou le manuel du propriétaire et saisissez la taille directement ci-dessous.`,
  },
  it: {
    selectMake: 'Seleziona una marca',
    selectModelFirst: 'Seleziona prima una marca',
    selectModel: 'Seleziona un modello',
    pendingSummary: 'Scegli marca e modello per vedere i dati di montaggio di riferimento.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, foratura ${v.boltPattern}.`,
    tireSize: 'Misura pneumatico di riferimento',
    boltPattern: 'Foratura (PCD)',
    wheelSize: 'Misura cerchio di riferimento',
    centerBore: 'Foro centrale',
    optionalSizes: 'Misure optional di fabbrica',
    torque: 'Coppia di serraggio ruote',
    fastener: 'Tipo di fissaggio',
    lugNut: 'Dado ruota',
    wheelBolt: 'Bullone ruota',
    generation: 'Generazione / anni',
    confidence: { high: 'Affidabilità alta', medium: 'Affidabilità media — verifica incrociata prima dell’uso', low: 'Affidabilità bassa — verifica prima dell’uso' },
    sourcesLabel: 'Fonti:',
    notesLabel: 'Nota:',
    disclaimer: 'Dati di riferimento, non un database del costruttore: controlla sempre il libretto del tuo veicolo o l’etichetta sul montante della portiera prima di acquistare ricambi o serrare le ruote.',
    openTireTool: 'Apri nel calcolatore misure pneumatici',
    openBoltTool: 'Apri nel calcolatore foratura cerchi',
    prefilled: 'Precompilato da questo veicolo',
    notPrefilled: 'Inserisci la tua misura',
    unverifiedSummary: (make: string, model: string): string => `Atlas non ha ancora una scheda di montaggio documentata per ${make} ${model}: controlla l’etichetta sul montante della portiera o il libretto e inserisci la misura direttamente qui sotto.`,
  },
  'pt-br': {
    selectMake: 'Selecione uma marca',
    selectModelFirst: 'Selecione uma marca primeiro',
    selectModel: 'Selecione um modelo',
    pendingSummary: 'Escolha marca e modelo para ver os dados de referência de rodas e pneus.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, furação ${v.boltPattern}.`,
    tireSize: 'Medida de pneu de referência',
    boltPattern: 'Furação (PCD)',
    wheelSize: 'Medida de roda de referência',
    centerBore: 'Furo central',
    optionalSizes: 'Medidas opcionais de fábrica',
    torque: 'Torque das rodas',
    fastener: 'Tipo de fixação',
    lugNut: 'Porca de roda',
    wheelBolt: 'Parafuso de roda',
    generation: 'Geração / anos',
    confidence: { high: 'Confiabilidade alta', medium: 'Confiabilidade média — confira antes de usar', low: 'Confiabilidade baixa — verifique antes de usar' },
    sourcesLabel: 'Fontes:',
    notesLabel: 'Observação:',
    disclaimer: 'Dados de referência, não uma base oficial da montadora — sempre confira no manual do seu veículo ou na etiqueta da coluna da porta antes de comprar peças ou apertar as rodas.',
    openTireTool: 'Abrir na calculadora de tamanho de pneus',
    openBoltTool: 'Abrir na calculadora de furação',
    prefilled: 'Preenchido com os dados deste veículo',
    notPrefilled: 'Digite sua própria medida',
    unverifiedSummary: (make: string, model: string): string => `A Atlas ainda não tem um registro de aplicação documentado para o ${make} ${model} — confira a etiqueta da coluna da porta ou o manual do proprietário e digite a medida diretamente abaixo.`,
  },
  pl: {
    selectMake: 'Wybierz markę',
    selectModelFirst: 'Najpierw wybierz markę',
    selectModel: 'Wybierz model',
    pendingSummary: 'Wybierz markę i model, aby zobaczyć referencyjne dane dopasowania.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, rozstaw śrub ${v.boltPattern}.`,
    tireSize: 'Referencyjny rozmiar opony',
    boltPattern: 'Rozstaw śrub (PCD)',
    wheelSize: 'Referencyjny rozmiar felgi',
    centerBore: 'Otwór centralny',
    optionalSizes: 'Fabryczne rozmiary opcjonalne',
    torque: 'Moment dokręcania kół',
    fastener: 'Rodzaj mocowania',
    lugNut: 'Nakrętka koła',
    wheelBolt: 'Śruba koła',
    generation: 'Generacja / lata',
    confidence: { high: 'Wysoka wiarygodność', medium: 'Średnia wiarygodność — porównaj przed użyciem', low: 'Niska wiarygodność — sprawdź przed użyciem' },
    sourcesLabel: 'Źródła:',
    notesLabel: 'Uwaga:',
    disclaimer: 'Dane referencyjne, a nie baza producenta — przed zakupem części lub dokręceniem kół zawsze sprawdź instrukcję pojazdu albo naklejkę na słupku drzwi.',
    openTireTool: 'Otwórz w kalkulatorze rozmiaru opon',
    openBoltTool: 'Otwórz w kalkulatorze rozstawu śrub',
    prefilled: 'Uzupełnione danymi tego pojazdu',
    notPrefilled: 'Wpisz własny rozmiar',
    unverifiedSummary: (make: string, model: string): string => `Atlas nie ma jeszcze udokumentowanych danych dopasowania dla ${make} ${model} — sprawdź naklejkę na słupku drzwi lub instrukcję obsługi i wpisz rozmiar bezpośrednio poniżej.`,
  },
  nl: {
    selectMake: 'Kies een merk',
    selectModelFirst: 'Kies eerst een merk',
    selectModel: 'Kies een model',
    pendingSummary: 'Kies een merk en model om de referentiegegevens voor velgen en banden te zien.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, steekmaat ${v.boltPattern}.`,
    tireSize: 'Referentiebandenmaat',
    boltPattern: 'Steekmaat (PCD)',
    wheelSize: 'Referentievelgmaat',
    centerBore: 'Naafgat',
    optionalSizes: 'Optionele fabrieksmaten',
    torque: 'Aanhaalmoment wielen',
    fastener: 'Type bevestiging',
    lugNut: 'Wielmoer',
    wheelBolt: 'Wielbout',
    generation: 'Generatie / bouwjaren',
    confidence: { high: 'Hoge betrouwbaarheid', medium: 'Gemiddelde betrouwbaarheid — controleer vóór gebruik', low: 'Lage betrouwbaarheid — verifieer vóór gebruik' },
    sourcesLabel: 'Bronnen:',
    notesLabel: 'Let op:',
    disclaimer: 'Referentiegegevens, geen fabrieksdatabase — controleer altijd het instructieboekje of de sticker in de deurstijl van je auto voordat je onderdelen koopt of wielen aanhaalt.',
    openTireTool: 'Openen in de bandenmaatcalculator',
    openBoltTool: 'Openen in de steekmaatcalculator',
    prefilled: 'Vooraf ingevuld met deze auto',
    notPrefilled: 'Vul je eigen maat in',
    unverifiedSummary: (make: string, model: string): string => `Atlas heeft nog geen gedocumenteerde maatgegevens voor de ${make} ${model} — kijk op de sticker in de deurstijl of in het instructieboekje en vul de maat hieronder direct in.`,
  },
  tr: {
    selectMake: 'Marka seçin',
    selectModelFirst: 'Önce bir marka seçin',
    selectModel: 'Model seçin',
    pendingSummary: 'Referans jant ve lastik verilerini görmek için marka ve model seçin.',
    summary: (v: VehicleFitment): string => `${v.make} ${v.model} — ${v.tireSize}, bijon aralığı ${v.boltPattern}.`,
    tireSize: 'Referans lastik ebadı',
    boltPattern: 'Bijon aralığı (PCD)',
    wheelSize: 'Referans jant ölçüsü',
    centerBore: 'Göbek çapı',
    optionalSizes: 'Fabrika opsiyonu ebatlar',
    torque: 'Bijon sıkma torku',
    fastener: 'Bağlantı tipi',
    lugNut: 'Bijon somunu',
    wheelBolt: 'Bijon cıvatası',
    generation: 'Nesil / yıllar',
    confidence: { high: 'Yüksek güvenilirlik', medium: 'Orta güvenilirlik — kullanmadan önce karşılaştırın', low: 'Düşük güvenilirlik — kullanmadan önce doğrulayın' },
    sourcesLabel: 'Kaynaklar:',
    notesLabel: 'Not:',
    disclaimer: 'Referans veridir, üretici veri akışı değildir — parça almadan veya bijonları sıkmadan önce mutlaka aracınızın kullanım kılavuzunu ya da kapı direğindeki etiketi kontrol edin.',
    openTireTool: 'Lastik ebadı hesaplayıcıda aç',
    openBoltTool: 'Bijon aralığı hesaplayıcıda aç',
    prefilled: 'Bu araçtan otomatik dolduruldu',
    notPrefilled: 'Kendi ebadınızı girin',
    unverifiedSummary: (make: string, model: string): string => `Atlas’ta ${make} ${model} için henüz belgelenmiş bir uyumluluk kaydı yok — kapı direğindeki etikete veya kullanım kılavuzuna bakın ve ebadı doğrudan aşağıya girin.`,
  },
} as const;

function formatTorque(vehicle: VehicleFitment, locale: TorqueLocale): string {
  const torque = torquePresentation(vehicle, locale);
  return torque.qualifier ? `${torque.value} — ${torque.qualifier}` : torque.value;
}

export function initializeVehicleFitmentFinder(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="vehicle-finder"]').forEach((form) => {
    const locale = getPageLocale();
    const t = TEXT[locale];
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
        ...(vehicle.centerBoreMm !== undefined ? [[t.centerBore, `${formatPlain(vehicle.centerBoreMm, locale)} mm`] as const] : []),
        ...(vehicle.optionalTireSizes && vehicle.optionalTireSizes.length > 0 ? [[t.optionalSizes, vehicle.optionalTireSizes.join(', ')] as const] : []),
        [t.torque, formatTorque(vehicle, locale)],
        [t.fastener, vehicle.fastenerType === 'lug-nut' ? t.lugNut : t.wheelBolt],
      ]);
      if (confidenceEl) { confidenceEl.textContent = t.confidence[vehicle.confidence]; confidenceEl.dataset.confidence = vehicle.confidence; }
      if (sourcesEl) sourcesEl.textContent = `${t.sourcesLabel} ${vehicle.sources.join(', ')}`;
      if (notesEl) {
        const note = vehicleNote(vehicle, locale);
        if (note) { notesEl.hidden = false; notesEl.textContent = `${t.notesLabel} ${note}`; }
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
