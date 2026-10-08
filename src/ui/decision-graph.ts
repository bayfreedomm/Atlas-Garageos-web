import type { VehicleFitment } from '../data/vehicle-fitment';
import { parseTireNotation, tireSizeSlug, type TireSizeEntry } from '../data/tire-size-catalog';
import { boltPatternCatalog, boltPatternSlug, type BoltPatternEntry } from '../data/bolt-pattern-catalog';
import { localizedToolPath } from '../localization/locales';
import { entityDetailPath, type EntityLocale } from '../seo/entity-routes';
import { boltPatternCalculatorHref, tireCalculatorHref, tireComparisonHref, toolLocale, vehicleHubPath } from './entity-page-model';
import { vehicleComparisonHref, vehicleTripHref } from './vehicle-comparison';

export interface DecisionAction { readonly id: string; readonly href: string; readonly title: string; readonly detail: string; }
export interface DecisionGraphModel {
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly actions: readonly DecisionAction[];
  readonly supportingActions?: readonly DecisionAction[];
  readonly caution?: string;
}

type Pair = readonly [string, string];
interface DecisionCopy {
  readonly eyebrow: string; readonly heading: string; readonly support: string;
  readonly intros: { readonly vehicle: string; readonly tire: string; readonly bolt: string; readonly fuel: string };
  readonly vehicle: { readonly tire: Pair; readonly bolt: Pair; readonly compare: Pair; readonly setup: Pair; readonly trip: Pair; readonly tireCalc: Pair; readonly tireCompare: Pair; readonly boltCalc: Pair; readonly fuel: Pair };
  readonly tire: { readonly compare: Pair; readonly calculate: Pair; readonly vehicles: Pair; readonly pcd: Pair; readonly caution: string };
  readonly bolt: { readonly vehicles: Pair; readonly measure: Pair; readonly offset: Pair; readonly setup: Pair; readonly tires: Pair; readonly directory: Pair; readonly caution: string };
  readonly fuel: { readonly cost: Pair; readonly trip: Pair; readonly vehicles: Pair };
}

