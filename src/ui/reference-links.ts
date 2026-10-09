/**
 * Site-wide links into the reference-data families (tire sizes, bolt patterns, vehicles).
 *
 * These families hold almost every indexable page on the site, so they must be reachable from
 * the global navigation, the footer, the home page and the tire tools — not only from their own
 * child pages. One module owns the labels and URLs so every entry point stays consistent.
 */
import { entityDetailPath, entityHubPath, type EntityLocale } from '../seo/entity-routes';
import { tireSizeByNotation } from '../data/tire-size-catalog';
import { displayTireNotation, tireDiameterGroupPath, tireDiameterGroups, vehicleHubPath } from './entity-page-model';
import { tireSizePageText } from '../content/entity-page-text';

export interface ReferenceLink { readonly href: string; readonly title: string; readonly helper: string; }

const COPY: Readonly<Record<EntityLocale, {
  readonly group: string;
  readonly tires: string; readonly tiresHelper: string;
  readonly bolts: string; readonly boltsHelper: string;
  readonly vehicles: string; readonly vehiclesHelper: string;
  readonly popularHeading: string; readonly popularKicker: string; readonly popularLead: string; readonly allSizes: string;
}>> = {
  en: {
    group: 'REFERENCE DATA',
    tires: 'Tire sizes', tiresHelper: 'Dimensions, inches and alternatives for every size',
    bolts: 'Bolt patterns', boltsHelper: 'PCD, hole spacing and vehicles per pattern',
    vehicles: 'Vehicle fitment', vehiclesHelper: 'Tire size, bolt pattern and torque by model',
    popularHeading: 'Look up a tire size', popularKicker: 'TIRE SIZE REFERENCE', popularLead: 'Diameter, circumference, size in inches, plus/minus sizes and speedometer error for each size.', allSizes: 'All tire sizes',
  },
  de: {
    group: 'REFERENZDATEN',
    tires: 'Reifengrößen', tiresHelper: 'Maße, Abrollumfang und Umrüstgrößen je Größe',
    bolts: 'Lochkreise', boltsHelper: 'Lochkreis, Lochabstand und Fahrzeuge je Muster',
    vehicles: 'Fahrzeug-Referenz', vehiclesHelper: 'Reifengröße, Lochkreis und Drehmoment je Modell',
    popularHeading: 'Reifengröße nachschlagen', popularKicker: 'REIFENGRÖSSEN-REFERENZ', popularLead: 'Durchmesser, Abrollumfang, Maße in Zoll, Umrüstgrößen und Tachoabweichung für jede Größe.', allSizes: 'Alle Reifengrößen',
  },
  es: {
    group: 'DATOS DE REFERENCIA',
    tires: 'Medidas de neumáticos', tiresHelper: 'Dimensiones, pulgadas y equivalencias de cada medida',
    bolts: 'Patrones de birlos', boltsHelper: 'PCD, distancia entre agujeros y vehículos',
    vehicles: 'Referencia de vehículos', vehiclesHelper: 'Medida, patrón de birlos y par por modelo',
    popularHeading: 'Consultar una medida de neumático', popularKicker: 'REFERENCIA DE MEDIDAS', popularLead: 'Diámetro, circunferencia, medidas en pulgadas, equivalencias y error de velocímetro de cada medida.', allSizes: 'Todas las medidas',
  },
  fr: {
    group: 'DONNÉES DE RÉFÉRENCE',
    tires: 'Dimensions de pneus', tiresHelper: 'Diamètre, circonférence et équivalences de chaque taille',
    bolts: 'Entraxes', boltsHelper: 'PCD, écart entre trous et véhicules par entraxe',
    vehicles: 'Référence véhicules', vehiclesHelper: 'Taille de pneu, entraxe et couple par modèle',
    popularHeading: 'Rechercher une taille de pneu', popularKicker: 'RÉFÉRENCE DES DIMENSIONS', popularLead: 'Diamètre, circonférence, dimensions en pouces, équivalences et écart du compteur pour chaque taille.', allSizes: 'Toutes les tailles',
  },
  'it': {
    group: 'DATI DI RIFERIMENTO',
    tires: 'Misure pneumatici', tiresHelper: 'Diametro, circonferenza ed equivalenze di ogni misura',
    bolts: 'Forature', boltsHelper: 'PCD, distanza tra i fori e veicoli per foratura',
    vehicles: 'Riferimento veicoli', vehiclesHelper: 'Misura pneumatici, foratura e coppia per modello',
    popularHeading: 'Cerca una misura pneumatico', popularKicker: 'RIFERIMENTO MISURE PNEUMATICI', popularLead: 'Diametro, circonferenza, dimensioni in pollici, equivalenze e scarto del tachimetro per ogni misura.', allSizes: 'Tutte le misure',
  },
  'pt-br': {
    group: 'DADOS DE REFERÊNCIA',
    tires: 'Medidas de pneus', tiresHelper: 'Diâmetro, circunferência e equivalências de cada medida',
    bolts: 'Furações', boltsHelper: 'PCD, distância entre furos e veículos por furação',
    vehicles: 'Referência de veículos', vehiclesHelper: 'Medida de pneu, furação e torque por modelo',
    popularHeading: 'Buscar uma medida de pneu', popularKicker: 'REFERÊNCIA DE MEDIDAS', popularLead: 'Diâmetro, circunferência, medidas em polegadas, equivalências e desvio do velocímetro para cada medida.', allSizes: 'Todas as medidas',
  },
  'pl': {
    group: 'DANE REFERENCYJNE',
    tires: 'Rozmiary opon', tiresHelper: 'Średnica, obwód i zamienniki każdego rozmiaru',
    bolts: 'Rozstawy śrub', boltsHelper: 'PCD, odstęp otworów i pojazdy dla każdego rozstawu',
    vehicles: 'Baza pojazdów', vehiclesHelper: 'Rozmiar opon, rozstaw śrub i moment dokręcania według modelu',
    popularHeading: 'Wyszukaj rozmiar opony', popularKicker: 'BAZA ROZMIARÓW OPON', popularLead: 'Średnica, obwód, wymiary w calach, zamienniki i odchyłka prędkościomierza dla każdego rozmiaru.', allSizes: 'Wszystkie rozmiary',
  },
  'nl': {
    group: 'REFERENTIEGEGEVENS',
    tires: 'Bandenmaten', tiresHelper: 'Diameter, omtrek en alternatieven voor elke maat',
    bolts: 'Steekmaten', boltsHelper: 'PCD, gatafstand en voertuigen per steekmaat',
    vehicles: 'Voertuigreferentie', vehiclesHelper: 'Bandenmaat, steekmaat en aanhaalmoment per model',
    popularHeading: 'Bandenmaat opzoeken', popularKicker: 'REFERENTIE BANDENMATEN', popularLead: 'Diameter, omtrek, afmetingen in inch, alternatieven en afwijking van de snelheidsmeter voor elke maat.', allSizes: 'Alle maten',
  },
  'tr': {
    group: 'REFERANS VERİLER',
    tires: 'Lastik ebatları', tiresHelper: 'Her ebat için çap, çevre ve muadiller',
    bolts: 'Bijon aralıkları', boltsHelper: 'Her bijon aralığı için PCD, delik arası mesafe ve araçlar',
    vehicles: 'Araç referansı', vehiclesHelper: 'Modele göre lastik ebadı, bijon aralığı ve tork',
    popularHeading: 'Lastik ebadı arayın', popularKicker: 'LASTİK EBADI REFERANSI', popularLead: 'Her ebat için çap, çevre, inç cinsinden ölçüler, muadiller ve kilometre saati sapması.', allSizes: 'Tüm lastik ebatları',
  },
};

