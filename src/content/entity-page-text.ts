/**
 * All translated copy for the tire-size and bolt-pattern entity pages (EN/DE/ES).
 *
 * Numbers are never translated — they are computed once from the shared geometry helpers and
 * rendered identically in every locale. Only labels, headings, explanations and CTAs live here.
 */
import type { EntityLocale } from '../seo/entity-routes';

export interface TireSizeText {
  readonly hubTitle: string;
  readonly hubDescription: string;
  readonly hubKicker: string;
  readonly hubH1: string;
  readonly hubLead: (count: number, vehicles: number) => string;
  readonly notationHeading: string;
  readonly notationIntro: string;
  readonly notationParts: readonly { readonly token: string; readonly label: string; readonly detail: string }[];
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly searchEmpty: string;
  readonly countLabel: (n: number) => string;
  readonly groupHeading: (rim: number) => string;
  readonly jumpLabel: string;
  readonly listedAs: (vehicles: number) => string;
  readonly toolsHeading: string;
  readonly calculatorCta: string;
  readonly calculatorCtaDetail: string;
  readonly comparisonCta: string;
  readonly comparisonCtaDetail: string;
  readonly vehiclesCta: string;
  readonly vehiclesCtaDetail: string;
  readonly boltHubCta: string;
  readonly boltHubCtaDetail: string;

  readonly detailKicker: string;
  readonly detailTitle: (notation: string) => string;
  readonly detailDescription: (notation: string, diameterMm: string, vehicles: number) => string;
  readonly detailH1: (notation: string) => string;
  readonly detailLead: (width: number, aspect: number, rim: number) => string;
  readonly metricsHeading: string;
  readonly metrics: {
    readonly sectionWidth: string;
    readonly aspectRatio: string;
    readonly sidewallHeight: string;
    readonly rimDiameterIn: string;
    readonly rimDiameterMm: string;
    readonly overallDiameter: string;
    readonly circumference: string;
    readonly revsPerKm: string;
    readonly revsPerMile: string;
  };
  readonly metricNote: string;
  readonly breakdownHeading: string;
  readonly breakdownParts: (width: number, aspect: number, rim: number) => readonly { readonly token: string; readonly label: string; readonly detail: string }[];
  readonly visualHeading: string;
  readonly visualNote: string;
  readonly crossAria: (notation: string) => string;
  readonly crossTread: string;
  readonly crossSidewall: string;
  readonly crossBead: string;
  readonly crossRimCaption: string;
  readonly vehiclesHeading: string;
  readonly vehiclesIntro: (n: number) => string;
  readonly vehiclesEmpty: string;
  readonly colVehicle: string;
  readonly colGeneration: string;
  readonly colWheel: string;
  readonly colBoltPattern: string;
  readonly colConfidence: string;
  /** Per-row source confidence, localized. Sourced from VehicleFitment.confidence. */
  readonly confidence: { readonly high: string; readonly medium: string; readonly low: string };
  readonly confidenceNote: string;
  readonly vehiclePageLink: string;
  readonly compareHeading: string;
  readonly compareIntro: string;
  readonly compareEmpty: string;
  readonly compareLabel: string;
  readonly colSize: string;
  readonly colDiameter: string;
  readonly colDifference: string;
  readonly compareCaveat: string;
  readonly ctaHeading: string;
  readonly ctaNote: string;
  readonly relatedHeading: string;
  readonly backToHub: string;
  readonly faqHeading: string;
  readonly faqs: (input: { readonly notation: string; readonly vehicles: number; readonly makes: string; readonly rim: number }) => readonly { readonly q: string; readonly a: string }[];
  readonly breadcrumbHome: string;
  readonly breadcrumbHub: string;
}

export interface BoltPatternText {
  readonly hubTitle: string;
  readonly hubDescription: string;
  readonly hubKicker: string;
  readonly hubH1: string;
  readonly hubLead: (count: number, vehicles: number) => string;
  readonly notationHeading: string;
  readonly notationIntro: (example: string, lugs: number, pcd: number) => string;
  readonly notationParts: readonly { readonly label: string; readonly detail: string }[];
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly searchEmpty: string;
  readonly countLabel: (n: number) => string;
  readonly groupHeading: (lugs: number) => string;
  readonly jumpLabel: string;
  readonly listedAs: (vehicles: number) => string;
  readonly toolsHeading: string;
  readonly calculatorCta: string;
  readonly calculatorCtaDetail: string;
  readonly fitmentCta: string;
  readonly fitmentCtaDetail: string;
  readonly vehiclesCta: string;
  readonly vehiclesCtaDetail: string;
  readonly tireHubCta: string;
  readonly tireHubCtaDetail: string;

  readonly detailKicker: string;
  readonly detailTitle: (notation: string) => string;
  readonly detailDescription: (notation: string, lugs: number, pcd: number, vehicles: number) => string;
  readonly detailH1: (notation: string) => string;
  readonly detailLead: (lugs: number, pcd: number) => string;
  readonly metricsHeading: string;
  readonly metrics: {
    readonly lugCount: string;
    readonly pcdMm: string;
    readonly pcdIn: string;
    readonly holeSpacing: string;
    readonly vehicleCount: string;
    readonly centerBore: string;
  };
  readonly metricNote: string;
  readonly holeSpacingNote: string;
  readonly diagramHeading: string;
  readonly diagramNote: (lugs: number, pcd: number) => string;
  readonly diagramAria: (lugs: number, pcd: number) => string;
  readonly pcdLabel: string;
  readonly vehiclesHeading: string;
  readonly vehiclesIntro: (n: number) => string;
  readonly vehiclesEmpty: string;
  readonly colVehicle: string;
  readonly colTireSize: string;
  readonly colCenterBore: string;
  readonly colWheel: string;
  readonly colTorque: string;
  readonly colFastener: string;
  readonly colConfidence: string;
  /** Per-row source confidence, localized. Sourced from VehicleFitment.confidence. */
  readonly confidence: { readonly high: string; readonly medium: string; readonly low: string };
  readonly confidenceNote: string;
  /** Tooltip/aria text on a torque figure that is extrapolated or unconfirmed. */
  readonly torqueUnconfirmedTitle: string;
  readonly lugNut: string;
  readonly wheelBolt: string;
  readonly vehiclePageLink: string;
  readonly safetyHeading: string;
  readonly safetyLead: string;
  readonly safetyFactors: readonly { readonly label: string; readonly detail: string }[];
  readonly safetyClose: string;
  readonly ctaHeading: string;
  readonly ctaNote: string;
  readonly relatedHeading: string;
  readonly relatedTireIntro: string;
  readonly backToHub: string;
  readonly faqHeading: string;
  readonly faqs: (input: { readonly notation: string; readonly lugs: number; readonly pcd: number; readonly vehicles: number; readonly makes: string }) => readonly { readonly q: string; readonly a: string }[];
  readonly breadcrumbHome: string;
  readonly breadcrumbHub: string;
}

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