const COPY: Readonly<Record<EntityLocale, DecisionCopy>> = {
  en: {
    eyebrow: 'Next decisions', heading: 'What to check next', support: 'More direct checks',
    intros: {
      vehicle: 'Move from reference data to the calculation that answers your next question.',
      tire: 'Use the known geometry as a starting point, then compare before making a fitment decision.',
      bolt: 'Use the pattern as one input in a wider wheel-fitment check.',
      fuel: 'Turn the published market price into a cost for your journey.',
    },
    vehicle: {
      tire: ['Open the referenced tire size', 'See diameter, sidewall, circumference and vehicles using it.'],
      bolt: ['Open the bolt pattern / PCD', 'Check lug geometry, center-bore values and vehicles using it.'],
      compare: ['Compare with another vehicle', 'Highlight documented wheel, tire and fitment differences without ranking either vehicle.'],
      setup: ['Compare wheel and tire setup', 'Work through tire, wheel and clearance geometry without a compatibility claim.'],
      trip: ['Estimate a road trip cost', 'Add distance, fuel use, extras and passenger split.'],
      tireCalc: ['Calculate this tire size', 'Open the tire calculator with the reference size prefilled.'],
      tireCompare: ['Compare this tire size', 'Prefill the current size and test another size.'],
      boltCalc: ['Measure this bolt pattern', 'Prefill lug count and adjacent-hole spacing.'],
      fuel: ['Calculate fuel cost', 'Enter real consumption; Atlas does not invent it for this vehicle.'],
    },
    tire: {
      compare: ['Compare this size', 'Compare diameter and speedometer effect with this size prefilled.'],
      calculate: ['Open the size calculator', 'Review the same nominal geometry interactively.'],
      vehicles: ['See vehicles using this size', 'Jump to documented Atlas vehicle entries below.'],
      pcd: ['Move to related PCD context', 'Follow listed vehicles to bolt-pattern and center-bore data.'],
      caution: 'A geometrically similar size is not an approved fitment. Load index, speed rating, rim width, clearance, OEM approval and local regulations still matter.',
    },
    bolt: {
      vehicles: ['See vehicles using this PCD', 'Review documented vehicles and discrete center-bore values.'],
      measure: ['Open the bolt-pattern calculator', 'Use the prefilled lug count and adjacent-hole measurement.'],
      offset: ['Compare wheel width and offset', 'Check inner position and outer poke as separate geometry.'],
      setup: ['Continue to wheel and tire comparison', 'Check the wider setup; matching PCD alone is not enough.'],
      tires: ['See tire sizes in this context', 'Follow documented vehicles to their referenced tire sizes.'],
      directory: ['Open the vehicle reference', 'Start from a documented make and model.'],
      caution: 'PCD match alone does not prove compatibility. Center bore, offset, wheel width, brake clearance, hardware and vehicle-specific requirements may also matter.',
    },
    fuel: {
      cost: ['Calculate fuel cost', 'Use consumption and distance to turn price into journey cost.'],
      trip: ['Calculate a road trip', 'Include route distance, extras and cost per person.'],
      vehicles: ['Start from a documented vehicle', 'Choose a reference, then enter its real-world consumption.'],
    },
  },
  de: {
    eyebrow: 'Nächste Entscheidungen', heading: 'Was Sie als Nächstes prüfen sollten', support: 'Weitere direkte Prüfungen',
    intros: {
      vehicle: 'Nutzen Sie die Referenzdaten als Ausgangspunkt für die nächste konkrete Berechnung.',
      tire: 'Nutzen Sie die bekannte Geometrie als Ausgangspunkt und vergleichen Sie vor einer Fitment-Entscheidung.',
      bolt: 'Behandeln Sie den Lochkreis als einen Baustein einer umfassenderen Radprüfung.',
      fuel: 'Machen Sie aus dem veröffentlichten Marktpreis konkrete Fahrtkosten.',
    },
    vehicle: {
      tire: ['Referenz-Reifengröße öffnen', 'Durchmesser, Flankenhöhe, Umfang und Fahrzeuge mit dieser Größe ansehen.'],
      bolt: ['Lochkreis / PCD öffnen', 'Lochgeometrie, Nabenbohrungen und weitere Fahrzeuge prüfen.'],
      compare: ['Mit einem anderen Fahrzeug vergleichen', 'Belegte Rad-, Reifen- und Fitment-Unterschiede ohne Rangliste hervorheben.'],
      setup: ['Rad- und Reifensetup vergleichen', 'Reifen-, Felgen- und Freiganggeometrie ohne Kompatibilitätsversprechen prüfen.'],
      trip: ['Fahrtkosten berechnen', 'Strecke, Verbrauch, Extras und Kosten pro Person eingeben.'],
      tireCalc: ['Diese Reifengröße berechnen', 'Reifenrechner mit der Referenzgröße vorausgefüllt öffnen.'],
      tireCompare: ['Diese Reifengröße vergleichen', 'Aktuelle Größe vorausfüllen und eine Alternative testen.'],
      boltCalc: ['Diesen Lochkreis messen', 'Lochzahl und benachbarten Lochabstand vorausfüllen.'],
      fuel: ['Kraftstoffkosten berechnen', 'Realen Verbrauch eingeben; Atlas erfindet keinen Fahrzeugverbrauch.'],
    },
    tire: {
      compare: ['Diese Größe vergleichen', 'Durchmesser und Tachoabweichung mit vorausgefüllter Größe vergleichen.'],
      calculate: ['Reifengrößen-Rechner öffnen', 'Dieselbe Nenngeometrie interaktiv prüfen.'],
      vehicles: ['Fahrzeuge mit dieser Größe ansehen', 'Zu den dokumentierten Atlas-Fahrzeugeinträgen springen.'],
      pcd: ['Zum zugehörigen Lochkreis-Kontext', 'Über die Fahrzeuge zu Lochkreis- und Nabenbohrungsdaten wechseln.'],
      caution: 'Eine geometrisch ähnliche Größe ist keine Freigabe. Tragfähigkeitsindex, Geschwindigkeitsindex, Felgenbreite, Freigang, Herstellerfreigabe und lokale Vorschriften bleiben entscheidend.',
    },
    bolt: {
      vehicles: ['Fahrzeuge mit diesem Lochkreis', 'Dokumentierte Fahrzeuge und diskrete Nabenbohrungen prüfen.'],
      measure: ['Lochkreis-Rechner öffnen', 'Lochzahl und benachbarten Lochabstand vorausgefüllt verwenden.'],
      offset: ['Felgenbreite und ET vergleichen', 'Innere Position und äußeren Überstand getrennt berechnen.'],
      setup: ['Zum Rad- und Reifenvergleich', 'Das gesamte Setup prüfen; gleicher Lochkreis allein reicht nicht.'],
      tires: ['Reifengrößen im Fahrzeugkontext', 'Über dokumentierte Fahrzeuge zu ihren Referenzgrößen wechseln.'],
      directory: ['Fahrzeug-Referenz öffnen', 'Mit einer dokumentierten Marke und einem Modell beginnen.'],
      caution: 'Ein passender Lochkreis beweist keine Kompatibilität. Nabenbohrung, ET, Felgenbreite, Bremsfreigang, Befestigung und fahrzeugspezifische Anforderungen können ebenfalls entscheidend sein.',
    },
    fuel: {
      cost: ['Kraftstoffkosten berechnen', 'Preis mit Verbrauch und Strecke in Fahrtkosten umrechnen.'],
      trip: ['Reisekosten berechnen', 'Strecke, Extras und Kosten pro Person einbeziehen.'],
      vehicles: ['Mit einem dokumentierten Fahrzeug starten', 'Fahrzeugreferenz wählen und realen Verbrauch eingeben.'],
    },
  },
  es: {
    eyebrow: 'Siguientes decisiones', heading: 'Qué comprobar a continuación', support: 'Otras comprobaciones directas',
    intros: {
      vehicle: 'Pase de los datos de referencia al cálculo que responde a su siguiente pregunta.',
      tire: 'Use la geometría conocida como punto de partida y compare antes de decidir un ajuste.',
      bolt: 'Trate el patrón como un dato dentro de una comprobación de llanta más amplia.',
      fuel: 'Convierta el precio publicado del mercado en el coste de su trayecto.',
    },
    vehicle: {
      tire: ['Abrir la medida de referencia', 'Ver diámetro, flanco, circunferencia y vehículos que la usan.'],
      bolt: ['Abrir el patrón / PCD', 'Comprobar geometría, bujes y otros vehículos que lo usan.'],
      compare: ['Comparar con otro vehículo', 'Destacar diferencias documentadas de ruedas, neumáticos y ajuste sin clasificarlos.'],
      setup: ['Comparar llanta y neumático', 'Revisar geometría de neumático, llanta y holgura sin prometer compatibilidad.'],
      trip: ['Estimar el coste de un viaje', 'Añadir distancia, consumo, extras y reparto entre pasajeros.'],
      tireCalc: ['Calcular esta medida', 'Abrir la calculadora con la medida de referencia precargada.'],
      tireCompare: ['Comparar esta medida', 'Precargar la medida actual y probar otra.'],
      boltCalc: ['Medir este patrón', 'Precargar número de birlos y distancia entre orificios adyacentes.'],
      fuel: ['Calcular coste de combustible', 'Introducir consumo real; Atlas no lo inventa para este vehículo.'],
    },
    tire: {
      compare: ['Comparar esta medida', 'Comparar diámetro y efecto en el velocímetro con la medida precargada.'],
      calculate: ['Abrir la calculadora de medida', 'Revisar la misma geometría nominal de forma interactiva.'],
      vehicles: ['Ver vehículos que usan esta medida', 'Saltar a las entradas documentadas de Atlas.'],
      pcd: ['Ir al contexto de PCD relacionado', 'Seguir los vehículos hasta datos de patrón y diámetro de buje.'],
      caution: 'Una medida geométricamente similar no es un ajuste aprobado. Índice de carga, código de velocidad, ancho de llanta, holgura, aprobación OEM y normativa local siguen siendo decisivos.',
    },
    bolt: {
      vehicles: ['Ver vehículos que usan este PCD', 'Revisar vehículos documentados y diámetros de buje discretos.'],
      measure: ['Abrir la calculadora de patrón', 'Usar número de birlos y distancia adyacente precargados.'],
      offset: ['Comparar ancho y offset de llanta', 'Calcular por separado posición interior y salida exterior.'],
      setup: ['Continuar a comparación de llanta y neumático', 'Comprobar el conjunto; coincidir en PCD no basta.'],
      tires: ['Ver medidas en este contexto', 'Seguir vehículos documentados hasta sus medidas de referencia.'],
      directory: ['Abrir la referencia de vehículos', 'Partir de una marca y un modelo documentados.'],
      caution: 'Coincidir en PCD no demuestra compatibilidad. Diámetro de buje, offset, ancho, holgura de frenos, fijaciones y requisitos del vehículo también pueden importar.',
    },
    fuel: {
      cost: ['Calcular coste de combustible', 'Convertir precio, consumo y distancia en coste del trayecto.'],
      trip: ['Calcular un viaje', 'Incluir distancia, extras y coste por persona.'],
      vehicles: ['Partir de un vehículo documentado', 'Elegir una referencia e introducir su consumo real.'],
    },
  },
  fr: {
    eyebrow: 'Étapes suivantes', heading: 'Que vérifier ensuite', support: 'Autres vérifications',
    intros: {
      vehicle: 'Passez des données de référence au calcul qui répond à votre prochaine question.',
      tire: 'Partez de la géométrie connue, puis comparez avant toute décision de montage.',
      bolt: 'Traitez l’entraxe comme un élément d’une vérification de jante plus large.',
      fuel: 'Transformez le prix publié en coût pour votre trajet.',
    },
    vehicle: {
      tire: ['Ouvrir la taille de référence', 'Diamètre, flanc, circonférence et véhicules qui l’utilisent.'],
      bolt: ['Ouvrir l’entraxe / PCD', 'Géométrie des trous, alésages et autres véhicules.'],
      compare: ['Comparer avec un autre véhicule (en anglais)', 'Différences documentées de roues et de pneus, sans classement.'],
      setup: ['Comparer jante et pneu (en anglais)', 'Géométrie pneu, jante et dégagement, sans promesse de compatibilité.'],
      trip: ['Estimer le coût d’un trajet (en anglais)', 'Distance, consommation, extras et partage entre passagers.'],
      tireCalc: ['Calculer cette taille (en anglais)', 'Ouvrir le calculateur prérempli avec la taille de référence.'],
      tireCompare: ['Comparer cette taille (en anglais)', 'Préremplir la taille actuelle et en tester une autre.'],
      boltCalc: ['Mesurer cet entraxe (en anglais)', 'Préremplir le nombre de trous et l’écart entre deux trous.'],
      fuel: ['Calculer le coût en carburant (en anglais)', 'Saisissez votre consommation réelle ; Atlas ne l’invente pas.'],
    },
    tire: {
      compare: ['Comparer cette taille (en anglais)', 'Diamètre et effet sur le compteur, taille préremplie.'],
      calculate: ['Ouvrir le calculateur de taille (en anglais)', 'La même géométrie nominale, en interactif.'],
      vehicles: ['Voir les véhicules avec cette taille', 'Aller aux véhicules documentés par Atlas ci-dessous.'],
      pcd: ['Voir les entraxes associés', 'Suivre les véhicules vers leurs entraxes et alésages.'],
      caution: 'Une taille géométriquement proche n’est pas une monte homologuée. Indice de charge, indice de vitesse, largeur de jante, dégagement, homologation constructeur et réglementation locale restent décisifs.',
    },
    bolt: {
      vehicles: ['Voir les véhicules avec cet entraxe', 'Véhicules documentés et alésages centraux.'],
      measure: ['Ouvrir le calculateur d’entraxe (en anglais)', 'Nombre de trous et écart entre trous préremplis.'],
      offset: ['Comparer largeur de jante et déport (en anglais)', 'Position intérieure et débord extérieur calculés séparément.'],
      setup: ['Comparer jante et pneu (en anglais)', 'Vérifier l’ensemble ; un même entraxe ne suffit pas.'],
      tires: ['Voir les tailles de pneus associées', 'Suivre les véhicules documentés vers leurs tailles d’origine.'],
      directory: ['Ouvrir la référence véhicules (en anglais)', 'Partir d’une marque et d’un modèle documentés.'],
      caution: 'Un entraxe identique ne prouve pas la compatibilité. Alésage, déport, largeur de jante, dégagement des freins, visserie et exigences du véhicule comptent aussi.',
    },
    fuel: {
      cost: ['Calculer le coût en carburant', 'Prix, consommation et distance en coût de trajet.'],
      trip: ['Calculer un trajet', 'Distance, extras et coût par personne.'],
      vehicles: ['Partir d’un véhicule documenté', 'Choisir une référence puis saisir sa consommation réelle.'],
    },
  },
};