export function referenceCopy(locale: EntityLocale) { return COPY[locale]; }

export function referenceLinks(locale: EntityLocale): readonly ReferenceLink[] {
  const c = COPY[locale];
  return Object.freeze([
    { href: entityHubPath('tire-size', locale), title: c.tires, helper: c.tiresHelper },
    { href: entityHubPath('bolt-pattern', locale), title: c.bolts, helper: c.boltsHelper },
    { href: vehicleHubPath(locale), title: c.vehicles, helper: c.vehiclesHelper },
    ...(locale === 'en' ? [{ href: '/cars/', title: 'Car MPG and specs', helper: 'EPA fuel economy by year, bolt pattern and wheel size for 3,000+ models' }] : []),
  ]);
}

/**
 * A short, market-appropriate shortcut list of everyday sizes. These are navigation
 * shortcuts, not a market-share claim: European compact/SUV sizes for DE/ES, North American
 * sedan/SUV/pickup sizes for EN. Only sizes that exist in the catalog are emitted.
 */
const SHORTCUTS: Readonly<Record<EntityLocale, readonly string[]>> = {
  en: ['225/65R17', '235/65R17', '265/70R17', '275/65R18', '215/55R17', '235/45R18', '225/60R18', '205/55R16', '245/65R17', '265/65R18'],
  de: ['205/55R16', '195/65R15', '225/45R17', '205/60R16', '215/65R16', '225/40R18', '215/60R16', '185/65R15', '215/55R17', '235/55R18'],
  es: ['205/55R16', '195/65R15', '225/45R17', '205/60R16', '215/65R16', '185/65R15', '215/60R17', '225/40R18', '195/55R16', '215/55R17'],
  fr: ['205/55R16', '195/65R15', '225/45R17', '205/60R16', '185/65R15', '215/65R16', '225/40R18', '215/55R17', '195/55R16', '235/55R18'],
  it: ['205/55R16', '195/65R15', '225/45R17', '185/65R15', '205/60R16', '215/65R16', '225/40R18', '215/55R17', '175/65R14', '235/55R18'],
  'pt-br': ['175/70R14', '185/65R15', '195/55R15', '205/55R16', '175/65R14', '185/60R15', '195/60R15', '205/60R16', '215/60R17', '225/65R17'],
  pl: ['205/55R16', '195/65R15', '225/45R17', '205/60R16', '215/65R16', '185/65R15', '225/40R18', '215/55R17', '195/55R16', '235/55R18'],
  nl: ['205/55R16', '225/45R17', '195/65R15', '205/60R16', '215/55R17', '225/40R18', '185/65R15', '215/65R16', '235/55R18', '195/55R16'],
  tr: ['205/55R16', '195/65R15', '185/65R15', '215/55R17', '225/45R17', '205/60R16', '215/65R16', '195/55R16', '225/40R18', '235/55R18'],
};

/** Tire heights people shop by in the Americas ("33-inch tires"); EN and ES only. */
const HEIGHT_SHORTCUTS: Readonly<Record<EntityLocale, readonly number[]>> = { en: [31, 33, 35, 37], de: [], es: [31, 33, 35], fr: [], it: [], 'pt-br': [31, 33], pl: [], nl: [], tr: [] };

export function tireSizeShortcuts(locale: EntityLocale): readonly { readonly href: string; readonly label: string }[] {
  const published = new Set(tireDiameterGroups().map((group) => group.inches));
  return Object.freeze([
    ...SHORTCUTS[locale]
      .map((notation) => tireSizeByNotation(notation))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
      .map((entry) => ({
        href: entityDetailPath('tire-size', locale, entry.slug),
        label: displayTireNotation(entry.notation, locale),
      })),
    ...HEIGHT_SHORTCUTS[locale]
      .filter((inches) => published.has(inches))
      .map((inches) => ({ href: tireDiameterGroupPath(inches, locale), label: tireSizePageText[locale].diameter.groupLink(inches) })),
  ]);
}
