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
    vehicles: 'Référence véhicules (en anglais)', vehiclesHelper: 'Taille de pneu, entraxe et couple par modèle',
    popularHeading: 'Rechercher une taille de pneu', popularKicker: 'RÉFÉRENCE DES DIMENSIONS', popularLead: 'Diamètre, circonférence, dimensions en pouces, équivalences et écart du compteur pour chaque taille.', allSizes: 'Toutes les tailles',
  },
};

export function referenceCopy(locale: EntityLocale) { return COPY[locale]; }

export function referenceLinks(locale: EntityLocale): readonly ReferenceLink[] {
  const c = COPY[locale];
  return Object.freeze([
    { href: entityHubPath('tire-size', locale), title: c.tires, helper: c.tiresHelper },
    { href: entityHubPath('bolt-pattern', locale), title: c.bolts, helper: c.boltsHelper },
    { href: vehicleHubPath(locale), title: c.vehicles, helper: c.vehiclesHelper },
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
};

/** Tire heights people shop by in the Americas ("33-inch tires"); EN and ES only. */
const HEIGHT_SHORTCUTS: Readonly<Record<EntityLocale, readonly number[]>> = { en: [31, 33, 35, 37], de: [], es: [31, 33, 35], fr: [] };

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