const makeAction = (id: string, href: string, text: Pair): DecisionAction => Object.freeze({ id, href, title: text[0], detail: text[1] });

// The Fitment Studio flagship app keeps the same unprefixed slug in every locale (unlike
// calculators, which get a fully localized slug from localizedToolPath), so it needs its own
// locale-prefix-only path here rather than a bare '/fitment-studio/'.
const fitmentStudioHref = (locale: EntityLocale): string => (locale === 'en' || locale === 'fr' ? '/fitment-studio/' : `/${locale}/fitment-studio/`);

function tireEntryForVehicle(vehicle: VehicleFitment): TireSizeEntry {
  const parsed = parseTireNotation(vehicle.tireSize);
  if (!parsed) throw new Error(`No tire-size entity for vehicle ${vehicle.id}: ${vehicle.tireSize}`);
  return Object.freeze({ notation: vehicle.tireSize, slug: tireSizeSlug(vehicle.tireSize), ...parsed });
}

export function vehicleDecisionGraph(vehicle: VehicleFitment, locale: EntityLocale): DecisionGraphModel {
  const copy = COPY[locale];
  const tire = tireEntryForVehicle(vehicle);
  const bolt = boltPatternCatalog.find((entry) => entry.notation === vehicle.boltPattern);
  if (!bolt) throw new Error(`No bolt-pattern entity for vehicle ${vehicle.id}: ${vehicle.boltPattern}`);
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: copy.intros.vehicle,
    actions: Object.freeze([
      makeAction('vehicle-tire', entityDetailPath('tire-size', locale, tire.slug), copy.vehicle.tire),
      makeAction('vehicle-bolt', entityDetailPath('bolt-pattern', locale, boltPatternSlug(vehicle.boltPattern)), copy.vehicle.bolt),
      makeAction('vehicle-compare', vehicleComparisonHref(locale, vehicle.id), copy.vehicle.compare),
      makeAction('vehicle-setup', fitmentStudioHref(locale), copy.vehicle.setup),
      makeAction('vehicle-trip', vehicleTripHref(locale, vehicle.id), copy.vehicle.trip),
    ]),
    supportingActions: Object.freeze([
      makeAction('vehicle-tire-calculator', tireCalculatorHref(locale, tire), copy.vehicle.tireCalc),
      makeAction('vehicle-tire-compare', tireComparisonHref(locale, tire), copy.vehicle.tireCompare),
      makeAction('vehicle-bolt-calculator', boltPatternCalculatorHref(locale, bolt), copy.vehicle.boltCalc),
      makeAction('vehicle-fuel-cost', localizedToolPath(toolLocale(locale), 'fuel-cost-calculator', 'tool'), copy.vehicle.fuel),
    ]),
  });
}