export const tireSizePageText: Readonly<Record<EntityLocale, TireSizeText>> = Object.freeze({
  en: {
    hubTitle: 'Tire Sizes — Dimensions, Diameter & Vehicle Matches',
    hubDescription: 'Every tire size in the Atlas OEM fitment reference, with calculated sidewall, overall diameter and circumference, and the Atlas vehicle entries that list each one.',
    hubKicker: 'Tire size reference',
    hubH1: 'Tire sizes in the Atlas fitment reference',
    hubLead: (count, vehicles) => `${count} tire ${plural(count, 'size', 'sizes')} appear as an OEM fitment on the ${vehicles} sourced ${plural(vehicles, 'vehicle', 'vehicles')} in the Atlas reference. Each size below has its own page with calculated geometry and the exact vehicles it is listed on — nothing here is a size we have not seen on a real, sourced vehicle entry.`,
    notationHeading: 'How to read a tire size',
    notationIntro: 'A metric tire code such as 205/55R16 packs three separate measurements plus a construction letter into one string:',
    notationParts: [
      { token: '205', label: 'Section width', detail: 'Tread-to-tread width of the inflated tire, in millimetres.' },
      { token: '55', label: 'Aspect ratio', detail: 'Sidewall height as a percentage of the section width — so 55 means the sidewall is 55% of 205 mm.' },
      { token: 'R', label: 'Radial construction', detail: 'The casing plies run radially. Effectively every modern passenger tire is radial.' },
      { token: '16', label: 'Rim diameter', detail: 'The wheel diameter the tire mounts on, in inches — the one imperial number in an otherwise metric code.' },
    ],
    searchLabel: 'Filter tire sizes',
    searchPlaceholder: 'e.g. 205/55 or R17',
    searchEmpty: 'No tire size in the reference matches that filter.',
    countLabel: (n) => `${n} ${plural(n, 'size', 'sizes')}`,
    groupHeading: (rim) => `${rim}-inch rims`,
    jumpLabel: 'Jump to rim size',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}`,
    toolsHeading: 'Calculate with these sizes',
    calculatorCta: 'Tire Size Calculator',
    calculatorCtaDetail: 'Sidewall, diameter, circumference and revolutions for any size',
    comparisonCta: 'Tire Size Comparison',
    comparisonCtaDetail: 'Put two sizes side by side with the real diameter difference',
    vehiclesCta: 'Vehicle fitment reference',
    vehiclesCtaDetail: 'OEM tire size, bolt pattern and torque by vehicle',
    boltHubCta: 'Bolt patterns',
    boltHubCtaDetail: 'The PCD side of the same fitment data',

    detailKicker: 'Tire size',
    detailTitle: (notation) => `${notation} Tire Size — Dimensions, Diameter & Sidewall`,
    detailDescription: (notation, diameterMm, vehicles) => `${notation} has a calculated overall diameter of ${diameterMm} mm. See its sidewall height, circumference and revolutions per mile, and the ${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')} currently listed in the Atlas fitment reference with it as an OEM fitment.`,
    detailH1: (notation) => `${notation} tire size`,
    detailLead: (width, aspect, rim) => `A ${width} mm wide tire with a sidewall ${aspect}% of that width, mounted on a ${rim}-inch rim.`,
    metricsHeading: 'Calculated dimensions',
    metrics: {
      sectionWidth: 'Section width', aspectRatio: 'Aspect ratio', sidewallHeight: 'Sidewall height',
      rimDiameterIn: 'Rim diameter', rimDiameterMm: 'Rim diameter (metric)', overallDiameter: 'Overall diameter',
      circumference: 'Circumference', revsPerKm: 'Revolutions per km', revsPerMile: 'Revolutions per mile',
    },
    metricNote: 'Every figure on this page is computed from the size code by the same tire geometry functions the Tire Size Calculator uses — nothing is hard-coded per page. Real tires vary slightly from the nominal code depending on manufacturer and tread pattern.',
    breakdownHeading: 'What the code means',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Section width', detail: `${width} mm from sidewall to sidewall when the tire is inflated and unloaded.` },
      { token: String(aspect), label: 'Aspect ratio', detail: `The sidewall is ${aspect}% of ${width} mm.` },
      { token: 'R', label: 'Radial construction', detail: 'The casing plies run radially — standard on passenger tires.' },
      { token: String(rim), label: 'Rim diameter', detail: `Mounts on a ${rim}-inch wheel.` },
    ],
    visualHeading: 'Cross-section at this size',
    crossAria: (notation) => `Cross-section diagram of a ${notation} tire showing section width, sidewall height, tread, bead and rim`,
    crossTread: 'Tread',
    crossSidewall: 'Sidewall',
    crossBead: 'Bead',
    crossRimCaption: 'inner cavity above the rim',
    visualNote: 'Drawn to the real section width and sidewall height of this size, using the same geometry helper as the calculator — proportions are calculated, not decorative.',
    vehiclesHeading: 'Vehicles listed with this size',
    vehiclesIntro: (n) => `Atlas lists ${n} sourced ${plural(n, 'vehicle', 'vehicles')} with this size as an OEM fitment. Trims and model years vary — always check the placard on the vehicle in front of you.`,
    vehiclesEmpty: 'No vehicle in the Atlas fitment reference is currently listed with this size.',
    colVehicle: 'Vehicle', colGeneration: 'Generation', colWheel: 'OEM wheel', colBoltPattern: 'Bolt pattern',
    colConfidence: 'Source confidence',
    confidence: { high: 'High', medium: 'Medium', low: 'Low' },
    confidenceNote: 'Confidence is per entry, not per page: it records how directly Atlas could source that particular row. Open a vehicle for its sources and caveats.',
    vehiclePageLink: 'Open vehicle page',
    compareHeading: 'Geometrically similar sizes',
    compareIntro: 'Other sizes in this reference whose calculated overall diameter is within 3% of this one:',
    compareEmpty: 'No other size in this reference is within 3% of this diameter, so there is nothing honest to compare it against here.',
    compareLabel: 'Compare',
    colSize: 'Size', colDiameter: 'Overall diameter', colDifference: 'Difference',
    compareCaveat: 'This is a geometric comparison, not a fitment recommendation. A similar overall diameter does not make a size safe to fit: wheel width, load index and speed rating, inner and outer clearance, and the vehicle manufacturer’s own approved sizes all matter too. Check the OEM requirements for your vehicle before changing size.',
    ctaHeading: 'Run the numbers yourself',
    ctaNote: 'Both tools open pre-filled with this size, so you can change one number and see what moves.',
    relatedHeading: 'Related data',
    backToHub: 'All tire sizes',
    faqHeading: 'Frequently asked questions',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `Is ${notation} a common tire size?`, a: `In the Atlas OEM fitment reference it appears on ${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}${makes ? ` (${makes})` : ''}. That is a sample of sourced vehicles, not a market-share figure — it tells you the size is genuinely used from the factory, not how many are sold.` },
      { q: `What vehicles use ${notation}?`, a: vehicles > 0 ? `The vehicles listed on this page: ${makes}. Each links to its own fitment page with the bolt pattern, wheel size and torque spec.` : 'No vehicle in the Atlas fitment reference is currently listed with this size.' },
      { q: `Can I fit a different tire size instead?`, a: `Often yes, but only within limits the vehicle manufacturer sets. The geometric comparison above shows which sizes in this reference come out within 3% of the same overall diameter, which is the starting filter — it is not permission. Wheel width, load index, speed rating and clearance all still have to work, and the vehicle’s placard and manual are the authority.` },
      { q: `What does the ${rim} in ${notation} mean?`, a: `It is the rim diameter in inches: this tire mounts on a ${rim}-inch wheel. The first two numbers are metric (millimetres and a percentage), so a tire code deliberately mixes unit systems.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Tire sizes',
  },

  de: {
    hubTitle: 'Reifengrößen — Maße, Durchmesser & Fahrzeugzuordnung',
    hubDescription: 'Alle Reifengrößen aus der Atlas-Werksdatenbank, mit berechneter Flankenhöhe, Gesamtdurchmesser und Abrollumfang sowie den belegten Fahrzeugen, die sie fahren.',
    hubKicker: 'Reifengrößen-Referenz',
    hubH1: 'Reifengrößen in der Atlas-Fitment-Referenz',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'Reifengröße ist', 'Reifengrößen sind')} bei den ${vehicles} belegten Fahrzeugen der Atlas-Referenz als Werksbereifung eingetragen. Jede Größe hat eine eigene Seite mit berechneter Geometrie und den Fahrzeugen, bei denen sie gelistet ist — hier steht keine Größe, die wir nicht an einem echten, mit Quelle belegten Fahrzeugeintrag gesehen haben.`,
    notationHeading: 'So lesen Sie eine Reifengröße',
    notationIntro: 'Ein metrischer Reifencode wie 205/55R16 fasst drei getrennte Maße und einen Bauart-Buchstaben in einer Zeichenfolge zusammen:',
    notationParts: [
      { token: '205', label: 'Querschnittsbreite', detail: 'Breite des aufgepumpten Reifens von Flanke zu Flanke, in Millimetern.' },
      { token: '55', label: 'Querschnittsverhältnis', detail: 'Flankenhöhe als Prozentsatz der Breite — 55 bedeutet also, die Flanke ist 55 % von 205 mm.' },
      { token: 'R', label: 'Radialbauweise', detail: 'Die Karkassenlagen verlaufen radial. Praktisch jeder moderne Pkw-Reifen ist ein Radialreifen.' },
      { token: '16', label: 'Felgendurchmesser', detail: 'Der Felgendurchmesser, auf den der Reifen montiert wird, in Zoll — die einzige imperiale Zahl in einem ansonsten metrischen Code.' },
    ],
    searchLabel: 'Reifengrößen filtern',
    searchPlaceholder: 'z. B. 205/55 oder R17',
    searchEmpty: 'Keine Reifengröße in der Referenz passt zu diesem Filter.',
    countLabel: (n) => `${n} ${plural(n, 'Größe', 'Größen')}`,
    groupHeading: (rim) => `${rim}-Zoll-Felgen`,
    jumpLabel: 'Zur Felgengröße springen',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'Fahrzeug', 'Fahrzeuge')}`,
    toolsHeading: 'Mit diesen Größen rechnen',
    calculatorCta: 'Reifengrößen-Rechner',
    calculatorCtaDetail: 'Flanke, Durchmesser, Umfang und Umdrehungen für jede Größe',
    comparisonCta: 'Reifengrößen-Vergleich',
    comparisonCtaDetail: 'Zwei Größen nebeneinander mit dem echten Durchmesserunterschied',
    vehiclesCta: 'Fahrzeug-Fitment-Referenz',
    vehiclesCtaDetail: 'Werksreifengröße, Lochkreis und Drehmoment je Fahrzeug',
    boltHubCta: 'Lochkreise',
    boltHubCtaDetail: 'Die Lochkreis-Seite derselben Fitment-Daten',

    detailKicker: 'Reifengröße',
    detailTitle: (notation) => `Reifengröße ${notation} — Maße, Durchmesser & Flankenhöhe`,
    detailDescription: (notation, diameterMm, vehicles) => `${notation} hat einen berechneten Gesamtdurchmesser von ${diameterMm} mm. Hier finden Sie Flankenhöhe, Abrollumfang und Umdrehungen pro Meile sowie die ${vehicles} belegten ${plural(vehicles, 'Fahrzeuge', 'Fahrzeuge')}, bei denen Atlas sie als Werksbereifung führt.`,
    detailH1: (notation) => `Reifengröße ${notation}`,
    detailLead: (width, aspect, rim) => `Ein ${width} mm breiter Reifen mit einer Flanke von ${aspect} % dieser Breite, montiert auf einer ${rim}-Zoll-Felge.`,
    metricsHeading: 'Berechnete Maße',
    metrics: {
      sectionWidth: 'Querschnittsbreite', aspectRatio: 'Querschnittsverhältnis', sidewallHeight: 'Flankenhöhe',
      rimDiameterIn: 'Felgendurchmesser', rimDiameterMm: 'Felgendurchmesser (metrisch)', overallDiameter: 'Gesamtdurchmesser',
      circumference: 'Abrollumfang', revsPerKm: 'Umdrehungen pro km', revsPerMile: 'Umdrehungen pro Meile',
    },
    metricNote: 'Jeder Wert auf dieser Seite wird aus dem Größencode mit denselben Reifengeometrie-Funktionen berechnet, die auch der Reifengrößen-Rechner verwendet — nichts ist pro Seite fest eingetragen. Echte Reifen weichen je nach Hersteller und Profil leicht vom Nennmaß ab.',
    breakdownHeading: 'Was der Code bedeutet',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Querschnittsbreite', detail: `${width} mm von Flanke zu Flanke im aufgepumpten, unbelasteten Zustand.` },
      { token: String(aspect), label: 'Querschnittsverhältnis', detail: `Die Flanke beträgt ${aspect} % von ${width} mm.` },
      { token: 'R', label: 'Radialbauweise', detail: 'Die Karkassenlagen verlaufen radial — Standard bei Pkw-Reifen.' },
      { token: String(rim), label: 'Felgendurchmesser', detail: `Montage auf einer ${rim}-Zoll-Felge.` },
    ],
    visualHeading: 'Querschnitt bei dieser Größe',
    crossAria: (notation) => `Querschnittsdiagramm eines Reifens ${notation} mit Querschnittsbreite, Flankenhöhe, Lauffläche, Wulst und Felge`,
    crossTread: 'Lauffläche',
    crossSidewall: 'Flanke',
    crossBead: 'Wulst',
    crossRimCaption: 'Hohlraum über der Felge',
    visualNote: 'Gezeichnet mit der echten Querschnittsbreite und Flankenhöhe dieser Größe, mit derselben Geometriefunktion wie im Rechner — die Proportionen sind berechnet, nicht dekorativ.',
    vehiclesHeading: 'Fahrzeuge mit dieser Größe',
    vehiclesIntro: (n) => `Atlas führt ${n} ${plural(n, 'belegtes Fahrzeug', 'belegte Fahrzeuge')} mit dieser Größe als Werksbereifung. Ausstattungen und Modelljahre unterscheiden sich — prüfen Sie immer den Aufkleber am Fahrzeug selbst.`,
    vehiclesEmpty: 'Atlas hat für diese Größe noch keine belegte Fahrzeugzuordnung.',
    colVehicle: 'Fahrzeug', colGeneration: 'Generation', colWheel: 'Werksfelge', colBoltPattern: 'Lochkreis',
    colConfidence: 'Quellenlage',
    confidence: { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' },
    confidenceNote: 'Die Quellenlage gilt pro Eintrag, nicht pro Seite: Sie hält fest, wie direkt Atlas genau diese Zeile belegen konnte. Quellen und Vorbehalte stehen auf der jeweiligen Fahrzeugseite.',
    vehiclePageLink: 'Fahrzeugseite öffnen',
    compareHeading: 'Geometrisch ähnliche Größen',
    compareIntro: 'Andere Größen dieser Referenz, deren berechneter Gesamtdurchmesser innerhalb von 3 % dieser Größe liegt:',
    compareEmpty: 'Keine andere Größe dieser Referenz liegt innerhalb von 3 % dieses Durchmessers — es gibt hier also nichts ehrlich Vergleichbares.',
    compareLabel: 'Vergleichen',
    colSize: 'Größe', colDiameter: 'Gesamtdurchmesser', colDifference: 'Unterschied',
    compareCaveat: 'Das ist ein geometrischer Vergleich, keine Fitment-Empfehlung. Ein ähnlicher Gesamtdurchmesser macht eine Größe nicht sicher montierbar: Felgenbreite, Tragfähigkeits- und Geschwindigkeitsindex, Freigang innen und außen sowie die vom Fahrzeughersteller freigegebenen Größen zählen ebenso. Prüfen Sie die Werksvorgaben Ihres Fahrzeugs, bevor Sie die Größe ändern.',
    ctaHeading: 'Selbst nachrechnen',
    ctaNote: 'Beide Tools öffnen sich mit dieser Größe vorausgefüllt — Sie ändern eine Zahl und sehen sofort, was sich bewegt.',
    relatedHeading: 'Verwandte Daten',
    backToHub: 'Alle Reifengrößen',
    faqHeading: 'Häufige Fragen',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `Ist ${notation} eine gängige Reifengröße?`, a: `In der Atlas-Werksreferenz taucht sie bei ${vehicles} ${plural(vehicles, 'Fahrzeug', 'Fahrzeugen')} auf${makes ? ` (${makes})` : ''}. Das ist eine Stichprobe belegter Fahrzeuge, keine Marktanteilszahl — sie zeigt, dass die Größe ab Werk wirklich verwendet wird, nicht wie viele davon verkauft werden.` },
      { q: `Welche Fahrzeuge fahren ${notation}?`, a: vehicles > 0 ? `Die auf dieser Seite gelisteten Fahrzeuge: ${makes}. Jedes verlinkt auf seine eigene Fitment-Seite mit Lochkreis, Felgengröße und Anzugsdrehmoment.` : 'Atlas hat für diese Größe noch keine belegte Fahrzeugzuordnung.' },
      { q: 'Kann ich stattdessen eine andere Reifengröße montieren?', a: 'Oft ja, aber nur innerhalb der Grenzen, die der Fahrzeughersteller setzt. Der geometrische Vergleich oben zeigt, welche Größen dieser Referenz auf 3 % denselben Gesamtdurchmesser erreichen — das ist der erste Filter, keine Freigabe. Felgenbreite, Tragfähigkeits- und Geschwindigkeitsindex sowie der Freigang müssen weiterhin passen, und maßgeblich sind der Aufkleber und das Handbuch des Fahrzeugs.' },
      { q: `Wofür steht die ${rim} in ${notation}?`, a: `Für den Felgendurchmesser in Zoll: Dieser Reifen wird auf eine ${rim}-Zoll-Felge montiert. Die ersten beiden Zahlen sind metrisch (Millimeter und Prozent) — ein Reifencode mischt also bewusst die Einheitensysteme.` },
    ],
    breadcrumbHome: 'Startseite', breadcrumbHub: 'Reifengrößen',
  },

  es: {
    hubTitle: 'Medidas de neumáticos — Dimensiones, diámetro y vehículos',
    hubDescription: 'Todas las medidas de neumático de la referencia de equipo original de Atlas, con flanco, diámetro total y circunferencia calculados, y los vehículos documentados en la referencia Atlas que las montan.',
    hubKicker: 'Referencia de medidas',
    hubH1: 'Medidas de neumático en la referencia Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'medida figura', 'medidas figuran')} como equipo original en los ${vehicles} ${plural(vehicles, 'vehículo documentado', 'vehículos documentados')} de la referencia Atlas. Cada medida tiene su propia página con la geometría calculada y los vehículos exactos en los que aparece — aquí no hay ninguna medida que no hayamos visto en una ficha de vehículo real y documentada.`,
    notationHeading: 'Cómo se lee una medida de neumático',
    notationIntro: 'Un código métrico como 205/55R16 reúne tres medidas distintas y una letra de construcción en una sola cadena:',
    notationParts: [
      { token: '205', label: 'Ancho de sección', detail: 'Anchura del neumático inflado de flanco a flanco, en milímetros.' },
      { token: '55', label: 'Perfil (serie)', detail: 'Altura del flanco como porcentaje del ancho — 55 significa que el flanco mide el 55 % de 205 mm.' },
      { token: 'R', label: 'Construcción radial', detail: 'Las lonas de la carcasa van en radial. Prácticamente todo neumático moderno de turismo es radial.' },
      { token: '16', label: 'Diámetro de llanta', detail: 'El diámetro de llanta sobre el que se monta, en pulgadas — el único dato imperial de un código por lo demás métrico.' },
    ],
    searchLabel: 'Filtrar medidas',
    searchPlaceholder: 'p. ej. 205/55 o R17',
    searchEmpty: 'Ninguna medida de la referencia coincide con ese filtro.',
    countLabel: (n) => `${n} ${plural(n, 'medida', 'medidas')}`,
    groupHeading: (rim) => `Llantas de ${rim} pulgadas`,
    jumpLabel: 'Ir a un tamaño de llanta',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}`,
    toolsHeading: 'Calcular con estas medidas',
    calculatorCta: 'Calculadora de tamaño de neumáticos',
    calculatorCtaDetail: 'Flanco, diámetro, circunferencia y vueltas para cualquier medida',
    comparisonCta: 'Comparador de neumáticos',
    comparisonCtaDetail: 'Dos medidas lado a lado con la diferencia real de diámetro',
    vehiclesCta: 'Referencia de vehículos',
    vehiclesCtaDetail: 'Medida de origen, patrón de birlos y par por vehículo',
    boltHubCta: 'Patrones de birlos',
    boltHubCtaDetail: 'La cara del PCD de los mismos datos de fitment',

    detailKicker: 'Medida de neumático',
    detailTitle: (notation) => `Medida ${notation} — Dimensiones, diámetro y flanco`,
    detailDescription: (notation, diameterMm, vehicles) => `${notation} tiene un diámetro total calculado de ${diameterMm} mm. Consulte su altura de flanco, circunferencia y vueltas por milla, y los ${vehicles} ${plural(vehicles, 'vehículo documentado', 'vehículos documentados')} en los que Atlas la registra como equipo original.`,
    detailH1: (notation) => `Medida de neumático ${notation}`,
    detailLead: (width, aspect, rim) => `Un neumático de ${width} mm de ancho con un flanco del ${aspect} % de ese ancho, montado sobre una llanta de ${rim} pulgadas.`,
    metricsHeading: 'Dimensiones calculadas',
    metrics: {
      sectionWidth: 'Ancho de sección', aspectRatio: 'Perfil', sidewallHeight: 'Altura del flanco',
      rimDiameterIn: 'Diámetro de llanta', rimDiameterMm: 'Diámetro de llanta (métrico)', overallDiameter: 'Diámetro total',
      circumference: 'Circunferencia', revsPerKm: 'Vueltas por km', revsPerMile: 'Vueltas por milla',
    },
    metricNote: 'Cada cifra de esta página se calcula a partir del código con las mismas funciones de geometría que usa la Calculadora de tamaño de neumáticos — nada está escrito a mano por página. Los neumáticos reales varían ligeramente respecto al valor nominal según el fabricante y el dibujo.',
    breakdownHeading: 'Qué significa el código',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Ancho de sección', detail: `${width} mm de flanco a flanco con el neumático inflado y sin carga.` },
      { token: String(aspect), label: 'Perfil', detail: `El flanco mide el ${aspect} % de ${width} mm.` },
      { token: 'R', label: 'Construcción radial', detail: 'Las lonas de la carcasa van en radial — lo habitual en turismos.' },
      { token: String(rim), label: 'Diámetro de llanta', detail: `Se monta en una llanta de ${rim} pulgadas.` },
    ],
    visualHeading: 'Sección transversal de esta medida',
    crossAria: (notation) => `Diagrama de sección transversal de un neumático ${notation} con ancho de sección, altura de flanco, banda de rodadura, talón y llanta`,
    crossTread: 'Banda de rodadura',
    crossSidewall: 'Flanco',
    crossBead: 'Talón',
    crossRimCaption: 'cavidad interior sobre la llanta',
    visualNote: 'Dibujada con el ancho de sección y la altura de flanco reales de esta medida, con la misma función de geometría que la calculadora — las proporciones son calculadas, no decorativas.',
    vehiclesHeading: 'Vehículos con esta medida',
    vehiclesIntro: (n) => `Atlas documenta ${n} ${plural(n, 'vehículo', 'vehículos')} con esta medida como equipo original. Los acabados y años de modelo varían — compruebe siempre la etiqueta del vehículo que tiene delante.`,
    vehiclesEmpty: 'Ningún vehículo de la referencia de equipo original de Atlas figura actualmente con esta medida.',
    colVehicle: 'Vehículo', colGeneration: 'Generación', colWheel: 'Llanta de origen', colBoltPattern: 'Patrón de birlos',
    colConfidence: 'Confianza de la fuente',
    confidence: { high: 'Alta', medium: 'Media', low: 'Baja' },
    confidenceNote: 'La confianza es por entrada, no por página: refleja con qué respaldo directo Atlas pudo documentar esa fila concreta. Las fuentes y advertencias están en la ficha de cada vehículo.',
    vehiclePageLink: 'Abrir ficha del vehículo',
    compareHeading: 'Medidas geométricamente similares',
    compareIntro: 'Otras medidas de esta referencia cuyo diámetro total calculado queda dentro del 3 % de esta:',
    compareEmpty: 'Ninguna otra medida de esta referencia queda dentro del 3 % de este diámetro, así que aquí no hay nada honesto con lo que compararla.',
    compareLabel: 'Comparar',
    colSize: 'Medida', colDiameter: 'Diámetro total', colDifference: 'Diferencia',
    compareCaveat: 'Esto es una comparación geométrica, no una recomendación de montaje. Un diámetro total parecido no hace que una medida sea segura: el ancho de llanta, el índice de carga y de velocidad, la holgura interior y exterior y las medidas homologadas por el fabricante también cuentan. Consulte los requisitos de origen de su vehículo antes de cambiar de medida.',
    ctaHeading: 'Haga usted mismo el cálculo',
    ctaNote: 'Ambas herramientas se abren precargadas con esta medida, así puede cambiar un número y ver qué se mueve.',
    relatedHeading: 'Datos relacionados',
    backToHub: 'Todas las medidas',
    faqHeading: 'Preguntas frecuentes',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `¿Es ${notation} una medida común?`, a: `En la referencia de equipo original de Atlas aparece en ${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}${makes ? ` (${makes})` : ''}. Es una muestra de vehículos documentados, no una cuota de mercado — indica que la medida se usa realmente de fábrica, no cuántas unidades se venden.` },
      { q: `¿Qué vehículos montan ${notation}?`, a: vehicles > 0 ? `Los vehículos listados en esta página: ${makes}. Cada uno enlaza con su ficha, con el patrón de birlos, el tamaño de llanta y el par de apriete.` : 'Ningún vehículo de la referencia de equipo original de Atlas figura actualmente con esta medida.' },
      { q: '¿Puedo montar otra medida distinta?', a: 'A menudo sí, pero solo dentro de los límites que fija el fabricante. La comparación geométrica de arriba muestra qué medidas de esta referencia quedan dentro del 3 % del mismo diámetro total: es el primer filtro, no un permiso. El ancho de llanta, el índice de carga, el de velocidad y la holgura siguen teniendo que encajar, y mandan la etiqueta y el manual del vehículo.' },
      { q: `¿Qué significa el ${rim} de ${notation}?`, a: `Es el diámetro de llanta en pulgadas: este neumático se monta en una llanta de ${rim} pulgadas. Los dos primeros números son métricos (milímetros y porcentaje), así que un código de neumático mezcla sistemas de unidades a propósito.` },
    ],
    breadcrumbHome: 'Inicio', breadcrumbHub: 'Medidas de neumáticos',
  },
});

export const boltPatternPageText: Readonly<Record<EntityLocale, BoltPatternText>> = Object.freeze({
  en: {
    hubTitle: 'Bolt Patterns (PCD) — Lug Count, Circle Diameter & Vehicles',
    hubDescription: 'Every wheel bolt pattern in the Atlas OEM fitment reference, with lug count, pitch circle diameter, measured hole spacing and the Atlas vehicle entries that use each one.',
    hubKicker: 'Bolt pattern reference',
    hubH1: 'Bolt patterns in the Atlas fitment reference',
    hubLead: (count, vehicles) => `${count} bolt ${plural(count, 'pattern appears', 'patterns appear')} across the ${vehicles} sourced ${plural(vehicles, 'vehicle', 'vehicles')} in the Atlas reference. Each pattern below has its own page with the vehicles it is listed on, their center bore values, and the OEM tire sizes they run.`,
    notationHeading: 'How to read a bolt pattern',
    notationIntro: (example, lugs, pcd) => `A bolt pattern such as ${example} is two numbers: the lug count and the pitch circle diameter (PCD). ${example} means ${lugs} lug holes evenly spaced around an imaginary circle ${pcd} mm across, measured through the centre of the wheel.`,
    notationParts: [
      { label: 'Lug count', detail: 'How many studs or bolts hold the wheel on — the first number.' },
      { label: 'Pitch circle diameter (PCD)', detail: 'The diameter in millimetres of the circle the lug holes sit on — the second number.' },
      { label: 'Hole-to-hole spacing', detail: 'What you can actually measure with a ruler between two adjacent holes. The Bolt Pattern Calculator turns that measurement back into a PCD.' },
    ],
    searchLabel: 'Filter bolt patterns',
    searchPlaceholder: 'e.g. 5x112 or 6x',
    searchEmpty: 'No bolt pattern in the reference matches that filter.',
    countLabel: (n) => `${n} ${plural(n, 'pattern', 'patterns')}`,
    groupHeading: (lugs) => `${lugs}-lug patterns`,
    jumpLabel: 'Jump to lug count',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}`,
    toolsHeading: 'Measure and check fitment',
    calculatorCta: 'Bolt Pattern Calculator',
    calculatorCtaDetail: 'Turn a hole-to-hole measurement into a PCD',
    fitmentCta: 'Wheel Offset Calculator',
    fitmentCtaDetail: 'The other half of whether a wheel actually fits',
    vehiclesCta: 'Vehicle fitment reference',
    vehiclesCtaDetail: 'OEM tire size, bolt pattern and torque by vehicle',
    tireHubCta: 'Tire sizes',
    tireHubCtaDetail: 'The tire side of the same fitment data',

    detailKicker: 'Bolt pattern',
    detailTitle: (notation) => `${notation} Bolt Pattern — PCD, Lug Spacing & Vehicles`,
    detailDescription: (notation, lugs, pcd, vehicles) => `${notation} means ${lugs} lugs on a ${pcd} mm pitch circle. See the measured hole-to-hole spacing, center bore values and the ${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')} currently listed in the Atlas fitment reference with this pattern.`,
    detailH1: (notation) => `${notation} bolt pattern`,
    detailLead: (lugs, pcd) => `${lugs} lug holes evenly spaced around a ${pcd} mm pitch circle.`,
    metricsHeading: 'Pattern dimensions',
    metrics: { lugCount: 'Lug count', pcdMm: 'Pitch circle diameter', pcdIn: 'PCD in inches', holeSpacing: 'Hole-to-hole spacing', vehicleCount: 'Vehicles listed', centerBore: 'Center bores in Atlas reference' },
    metricNote: 'The PCD and lug count come straight from the vehicle entries below. The hole spacing is calculated from them, not separately sourced.',
    holeSpacingNote: 'Chord between two adjacent lug holes, calculated as PCD × sin(180° ÷ lug count) — the distance you measure on the hub.',
    diagramHeading: 'Lug layout',
    diagramNote: (lugs, pcd) => `${lugs} holes drawn at their true angular spacing on a ${pcd} mm pitch circle. Angles are exact; the drawing is scaled to fit, so do not measure a real wheel off the screen.`,
    diagramAria: (lugs, pcd) => `Diagram of ${lugs} lug holes evenly spaced around a ${pcd} millimetre pitch circle`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Vehicles with this bolt pattern',
    vehiclesIntro: (n) => `Atlas lists ${n} sourced ${plural(n, 'vehicle', 'vehicles')} with this pattern. Center bore, wheel size and torque differ between them — that is exactly why a shared pattern is not interchangeability.`,
    vehiclesEmpty: 'No vehicle in the Atlas fitment reference is currently listed with this bolt pattern.',
    colVehicle: 'Vehicle', colTireSize: 'OEM tire size', colCenterBore: 'Center bore', colWheel: 'OEM wheel', colTorque: 'Wheel torque', colFastener: 'Fastener',
    colConfidence: 'Source confidence',
    confidence: { high: 'High', medium: 'Medium', low: 'Low' },
    confidenceNote: 'Confidence is per entry, not per page: it records how directly Atlas could source that particular row. Open a vehicle for its sources and caveats.',
    torqueUnconfirmedTitle: 'Extrapolated or not independently confirmed — check the vehicle manual before torquing.',
    lugNut: 'Lug nuts', wheelBolt: 'Wheel bolts',
    vehiclePageLink: 'Open vehicle page',
    safetyHeading: 'A shared bolt pattern does not mean the wheel fits',
    safetyLead: 'Two vehicles having the same bolt pattern only means the lug holes line up. It says nothing about whether the wheel can safely be fitted. All of the following still have to match:',
    safetyFactors: [
      { label: 'Center bore', detail: 'The wheel must sit on the hub, not on the studs. A smaller bore will not go on; a larger one needs the correct hub-centric ring.' },
      { label: 'Offset (ET)', detail: 'Changes where the wheel sits in the arch — wrong offset causes rubbing, suspension contact or altered bearing loads.' },
      { label: 'Wheel width', detail: 'Has to suit the tire width and the arch. The same bolt pattern is sold in widths that do not all fit the same car.' },
      { label: 'Brake clearance', detail: 'Spoke shape and barrel depth have to clear the caliper. Many same-pattern wheels foul larger brakes.' },
      { label: 'Bolt seat and hardware', detail: 'Conical, ball or flat seats are not interchangeable, and thread pitch and bolt length must match the hub.' },
      { label: 'Load rating', detail: 'The wheel must be rated for the axle load, which matters most on heavier vehicles, vans and trucks.' },
    ],
    safetyClose: 'Use the bolt pattern to rule wheels out, never to rule them in. Confirm against the vehicle manufacturer’s specification, and have anything you are unsure about checked by a qualified fitter.',
    ctaHeading: 'Check a measurement',
    ctaNote: 'The calculator opens pre-filled with this pattern’s lug count and spacing.',
    relatedHeading: 'Related data',
    relatedTireIntro: 'OEM tire sizes on the vehicles that use this pattern:',
    backToHub: 'All bolt patterns',
    faqHeading: 'Frequently asked questions',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `What does ${notation} mean?`, a: `${lugs} lug holes spaced evenly around a circle ${pcd} mm in diameter. The first number is the lug count, the second is the pitch circle diameter in millimetres.` },
      { q: `Which vehicles use ${notation}?`, a: vehicles > 0 ? `In the Atlas reference: ${makes}. Each links to its own fitment page with the OEM tire size, wheel size and torque spec.` : 'No vehicle in the Atlas fitment reference is currently listed with this bolt pattern.' },
      { q: `Will a ${notation} wheel from one of these cars fit another?`, a: 'Not necessarily, and not because of the bolt pattern. Center bore, offset, wheel width, brake clearance, bolt seat type and load rating all have to match as well — the pattern only tells you the holes line up.' },
      { q: 'How do I measure this pattern myself?', a: `Measure the distance between two adjacent lug holes, centre to centre, then convert it to a pitch circle diameter. For ${notation} that hole-to-hole distance works out at the figure shown above. The Bolt Pattern Calculator does the conversion for any lug count.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Bolt patterns',
  },

  de: {
    hubTitle: 'Lochkreise (LK) — Lochzahl, Lochkreisdurchmesser & Fahrzeuge',
    hubDescription: 'Alle Radlochkreise aus der Atlas-Werksdatenbank, mit Lochzahl, Lochkreisdurchmesser, messbarem Lochabstand und den belegten Fahrzeugen, die sie verwenden.',
    hubKicker: 'Lochkreis-Referenz',
    hubH1: 'Lochkreise in der Atlas-Fitment-Referenz',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'Lochkreis kommt', 'Lochkreise kommen')} bei den ${vehicles} belegten Fahrzeugen der Atlas-Referenz vor. Jeder Lochkreis hat eine eigene Seite mit den gelisteten Fahrzeugen, ihren Mittenlochwerten und den Werksreifengrößen, die sie fahren.`,
    notationHeading: 'So lesen Sie einen Lochkreis',
    notationIntro: (example, lugs, pcd) => `Ein Lochkreis wie ${example} besteht aus zwei Zahlen: der Lochzahl und dem Lochkreisdurchmesser (LK). ${example} bedeutet ${lugs} gleichmäßig verteilte Radbohrungen auf einem gedachten Kreis mit ${pcd} mm Durchmesser, gemessen durch die Radmitte.`,
    notationParts: [
      { label: 'Lochzahl', detail: 'Wie viele Bolzen oder Schrauben das Rad halten — die erste Zahl.' },
      { label: 'Lochkreisdurchmesser (LK)', detail: 'Der Durchmesser in Millimetern des Kreises, auf dem die Bohrungen liegen — die zweite Zahl.' },
      { label: 'Lochabstand', detail: 'Was Sie tatsächlich zwischen zwei benachbarten Bohrungen messen können. Der Lochkreis-Rechner rechnet diese Messung wieder in einen LK zurück.' },
    ],
    searchLabel: 'Lochkreise filtern',
    searchPlaceholder: 'z. B. 5x112 oder 6x',
    searchEmpty: 'Kein Lochkreis in der Referenz passt zu diesem Filter.',
    countLabel: (n) => `${n} ${plural(n, 'Lochkreis', 'Lochkreise')}`,
    groupHeading: (lugs) => `Lochkreise mit ${lugs} Bohrungen`,
    jumpLabel: 'Zur Lochzahl springen',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'Fahrzeug', 'Fahrzeuge')}`,
    toolsHeading: 'Messen und Fitment prüfen',
    calculatorCta: 'Lochkreis-Rechner',
    calculatorCtaDetail: 'Aus einem Lochabstand den Lochkreisdurchmesser berechnen',
    fitmentCta: 'Felgen-ET-Rechner',
    fitmentCtaDetail: 'Die andere Hälfte der Frage, ob eine Felge wirklich passt',
    vehiclesCta: 'Fahrzeug-Fitment-Referenz',
    vehiclesCtaDetail: 'Werksreifengröße, Lochkreis und Drehmoment je Fahrzeug',
    tireHubCta: 'Reifengrößen',
    tireHubCtaDetail: 'Die Reifenseite derselben Fitment-Daten',

    detailKicker: 'Lochkreis',
    detailTitle: (notation) => `Lochkreis ${notation} — LK, Lochabstand & Fahrzeuge`,
    detailDescription: (notation, lugs, pcd, vehicles) => `${notation} bedeutet ${lugs} Bohrungen auf einem Lochkreis von ${pcd} mm. Hier finden Sie den messbaren Lochabstand, die Mittenlochwerte und die ${vehicles} belegten Fahrzeuge, die Atlas mit diesem Lochkreis führt.`,
    detailH1: (notation) => `Lochkreis ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} gleichmäßig verteilte Radbohrungen auf einem Lochkreis von ${pcd} mm.`,
    metricsHeading: 'Maße des Lochkreises',
    metrics: { lugCount: 'Lochzahl', pcdMm: 'Lochkreisdurchmesser', pcdIn: 'LK in Zoll', holeSpacing: 'Lochabstand', vehicleCount: 'Gelistete Fahrzeuge', centerBore: 'Mittenlochmaße in der Atlas-Referenz' },
    metricNote: 'Lochkreisdurchmesser und Lochzahl stammen direkt aus den Fahrzeugeinträgen unten. Der Lochabstand wird daraus berechnet und nicht separat recherchiert.',
    holeSpacingNote: 'Sehne zwischen zwei benachbarten Bohrungen, berechnet als LK × sin(180° ÷ Lochzahl) — der Abstand, den Sie an der Nabe messen.',
    diagramHeading: 'Anordnung der Bohrungen',
    diagramNote: (lugs, pcd) => `${lugs} Bohrungen im echten Winkelabstand auf einem Lochkreis von ${pcd} mm. Die Winkel stimmen exakt; die Zeichnung ist eingepasst skaliert — messen Sie also kein echtes Rad am Bildschirm ab.`,
    diagramAria: (lugs, pcd) => `Diagramm mit ${lugs} gleichmäßig verteilten Radbohrungen auf einem Lochkreis von ${pcd} Millimetern`,
    pcdLabel: 'LK',
    vehiclesHeading: 'Fahrzeuge mit diesem Lochkreis',
    vehiclesIntro: (n) => `Atlas führt ${n} ${plural(n, 'belegtes Fahrzeug', 'belegte Fahrzeuge')} mit diesem Lochkreis. Mittenloch, Felgengröße und Drehmoment unterscheiden sich dabei — genau deshalb bedeutet ein gleicher Lochkreis noch keine Austauschbarkeit.`,
    vehiclesEmpty: 'Atlas hat für diesen Lochkreis noch keine belegte Fahrzeugzuordnung.',
    colVehicle: 'Fahrzeug', colTireSize: 'Werksreifengröße', colCenterBore: 'Mittenloch', colWheel: 'Werksfelge', colTorque: 'Anzugsdrehmoment', colFastener: 'Befestigung',
    colConfidence: 'Quellenlage',
    confidence: { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' },
    confidenceNote: 'Die Quellenlage gilt pro Eintrag, nicht pro Seite: Sie hält fest, wie direkt Atlas genau diese Zeile belegen konnte. Quellen und Vorbehalte stehen auf der jeweiligen Fahrzeugseite.',
    torqueUnconfirmedTitle: 'Abgeleitet bzw. nicht unabhängig bestätigt — vor dem Anziehen im Fahrzeughandbuch prüfen.',
    lugNut: 'Radmuttern', wheelBolt: 'Radschrauben',
    vehiclePageLink: 'Fahrzeugseite öffnen',
    safetyHeading: 'Ein gleicher Lochkreis heißt nicht, dass die Felge passt',
    safetyLead: 'Wenn zwei Fahrzeuge denselben Lochkreis haben, fluchten lediglich die Bohrungen. Über die sichere Montierbarkeit sagt das nichts aus. Folgendes muss ebenfalls passen:',
    safetyFactors: [
      { label: 'Mittenloch', detail: 'Die Felge muss auf der Nabe zentriert sitzen, nicht auf den Bolzen. Ein kleineres Mittenloch passt gar nicht; ein größeres braucht den richtigen Zentrierring.' },
      { label: 'Einpresstiefe (ET)', detail: 'Bestimmt, wo das Rad im Radhaus steht — eine falsche ET führt zu Schleifen, Kontakt mit dem Fahrwerk oder veränderten Lagerkräften.' },
      { label: 'Felgenbreite', detail: 'Muss zur Reifenbreite und zum Radhaus passen. Denselben Lochkreis gibt es in Breiten, die nicht alle an dasselbe Auto passen.' },
      { label: 'Bremsenfreigang', detail: 'Speichenform und Felgenbett müssen am Bremssattel vorbeigehen. Viele Felgen mit gleichem Lochkreis kollidieren mit größeren Bremsen.' },
      { label: 'Sitzform und Befestigungsteile', detail: 'Kegel-, Kugel- und Flachbund sind nicht austauschbar, und Gewindesteigung sowie Schraubenlänge müssen zur Nabe passen.' },
      { label: 'Tragfähigkeit', detail: 'Die Felge muss für die Achslast freigegeben sein — besonders wichtig bei schweren Fahrzeugen, Transportern und Pick-ups.' },
    ],
    safetyClose: 'Nutzen Sie den Lochkreis, um Felgen auszuschließen, nie um sie freizugeben. Gleichen Sie mit der Herstellerangabe ab und lassen Sie alles, was unklar ist, von einer Fachwerkstatt prüfen.',
    ctaHeading: 'Eine Messung prüfen',
    ctaNote: 'Der Rechner öffnet sich mit Lochzahl und Lochabstand dieses Lochkreises vorausgefüllt.',
    relatedHeading: 'Verwandte Daten',
    relatedTireIntro: 'Werksreifengrößen der Fahrzeuge mit diesem Lochkreis:',
    backToHub: 'Alle Lochkreise',
    faqHeading: 'Häufige Fragen',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `Was bedeutet ${notation}?`, a: `${lugs} gleichmäßig verteilte Radbohrungen auf einem Kreis mit ${pcd} mm Durchmesser. Die erste Zahl ist die Lochzahl, die zweite der Lochkreisdurchmesser in Millimetern.` },
      { q: `Welche Fahrzeuge haben ${notation}?`, a: vehicles > 0 ? `In der Atlas-Referenz: ${makes}. Jedes verlinkt auf seine eigene Fitment-Seite mit Werksreifengröße, Felgengröße und Anzugsdrehmoment.` : 'Atlas hat für diesen Lochkreis noch keine belegte Fahrzeugzuordnung.' },
      { q: `Passt eine ${notation}-Felge von einem dieser Autos an ein anderes?`, a: 'Nicht zwangsläufig — und das liegt nicht am Lochkreis. Mittenloch, Einpresstiefe, Felgenbreite, Bremsenfreigang, Sitzform und Tragfähigkeit müssen ebenfalls passen. Der Lochkreis sagt nur, dass die Bohrungen fluchten.' },
      { q: 'Wie messe ich diesen Lochkreis selbst?', a: `Messen Sie den Abstand zwischen zwei benachbarten Bohrungen von Mitte zu Mitte und rechnen Sie ihn in den Lochkreisdurchmesser um. Für ${notation} ergibt sich der oben angegebene Lochabstand. Der Lochkreis-Rechner übernimmt die Umrechnung für jede Lochzahl.` },
    ],
    breadcrumbHome: 'Startseite', breadcrumbHub: 'Lochkreise',
  },

  es: {
    hubTitle: 'Patrones de birlos (PCD) — Número de birlos, diámetro y vehículos',
    hubDescription: 'Todos los patrones de birlos de la referencia de equipo original de Atlas, con número de birlos, diámetro del círculo de paso, separación medible entre agujeros y los vehículos documentados en la referencia Atlas que los usan.',
    hubKicker: 'Referencia de patrones',
    hubH1: 'Patrones de birlos en la referencia Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'patrón aparece', 'patrones aparecen')} entre los ${vehicles} ${plural(vehicles, 'vehículo documentado', 'vehículos documentados')} de la referencia Atlas. Cada patrón tiene su propia página con los vehículos en los que figura, sus valores de centro de rueda y las medidas de neumático de origen que montan.`,
    notationHeading: 'Cómo se lee un patrón de birlos',
    notationIntro: (example, lugs, pcd) => `Un patrón como ${example} son dos números: el número de birlos y el diámetro del círculo de paso (PCD). ${example} significa ${lugs} agujeros repartidos por igual sobre un círculo imaginario de ${pcd} mm de diámetro, medido por el centro de la rueda.`,
    notationParts: [
      { label: 'Número de birlos', detail: 'Cuántos espárragos o tornillos sujetan la rueda — el primer número.' },
      { label: 'Diámetro del círculo de paso (PCD)', detail: 'El diámetro en milímetros del círculo sobre el que se sitúan los agujeros — el segundo número.' },
      { label: 'Separación entre agujeros', detail: 'Lo que realmente puede medir con una regla entre dos agujeros contiguos. La Calculadora de patrón de birlos convierte esa medida de vuelta en un PCD.' },
    ],
    searchLabel: 'Filtrar patrones',
    searchPlaceholder: 'p. ej. 5x112 o 6x',
    searchEmpty: 'Ningún patrón de la referencia coincide con ese filtro.',
    countLabel: (n) => `${n} ${plural(n, 'patrón', 'patrones')}`,
    groupHeading: (lugs) => `Patrones de ${lugs} birlos`,
    jumpLabel: 'Ir a un número de birlos',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}`,
    toolsHeading: 'Medir y comprobar el montaje',
    calculatorCta: 'Calculadora de patrón de birlos',
    calculatorCtaDetail: 'Convertir una medida entre agujeros en un PCD',
    fitmentCta: 'Calculadora de offset de llantas',
    fitmentCtaDetail: 'La otra mitad de si una llanta encaja de verdad',
    vehiclesCta: 'Referencia de vehículos',
    vehiclesCtaDetail: 'Medida de origen, patrón de birlos y par por vehículo',
    tireHubCta: 'Medidas de neumáticos',
    tireHubCtaDetail: 'La cara del neumático de los mismos datos de fitment',

    detailKicker: 'Patrón de birlos',
    detailTitle: (notation) => `Patrón ${notation} — PCD, separación y vehículos`,
    detailDescription: (notation, lugs, pcd, vehicles) => `${notation} significa ${lugs} birlos sobre un círculo de paso de ${pcd} mm. Consulte la separación medible entre agujeros, los valores de centro de rueda y los ${vehicles} ${plural(vehicles, 'vehículo documentado', 'vehículos documentados')} que Atlas registra con este patrón.`,
    detailH1: (notation) => `Patrón de birlos ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} agujeros repartidos por igual sobre un círculo de paso de ${pcd} mm.`,
    metricsHeading: 'Dimensiones del patrón',
    metrics: { lugCount: 'Número de birlos', pcdMm: 'Diámetro del círculo de paso', pcdIn: 'PCD en pulgadas', holeSpacing: 'Separación entre agujeros', vehicleCount: 'Vehículos documentados', centerBore: 'Centros de rueda en la referencia Atlas' },
    metricNote: 'El PCD y el número de birlos salen directamente de las fichas de vehículo de abajo. La separación entre agujeros se calcula a partir de ellos, no se documenta aparte.',
    holeSpacingNote: 'Cuerda entre dos agujeros contiguos, calculada como PCD × sen(180° ÷ número de birlos) — la distancia que se mide en el buje.',
    diagramHeading: 'Disposición de los agujeros',
    diagramNote: (lugs, pcd) => `${lugs} agujeros dibujados con su separación angular real sobre un círculo de paso de ${pcd} mm. Los ángulos son exactos; el dibujo está escalado para encajar, así que no mida una rueda real sobre la pantalla.`,
    diagramAria: (lugs, pcd) => `Diagrama de ${lugs} agujeros repartidos por igual sobre un círculo de paso de ${pcd} milímetros`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Vehículos con este patrón',
    vehiclesIntro: (n) => `Atlas documenta ${n} ${plural(n, 'vehículo', 'vehículos')} con este patrón. El centro de rueda, el tamaño de llanta y el par varían entre ellos — justo por eso compartir patrón no es intercambiabilidad.`,
    vehiclesEmpty: 'Ningún vehículo de la referencia de equipo original de Atlas figura actualmente con este patrón.',
    colVehicle: 'Vehículo', colTireSize: 'Medida de origen', colCenterBore: 'Centro de rueda', colWheel: 'Llanta de origen', colTorque: 'Par de apriete', colFastener: 'Fijación',
    colConfidence: 'Confianza de la fuente',
    confidence: { high: 'Alta', medium: 'Media', low: 'Baja' },
    confidenceNote: 'La confianza es por entrada, no por página: refleja con qué respaldo directo Atlas pudo documentar esa fila concreta. Las fuentes y advertencias están en la ficha de cada vehículo.',
    torqueUnconfirmedTitle: 'Extrapolado o no confirmado de forma independiente — compruébelo en el manual antes de apretar.',
    lugNut: 'Tuercas', wheelBolt: 'Tornillos',
    vehiclePageLink: 'Abrir ficha del vehículo',
    safetyHeading: 'Compartir patrón no significa que la llanta encaje',
    safetyLead: 'Que dos vehículos tengan el mismo patrón solo significa que los agujeros coinciden. No dice nada sobre si la llanta se puede montar con seguridad. Todo esto también tiene que coincidir:',
    safetyFactors: [
      { label: 'Centro de rueda', detail: 'La llanta debe apoyar en el buje, no en los espárragos. Un centro menor no entra; uno mayor necesita el anillo centrador correcto.' },
      { label: 'Offset (ET)', detail: 'Define dónde queda la rueda en el paso de rueda — un offset incorrecto provoca roces, contacto con la suspensión o cargas anómalas en los rodamientos.' },
      { label: 'Ancho de llanta', detail: 'Debe corresponder al ancho del neumático y al paso de rueda. El mismo patrón se vende en anchos que no encajan todos en el mismo coche.' },
      { label: 'Holgura de frenos', detail: 'La forma de los radios y la profundidad del canal deben librar la pinza. Muchas llantas del mismo patrón rozan con frenos mayores.' },
      { label: 'Asiento y tornillería', detail: 'Los asientos cónico, esférico y plano no son intercambiables, y el paso de rosca y la longitud deben corresponder al buje.' },
      { label: 'Capacidad de carga', detail: 'La llanta debe estar homologada para la carga del eje, algo crítico en vehículos pesados, furgonetas y pick-ups.' },
    ],
    safetyClose: 'Use el patrón de birlos para descartar llantas, nunca para aprobarlas. Contraste con la especificación del fabricante y haga revisar por un profesional cualquier duda.',
    ctaHeading: 'Comprobar una medida',
    ctaNote: 'La calculadora se abre precargada con el número de birlos y la separación de este patrón.',
    relatedHeading: 'Datos relacionados',
    relatedTireIntro: 'Medidas de neumático de origen en los vehículos que usan este patrón:',
    backToHub: 'Todos los patrones',
    faqHeading: 'Preguntas frecuentes',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `¿Qué significa ${notation}?`, a: `${lugs} agujeros repartidos por igual sobre un círculo de ${pcd} mm de diámetro. El primer número es el número de birlos y el segundo, el diámetro del círculo de paso en milímetros.` },
      { q: `¿Qué vehículos usan ${notation}?`, a: vehicles > 0 ? `En la referencia Atlas: ${makes}. Cada uno enlaza con su ficha, con la medida de origen, el tamaño de llanta y el par de apriete.` : 'Ningún vehículo de la referencia de equipo original de Atlas figura actualmente con este patrón.' },
      { q: `¿Una llanta ${notation} de uno de estos coches vale para otro?`, a: 'No necesariamente, y no por el patrón. El centro de rueda, el offset, el ancho de llanta, la holgura de frenos, el tipo de asiento y la capacidad de carga también tienen que coincidir: el patrón solo indica que los agujeros encajan.' },
      { q: '¿Cómo mido yo mismo este patrón?', a: `Mida la distancia entre dos agujeros contiguos, de centro a centro, y conviértala en diámetro del círculo de paso. Para ${notation} esa distancia es la indicada arriba. La Calculadora de patrón de birlos hace la conversión para cualquier número de birlos.` },
    ],
    breadcrumbHome: 'Inicio', breadcrumbHub: 'Patrones de birlos',
  },
});