export function tireDecisionGraph(entry: TireSizeEntry, locale: EntityLocale): DecisionGraphModel {
  const copy = COPY[locale];
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: copy.intros.tire,
    actions: Object.freeze([
      makeAction('tire-compare', tireComparisonHref(locale, entry), copy.tire.compare),
      makeAction('tire-calculate', tireCalculatorHref(locale, entry), copy.tire.calculate),
      makeAction('tire-vehicles', '#entity-vehicles', copy.tire.vehicles),
      makeAction('tire-pcd', '#entity-related', copy.tire.pcd),
    ]),
    caution: copy.tire.caution,
  });
}

export function boltDecisionGraph(entry: BoltPatternEntry, locale: EntityLocale): DecisionGraphModel {
  const copy = COPY[locale];
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: copy.intros.bolt,
    actions: Object.freeze([
      makeAction('bolt-vehicles', '#entity-vehicles', copy.bolt.vehicles),
      makeAction('bolt-measure', boltPatternCalculatorHref(locale, entry), copy.bolt.measure),
      makeAction('bolt-offset', localizedToolPath(toolLocale(locale), 'wheel-offset-calculator', 'tool'), copy.bolt.offset),
      makeAction('bolt-setup', fitmentStudioHref(locale), copy.bolt.setup),
    ]),
    supportingActions: Object.freeze([
      makeAction('bolt-tires', '#entity-related', copy.bolt.tires),
      makeAction('bolt-vehicle-directory', vehicleHubPath(locale), copy.bolt.directory),
    ]),
    caution: copy.bolt.caution,
  });
}

export function fuelDecisionGraph(locale: EntityLocale, note: string): DecisionGraphModel {
  const copy = COPY[locale];
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: `${copy.intros.fuel} ${note}`,
    actions: Object.freeze([
      makeAction('fuel-cost', localizedToolPath(toolLocale(locale), 'fuel-cost-calculator', 'tool'), copy.fuel.cost),
      makeAction('fuel-trip', localizedToolPath(toolLocale(locale), 'road-trip-cost-calculator', 'tool'), copy.fuel.trip),
      makeAction('fuel-vehicle', vehicleHubPath(locale), copy.fuel.vehicles),
    ]),
  });
}

export const decisionSupportingLabel = (locale: EntityLocale): string => COPY[locale].support;
