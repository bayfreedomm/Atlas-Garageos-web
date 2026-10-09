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
  readonly detailTitle: (notation: string, figures: TireTitleFigures) => string;
  readonly detailDescription: (notation: string, figures: TireTitleFigures, vehicles: number) => string;
  readonly detailH1: (notation: string) => string;
  readonly commercialKicker: string;
  readonly commercialNote: string;
  readonly commercialBreakdown: { readonly label: string; readonly detail: string };
  readonly commercialTwinLink: (twin: string) => string;
  readonly passengerTwinLink: (twin: string) => string;
  readonly inchHeading: string;
  readonly inchIntro: (shorthand: string) => string;
  readonly inchLabels: { readonly diameter: string; readonly width: string; readonly sidewall: string; readonly circumference: string };
  readonly alternativesHeading: string;
  readonly alternativesIntro: string;
  readonly alternativesEmpty: string;
  readonly rimRowLabel: (rim: string, delta: number) => string;
  readonly colSpeed: string;
  /** Unit system of the speedometer column: km/h at 100 or mph at 60. */
  readonly speedBase: { readonly indicated: number; readonly unit: string };
  readonly neighboursHeading: string;
  readonly neighboursIntro: string;
  readonly colFitment: string;
  readonly fitmentStandard: string;
  readonly fitmentOption: string;
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
  /** Extra FAQ answered with this size's own inch figures, placed first. */
  readonly sizeFaqs: (notation: string, f: TireFaqFigures, flotation: boolean) => readonly { readonly q: string; readonly a: string }[];
  readonly flotationKicker: string;
  readonly flotationNote: string;
  /** Compact mobile-first layout: section jump links, spec-table column heads, lookup box. */
  readonly pageNav: { readonly label: string; readonly specs: string; readonly alternatives: string; readonly vehicles: string; readonly code: string; readonly faq: string };
  readonly specCols: { readonly measure: string; readonly metric: string; readonly imperial: string };
  readonly revsLabel: string;
  readonly answerLabels: { readonly diameter: string; readonly width: string; readonly sidewall: string; readonly circumference: string };
  readonly lookup: { readonly label: string; readonly placeholder: string; readonly button: string; readonly notFound: string; readonly heading: string; readonly intro: string };
  readonly flotationLead: (diameter: string, width: string, rim: string) => string;
  readonly flotationParts: (diameter: string, width: string, rim: string) => readonly { readonly token: string; readonly label: string; readonly detail: string }[];
  readonly breadcrumbHome: string;
  readonly breadcrumbHub: string;
  readonly diameter: TireDiameterGroupText;
}

/** Pre-formatted, locale-correct figures used in a tire-size page title and description. */
export interface TireTitleFigures {
  readonly diameterMm: string;
  readonly circumferenceMm: string;
  readonly diameterIn: string;
  readonly widthIn: string;
  readonly sidewallIn: string;
  readonly sidewallMm: string;
  readonly rim: string;
  readonly commercial: boolean;
  readonly flotation: boolean;
}

/** Inch figures used by the "how tall is it" FAQ answer. */
export interface TireFaqFigures {
  readonly diameterIn: string;
  readonly diameterMm: string;
  readonly widthIn: string;
  readonly sidewallIn: string;
  /** Closest metric sizes on the same rim, already formatted ("285/75R16, 305/70R16"). */
  readonly metricEquivalents: string;
  /** e.g. "33-inch" group label and link text; empty when the size has no diameter group page. */
  readonly inchClass: string;
}

/** Copy for one "N-inch tires" group page (all sizes with that rounded overall diameter). */
export interface TireDiameterGroupText {
  readonly title: (inches: number) => string;
  readonly description: (inches: number, count: number, examples: string) => string;
  readonly kicker: string;
  readonly h1: (inches: number) => string;
  readonly lead: (inches: number, count: number) => string;
  readonly ruleNote: (inches: number) => string;
  readonly tableHeading: (inches: number) => string;
  readonly rimGroup: (rim: string) => string;
  readonly colSize: string;
  readonly colDiameter: string;
  readonly colWidth: string;
  readonly colSidewall: string;
  readonly flotationTag: string;
  readonly popularHeading: (inches: number) => string;
  readonly popularIntro: string;
  readonly neighboursHeading: string;
  readonly groupLink: (inches: number) => string;
  readonly hubHeading: string;
  readonly hubIntro: string;
  readonly sizeLink: (inches: number) => string;
  readonly faqs: (inches: number, examples: string, flotation: string) => readonly { readonly q: string; readonly a: string }[];
  readonly breadcrumb: (inches: number) => string;
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
/** German/Spanish decimal comma for a PCD such as 114.3 → "114,3". */
const dec = (n: number): string => String(n).replace('.', ',');

export const tireSizePageText: Readonly<Record<EntityLocale, TireSizeText>> = Object.freeze({
  en: {
    hubTitle: 'Tire Sizes: Dimensions & Vehicle Matches',
    hubDescription: 'Browse manufactured metric tire sizes with calculated sidewall, diameter and circumference plus documented Atlas vehicle matches where available.',
    hubKicker: 'Tire size reference',
    hubH1: 'Tire sizes in the Atlas fitment reference',
    hubLead: (count, vehicles) => `${count} manufactured tire ${plural(count, 'size', 'sizes')} are documented in the Atlas reference, including the OEM sizes on ${vehicles} sourced ${plural(vehicles, 'vehicle', 'vehicles')}. Every page calculates its own geometry and real near-diameter alternatives; vehicle matches appear only where Atlas has a sourced fitment row.`,
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
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}` : 'Reference size',
    toolsHeading: 'Calculate with these sizes',
    calculatorCta: 'Tire Size Calculator',
    calculatorCtaDetail: 'Sidewall, diameter, circumference and revolutions for any size',
    comparisonCta: 'Tire Size Comparison',
    comparisonCtaDetail: 'Put two sizes side by side with the real diameter difference',
    vehiclesCta: 'Vehicle fitment reference',
    vehiclesCtaDetail: 'Sourced tire size, bolt pattern and qualified torque by vehicle',
    boltHubCta: 'Bolt patterns',
    boltHubCtaDetail: 'The PCD side of the same fitment data',

    detailKicker: 'Tire size',
    detailTitle: (notation, f) => f.commercial
      ? `${notation} Van Tire Size: Dimensions & Alternatives`
      : f.flotation
        ? `${notation} Tire Size in mm & Metric Equivalent`
        : `${notation} Tire Size in Inches: ${f.diameterIn}″ × ${f.widthIn}″`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} in metric: ${f.diameterMm} mm tall, ${f.sidewallIn}″ sidewall on a ${f.rim}-inch rim. Closest metric sizes, speedometer change${vehicles > 0 ? ` and ${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}` : ''}.`
      : `How big is a ${notation} tire? ${f.diameterIn} in tall (${f.diameterMm} mm), ${f.widthIn} in wide, ${f.sidewallIn} in sidewall. Equivalent sizes and speedometer change${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}` : ''}.`,
    detailH1: (notation) => `${notation} tire size`,
    commercialKicker: 'Light-commercial (C) tire size',
    commercialNote: 'The "C" marks a reinforced light-commercial tire for vans and light trucks. Its nominal dimensions match the passenger size with the same numbers, but it is built for higher loads and usually runs at higher inflation pressure. A passenger tire is not a load-rated substitute for a C tire.',
    commercialBreakdown: { label: 'Light commercial', detail: 'Reinforced construction for vans: higher load capacity, usually higher pressure.' },
    commercialTwinLink: (twin) => `Passenger-car version: ${twin}`,
    passengerTwinLink: (twin) => `Van (C) version: ${twin}`,
    inchHeading: 'Size in inches',
    inchIntro: (shorthand) => `In inch terms this size is roughly ${shorthand} — overall diameter × section width, on the given rim.`,
    inchLabels: { diameter: 'Overall diameter', width: 'Section width', sidewall: 'Sidewall height', circumference: 'Circumference' },
    alternativesHeading: 'Alternative sizes on other rims',
    alternativesIntro: 'Manufactured sizes that keep the overall diameter within 3%, one inch smaller to two inches larger, with a sensible width for each rim step. The speedometer column shows your true speed when the speedometer reads 60 mph.',
    alternativesEmpty: 'No manufactured size in the reference keeps this diameter within 3% at a sensible width on a neighbouring rim.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (same rim)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} in)`,
    colSpeed: 'True speed at 60 mph',
    speedBase: { indicated: 60, unit: 'mph' },
    neighboursHeading: 'Neighbouring sizes on the same rim',
    neighboursIntro: 'One step wider or narrower, or one profile step taller or lower:',
    colFitment: 'Fitment',
    fitmentStandard: 'Standard',
    fitmentOption: 'Factory option',
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
    vehiclesIntro: (n) => `Atlas lists ${n} sourced ${plural(n, 'vehicle', 'vehicles')} with this referenced size. Trims and model years vary — always check the placard on the vehicle in front of you.`,
    vehiclesEmpty: 'This is a documented manufactured size, but Atlas does not yet have a sourced vehicle-fitment row that uses it. That is a coverage limit, not evidence that the size is unsuitable or uncommon.',
    colVehicle: 'Vehicle', colGeneration: 'Generation', colWheel: 'Referenced wheel', colBoltPattern: 'Bolt pattern',
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
      { q: `Is ${notation} a common tire size?`, a: vehicles > 0 ? `Atlas has sourced vehicle matches for this manufactured size on ${vehicles} ${plural(vehicles, 'vehicle', 'vehicles')}${makes ? ` (${makes})` : ''}. That is a documented sample, not a market-share figure or a universal fitment claim.` : 'It appears in Atlas’s manufactured-size reference, but Atlas does not claim a market-share ranking or a vehicle match without sourced fitment data.' },
      { q: `What vehicles use ${notation}?`, a: vehicles > 0 ? `The vehicles listed on this page: ${makes}. Each links to its own fitment page with the bolt pattern, wheel size and torque spec.` : 'No vehicle in the Atlas fitment reference is currently listed with this size.' },
      { q: `Can I fit a different tire size instead?`, a: `Often yes, but only within limits the vehicle manufacturer sets. The geometric comparison above shows which sizes in this reference come out within 3% of the same overall diameter, which is the starting filter — it is not permission. Wheel width, load index, speed rating and clearance all still have to work, and the vehicle’s placard and manual are the authority.` },
      { q: `What does the ${rim} in ${notation} mean?`, a: `It is the rim diameter in inches: this tire mounts on a ${rim}-inch wheel. The first two numbers are metric (millimetres and a percentage), so a tire code deliberately mixes unit systems.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Tire sizes',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `What is ${notation} in metric?`, a: `${notation} is ${f.diameterMm} mm (${f.diameterIn} in) tall and ${f.widthIn} in wide with a ${f.sidewallIn}-inch sidewall.${f.metricEquivalents ? ` The closest metric sizes on the same rim are ${f.metricEquivalents}.` : ''}` }
        : { q: `How tall is a ${notation} tire in inches?`, a: `${f.diameterIn} inches (${f.diameterMm} mm) overall, ${f.widthIn} inches wide, with a ${f.sidewallIn}-inch sidewall.${f.inchClass ? ` That makes it a ${f.inchClass} tire.` : ''}` },
    ],
    pageNav: { label: 'On this page', specs: 'Dimensions', alternatives: 'Alternatives', vehicles: 'Vehicles', code: 'Code', faq: 'FAQ' },
    specCols: { measure: 'Measure', metric: 'Metric', imperial: 'Inches' },
    revsLabel: 'Revolutions',
    answerLabels: { diameter: 'Height', width: 'Width', sidewall: 'Sidewall', circumference: 'Circumference' },
    lookup: { label: 'Tire size', placeholder: 'e.g. 265/70R17', button: 'Show size', notFound: 'That size is not in the reference yet. Check the format, e.g. 225/45R17.', heading: 'Look up any tire size', intro: 'Type the size from your sidewall to get its height, width and alternatives instantly.' },
    flotationKicker: 'High-flotation tire size',
    flotationNote: 'A flotation size states its overall diameter and section width directly in inches, then the rim. It is the usual notation for off-road and light-truck tires in North America.',
    flotationLead: (diameter, width, rim) => `A ${diameter}-inch-tall tire, ${width} inches wide, mounted on a ${rim}-inch rim.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Overall diameter', detail: `${diameter} inches tall, measured inflated and unloaded.` },
      { token: width, label: 'Section width', detail: `${width} inches from sidewall to sidewall.` },
      { token: 'R', label: 'Radial construction', detail: 'The casing plies run radially.' },
      { token: rim, label: 'Rim diameter', detail: `Mounts on a ${rim}-inch wheel.` },
    ],
    diameter: {
      title: (n) => `${n}-Inch Tires: Every Metric Size That Equals ${n}″`,
      description: (n, count, ex) => `Which metric tire sizes are ${n} inches tall? ${count} sizes by rim, with exact height in inches and mm — e.g. ${ex}.`,
      kicker: 'Tire sizes by height',
      h1: (n) => `${n}-inch tire sizes`,
      lead: (n, count) => `${count} manufactured sizes in the Atlas reference come out at about ${n} inches tall. They are listed by rim with the exact calculated diameter, width and sidewall.`,
      ruleNote: (n) => `"${n}-inch" here means an overall diameter that rounds to ${n} in (${n - 0.5} to just under ${n + 0.5} in). Real tires vary slightly by brand and tread.`,
      tableHeading: (n) => `${n}-inch sizes by rim`,
      rimGroup: (rim) => `${rim}″ rim`,
      colSize: 'Size', colDiameter: 'Exact diameter', colWidth: 'Width', colSidewall: 'Sidewall',
      flotationTag: 'flotation',
      popularHeading: (n) => `The ${n}-inch size closest to exact on each rim`,
      popularIntro: 'For each rim, the size whose calculated diameter is nearest the whole number:',
      neighboursHeading: 'Other tire heights',
      groupLink: (n) => `${n}″ tires`,
      hubHeading: 'Browse by tire height',
      hubIntro: 'Every size grouped by its overall diameter in inches — the way off-road and truck tires are usually described:',
      sizeLink: (n) => `All ${n}-inch tire sizes`,
      faqs: (n, ex, flot) => [
        { q: `What size is a ${n} inch tire in metric?`, a: `There is no single size: any metric size about ${n} inches tall counts. The closest on common rims are ${ex}.` },
        ...(flot ? [{ q: `What are the flotation ${n}-inch sizes?`, a: `In flotation notation the height is the first number: ${flot}.` }] : []),
        { q: `Can I swap my tires for a ${n}-inch size?`, a: 'A taller tire changes speedometer reading, gearing and clearance. The tables are geometry only; check wheel width, load index, clearance and the vehicle manufacturer’s approved sizes first.' },
      ],
      breadcrumb: (n) => `${n}-inch tires`,
    },
  },

  de: {
    hubTitle: 'Reifengrößen: Maße & Fahrzeugzuordnung',
    hubDescription: 'Metrische Reifengrößen mit berechneter Flanke, Durchmesser und Umfang sowie belegten Atlas-Fahrzeugzuordnungen, soweit vorhanden.',
    hubKicker: 'Reifengrößen-Referenz',
    hubH1: 'Reifengrößen in der Atlas-Fitment-Referenz',
    hubLead: (count, vehicles) => `${count} hergestellte ${plural(count, 'Reifengröße ist', 'Reifengrößen sind')} in der Atlas-Referenz dokumentiert, einschließlich der Werksgrößen von ${vehicles} belegten Fahrzeugen. Jede Seite berechnet Geometrie und echte Alternativen; Fahrzeugtreffer erscheinen nur bei belegter Zuordnung.`,
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
    groupHeading: (rim) => `${String(rim).replace('.', ',')}-Zoll-Felgen`,
    jumpLabel: 'Zur Felgengröße springen',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'Fahrzeug', 'Fahrzeuge')}` : 'Referenzgröße',
    toolsHeading: 'Mit diesen Größen rechnen',
    calculatorCta: 'Reifengrößen-Rechner',
    calculatorCtaDetail: 'Flanke, Durchmesser, Umfang und Umdrehungen für jede Größe',
    comparisonCta: 'Reifengrößen-Vergleich',
    comparisonCtaDetail: 'Zwei Größen nebeneinander mit dem echten Durchmesserunterschied',
    vehiclesCta: 'Fahrzeug-Fitment-Referenz',
    vehiclesCtaDetail: 'Werksreifengröße, Lochkreis und Drehmoment je Fahrzeug',
    boltHubCta: 'Lochkreise',
    boltHubCtaDetail: 'Lochkreis und Nabenbohrung derselben Fahrzeugdaten',

    detailKicker: 'Reifengröße',
    detailTitle: (notation, f) => f.commercial
      ? `${notation} Transporterreifen: Maße & Alternativen`
      : f.flotation
        ? `${notation} Reifen: Maße in mm & metrische Größe`
        : notation.length > 11
          ? `${notation} Reifen: Abrollumfang ${f.circumferenceMm} mm & Maße`
          : `${notation} Reifen: Abrollumfang ${f.circumferenceMm} mm & Alternativen`,
    detailDescription: (notation, f, vehicles) => `${notation}: ${f.diameterMm} mm Durchmesser, ${f.circumferenceMm} mm Abrollumfang, ${f.sidewallMm} mm Flanke. Mit Umrüstgrößen und Tachoabweichung${vehicles > 0 ? ` sowie ${vehicles} ${plural(vehicles, 'Fahrzeug', 'Fahrzeugen')}` : ''}.`,
    detailH1: (notation) => `Reifengröße ${notation}`,
    commercialKicker: 'Transporter-Reifengröße (C)',
    commercialNote: 'Das „C“ steht für einen verstärkten Leicht-Lkw-Reifen (Commercial) für Transporter und Kleinbusse. Die Nennmaße entsprechen der Pkw-Größe mit denselben Zahlen, der Reifen ist aber für höhere Lasten gebaut und wird meist mit höherem Luftdruck gefahren. Ein Pkw-Reifen ist kein tragfähiger Ersatz für einen C-Reifen.',
    commercialBreakdown: { label: 'Commercial (Transporter)', detail: 'Verstärkte Bauweise für Transporter: höhere Tragfähigkeit, meist höherer Luftdruck.' },
    commercialTwinLink: (twin) => `Pkw-Ausführung: ${twin}`,
    passengerTwinLink: (twin) => `Transporter-Ausführung (C): ${twin}`,
    inchHeading: 'Maße in Zoll',
    inchIntro: (shorthand) => `In Zoll entspricht diese Größe etwa ${shorthand} — Gesamtdurchmesser × Breite auf der angegebenen Felge.`,
    inchLabels: { diameter: 'Gesamtdurchmesser', width: 'Querschnittsbreite', sidewall: 'Flankenhöhe', circumference: 'Abrollumfang' },
    alternativesHeading: 'Umrüstgrößen auf anderen Felgen',
    alternativesIntro: 'Hergestellte Größen, deren Gesamtdurchmesser höchstens 3 % abweicht — von einem Zoll kleiner bis zwei Zoll größer, jeweils mit passender Breite. Die Tacho-Spalte zeigt die tatsächliche Geschwindigkeit, wenn der Tacho 100 km/h anzeigt.',
    alternativesEmpty: 'Keine hergestellte Größe der Referenz hält diesen Durchmesser auf einer Nachbarfelge mit sinnvoller Breite innerhalb von 3 %.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim} Zoll (gleiche Felge)` : `${rim} Zoll (${delta > 0 ? '+' : '−'}${Math.abs(delta)} Zoll)`,
    colSpeed: 'Real bei Tacho 100',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Benachbarte Größen auf derselben Felge',
    neighboursIntro: 'Eine Stufe breiter oder schmaler bzw. eine Querschnittsstufe höher oder flacher:',
    colFitment: 'Bereifung',
    fitmentStandard: 'Serie',
    fitmentOption: 'Werksoption',
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
    vehiclesEmpty: 'Diese Größe ist als hergestellte Referenzgröße dokumentiert; Atlas hat dafür aber noch keine belegte Fahrzeugzuordnung. Das ist eine Datenlücke, keine Aussage über Eignung oder Verbreitung.',
    colVehicle: 'Fahrzeug', colGeneration: 'Generation', colWheel: 'Referenzfelge', colBoltPattern: 'Lochkreis',
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
      { q: `Ist ${notation} eine gängige Reifengröße?`, a: vehicles > 0 ? `Atlas hat für diese hergestellte Größe ${vehicles} belegte ${plural(vehicles, 'Fahrzeugzuordnung', 'Fahrzeugzuordnungen')}${makes ? ` (${makes})` : ''}. Das ist eine Stichprobe, keine Marktanteilszahl.` : 'Die Größe steht in der Atlas-Referenz hergestellter Größen. Ohne belegte Fahrzeugzuordnung behauptet Atlas weder eine Marktverbreitung noch eine Fahrzeugfreigabe.' },
      { q: `Welche Fahrzeuge fahren ${notation}?`, a: vehicles > 0 ? `Die auf dieser Seite gelisteten Fahrzeuge: ${makes}. Jedes verlinkt auf seine eigene Fitment-Seite mit Lochkreis, Felgengröße und Anzugsdrehmoment.` : 'Atlas hat für diese Größe noch keine belegte Fahrzeugzuordnung.' },
      { q: 'Kann ich stattdessen eine andere Reifengröße montieren?', a: 'Oft ja, aber nur innerhalb der Grenzen, die der Fahrzeughersteller setzt. Der geometrische Vergleich oben zeigt, welche Größen dieser Referenz auf 3 % denselben Gesamtdurchmesser erreichen — das ist der erste Filter, keine Freigabe. Felgenbreite, Tragfähigkeits- und Geschwindigkeitsindex sowie der Freigang müssen weiterhin passen, und maßgeblich sind der Aufkleber und das Handbuch des Fahrzeugs.' },
      { q: `Wofür steht die ${rim} in ${notation}?`, a: `Für den Felgendurchmesser in Zoll: Dieser Reifen wird auf eine ${rim}-Zoll-Felge montiert. Die ersten beiden Zahlen sind metrisch (Millimeter und Prozent) — ein Reifencode mischt also bewusst die Einheitensysteme.` },
    ],
    breadcrumbHome: 'Startseite', breadcrumbHub: 'Reifengrößen',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Welche metrische Größe entspricht ${notation}?`, a: `${notation} ist ${f.diameterMm} mm (${f.diameterIn} Zoll) hoch und ${f.widthIn} Zoll breit, mit ${f.sidewallIn} Zoll Flankenhöhe.${f.metricEquivalents ? ` Die nächsten metrischen Größen auf derselben Felge sind ${f.metricEquivalents}.` : ''}` }
        : { q: `Wie groß ist ein ${notation} Reifen in Zoll?`, a: `${f.diameterIn} Zoll (${f.diameterMm} mm) Gesamtdurchmesser, ${f.widthIn} Zoll Breite und ${f.sidewallIn} Zoll Flankenhöhe.${f.inchClass ? ` Damit ist er ein ${f.inchClass}-Reifen.` : ''}` },
    ],
    pageNav: { label: 'Auf dieser Seite', specs: 'Maße', alternatives: 'Alternativen', vehicles: 'Fahrzeuge', code: 'Code', faq: 'FAQ' },
    specCols: { measure: 'Maß', metric: 'Metrisch', imperial: 'Zoll' },
    revsLabel: 'Umdrehungen',
    answerLabels: { diameter: 'Durchmesser', width: 'Breite', sidewall: 'Flanke', circumference: 'Abrollumfang' },
    lookup: { label: 'Reifengröße', placeholder: 'z. B. 205/55 R16', button: 'Anzeigen', notFound: 'Diese Größe ist noch nicht in der Referenz. Prüfen Sie das Format, z. B. 205/55 R16.', heading: 'Reifengröße nachschlagen', intro: 'Größe von der Reifenflanke eingeben und sofort Durchmesser, Abrollumfang und Alternativen sehen.' },
    flotationKicker: 'Reifengröße in Zoll (Flotation)',
    flotationNote: 'Eine Flotation-Größe nennt Gesamtdurchmesser und Breite direkt in Zoll, danach den Felgendurchmesser. Diese Schreibweise ist bei Offroad- und Pick-up-Reifen aus Nordamerika üblich.',
    flotationLead: (diameter, width, rim) => `Ein ${diameter} Zoll hoher und ${width} Zoll breiter Reifen auf einer ${rim}-Zoll-Felge.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Gesamtdurchmesser', detail: `${diameter} Zoll hoch, aufgepumpt und unbelastet.` },
      { token: width, label: 'Querschnittsbreite', detail: `${width} Zoll von Flanke zu Flanke.` },
      { token: 'R', label: 'Radialbauweise', detail: 'Die Karkassenlagen verlaufen radial.' },
      { token: rim, label: 'Felgendurchmesser', detail: `Montage auf einer ${rim}-Zoll-Felge.` },
    ],
    diameter: {
      title: (n) => `${n} Zoll Reifen: alle metrischen Größen mit ${n}″`,
      description: (n, count, ex) => `Welche Reifengrößen sind ${n} Zoll hoch? ${count} Größen nach Felge, mit exaktem Durchmesser in Zoll und mm — z. B. ${ex}.`,
      kicker: 'Reifengrößen nach Höhe',
      h1: (n) => `${n}-Zoll-Reifengrößen`,
      lead: (n, count) => `${count} hergestellte Größen der Atlas-Referenz sind rund ${n} Zoll hoch. Sie stehen hier nach Felge sortiert, mit exakt berechnetem Durchmesser, Breite und Flanke.`,
      ruleNote: (n) => `„${n} Zoll“ heißt hier: ein Gesamtdurchmesser, der auf ${n} Zoll gerundet wird (${String(n - 0.5).replace('.', ',')} bis knapp ${String(n + 0.5).replace('.', ',')} Zoll). Echte Reifen weichen je nach Hersteller leicht ab.`,
      tableHeading: (n) => `${n}-Zoll-Größen nach Felge`,
      rimGroup: (rim) => `${rim}-Zoll-Felge`,
      colSize: 'Größe', colDiameter: 'Exakter Durchmesser', colWidth: 'Breite', colSidewall: 'Flanke',
      flotationTag: 'Flotation',
      popularHeading: (n) => `Die ${n}-Zoll-Größe, die je Felge am genauesten passt`,
      popularIntro: 'Je Felge die Größe, deren berechneter Durchmesser am nächsten an der ganzen Zahl liegt:',
      neighboursHeading: 'Andere Reifenhöhen',
      groupLink: (n) => `${n}″ Reifen`,
      hubHeading: 'Nach Reifenhöhe suchen',
      hubIntro: 'Alle Größen nach Gesamtdurchmesser in Zoll gruppiert — so werden Offroad- und Pick-up-Reifen meist beschrieben:',
      sizeLink: (n) => `Alle ${n}-Zoll-Reifengrößen`,
      faqs: (n, ex, flot) => [
        { q: `Welche Reifengröße hat ${n} Zoll?`, a: `Es gibt nicht die eine Größe: Jede metrische Größe mit rund ${n} Zoll Durchmesser zählt. Auf gängigen Felgen am nächsten liegen ${ex}.` },
        ...(flot ? [{ q: `Welche Flotation-Größen haben ${n} Zoll?`, a: `In der Flotation-Schreibweise ist die Höhe die erste Zahl: ${flot}.` }] : []),
        { q: `Kann ich auf eine ${n}-Zoll-Größe umrüsten?`, a: 'Ein höherer Reifen verändert Tachoanzeige, Übersetzung und Freigang. Die Tabellen zeigen nur Geometrie; Felgenbreite, Tragfähigkeit, Freigang und die Herstellerfreigabe bzw. Eintragung müssen zuerst passen.' },
      ],
      breadcrumb: (n) => `${n} Zoll Reifen`,
    },
  },

  es: {
    hubTitle: 'Medidas de neumáticos: dimensiones y vehículos',
    hubDescription: 'Medidas métricas fabricadas con flanco, diámetro y circunferencia calculados, más vehículos documentados por Atlas cuando existen.',
    hubKicker: 'Referencia de medidas',
    hubH1: 'Medidas de neumático en la referencia Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'medida fabricada está documentada', 'medidas fabricadas están documentadas')} en la referencia Atlas, incluidas las medidas de origen de ${vehicles} vehículos documentados. Cada página calcula su geometría y alternativas reales; solo muestra vehículos cuando existe una relación respaldada.`,
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
    groupHeading: (rim) => `Llantas de ${String(rim).replace('.', ',')} pulgadas`,
    jumpLabel: 'Ir a un tamaño de llanta',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}` : 'Medida de referencia',
    toolsHeading: 'Calcular con estas medidas',
    calculatorCta: 'Calculadora de tamaño de neumáticos',
    calculatorCtaDetail: 'Flanco, diámetro, circunferencia y vueltas para cualquier medida',
    comparisonCta: 'Comparador de neumáticos',
    comparisonCtaDetail: 'Dos medidas lado a lado con la diferencia real de diámetro',
    vehiclesCta: 'Referencia de vehículos',
    vehiclesCtaDetail: 'Medida de origen, patrón de birlos y par por vehículo',
    boltHubCta: 'Patrones de birlos',
    boltHubCtaDetail: 'El PCD y el buje de los mismos vehículos',

    detailKicker: 'Medida de neumático',
    detailTitle: (notation, f) => f.commercial
      ? `${notation} de furgoneta: medidas y equivalencias`
      : f.flotation
        ? `Llanta ${notation}: medida en mm y equivalencia métrica`
        : `Neumático ${notation} en pulgadas: ${f.diameterIn}″ y equivalencias`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} en milímetros: ${f.diameterMm} mm de diámetro y flanco de ${f.sidewallIn}″ en rin de ${f.rim}. Medidas métricas equivalentes y error de velocímetro${vehicles > 0 ? `, con ${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}` : ''}.`
      : `¿Cuánto mide una llanta ${notation}? ${f.diameterIn} pulgadas (${f.diameterMm} mm) de diámetro y ${f.widthIn}″ de ancho. Equivalencias en otras llantas y error de velocímetro${vehicles > 0 ? `, con ${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}` : ''}.`,
    detailH1: (notation) => `Medida de neumático ${notation}`,
    commercialKicker: 'Medida de neumático de furgoneta (C)',
    commercialNote: 'La «C» indica un neumático reforzado para vehículos comerciales ligeros, como furgonetas. Sus medidas nominales coinciden con las del turismo con los mismos números, pero está construido para más carga y suele llevar más presión de inflado. Un neumático de turismo no sustituye a un neumático C en capacidad de carga.',
    commercialBreakdown: { label: 'Comercial ligero', detail: 'Construcción reforzada para furgonetas: más capacidad de carga y normalmente más presión.' },
    commercialTwinLink: (twin) => `Versión de turismo: ${twin}`,
    passengerTwinLink: (twin) => `Versión de furgoneta (C): ${twin}`,
    inchHeading: 'Medidas en pulgadas',
    inchIntro: (shorthand) => `En pulgadas, esta medida equivale aproximadamente a ${shorthand}: diámetro total × ancho sobre la llanta indicada.`,
    inchLabels: { diameter: 'Diámetro total', width: 'Ancho de sección', sidewall: 'Altura del flanco', circumference: 'Circunferencia' },
    alternativesHeading: 'Equivalencias en otras llantas',
    alternativesIntro: 'Medidas fabricadas cuyo diámetro total no se desvía más de un 3 %, desde una pulgada menos hasta dos pulgadas más y con un ancho razonable en cada caso. La columna del velocímetro indica la velocidad real cuando el velocímetro marca 100 km/h.',
    alternativesEmpty: 'Ninguna medida fabricada de la referencia mantiene este diámetro dentro del 3 % con un ancho razonable en una llanta vecina.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (misma llanta)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} pulg.)`,
    colSpeed: 'Real a 100 indicados',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Medidas cercanas en la misma llanta',
    neighboursIntro: 'Un paso más ancho o más estrecho, o un paso de perfil más alto o más bajo:',
    colFitment: 'Montaje',
    fitmentStandard: 'De serie',
    fitmentOption: 'Opción de fábrica',
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
    vehiclesEmpty: 'Esta es una medida fabricada documentada, pero Atlas aún no tiene una relación de vehículo respaldada que la utilice. Es un límite de cobertura, no una afirmación sobre su idoneidad o popularidad.',
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
      { q: `¿Es ${notation} una medida común?`, a: vehicles > 0 ? `Atlas tiene relaciones documentadas para esta medida fabricada en ${vehicles} ${plural(vehicles, 'vehículo', 'vehículos')}${makes ? ` (${makes})` : ''}. Es una muestra, no una cuota de mercado.` : 'La medida figura en la referencia Atlas de medidas fabricadas. Sin una relación documentada, Atlas no afirma cuota de mercado ni homologación para un vehículo concreto.' },
      { q: `¿Qué vehículos montan ${notation}?`, a: vehicles > 0 ? `Los vehículos listados en esta página: ${makes}. Cada uno enlaza con su ficha, con el patrón de birlos, el tamaño de llanta y el par de apriete.` : 'Ningún vehículo de la referencia de equipo original de Atlas figura actualmente con esta medida.' },
      { q: '¿Puedo montar otra medida distinta?', a: 'A menudo sí, pero solo dentro de los límites que fija el fabricante. La comparación geométrica de arriba muestra qué medidas de esta referencia quedan dentro del 3 % del mismo diámetro total: es el primer filtro, no un permiso. El ancho de llanta, el índice de carga, el de velocidad y la holgura siguen teniendo que encajar, y mandan la etiqueta y el manual del vehículo.' },
      { q: `¿Qué significa el ${rim} de ${notation}?`, a: `Es el diámetro de llanta en pulgadas: este neumático se monta en una llanta de ${rim} pulgadas. Los dos primeros números son métricos (milímetros y porcentaje), así que un código de neumático mezcla sistemas de unidades a propósito.` },
    ],
    breadcrumbHome: 'Inicio', breadcrumbHub: 'Medidas de neumáticos',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `¿Cuál es la equivalencia métrica de ${notation}?`, a: `${notation} mide ${f.diameterMm} mm (${f.diameterIn} pulgadas) de alto y ${f.widthIn} pulgadas de ancho, con un flanco de ${f.sidewallIn} pulgadas.${f.metricEquivalents ? ` Las medidas métricas más cercanas en el mismo rin son ${f.metricEquivalents}.` : ''}` }
        : { q: `¿Cuánto mide una llanta ${notation} en pulgadas?`, a: `${f.diameterIn} pulgadas (${f.diameterMm} mm) de diámetro total, ${f.widthIn} pulgadas de ancho y ${f.sidewallIn} pulgadas de flanco.${f.inchClass ? ` Es decir, una llanta de ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'En esta página', specs: 'Medidas', alternatives: 'Equivalencias', vehicles: 'Vehículos', code: 'Código', faq: 'Preguntas' },
    specCols: { measure: 'Medida', metric: 'Métrico', imperial: 'Pulgadas' },
    revsLabel: 'Vueltas',
    answerLabels: { diameter: 'Diámetro', width: 'Ancho', sidewall: 'Flanco', circumference: 'Circunferencia' },
    lookup: { label: 'Medida de llanta', placeholder: 'p. ej. 205/55 R16', button: 'Ver medida', notFound: 'Esa medida aún no está en la referencia. Revise el formato, p. ej. 205/55 R16.', heading: 'Busca cualquier medida', intro: 'Escribe la medida del costado de tu llanta y ve al instante su diámetro, ancho y equivalencias.' },
    flotationKicker: 'Medida en pulgadas (flotación)',
    flotationNote: 'Una medida de flotación indica directamente el diámetro total y el ancho en pulgadas, y después el rin. Es la nomenclatura habitual de las llantas todoterreno y de camioneta en América.',
    flotationLead: (diameter, width, rim) => `Una llanta de ${diameter} pulgadas de alto y ${width} pulgadas de ancho, para rin de ${rim} pulgadas.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Diámetro total', detail: `${diameter} pulgadas de alto, inflada y sin carga.` },
      { token: width, label: 'Ancho de sección', detail: `${width} pulgadas de flanco a flanco.` },
      { token: 'R', label: 'Construcción radial', detail: 'Las lonas de la carcasa van en radial.' },
      { token: rim, label: 'Diámetro de rin', detail: `Se monta en un rin de ${rim} pulgadas.` },
    ],
    diameter: {
      title: (n) => `Llantas de ${n} pulgadas: equivalencias en medida métrica`,
      description: (n, count, ex) => `¿Qué medida es una llanta de ${n} pulgadas? ${count} medidas métricas por rin, con el diámetro exacto en pulgadas y mm; por ejemplo ${ex}.`,
      kicker: 'Medidas por altura',
      h1: (n) => `Llantas de ${n} pulgadas`,
      lead: (n, count) => `${count} medidas fabricadas de la referencia Atlas miden unas ${n} pulgadas de alto. Aquí están por rin, con el diámetro, el ancho y el flanco calculados.`,
      ruleNote: (n) => `«${n} pulgadas» significa aquí un diámetro total que se redondea a ${n} (de ${String(n - 0.5).replace('.', ',')} a poco menos de ${String(n + 0.5).replace('.', ',')} pulgadas). Las llantas reales varían un poco según la marca.`,
      tableHeading: (n) => `Medidas de ${n} pulgadas por rin`,
      rimGroup: (rim) => `Rin ${rim}`,
      colSize: 'Medida', colDiameter: 'Diámetro exacto', colWidth: 'Ancho', colSidewall: 'Flanco',
      flotationTag: 'flotación',
      popularHeading: (n) => `La medida de ${n} pulgadas más exacta en cada rin`,
      popularIntro: 'En cada rin, la medida cuyo diámetro calculado queda más cerca del número entero:',
      neighboursHeading: 'Otras alturas de llanta',
      groupLink: (n) => `Llantas ${n}″`,
      hubHeading: 'Buscar por altura de llanta',
      hubIntro: 'Todas las medidas agrupadas por su diámetro total en pulgadas, como se suelen pedir las llantas todoterreno y de camioneta:',
      sizeLink: (n) => `Todas las llantas de ${n} pulgadas`,
      faqs: (n, ex, flot) => [
        { q: `¿Qué medida es una llanta de ${n} pulgadas?`, a: `No hay una sola: cuenta cualquier medida métrica de unas ${n} pulgadas de alto. Las más cercanas en los rines habituales son ${ex}.` },
        ...(flot ? [{ q: `¿Qué medidas de flotación son de ${n} pulgadas?`, a: `En la nomenclatura de flotación la altura es el primer número: ${flot}.` }] : []),
        { q: `¿Puedo cambiar a una llanta de ${n} pulgadas?`, a: 'Una llanta más alta cambia la lectura del velocímetro, la relación final y la holgura. Las tablas son solo geometría; revise antes el ancho del rin, el índice de carga, la holgura y las medidas aprobadas por el fabricante.' },
      ],
      breadcrumb: (n) => `Llantas ${n} pulgadas`,
    },
  },
  fr: {
    hubTitle: 'Dimensions de pneus : tailles, diamètres et véhicules',
    hubDescription: 'Toutes les tailles de pneus fabriquées avec flanc, diamètre et circonférence calculés, équivalences et véhicules documentés par Atlas.',
    hubKicker: 'Référence des dimensions',
    hubH1: 'Dimensions de pneus dans la référence Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'taille de pneu fabriquée est documentée', 'tailles de pneus fabriquées sont documentées')} dans la référence Atlas, dont les tailles d’origine de ${vehicles} véhicules documentés. Chaque page calcule sa propre géométrie et de vraies équivalences ; les véhicules n’apparaissent que lorsqu’une correspondance est documentée.`,
    notationHeading: 'Comment lire une taille de pneu',
    notationIntro: 'Un code métrique comme 205/55 R16 réunit trois mesures distinctes et une lettre de structure :',
    notationParts: [
      { token: '205', label: 'Largeur de section', detail: 'Largeur du pneu gonflé, d’un flanc à l’autre, en millimètres.' },
      { token: '55', label: 'Série (rapport hauteur/largeur)', detail: 'Hauteur du flanc en pourcentage de la largeur — 55 signifie un flanc égal à 55 % de 205 mm.' },
      { token: 'R', label: 'Structure radiale', detail: 'Les nappes de la carcasse sont disposées radialement. Presque tous les pneus tourisme modernes sont radiaux.' },
      { token: '16', label: 'Diamètre de jante', detail: 'Le diamètre de la jante, en pouces — la seule valeur impériale d’un code par ailleurs métrique.' },
    ],
    searchLabel: 'Filtrer les tailles',
    searchPlaceholder: 'ex. 205/55 ou R17',
    searchEmpty: 'Aucune taille de la référence ne correspond à ce filtre.',
    countLabel: (n) => `${n} ${plural(n, 'taille', 'tailles')}`,
    groupHeading: (rim) => `Jantes de ${String(rim).replace('.', ',')} pouces`,
    jumpLabel: 'Aller à un diamètre de jante',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'véhicule', 'véhicules')}` : 'Taille de référence',
    toolsHeading: 'Calculer avec ces tailles',
    calculatorCta: 'Calculateur de taille de pneu (en anglais)',
    calculatorCtaDetail: 'Flanc, diamètre, circonférence et tours de roue pour n’importe quelle taille',
    comparisonCta: 'Comparateur de pneus (en anglais)',
    comparisonCtaDetail: 'Deux tailles côte à côte avec l’écart réel de diamètre',
    vehiclesCta: 'Référence véhicules',
    vehiclesCtaDetail: 'Taille d’origine, entraxe et couple de serrage par véhicule',
    boltHubCta: 'Entraxes de jantes',
    boltHubCtaDetail: 'L’entraxe et l’alésage des mêmes véhicules',

    detailKicker: 'Dimension de pneu',
    detailTitle: (notation, f) => f.commercial
      ? `Pneu utilitaire ${notation} : dimensions et équivalences`
      : f.flotation
        ? `Pneu ${notation} : taille en mm et équivalent métrique`
        : `Pneu ${notation} : diamètre ${f.diameterMm} mm et équivalences`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} en millimètres : ${f.diameterMm} mm de diamètre, flanc de ${f.sidewallIn}″ sur jante de ${f.rim}. Tailles métriques équivalentes et écart du compteur${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'véhicule', 'véhicules')}` : ''}.`
      : `Pneu ${notation} : ${f.diameterMm} mm de diamètre (${f.diameterIn}″), flanc de ${f.sidewallMm} mm, circonférence de ${f.circumferenceMm} mm. Équivalences et écart du compteur${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'véhicule', 'véhicules')}` : ''}.`,
    detailH1: (notation) => `Dimension de pneu ${notation}`,
    commercialKicker: 'Pneu utilitaire (C)',
    commercialNote: 'Le « C » désigne un pneu renforcé pour véhicule utilitaire léger, comme une fourgonnette. Ses dimensions nominales sont celles de la taille tourisme aux mêmes chiffres, mais il est conçu pour des charges plus élevées et se gonfle généralement davantage. Un pneu tourisme ne remplace pas un pneu C en capacité de charge.',
    commercialBreakdown: { label: 'Utilitaire léger', detail: 'Structure renforcée pour fourgons : charge admissible plus élevée, pression généralement plus haute.' },
    commercialTwinLink: (twin) => `Version tourisme : ${twin}`,
    passengerTwinLink: (twin) => `Version utilitaire (C) : ${twin}`,
    inchHeading: 'Dimensions en pouces',
    inchIntro: (shorthand) => `En pouces, cette taille correspond à environ ${shorthand} — diamètre extérieur × largeur sur la jante indiquée.`,
    inchLabels: { diameter: 'Diamètre extérieur', width: 'Largeur de section', sidewall: 'Hauteur de flanc', circumference: 'Circonférence' },
    alternativesHeading: 'Équivalences sur d’autres jantes',
    alternativesIntro: 'Tailles fabriquées dont le diamètre extérieur ne s’écarte pas de plus de 3 %, d’un pouce de moins à deux pouces de plus, avec une largeur cohérente à chaque fois. La colonne compteur indique la vitesse réelle quand le compteur affiche 100 km/h.',
    alternativesEmpty: 'Aucune taille fabriquée de la référence ne garde ce diamètre à 3 % près avec une largeur cohérente sur une jante voisine.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (même jante)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} po)`,
    colSpeed: 'Vitesse réelle à 100',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Tailles voisines sur la même jante',
    neighboursIntro: 'Un cran plus large ou plus étroit, ou une série plus haute ou plus basse :',
    colFitment: 'Monte',
    fitmentStandard: 'D’origine',
    fitmentOption: 'Option usine',
    detailLead: (width, aspect, rim) => `Un pneu de ${width} mm de large dont le flanc mesure ${aspect} % de cette largeur, monté sur une jante de ${rim} pouces.`,
    metricsHeading: 'Dimensions calculées',
    metrics: {
      sectionWidth: 'Largeur de section', aspectRatio: 'Série', sidewallHeight: 'Hauteur de flanc',
      rimDiameterIn: 'Diamètre de jante', rimDiameterMm: 'Diamètre de jante (métrique)', overallDiameter: 'Diamètre extérieur',
      circumference: 'Circonférence', revsPerKm: 'Tours par km', revsPerMile: 'Tours par mile',
    },
    metricNote: 'Chaque valeur de cette page est calculée à partir du code avec les mêmes fonctions de géométrie que le calculateur de taille de pneu — rien n’est saisi à la main page par page. Les pneus réels s’écartent légèrement de la cote nominale selon le fabricant et la sculpture.',
    breakdownHeading: 'Ce que signifie le code',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Largeur de section', detail: `${width} mm d’un flanc à l’autre, pneu gonflé et sans charge.` },
      { token: String(aspect), label: 'Série', detail: `Le flanc mesure ${aspect} % de ${width} mm.` },
      { token: 'R', label: 'Structure radiale', detail: 'Les nappes de la carcasse sont radiales — la norme en tourisme.' },
      { token: String(rim), label: 'Diamètre de jante', detail: `Se monte sur une jante de ${rim} pouces.` },
    ],
    visualHeading: 'Coupe à cette taille',
    crossAria: (notation) => `Schéma en coupe d’un pneu ${notation} avec largeur de section, hauteur de flanc, bande de roulement, talon et jante`,
    crossTread: 'Bande de roulement',
    crossSidewall: 'Flanc',
    crossBead: 'Talon',
    crossRimCaption: 'cavité intérieure au-dessus de la jante',
    visualNote: 'Dessinée avec la largeur de section et la hauteur de flanc réelles de cette taille, avec la même fonction de géométrie que le calculateur — les proportions sont calculées, pas décoratives.',
    vehiclesHeading: 'Véhicules avec cette taille',
    vehiclesIntro: (n) => `Atlas recense ${n} ${plural(n, 'véhicule documenté', 'véhicules documentés')} avec cette taille. Les finitions et millésimes varient — vérifiez toujours l’étiquette du véhicule concerné.`,
    vehiclesEmpty: 'Cette taille fabriquée est documentée, mais Atlas n’a pas encore de véhicule documenté qui l’utilise. C’est une limite de couverture, pas un avis sur la taille.',
    colVehicle: 'Véhicule', colGeneration: 'Génération', colWheel: 'Jante d’origine', colBoltPattern: 'Entraxe',
    colConfidence: 'Fiabilité de la source',
    confidence: { high: 'Élevée', medium: 'Moyenne', low: 'Faible' },
    confidenceNote: 'La fiabilité est indiquée par ligne, pas par page : elle reflète la solidité des sources trouvées par Atlas pour cette ligne précise. Sources et réserves figurent sur la fiche de chaque véhicule.',
    vehiclePageLink: 'Ouvrir la fiche du véhicule',
    compareHeading: 'Tailles géométriquement proches',
    compareIntro: 'Autres tailles de la référence dont le diamètre extérieur calculé est à moins de 3 % de celui-ci :',
    compareEmpty: 'Aucune autre taille de la référence n’est à moins de 3 % de ce diamètre.',
    compareLabel: 'Comparer',
    colSize: 'Taille', colDiameter: 'Diamètre extérieur', colDifference: 'Écart',
    compareCaveat: 'Il s’agit d’une comparaison géométrique, pas d’une recommandation de montage. Un diamètre proche ne rend pas une taille montable en toute sécurité : largeur de jante, indices de charge et de vitesse, dégagement intérieur et extérieur et tailles homologuées par le constructeur comptent aussi. Vérifiez les exigences d’origine de votre véhicule avant de changer de taille.',
    ctaHeading: 'Faites le calcul vous-même',
    ctaNote: 'Les deux outils s’ouvrent préremplis avec cette taille.',
    relatedHeading: 'Données associées',
    backToHub: 'Toutes les tailles',
    faqHeading: 'Questions fréquentes',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `${notation} est-elle une taille courante ?`, a: vehicles > 0 ? `Atlas a documenté cette taille sur ${vehicles} ${plural(vehicles, 'véhicule', 'véhicules')}${makes ? ` (${makes})` : ''}. C’est un échantillon documenté, pas une part de marché.` : 'Elle figure dans la référence Atlas des tailles fabriquées. Sans correspondance documentée, Atlas n’avance ni part de marché ni homologation pour un véhicule.' },
      { q: `Quels véhicules montent du ${notation} ?`, a: vehicles > 0 ? `Les véhicules listés sur cette page : ${makes}. Chacun renvoie à sa fiche avec l’entraxe, la taille de jante et le couple de serrage.` : 'Aucun véhicule de la référence Atlas n’est actuellement associé à cette taille.' },
      { q: 'Puis-je monter une autre taille à la place ?', a: 'Souvent oui, mais uniquement dans les limites fixées par le constructeur. La comparaison géométrique ci-dessus montre quelles tailles restent à 3 % du même diamètre : c’est un premier filtre, pas une autorisation. Largeur de jante, indices de charge et de vitesse et dégagement doivent aussi convenir ; la plaque et le manuel du véhicule font foi.' },
      { q: `Que signifie le ${rim} de ${notation} ?`, a: `C’est le diamètre de jante en pouces : ce pneu se monte sur une jante de ${rim} pouces. Les deux premiers chiffres sont métriques (millimètres et pourcentage) — un code de pneu mélange volontairement les unités.` },
    ],
    breadcrumbHome: 'Accueil', breadcrumbHub: 'Dimensions de pneus',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Quel est l’équivalent métrique du ${notation} ?`, a: `Le ${notation} mesure ${f.diameterMm} mm (${f.diameterIn} pouces) de haut et ${f.widthIn} pouces de large, avec un flanc de ${f.sidewallIn} pouces.${f.metricEquivalents ? ` Les tailles métriques les plus proches sur la même jante sont ${f.metricEquivalents}.` : ''}` }
        : { q: `Quelle est la taille d’un pneu ${notation} en pouces ?`, a: `${f.diameterIn} pouces (${f.diameterMm} mm) de diamètre extérieur, ${f.widthIn} pouces de large et ${f.sidewallIn} pouces de flanc.${f.inchClass ? ` C’est donc un pneu de ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'Sur cette page', specs: 'Dimensions', alternatives: 'Équivalences', vehicles: 'Véhicules', code: 'Code', faq: 'FAQ' },
    specCols: { measure: 'Mesure', metric: 'Métrique', imperial: 'Pouces' },
    revsLabel: 'Tours de roue',
    answerLabels: { diameter: 'Diamètre', width: 'Largeur', sidewall: 'Flanc', circumference: 'Circonférence' },
    lookup: { label: 'Taille de pneu', placeholder: 'ex. 205/55 R16', button: 'Afficher', notFound: 'Cette taille n’est pas encore dans la référence. Vérifiez le format, ex. 205/55 R16.', heading: 'Rechercher une taille de pneu', intro: 'Saisissez la taille inscrite sur le flanc pour voir aussitôt son diamètre, sa circonférence et ses équivalences.' },
    flotationKicker: 'Taille en pouces (flotation)',
    flotationNote: 'Une taille « flotation » indique directement le diamètre extérieur et la largeur en pouces, puis la jante. C’est la notation habituelle des pneus tout-terrain et pick-up d’origine nord-américaine.',
    flotationLead: (diameter, width, rim) => `Un pneu de ${diameter} pouces de haut et ${width} pouces de large, sur jante de ${rim} pouces.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Diamètre extérieur', detail: `${diameter} pouces de haut, gonflé et sans charge.` },
      { token: width, label: 'Largeur de section', detail: `${width} pouces d’un flanc à l’autre.` },
      { token: 'R', label: 'Structure radiale', detail: 'Les nappes de la carcasse sont radiales.' },
      { token: rim, label: 'Diamètre de jante', detail: `Se monte sur une jante de ${rim} pouces.` },
    ],
    diameter: {
      title: (n) => `Pneus de ${n} pouces : toutes les tailles équivalentes`,
      description: (n, count, ex) => `Quelles tailles de pneus font ${n} pouces de diamètre ? ${count} tailles par jante, avec la hauteur exacte en pouces et en mm — par ex. ${ex}.`,
      kicker: 'Tailles par hauteur',
      h1: (n) => `Pneus de ${n} pouces`,
      lead: (n, count) => `${count} tailles fabriquées de la référence Atlas mesurent environ ${n} pouces de haut. Elles sont classées par jante avec le diamètre, la largeur et le flanc calculés.`,
      ruleNote: (n) => `« ${n} pouces » signifie ici un diamètre extérieur arrondi à ${n} (de ${String(n - 0.5).replace('.', ',')} à un peu moins de ${String(n + 0.5).replace('.', ',')} pouces). Les pneus réels varient légèrement selon la marque.`,
      tableHeading: (n) => `Tailles de ${n} pouces par jante`,
      rimGroup: (rim) => `Jante ${rim}″`,
      colSize: 'Taille', colDiameter: 'Diamètre exact', colWidth: 'Largeur', colSidewall: 'Flanc',
      flotationTag: 'flotation',
      popularHeading: (n) => `La taille de ${n} pouces la plus exacte sur chaque jante`,
      popularIntro: 'Pour chaque jante, la taille dont le diamètre calculé est le plus proche du nombre entier :',
      neighboursHeading: 'Autres hauteurs de pneu',
      groupLink: (n) => `Pneus ${n}″`,
      hubHeading: 'Rechercher par hauteur de pneu',
      hubIntro: 'Toutes les tailles regroupées par diamètre extérieur en pouces, comme on désigne souvent les pneus tout-terrain et pick-up :',
      sizeLink: (n) => `Toutes les tailles de ${n} pouces`,
      faqs: (n, ex, flot) => [
        { q: `Quelle taille correspond à un pneu de ${n} pouces ?`, a: `Il n’y en a pas qu’une : toute taille métrique d’environ ${n} pouces de haut convient. Les plus proches sur les jantes courantes sont ${ex}.` },
        ...(flot ? [{ q: `Quelles tailles flotation font ${n} pouces ?`, a: `En notation flotation, la hauteur est le premier chiffre : ${flot}.` }] : []),
        { q: `Puis-je passer à un pneu de ${n} pouces ?`, a: 'Un pneu plus haut modifie l’affichage du compteur, la démultiplication et le dégagement. Les tableaux ne décrivent que la géométrie ; vérifiez d’abord la largeur de jante, l’indice de charge, le dégagement et les tailles homologuées pour votre véhicule.' },
      ],
      breadcrumb: (n) => `Pneus ${n} pouces`,
    },
  },
  'it': {
    hubTitle: 'Misure pneumatici: dimensioni, diametri e veicoli',
    hubDescription: 'Tutte le misure di pneumatici in produzione con spalla, diametro e circonferenza calcolati, equivalenze e veicoli documentati da Atlas.',
    hubKicker: 'Riferimento misure pneumatici',
    hubH1: 'Misure pneumatici nel riferimento Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'misura di pneumatico in produzione è documentata', 'misure di pneumatici in produzione sono documentate')} nel riferimento Atlas, comprese le misure di primo equipaggiamento di ${vehicles} ${plural(vehicles, 'veicolo documentato', 'veicoli documentati')}. Ogni pagina calcola la propria geometria e le vere equivalenze; i veicoli compaiono solo quando esiste una corrispondenza documentata.`,
    notationHeading: 'Come leggere una misura pneumatico',
    notationIntro: 'Un codice metrico come 205/55 R16 riunisce tre misure distinte e una lettera che indica la struttura:',
    notationParts: [
      { token: '205', label: 'Larghezza di sezione', detail: 'Larghezza dello pneumatico gonfio, da un fianco all’altro, in millimetri.' },
      { token: '55', label: 'Serie (rapporto altezza/larghezza)', detail: 'Altezza della spalla in percentuale della larghezza: 55 significa una spalla pari al 55% di 205 mm.' },
      { token: 'R', label: 'Struttura radiale', detail: 'Le tele della carcassa sono disposte radialmente. Quasi tutti gli pneumatici moderni per autovetture sono radiali.' },
      { token: '16', label: 'Diametro del cerchio', detail: 'Il diametro del cerchio, in pollici: l’unico valore imperiale in un codice per il resto metrico.' },
    ],
    searchLabel: 'Filtra le misure',
    searchPlaceholder: 'es. 205/55 o R17',
    searchEmpty: 'Nessuna misura del riferimento corrisponde a questo filtro.',
    countLabel: (n) => `${n} ${plural(n, 'misura', 'misure')}`,
    groupHeading: (rim) => `Cerchi da ${String(rim).replace('.', ',')} pollici`,
    jumpLabel: 'Vai a un diametro del cerchio',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'veicolo', 'veicoli')}` : 'Misura di riferimento',
    toolsHeading: 'Calcola con queste misure',
    calculatorCta: 'Calcolatore misura pneumatici (in inglese)',
    calculatorCtaDetail: 'Spalla, diametro, circonferenza e giri ruota per qualsiasi misura',
    comparisonCta: 'Confronto misure pneumatici (in inglese)',
    comparisonCtaDetail: 'Due misure a confronto con la reale differenza di diametro',
    vehiclesCta: 'Riferimento veicoli',
    vehiclesCtaDetail: 'Misura di serie, foratura e coppia di serraggio per veicolo',
    boltHubCta: 'Forature cerchi',
    boltHubCtaDetail: 'Foratura e foro centrale degli stessi veicoli',

    detailKicker: 'Misura pneumatico',
    detailTitle: (notation, f) => f.commercial
      ? `Pneumatico furgone ${notation}: misure ed equivalenze`
      : f.flotation
        ? `Pneumatico ${notation} in mm: equivalente metrico`
        : `Misura ${notation}: diametro ${f.diameterMm} mm ed equivalenze`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} in millimetri: ${f.diameterMm} mm di diametro, spalla da ${f.sidewallIn}″ su cerchio da ${f.rim}. Misure metriche equivalenti e scarto del tachimetro${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'veicolo', 'veicoli')}` : ''}.`
      : `Pneumatico ${notation}: ${f.diameterMm} mm di diametro (${f.diameterIn}″), spalla da ${f.sidewallMm} mm, circonferenza di ${f.circumferenceMm} mm. Equivalenze e scarto del tachimetro${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'veicolo', 'veicoli')}` : ''}.`,
    detailH1: (notation) => `Misura pneumatico ${notation}`,
    commercialKicker: 'Pneumatico per veicoli commerciali (C)',
    commercialNote: 'La «C» indica uno pneumatico rinforzato per veicoli commerciali leggeri, come i furgoni. Le dimensioni nominali sono quelle della misura per autovettura con gli stessi numeri, ma è progettato per carichi più elevati e di solito si gonfia a una pressione maggiore. Uno pneumatico per autovettura non sostituisce uno pneumatico C in termini di capacità di carico.',
    commercialBreakdown: { label: 'Commerciale leggero', detail: 'Struttura rinforzata per furgoni: capacità di carico più alta, pressione di solito più elevata.' },
    commercialTwinLink: (twin) => `Versione per autovettura: ${twin}`,
    passengerTwinLink: (twin) => `Versione per furgoni (C): ${twin}`,
    inchHeading: 'Dimensioni in pollici',
    inchIntro: (shorthand) => `In pollici questa misura corrisponde a circa ${shorthand}: diametro esterno × larghezza di sezione sul cerchio indicato.`,
    inchLabels: { diameter: 'Diametro esterno', width: 'Larghezza di sezione', sidewall: 'Altezza della spalla', circumference: 'Circonferenza' },
    alternativesHeading: 'Equivalenze su altri cerchi',
    alternativesIntro: 'Misure in produzione il cui diametro esterno non si discosta più del 3%, da un pollice in meno a due pollici in più, con una larghezza coerente a ogni passo. La colonna tachimetro indica la velocità reale quando il tachimetro segna 100 km/h.',
    alternativesEmpty: 'Nessuna misura in produzione del riferimento mantiene questo diametro entro il 3% con una larghezza coerente su un cerchio vicino.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (stesso cerchio)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} poll.)`,
    colSpeed: 'Velocità reale a 100',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Misure vicine sullo stesso cerchio',
    neighboursIntro: 'Un passo più larga o più stretta, oppure una serie più alta o più bassa:',
    colFitment: 'Montaggio',
    fitmentStandard: 'Di serie',
    fitmentOption: 'Optional di fabbrica',
    detailLead: (width, aspect, rim) => `Uno pneumatico largo ${width} mm con una spalla pari al ${aspect}% di questa larghezza, montato su un cerchio da ${rim} pollici.`,
    metricsHeading: 'Dimensioni calcolate',
    metrics: {
      sectionWidth: 'Larghezza di sezione', aspectRatio: 'Serie', sidewallHeight: 'Altezza della spalla',
      rimDiameterIn: 'Diametro del cerchio', rimDiameterMm: 'Diametro del cerchio (metrico)', overallDiameter: 'Diametro esterno',
      circumference: 'Circonferenza', revsPerKm: 'Giri per km', revsPerMile: 'Giri per miglio',
    },
    metricNote: 'Ogni valore di questa pagina è calcolato dal codice con le stesse funzioni geometriche del calcolatore di misure pneumatici: nulla è inserito a mano pagina per pagina. Gli pneumatici reali si discostano leggermente dalla quota nominale a seconda del produttore e del disegno del battistrada.',
    breakdownHeading: 'Cosa significa il codice',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Larghezza di sezione', detail: `${width} mm da un fianco all’altro, con pneumatico gonfio e senza carico.` },
      { token: String(aspect), label: 'Serie', detail: `La spalla misura il ${aspect}% di ${width} mm.` },
      { token: 'R', label: 'Struttura radiale', detail: 'Le tele della carcassa sono radiali: lo standard sulle autovetture.' },
      { token: String(rim), label: 'Diametro del cerchio', detail: `Si monta su un cerchio da ${rim} pollici.` },
    ],
    visualHeading: 'Sezione a questa misura',
    crossAria: (notation) => `Schema in sezione di uno pneumatico ${notation} con larghezza di sezione, altezza della spalla, battistrada, tallone e cerchio`,
    crossTread: 'Battistrada',
    crossSidewall: 'Spalla',
    crossBead: 'Tallone',
    crossRimCaption: 'cavità interna sopra il cerchio',
    visualNote: 'Disegnata con la larghezza di sezione e l’altezza della spalla reali di questa misura, con la stessa funzione geometrica del calcolatore: le proporzioni sono calcolate, non decorative.',
    vehiclesHeading: 'Veicoli con questa misura',
    vehiclesIntro: (n) => `Atlas registra ${n} ${plural(n, 'veicolo documentato', 'veicoli documentati')} con questa misura. Allestimenti e anni modello variano: verificare sempre l’etichetta del veicolo in questione.`,
    vehiclesEmpty: 'Questa misura in produzione è documentata, ma Atlas non ha ancora un veicolo documentato che la utilizzi. È un limite di copertura, non un giudizio sulla misura.',
    colVehicle: 'Veicolo', colGeneration: 'Generazione', colWheel: 'Cerchio di serie', colBoltPattern: 'Foratura',
    colConfidence: 'Affidabilità della fonte',
    confidence: { high: 'Alta', medium: 'Media', low: 'Bassa' },
    confidenceNote: 'L’affidabilità è indicata per riga, non per pagina: riflette la solidità delle fonti trovate da Atlas per quella riga specifica. Fonti e riserve sono riportate nella scheda di ciascun veicolo.',
    vehiclePageLink: 'Apri la scheda del veicolo',
    compareHeading: 'Misure geometricamente simili',
    compareIntro: 'Altre misure del riferimento il cui diametro esterno calcolato rientra nel 3% di questa:',
    compareEmpty: 'Nessun’altra misura del riferimento rientra nel 3% di questo diametro.',
    compareLabel: 'Confronta',
    colSize: 'Misura', colDiameter: 'Diametro esterno', colDifference: 'Differenza',
    compareCaveat: 'Si tratta di un confronto geometrico, non di una raccomandazione di montaggio. Un diametro simile non rende una misura montabile in sicurezza: contano anche larghezza del cerchio, indice di carico e codice di velocità, spazio libero interno ed esterno e misure omologate dal costruttore. Verificare i requisiti di serie del proprio veicolo prima di cambiare misura.',
    ctaHeading: 'Fare il calcolo in autonomia',
    ctaNote: 'Entrambi gli strumenti si aprono precompilati con questa misura.',
    relatedHeading: 'Dati correlati',
    backToHub: 'Tutte le misure',
    faqHeading: 'Domande frequenti',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `${notation} è una misura comune?`, a: vehicles > 0 ? `Atlas ha documentato questa misura su ${vehicles} ${plural(vehicles, 'veicolo', 'veicoli')}${makes ? ` (${makes})` : ''}. È un campione documentato, non una quota di mercato.` : 'Compare nel riferimento Atlas delle misure in produzione. Senza una corrispondenza documentata, Atlas non indica né quote di mercato né omologazioni per un veicolo.' },
      { q: `Quali veicoli montano ${notation}?`, a: vehicles > 0 ? `I veicoli elencati in questa pagina: ${makes}. Ognuno rimanda alla propria scheda con foratura, misura del cerchio e coppia di serraggio.` : 'Nessun veicolo del riferimento Atlas è attualmente associato a questa misura.' },
      { q: 'Posso montare una misura diversa?', a: 'Spesso sì, ma solo entro i limiti fissati dal costruttore. Il confronto geometrico qui sopra mostra quali misure restano entro il 3% dello stesso diametro: è un primo filtro, non un’autorizzazione. Anche larghezza del cerchio, indice di carico, codice di velocità e spazio libero devono essere adeguati; fanno fede l’etichetta e il manuale del veicolo.' },
      { q: `Cosa significa il ${rim} in ${notation}?`, a: `È il diametro del cerchio in pollici: questo pneumatico si monta su un cerchio da ${rim} pollici. I primi due numeri sono metrici (millimetri e percentuale): un codice pneumatico mescola volutamente le unità di misura.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Misure pneumatici',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Qual è l’equivalente metrico di ${notation}?`, a: `${notation} misura ${f.diameterMm} mm (${f.diameterIn} pollici) di altezza e ${f.widthIn} pollici di larghezza, con una spalla di ${f.sidewallIn} pollici.${f.metricEquivalents ? ` Le misure metriche più vicine sullo stesso cerchio sono ${f.metricEquivalents}.` : ''}` }
        : { q: `Quanto misura uno pneumatico ${notation} in pollici?`, a: `${f.diameterIn} pollici (${f.diameterMm} mm) di diametro esterno, ${f.widthIn} pollici di larghezza e ${f.sidewallIn} pollici di spalla.${f.inchClass ? ` È quindi uno pneumatico da ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'In questa pagina', specs: 'Dimensioni', alternatives: 'Equivalenze', vehicles: 'Veicoli', code: 'Codice', faq: 'FAQ' },
    specCols: { measure: 'Misura', metric: 'Metrico', imperial: 'Pollici' },
    revsLabel: 'Giri ruota',
    answerLabels: { diameter: 'Diametro', width: 'Larghezza', sidewall: 'Spalla', circumference: 'Circonferenza' },
    lookup: { label: 'Misura pneumatico', placeholder: 'es. 205/55 R16', button: 'Mostra', notFound: 'Questa misura non è ancora nel riferimento. Verificare il formato, es. 205/55 R16.', heading: 'Cerca una misura pneumatico', intro: 'Inserire la misura riportata sul fianco per vedere subito diametro, circonferenza ed equivalenze.' },
    flotationKicker: 'Misura in pollici (flotation)',
    flotationNote: 'Una misura «flotation» indica direttamente il diametro esterno e la larghezza in pollici, poi il cerchio. È la notazione abituale degli pneumatici fuoristrada e pick-up di origine nordamericana.',
    flotationLead: (diameter, width, rim) => `Uno pneumatico alto ${diameter} pollici e largo ${width} pollici, su cerchio da ${rim} pollici.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Diametro esterno', detail: `${diameter} pollici di altezza, gonfio e senza carico.` },
      { token: width, label: 'Larghezza di sezione', detail: `${width} pollici da un fianco all’altro.` },
      { token: 'R', label: 'Struttura radiale', detail: 'Le tele della carcassa sono radiali.' },
      { token: rim, label: 'Diametro del cerchio', detail: `Si monta su un cerchio da ${rim} pollici.` },
    ],
    diameter: {
      title: (n) => `Pneumatici da ${n} pollici: le misure equivalenti`,
      description: (n, count, ex) => `Quali misure di pneumatici hanno un diametro di ${n} pollici? ${count} misure per cerchio, con l’altezza esatta in pollici e in mm, ad es. ${ex}.`,
      kicker: 'Misure per altezza',
      h1: (n) => `Pneumatici da ${n} pollici`,
      lead: (n, count) => `${count} misure in produzione del riferimento Atlas sono alte circa ${n} pollici. Sono ordinate per cerchio con diametro, larghezza e spalla calcolati.`,
      ruleNote: (n) => `«${n} pollici» indica qui un diametro esterno arrotondato a ${n} (da ${String(n - 0.5).replace('.', ',')} a poco meno di ${String(n + 0.5).replace('.', ',')} pollici). Gli pneumatici reali variano leggermente a seconda della marca.`,
      tableHeading: (n) => `Misure da ${n} pollici per cerchio`,
      rimGroup: (rim) => `Cerchio ${rim}″`,
      colSize: 'Misura', colDiameter: 'Diametro esatto', colWidth: 'Larghezza', colSidewall: 'Spalla',
      flotationTag: 'flotation',
      popularHeading: (n) => `La misura da ${n} pollici più precisa su ogni cerchio`,
      popularIntro: 'Per ogni cerchio, la misura il cui diametro calcolato è più vicino al numero intero:',
      neighboursHeading: 'Altre altezze di pneumatico',
      groupLink: (n) => `Pneumatici ${n}″`,
      hubHeading: 'Cerca per altezza dello pneumatico',
      hubIntro: 'Tutte le misure raggruppate per diametro esterno in pollici, come si indicano spesso gli pneumatici fuoristrada e pick-up:',
      sizeLink: (n) => `Tutte le misure da ${n} pollici`,
      faqs: (n, ex, flot) => [
        { q: `Quale misura corrisponde a uno pneumatico da ${n} pollici?`, a: `Non ce n’è una sola: va bene qualsiasi misura metrica alta circa ${n} pollici. Le più vicine sui cerchi più comuni sono ${ex}.` },
        ...(flot ? [{ q: `Quali misure flotation sono da ${n} pollici?`, a: `Nella notazione flotation l’altezza è il primo numero: ${flot}.` }] : []),
        { q: `Posso passare a uno pneumatico da ${n} pollici?`, a: 'Uno pneumatico più alto modifica l’indicazione del tachimetro, la rapportatura e lo spazio libero. Le tabelle descrivono solo la geometria; verificare prima larghezza del cerchio, indice di carico, spazio libero e misure omologate per il proprio veicolo.' },
      ],
      breadcrumb: (n) => `Pneumatici ${n} pollici`,
    },
  },
  'pt-br': {
    hubTitle: 'Medidas de pneus: diâmetros, equivalências e veículos',
    hubDescription: 'Todas as medidas de pneus fabricadas com flanco, diâmetro e circunferência calculados, equivalências e veículos documentados pela Atlas.',
    hubKicker: 'Referência de medidas',
    hubH1: 'Medidas de pneus na referência Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'medida de pneu fabricada está documentada', 'medidas de pneus fabricadas estão documentadas')} na referência Atlas, incluindo as medidas originais de ${vehicles} veículos documentados. Cada página calcula sua própria geometria e equivalências reais; os veículos só aparecem quando há uma correspondência documentada.`,
    notationHeading: 'Como ler a medida de um pneu',
    notationIntro: 'Um código métrico como 205/55 R16 reúne três medidas distintas e uma letra de construção:',
    notationParts: [
      { token: '205', label: 'Largura da seção', detail: 'Largura do pneu inflado, de um flanco ao outro, em milímetros.' },
      { token: '55', label: 'Série (relação altura/largura)', detail: 'Altura do flanco como porcentagem da largura — 55 significa um flanco igual a 55% de 205 mm.' },
      { token: 'R', label: 'Construção radial', detail: 'As lonas da carcaça são dispostas radialmente. Praticamente todos os pneus de passeio modernos são radiais.' },
      { token: '16', label: 'Diâmetro do aro', detail: 'O diâmetro do aro, em polegadas — o único valor imperial em um código que, no resto, é métrico.' },
    ],
    searchLabel: 'Filtrar medidas',
    searchPlaceholder: 'ex.: 205/55 ou R17',
    searchEmpty: 'Nenhuma medida da referência corresponde a esse filtro.',
    countLabel: (n) => `${n} ${plural(n, 'medida', 'medidas')}`,
    groupHeading: (rim) => `Aros de ${String(rim).replace('.', ',')} polegadas`,
    jumpLabel: 'Ir para um diâmetro de aro',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'veículo', 'veículos')}` : 'Medida de referência',
    toolsHeading: 'Calcular com estas medidas',
    calculatorCta: 'Calculadora de medida de pneu (em inglês)',
    calculatorCtaDetail: 'Flanco, diâmetro, circunferência e voltas da roda para qualquer medida',
    comparisonCta: 'Comparador de pneus (em inglês)',
    comparisonCtaDetail: 'Duas medidas lado a lado com a diferença real de diâmetro',
    vehiclesCta: 'Referência de veículos',
    vehiclesCtaDetail: 'Medida original, furação e torque de aperto por veículo',
    boltHubCta: 'Furação de rodas',
    boltHubCtaDetail: 'A furação e o furo central dos mesmos veículos',

    detailKicker: 'Medida de pneu',
    detailTitle: (notation, f) => f.commercial
      ? `Pneu comercial ${notation}: medidas e equivalências`
      : f.flotation
        ? `Pneu ${notation}: medida em mm e equivalente métrico`
        : `Pneu ${notation}: diâmetro ${f.diameterMm} mm e equivalências`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} em milímetros: ${f.diameterMm} mm de diâmetro, flanco de ${f.sidewallIn}″ em aro ${f.rim}. Medidas métricas equivalentes e desvio do velocímetro${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'veículo', 'veículos')}` : ''}.`
      : `Pneu ${notation}: ${f.diameterMm} mm de diâmetro (${f.diameterIn}″), flanco de ${f.sidewallMm} mm, circunferência de ${f.circumferenceMm} mm. Equivalências e desvio do velocímetro${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'veículo', 'veículos')}` : ''}.`,
    detailH1: (notation) => `Medida de pneu ${notation}`,
    commercialKicker: 'Pneu comercial leve (C)',
    commercialNote: 'O “C” indica um pneu reforçado para veículos comerciais leves, como vans e furgões. Suas dimensões nominais são as mesmas da medida de passeio com os mesmos números, mas ele é projetado para cargas maiores e geralmente roda com pressão mais alta. Um pneu de passeio não substitui um pneu C em capacidade de carga.',
    commercialBreakdown: { label: 'Comercial leve', detail: 'Construção reforçada para vans: maior capacidade de carga, pressão geralmente mais alta.' },
    commercialTwinLink: (twin) => `Versão de passeio: ${twin}`,
    passengerTwinLink: (twin) => `Versão comercial (C): ${twin}`,
    inchHeading: 'Medidas em polegadas',
    inchIntro: (shorthand) => `Em polegadas, esta medida corresponde a cerca de ${shorthand} — diâmetro externo × largura, no aro indicado.`,
    inchLabels: { diameter: 'Diâmetro externo', width: 'Largura da seção', sidewall: 'Altura do flanco', circumference: 'Circunferência' },
    alternativesHeading: 'Equivalências em outros aros',
    alternativesIntro: 'Medidas fabricadas cujo diâmetro externo não varia mais de 3%, de uma polegada a menos até duas polegadas a mais, com uma largura coerente em cada caso. A coluna do velocímetro mostra a velocidade real quando o velocímetro marca 100 km/h.',
    alternativesEmpty: 'Nenhuma medida fabricada da referência mantém este diâmetro dentro de 3% com uma largura coerente em um aro vizinho.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (mesmo aro)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} pol)`,
    colSpeed: 'Velocidade real a 100',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Medidas vizinhas no mesmo aro',
    neighboursIntro: 'Uma medida mais larga ou mais estreita, ou uma série mais alta ou mais baixa:',
    colFitment: 'Aplicação',
    fitmentStandard: 'Original',
    fitmentOption: 'Opcional de fábrica',
    detailLead: (width, aspect, rim) => `Um pneu de ${width} mm de largura cujo flanco mede ${aspect}% dessa largura, montado em um aro de ${rim} polegadas.`,
    metricsHeading: 'Dimensões calculadas',
    metrics: {
      sectionWidth: 'Largura da seção', aspectRatio: 'Série', sidewallHeight: 'Altura do flanco',
      rimDiameterIn: 'Diâmetro do aro', rimDiameterMm: 'Diâmetro do aro (métrico)', overallDiameter: 'Diâmetro externo',
      circumference: 'Circunferência', revsPerKm: 'Voltas por km', revsPerMile: 'Voltas por milha',
    },
    metricNote: 'Cada valor desta página é calculado a partir do código com as mesmas funções de geometria da calculadora de medida de pneu — nada é digitado à mão página por página. Os pneus reais variam ligeiramente em relação à medida nominal conforme o fabricante e o desenho da banda.',
    breakdownHeading: 'O que o código significa',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Largura da seção', detail: `${width} mm de um flanco ao outro, com o pneu inflado e sem carga.` },
      { token: String(aspect), label: 'Série', detail: `O flanco mede ${aspect}% de ${width} mm.` },
      { token: 'R', label: 'Construção radial', detail: 'As lonas da carcaça são radiais — o padrão nos pneus de passeio.' },
      { token: String(rim), label: 'Diâmetro do aro', detail: `Monta em um aro de ${rim} polegadas.` },
    ],
    visualHeading: 'Corte nesta medida',
    crossAria: (notation) => `Diagrama em corte de um pneu ${notation} com largura da seção, altura do flanco, banda de rodagem, talão e aro`,
    crossTread: 'Banda de rodagem',
    crossSidewall: 'Flanco',
    crossBead: 'Talão',
    crossRimCaption: 'cavidade interna acima do aro',
    visualNote: 'Desenhado com a largura da seção e a altura do flanco reais desta medida, com a mesma função de geometria da calculadora — as proporções são calculadas, não decorativas.',
    vehiclesHeading: 'Veículos com esta medida',
    vehiclesIntro: (n) => `A Atlas lista ${n} ${plural(n, 'veículo documentado', 'veículos documentados')} com esta medida. Versões e anos-modelo variam — confira sempre a etiqueta do veículo em questão.`,
    vehiclesEmpty: 'Esta medida fabricada está documentada, mas a Atlas ainda não tem um veículo documentado que a utilize. É um limite de cobertura, não uma avaliação da medida.',
    colVehicle: 'Veículo', colGeneration: 'Geração', colWheel: 'Roda original', colBoltPattern: 'Furação',
    colConfidence: 'Confiabilidade da fonte',
    confidence: { high: 'Alta', medium: 'Média', low: 'Baixa' },
    confidenceNote: 'A confiabilidade é indicada por linha, não por página: ela reflete a solidez das fontes que a Atlas encontrou para aquela linha específica. Fontes e ressalvas estão na página de cada veículo.',
    vehiclePageLink: 'Abrir a página do veículo',
    compareHeading: 'Medidas geometricamente próximas',
    compareIntro: 'Outras medidas da referência cujo diâmetro externo calculado fica a menos de 3% deste:',
    compareEmpty: 'Nenhuma outra medida da referência fica a menos de 3% deste diâmetro.',
    compareLabel: 'Comparar',
    colSize: 'Medida', colDiameter: 'Diâmetro externo', colDifference: 'Diferença',
    compareCaveat: 'Esta é uma comparação geométrica, não uma recomendação de montagem. Um diâmetro próximo não torna uma medida segura para montar: largura da roda, índices de carga e de velocidade, folga interna e externa e as medidas homologadas pelo fabricante também importam. Verifique as exigências originais do seu veículo antes de mudar de medida.',
    ctaHeading: 'Faça o cálculo você mesmo',
    ctaNote: 'As duas ferramentas abrem já preenchidas com esta medida.',
    relatedHeading: 'Dados relacionados',
    backToHub: 'Todas as medidas',
    faqHeading: 'Perguntas frequentes',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `${notation} é uma medida comum?`, a: vehicles > 0 ? `A Atlas documentou esta medida em ${vehicles} ${plural(vehicles, 'veículo', 'veículos')}${makes ? ` (${makes})` : ''}. É uma amostra documentada, não uma participação de mercado.` : 'Ela consta da referência Atlas de medidas fabricadas. Sem correspondência documentada, a Atlas não indica participação de mercado nem homologação para um veículo.' },
      { q: `Quais veículos usam ${notation}?`, a: vehicles > 0 ? `Os veículos listados nesta página: ${makes}. Cada um leva à sua página com a furação, a medida da roda e o torque de aperto.` : 'No momento, nenhum veículo da referência Atlas está associado a esta medida.' },
      { q: 'Posso montar outra medida no lugar?', a: 'Muitas vezes sim, mas somente dentro dos limites definidos pelo fabricante. A comparação geométrica acima mostra quais medidas ficam a 3% do mesmo diâmetro: é um primeiro filtro, não uma autorização. Largura da roda, índices de carga e de velocidade e folga também precisam servir; a etiqueta e o manual do veículo prevalecem.' },
      { q: `O que significa o ${rim} em ${notation}?`, a: `É o diâmetro do aro em polegadas: este pneu monta em um aro de ${rim} polegadas. Os dois primeiros números são métricos (milímetros e porcentagem) — um código de pneu mistura unidades de propósito.` },
    ],
    breadcrumbHome: 'Início', breadcrumbHub: 'Medidas de pneus',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Qual é o equivalente métrico do ${notation}?`, a: `O ${notation} mede ${f.diameterMm} mm (${f.diameterIn} polegadas) de altura e ${f.widthIn} polegadas de largura, com flanco de ${f.sidewallIn} polegadas.${f.metricEquivalents ? ` As medidas métricas mais próximas no mesmo aro são ${f.metricEquivalents}.` : ''}` }
        : { q: `Qual é o tamanho de um pneu ${notation} em polegadas?`, a: `${f.diameterIn} polegadas (${f.diameterMm} mm) de diâmetro externo, ${f.widthIn} polegadas de largura e ${f.sidewallIn} polegadas de flanco.${f.inchClass ? ` Portanto, é um pneu de ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'Nesta página', specs: 'Dimensões', alternatives: 'Equivalências', vehicles: 'Veículos', code: 'Código', faq: 'FAQ' },
    specCols: { measure: 'Dimensão', metric: 'Métrico', imperial: 'Polegadas' },
    revsLabel: 'Voltas da roda',
    answerLabels: { diameter: 'Diâmetro', width: 'Largura', sidewall: 'Flanco', circumference: 'Circunferência' },
    lookup: { label: 'Medida do pneu', placeholder: 'ex.: 205/55 R16', button: 'Mostrar', notFound: 'Esta medida ainda não está na referência. Confira o formato, ex.: 205/55 R16.', heading: 'Buscar uma medida de pneu', intro: 'Digite a medida gravada no flanco para ver na hora o diâmetro, a circunferência e as equivalências.' },
    flotationKicker: 'Medida em polegadas (flotation)',
    flotationNote: 'Uma medida “flotation” indica diretamente o diâmetro externo e a largura em polegadas, seguidos do aro. É a notação usual dos pneus off-road e de picapes de origem norte-americana.',
    flotationLead: (diameter, width, rim) => `Um pneu de ${diameter} polegadas de altura e ${width} polegadas de largura, em aro de ${rim} polegadas.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Diâmetro externo', detail: `${diameter} polegadas de altura, inflado e sem carga.` },
      { token: width, label: 'Largura da seção', detail: `${width} polegadas de um flanco ao outro.` },
      { token: 'R', label: 'Construção radial', detail: 'As lonas da carcaça são radiais.' },
      { token: rim, label: 'Diâmetro do aro', detail: `Monta em um aro de ${rim} polegadas.` },
    ],
    diameter: {
      title: (n) => `Pneus de ${n} polegadas: todas as medidas equivalentes`,
      description: (n, count, ex) => `Quais medidas de pneus têm ${n} polegadas de diâmetro? ${count} medidas por aro, com a altura exata em polegadas e em mm — por ex. ${ex}.`,
      kicker: 'Medidas por altura',
      h1: (n) => `Pneus de ${n} polegadas`,
      lead: (n, count) => `${count} medidas fabricadas da referência Atlas têm cerca de ${n} polegadas de altura. Elas estão organizadas por aro, com o diâmetro, a largura e o flanco calculados.`,
      ruleNote: (n) => `“${n} polegadas” significa aqui um diâmetro externo arredondado para ${n} (de ${String(n - 0.5).replace('.', ',')} até pouco menos de ${String(n + 0.5).replace('.', ',')} polegadas). Os pneus reais variam ligeiramente conforme a marca.`,
      tableHeading: (n) => `Medidas de ${n} polegadas por aro`,
      rimGroup: (rim) => `Aro ${rim}″`,
      colSize: 'Medida', colDiameter: 'Diâmetro exato', colWidth: 'Largura', colSidewall: 'Flanco',
      flotationTag: 'flotation',
      popularHeading: (n) => `A medida de ${n} polegadas mais exata em cada aro`,
      popularIntro: 'Para cada aro, a medida cujo diâmetro calculado fica mais perto do número inteiro:',
      neighboursHeading: 'Outras alturas de pneu',
      groupLink: (n) => `Pneus ${n}″`,
      hubHeading: 'Buscar por altura do pneu',
      hubIntro: 'Todas as medidas agrupadas pelo diâmetro externo em polegadas, como costumam ser chamados os pneus off-road e de picape:',
      sizeLink: (n) => `Todas as medidas de ${n} polegadas`,
      faqs: (n, ex, flot) => [
        { q: `Qual medida corresponde a um pneu de ${n} polegadas?`, a: `Não existe uma só: qualquer medida métrica com cerca de ${n} polegadas de altura serve. As mais próximas nos aros mais comuns são ${ex}.` },
        ...(flot ? [{ q: `Quais medidas flotation têm ${n} polegadas?`, a: `Na notação flotation, a altura é o primeiro número: ${flot}.` }] : []),
        { q: `Posso trocar por um pneu de ${n} polegadas?`, a: 'Um pneu mais alto altera a leitura do velocímetro, a relação de transmissão e a folga. As tabelas descrevem só a geometria; verifique antes a largura da roda, o índice de carga, a folga e as medidas homologadas para o seu veículo.' },
      ],
      breadcrumb: (n) => `Pneus de ${n} polegadas`,
    },
  },
  'pl': {
    hubTitle: 'Rozmiary opon: wymiary, średnice i pojazdy',
    hubDescription: 'Wszystkie produkowane rozmiary opon z obliczoną wysokością boku, średnicą i obwodem, zamiennikami oraz pojazdami udokumentowanymi przez Atlas.',
    hubKicker: 'Baza rozmiarów opon',
    hubH1: 'Rozmiary opon w bazie Atlas',
    hubLead: (count, vehicles) => `Produkowane rozmiary opon udokumentowane w bazie Atlas — ${plural(count, 'rozmiar', 'rozmiary')}: ${count}, w tym rozmiary fabryczne udokumentowanych pojazdów (${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}). Każda strona oblicza własną geometrię i rzeczywiste zamienniki; pojazdy pojawiają się tylko tam, gdzie dopasowanie jest udokumentowane.`,
    notationHeading: 'Jak odczytać rozmiar opony',
    notationIntro: 'Metryczny kod, taki jak 205/55 R16, łączy trzy osobne wymiary i literę oznaczającą konstrukcję:',
    notationParts: [
      { token: '205', label: 'Szerokość przekroju', detail: 'Szerokość napompowanej opony od boku do boku, w milimetrach.' },
      { token: '55', label: 'Profil (stosunek wysokości do szerokości)', detail: 'Wysokość boku jako procent szerokości — 55 oznacza bok równy 55% z 205 mm.' },
      { token: 'R', label: 'Konstrukcja radialna', detail: 'Warstwy osnowy biegną promieniowo. Niemal wszystkie współczesne opony do samochodów osobowych są radialne.' },
      { token: '16', label: 'Średnica felgi', detail: 'Średnica felgi w calach — jedyna wartość calowa w kodzie, który poza tym jest metryczny.' },
    ],
    searchLabel: 'Filtruj rozmiary opon',
    searchPlaceholder: 'np. 205/55 lub R17',
    searchEmpty: 'Żaden rozmiar w bazie nie pasuje do tego filtra.',
    countLabel: (n) => `${plural(n, 'rozmiar', 'rozmiary')}: ${n}`,
    groupHeading: (rim) => `Felgi ${String(rim).replace('.', ',')}″`,
    jumpLabel: 'Przejdź do średnicy felgi',
    listedAs: (vehicles) => vehicles > 0 ? `${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}` : 'Rozmiar referencyjny',
    toolsHeading: 'Oblicz z tymi rozmiarami',
    calculatorCta: 'Kalkulator rozmiaru opon (po angielsku)',
    calculatorCtaDetail: 'Bok, średnica, obwód i obroty koła dla dowolnego rozmiaru',
    comparisonCta: 'Porównywarka opon (po angielsku)',
    comparisonCtaDetail: 'Dwa rozmiary obok siebie z rzeczywistą różnicą średnicy',
    vehiclesCta: 'Baza pojazdów',
    vehiclesCtaDetail: 'Rozmiar fabryczny, rozstaw śrub i moment dokręcania dla każdego pojazdu',
    boltHubCta: 'Rozstawy śrub (PCD)',
    boltHubCtaDetail: 'Rozstaw śrub i otwór centralny tych samych pojazdów',

    detailKicker: 'Rozmiar opony',
    detailTitle: (notation, f) => f.commercial
      ? `Opona dostawcza ${notation}: wymiary i zamienniki`
      : f.flotation
        ? `Opona ${notation} w mm i odpowiednik metryczny`
        : `Opona ${notation}: średnica ${f.diameterMm} mm i zamienniki`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} w milimetrach: średnica ${f.diameterMm} mm, bok ${f.sidewallIn}″ na feldze ${f.rim}″. Najbliższe rozmiary metryczne i odchyłka prędkościomierza${vehicles > 0 ? `, ${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}` : ''}.`
      : `Opona ${notation}: średnica ${f.diameterMm} mm (${f.diameterIn}″), bok ${f.sidewallMm} mm, obwód ${f.circumferenceMm} mm. Zamienniki i odchyłka prędkościomierza${vehicles > 0 ? `, ${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}` : ''}.`,
    detailH1: (notation) => `Rozmiar opony ${notation}`,
    commercialKicker: 'Opona dostawcza (C)',
    commercialNote: 'Litera „C” oznacza wzmocnioną oponę do lekkich pojazdów użytkowych, np. samochodów dostawczych. Jej wymiary nominalne są takie same jak opony osobowej o tych samych liczbach, ale jest przeznaczona do większych obciążeń i zwykle pompuje się ją do wyższego ciśnienia. Opona osobowa nie zastępuje opony C pod względem nośności.',
    commercialBreakdown: { label: 'Lekki pojazd użytkowy', detail: 'Wzmocniona konstrukcja do aut dostawczych: wyższa nośność, zwykle wyższe ciśnienie.' },
    commercialTwinLink: (twin) => `Wersja do aut osobowych: ${twin}`,
    passengerTwinLink: (twin) => `Wersja dostawcza (C): ${twin}`,
    inchHeading: 'Wymiary w calach',
    inchIntro: (shorthand) => `W calach ten rozmiar to około ${shorthand} — średnica zewnętrzna × szerokość, na podanej feldze.`,
    inchLabels: { diameter: 'Średnica zewnętrzna', width: 'Szerokość przekroju', sidewall: 'Wysokość boku', circumference: 'Obwód' },
    alternativesHeading: 'Zamienniki na innych felgach',
    alternativesIntro: 'Produkowane rozmiary, których średnica zewnętrzna różni się najwyżej o 3%, od felgi o cal mniejszej do felgi o dwa cale większej, z rozsądną szerokością na każdym kroku. Kolumna prędkościomierza pokazuje rzeczywistą prędkość, gdy prędkościomierz wskazuje 100 km/h.',
    alternativesEmpty: 'Żaden produkowany rozmiar w bazie nie utrzymuje tej średnicy w granicach 3% przy rozsądnej szerokości na sąsiedniej feldze.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (ta sama felga)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)}″)`,
    colSpeed: 'Rzeczywista prędkość przy 100',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Sąsiednie rozmiary na tej samej feldze',
    neighboursIntro: 'O krok szersze lub węższe albo o krok wyższy lub niższy profil:',
    colFitment: 'Wyposażenie',
    fitmentStandard: 'Standard',
    fitmentOption: 'Opcja fabryczna',
    detailLead: (width, aspect, rim) => `Opona o szerokości ${width} mm, z bokiem równym ${aspect}% tej szerokości, na feldze ${rim}-calowej.`,
    metricsHeading: 'Obliczone wymiary',
    metrics: {
      sectionWidth: 'Szerokość przekroju', aspectRatio: 'Profil', sidewallHeight: 'Wysokość boku',
      rimDiameterIn: 'Średnica felgi', rimDiameterMm: 'Średnica felgi (metryczna)', overallDiameter: 'Średnica zewnętrzna',
      circumference: 'Obwód', revsPerKm: 'Obroty na km', revsPerMile: 'Obroty na milę',
    },
    metricNote: 'Każda wartość na tej stronie jest obliczana z kodu rozmiaru tymi samymi funkcjami geometrii co kalkulator rozmiaru opon — nic nie jest wpisywane ręcznie dla poszczególnych stron. Rzeczywiste opony nieznacznie odbiegają od wymiaru nominalnego zależnie od producenta i bieżnika.',
    breakdownHeading: 'Co oznacza kod',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Szerokość przekroju', detail: `${width} mm od boku do boku, gdy opona jest napompowana i nieobciążona.` },
      { token: String(aspect), label: 'Profil', detail: `Wysokość boku to ${aspect}% z ${width} mm.` },
      { token: 'R', label: 'Konstrukcja radialna', detail: 'Warstwy osnowy biegną promieniowo — standard w oponach osobowych.' },
      { token: String(rim), label: 'Średnica felgi', detail: `Montowana na feldze ${rim}-calowej.` },
    ],
    visualHeading: 'Przekrój w tym rozmiarze',
    crossAria: (notation) => `Schemat przekroju opony ${notation} z szerokością przekroju, wysokością boku, bieżnikiem, stopką i felgą`,
    crossTread: 'Bieżnik',
    crossSidewall: 'Bok',
    crossBead: 'Stopka',
    crossRimCaption: 'wnętrze opony nad felgą',
    visualNote: 'Narysowany z rzeczywistą szerokością przekroju i wysokością boku tego rozmiaru, tą samą funkcją geometrii co kalkulator — proporcje są obliczone, a nie dekoracyjne.',
    vehiclesHeading: 'Pojazdy z tym rozmiarem',
    vehiclesIntro: (n) => `Udokumentowane pojazdy z tym rozmiarem w bazie Atlas — ${plural(n, 'pojazd', 'pojazdy')}: ${n}. Wersje wyposażenia i roczniki się różnią — zawsze należy sprawdzić naklejkę informacyjną konkretnego pojazdu.`,
    vehiclesEmpty: 'Ten produkowany rozmiar jest udokumentowany, ale Atlas nie ma jeszcze udokumentowanego pojazdu, który go używa. To ograniczenie zakresu bazy, a nie ocena rozmiaru.',
    colVehicle: 'Pojazd', colGeneration: 'Generacja', colWheel: 'Felga fabryczna', colBoltPattern: 'Rozstaw śrub',
    colConfidence: 'Wiarygodność źródła',
    confidence: { high: 'Wysoka', medium: 'Średnia', low: 'Niska' },
    confidenceNote: 'Wiarygodność jest podawana dla każdego wiersza, a nie dla całej strony: pokazuje, jak solidne źródła Atlas znalazł dla tego konkretnego wiersza. Źródła i zastrzeżenia są na stronie każdego pojazdu.',
    vehiclePageLink: 'Otwórz stronę pojazdu',
    compareHeading: 'Rozmiary geometrycznie zbliżone',
    compareIntro: 'Inne rozmiary w bazie, których obliczona średnica zewnętrzna różni się od tej o mniej niż 3%:',
    compareEmpty: 'Żaden inny rozmiar w bazie nie mieści się w granicach 3% tej średnicy.',
    compareLabel: 'Porównaj',
    colSize: 'Rozmiar', colDiameter: 'Średnica zewnętrzna', colDifference: 'Różnica',
    compareCaveat: 'To porównanie geometryczne, a nie zalecenie montażu. Zbliżona średnica nie oznacza, że rozmiar można bezpiecznie zamontować: liczą się też szerokość felgi, indeksy nośności i prędkości, luz wewnętrzny i zewnętrzny oraz rozmiary dopuszczone przez producenta pojazdu. Przed zmianą rozmiaru należy sprawdzić wymagania producenta dla danego pojazdu.',
    ctaHeading: 'Policz samodzielnie',
    ctaNote: 'Oba narzędzia otwierają się z wpisanym już tym rozmiarem.',
    relatedHeading: 'Powiązane dane',
    backToHub: 'Wszystkie rozmiary',
    faqHeading: 'Najczęściej zadawane pytania',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `Czy ${notation} to popularny rozmiar?`, a: vehicles > 0 ? `Atlas udokumentował ten rozmiar w pojazdach — ${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}${makes ? ` (${makes})` : ''}. To udokumentowana próbka, a nie udział w rynku.` : 'Rozmiar figuruje w bazie Atlas produkowanych rozmiarów. Bez udokumentowanego dopasowania Atlas nie podaje ani udziału w rynku, ani homologacji dla pojazdu.' },
      { q: `Jakie pojazdy mają opony ${notation}?`, a: vehicles > 0 ? `Pojazdy wymienione na tej stronie: ${makes}. Każdy prowadzi do swojej strony z rozstawem śrub, rozmiarem felgi i momentem dokręcania.` : 'Żaden pojazd w bazie Atlas nie jest obecnie powiązany z tym rozmiarem.' },
      { q: 'Czy można zamontować inny rozmiar?', a: 'Często tak, ale tylko w granicach określonych przez producenta pojazdu. Powyższe porównanie geometryczne pokazuje, które rozmiary mieszczą się w 3% tej samej średnicy: to pierwszy filtr, a nie zezwolenie. Szerokość felgi, indeksy nośności i prędkości oraz luz w nadkolu również muszą się zgadzać; rozstrzygają tabliczka i instrukcja pojazdu.' },
      { q: `Co oznacza ${rim} w rozmiarze ${notation}?`, a: `To średnica felgi w calach: ta opona pasuje na felgę ${rim}-calową. Dwie pierwsze liczby są metryczne (milimetry i procent) — kod opony celowo łączy różne jednostki.` },
    ],
    breadcrumbHome: 'Strona główna', breadcrumbHub: 'Rozmiary opon',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Jaki jest metryczny odpowiednik ${notation}?`, a: `${notation} ma ${f.diameterMm} mm (${f.diameterIn} cala) wysokości i ${f.widthIn} cala szerokości, z bokiem o wysokości ${f.sidewallIn} cala.${f.metricEquivalents ? ` Najbliższe rozmiary metryczne na tej samej feldze: ${f.metricEquivalents}.` : ''}` }
        : { q: `Jaki jest rozmiar opony ${notation} w calach?`, a: `${f.diameterIn} cala (${f.diameterMm} mm) średnicy zewnętrznej, ${f.widthIn} cala szerokości i ${f.sidewallIn} cala wysokości boku.${f.inchClass ? ` Należy więc do grupy: ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'Na tej stronie', specs: 'Wymiary', alternatives: 'Zamienniki', vehicles: 'Pojazdy', code: 'Kod', faq: 'FAQ' },
    specCols: { measure: 'Wymiar', metric: 'Metrycznie', imperial: 'Cale' },
    revsLabel: 'Obroty koła',
    answerLabels: { diameter: 'Średnica', width: 'Szerokość', sidewall: 'Bok', circumference: 'Obwód' },
    lookup: { label: 'Rozmiar opony', placeholder: 'np. 205/55 R16', button: 'Pokaż', notFound: 'Tego rozmiaru nie ma jeszcze w bazie. Proszę sprawdzić format, np. 205/55 R16.', heading: 'Wyszukaj rozmiar opony', intro: 'Wpisz rozmiar z boku opony, aby od razu zobaczyć jej średnicę, obwód i zamienniki.' },
    flotationKicker: 'Rozmiar calowy (flotation)',
    flotationNote: 'Rozmiar typu „flotation” podaje bezpośrednio średnicę zewnętrzną i szerokość w calach, a następnie felgę. To typowe oznaczenie opon terenowych i do pick-upów pochodzenia północnoamerykańskiego.',
    flotationLead: (diameter, width, rim) => `Opona ${diameter}-calowa o szerokości ${width} cala, na feldze ${rim}-calowej.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Średnica zewnętrzna', detail: `${diameter}″ wysokości, po napompowaniu i bez obciążenia.` },
      { token: width, label: 'Szerokość przekroju', detail: `${width}″ od boku do boku.` },
      { token: 'R', label: 'Konstrukcja radialna', detail: 'Warstwy osnowy biegną promieniowo.' },
      { token: rim, label: 'Średnica felgi', detail: `Montowana na feldze ${rim}-calowej.` },
    ],
    diameter: {
      title: (n) => `Opony ${n}-calowe: wszystkie rozmiary metryczne`,
      description: (n, count, ex) => `Które rozmiary opon mają średnicę ${n}″? Rozmiary: ${count}, według felgi, z dokładną wysokością w calach i mm — np. ${ex}.`,
      kicker: 'Rozmiary według wysokości',
      h1: (n) => `Opony ${n}-calowe`,
      lead: (n, count) => `Produkowane rozmiary w bazie Atlas o wysokości około ${n}″ — łącznie: ${count}. Są pogrupowane według felgi z obliczoną średnicą, szerokością i wysokością boku.`,
      ruleNote: (n) => `„${n}-calowe” oznacza tu średnicę zewnętrzną zaokrągloną do ${n}″ (od ${String(n - 0.5).replace('.', ',')} do nieco poniżej ${String(n + 0.5).replace('.', ',')} cala). Rzeczywiste opony różnią się nieznacznie zależnie od marki.`,
      tableHeading: (n) => `Rozmiary ${n}-calowe według felgi`,
      rimGroup: (rim) => `Felga ${rim}″`,
      colSize: 'Rozmiar', colDiameter: 'Dokładna średnica', colWidth: 'Szerokość', colSidewall: 'Bok',
      flotationTag: 'flotation',
      popularHeading: (n) => `Rozmiar najbliższy ${n}″ na każdej feldze`,
      popularIntro: 'Dla każdej felgi rozmiar, którego obliczona średnica jest najbliższa liczbie całkowitej:',
      neighboursHeading: 'Inne wysokości opon',
      groupLink: (n) => `Opony ${n}″`,
      hubHeading: 'Szukaj według wysokości opony',
      hubIntro: 'Wszystkie rozmiary pogrupowane według średnicy zewnętrznej w calach — tak często określa się opony terenowe i do pick-upów:',
      sizeLink: (n) => `Wszystkie rozmiary ${n}-calowe`,
      faqs: (n, ex, flot) => [
        { q: `Jaki rozmiar odpowiada oponie ${n}-calowej?`, a: `Nie ma jednego: pasuje każdy rozmiar metryczny o wysokości około ${n}″. Najbliższe na popularnych felgach to ${ex}.` },
        ...(flot ? [{ q: `Które rozmiary flotation mają ${n}″?`, a: `W oznaczeniu flotation wysokość to pierwsza liczba: ${flot}.` }] : []),
        { q: `Czy można przejść na oponę ${n}-calową?`, a: 'Wyższa opona zmienia wskazania prędkościomierza, przełożenie i luz w nadkolu. Tabele opisują tylko geometrię; najpierw należy sprawdzić szerokość felgi, indeks nośności, luz w nadkolu i rozmiary dopuszczone dla danego pojazdu.' },
      ],
      breadcrumb: (n) => `Opony ${n}-calowe`,
    },
  },
  'nl': {
    hubTitle: 'Bandenmaten: afmetingen, diameters en voertuigen',
    hubDescription: 'Alle geproduceerde bandenmaten met berekende wang, diameter en omtrek, alternatieven en door Atlas gedocumenteerde voertuigen.',
    hubKicker: 'Referentie bandenmaten',
    hubH1: 'Bandenmaten in de Atlas-referentie',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'geproduceerde bandenmaat is', 'geproduceerde bandenmaten zijn')} vastgelegd in de Atlas-referentie, waaronder de originele maten van ${vehicles} ${plural(vehicles, 'gedocumenteerd voertuig', 'gedocumenteerde voertuigen')}. Elke pagina berekent haar eigen geometrie en echte alternatieven; voertuigen verschijnen alleen als er een gedocumenteerde koppeling is.`,
    notationHeading: 'Zo leest u een bandenmaat',
    notationIntro: 'Een metrische code zoals 205/55 R16 bevat drie afzonderlijke maten en een letter voor de constructie:',
    notationParts: [
      { token: '205', label: 'Bandbreedte', detail: 'Breedte van de opgepompte band, van wang tot wang, in millimeters.' },
      { token: '55', label: 'Serie (hoogte-breedteverhouding)', detail: 'Hoogte van de wang als percentage van de breedte — 55 betekent een wang van 55 % van 205 mm.' },
      { token: 'R', label: 'Radiaalconstructie', detail: 'De karkaslagen lopen radiaal. Vrijwel alle moderne personenautobanden zijn radiaalbanden.' },
      { token: '16', label: 'Velgdiameter', detail: 'De diameter van de velg, in inch — de enige niet-metrische waarde in een verder metrische code.' },
    ],
    searchLabel: 'Bandenmaten filteren',
    searchPlaceholder: 'bijv. 205/55 of R17',
    searchEmpty: 'Geen enkele bandenmaat in de referentie past bij dit filter.',
    countLabel: (n) => `${n} ${plural(n, 'maat', 'maten')}`,
    groupHeading: (rim) => `Velgen van ${String(rim).replace('.', ',')} inch`,
    jumpLabel: 'Naar velgdiameter',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'voertuig', 'voertuigen')}` : 'Referentiemaat',
    toolsHeading: 'Rekenen met deze maten',
    calculatorCta: 'Bandenmaatcalculator (in het Engels)',
    calculatorCtaDetail: 'Wang, diameter, omtrek en omwentelingen voor elke maat',
    comparisonCta: 'Bandenmaten vergelijken (in het Engels)',
    comparisonCtaDetail: 'Twee maten naast elkaar met het echte diameterverschil',
    vehiclesCta: 'Voertuigreferentie',
    vehiclesCtaDetail: 'Originele bandenmaat, steekmaat en aanhaalmoment per voertuig',
    boltHubCta: 'Steekmaten van velgen',
    boltHubCtaDetail: 'Steekmaat en naafgat van dezelfde voertuigen',

    detailKicker: 'Bandenmaat',
    detailTitle: (notation, f) => f.commercial
      ? `Bestelwagenband ${notation}: maten en alternatieven`
      : f.flotation
        ? `Band ${notation}: maat in mm en metrisch equivalent`
        : `Band ${notation}: diameter ${f.diameterMm} mm en alternatieven`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} in millimeters: ${f.diameterMm} mm diameter, wang van ${f.sidewallIn}″ op een ${f.rim}-inch velg. Metrische equivalenten en afwijking snelheidsmeter${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'voertuig', 'voertuigen')}` : ''}.`
      : `Band ${notation}: ${f.diameterMm} mm diameter (${f.diameterIn}″), wang van ${f.sidewallMm} mm, omtrek ${f.circumferenceMm} mm. Alternatieven en afwijking snelheidsmeter${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'voertuig', 'voertuigen')}` : ''}.`,
    detailH1: (notation) => `Bandenmaat ${notation}`,
    commercialKicker: 'Bestelwagenband (C)',
    commercialNote: 'De „C” staat voor een versterkte band voor lichte bedrijfsvoertuigen, zoals bestelwagens. De nominale afmetingen zijn gelijk aan die van de personenautomaat met dezelfde cijfers, maar de band is gebouwd voor hogere belasting en wordt meestal op een hogere spanning gereden. Een personenautoband is qua draagvermogen geen vervanging voor een C-band.',
    commercialBreakdown: { label: 'Licht bedrijfsvoertuig', detail: 'Versterkte constructie voor bestelwagens: hoger draagvermogen, meestal hogere bandenspanning.' },
    commercialTwinLink: (twin) => `Personenautoversie: ${twin}`,
    passengerTwinLink: (twin) => `Bestelwagenversie (C): ${twin}`,
    inchHeading: 'Afmetingen in inch',
    inchIntro: (shorthand) => `In inch komt deze maat ongeveer overeen met ${shorthand} — buitendiameter × breedte op de aangegeven velg.`,
    inchLabels: { diameter: 'Buitendiameter', width: 'Bandbreedte', sidewall: 'Wanghoogte', circumference: 'Omtrek' },
    alternativesHeading: 'Alternatieven op andere velgen',
    alternativesIntro: 'Geproduceerde maten waarvan de buitendiameter niet meer dan 3 % afwijkt, van één inch kleiner tot twee inch groter, telkens met een passende breedte. De kolom snelheidsmeter toont de werkelijke snelheid wanneer de teller 100 km/h aangeeft.',
    alternativesEmpty: 'Geen enkele geproduceerde maat in de referentie houdt deze diameter binnen 3 % met een passende breedte op een naastgelegen velgmaat.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (zelfde velg)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} inch)`,
    colSpeed: 'Werkelijke snelheid bij 100',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Naburige maten op dezelfde velg',
    neighboursIntro: 'Eén stap breder of smaller, of één serie hoger of lager:',
    colFitment: 'Montage',
    fitmentStandard: 'Standaard',
    fitmentOption: 'Fabrieksoptie',
    detailLead: (width, aspect, rim) => `Een band van ${width} mm breed met een wang van ${aspect} % van die breedte, gemonteerd op een velg van ${rim} inch.`,
    metricsHeading: 'Berekende afmetingen',
    metrics: {
      sectionWidth: 'Bandbreedte', aspectRatio: 'Serie', sidewallHeight: 'Wanghoogte',
      rimDiameterIn: 'Velgdiameter', rimDiameterMm: 'Velgdiameter (metrisch)', overallDiameter: 'Buitendiameter',
      circumference: 'Omtrek', revsPerKm: 'Omwentelingen per km', revsPerMile: 'Omwentelingen per mijl',
    },
    metricNote: 'Elke waarde op deze pagina wordt uit de code berekend met dezelfde geometriefuncties als de bandenmaatcalculator — niets wordt per pagina handmatig ingevoerd. Echte banden wijken iets af van de nominale maat, afhankelijk van fabrikant en profiel.',
    breakdownHeading: 'Wat de code betekent',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Bandbreedte', detail: `${width} mm van wang tot wang, opgepompt en onbelast.` },
      { token: String(aspect), label: 'Serie', detail: `De wang is ${aspect} % van ${width} mm.` },
      { token: 'R', label: 'Radiaalconstructie', detail: 'De karkaslagen lopen radiaal — de norm bij personenautobanden.' },
      { token: String(rim), label: 'Velgdiameter', detail: `Past op een velg van ${rim} inch.` },
    ],
    visualHeading: 'Doorsnede bij deze maat',
    crossAria: (notation) => `Doorsnedetekening van een band ${notation} met bandbreedte, wanghoogte, loopvlak, hiel en velg`,
    crossTread: 'Loopvlak',
    crossSidewall: 'Wang',
    crossBead: 'Hiel',
    crossRimCaption: 'binnenruimte boven de velg',
    visualNote: 'Getekend met de echte bandbreedte en wanghoogte van deze maat, met dezelfde geometriefunctie als de calculator — de verhoudingen zijn berekend, niet decoratief.',
    vehiclesHeading: 'Voertuigen met deze maat',
    vehiclesIntro: (n) => `Atlas vermeldt ${n} ${plural(n, 'gedocumenteerd voertuig', 'gedocumenteerde voertuigen')} met deze maat. Uitvoeringen en modeljaren verschillen — controleer altijd de sticker op het voertuig zelf.`,
    vehiclesEmpty: 'Deze geproduceerde maat is gedocumenteerd, maar Atlas heeft nog geen gedocumenteerd voertuig dat haar gebruikt. Dat is een beperking van de dekking, geen oordeel over de maat.',
    colVehicle: 'Voertuig', colGeneration: 'Generatie', colWheel: 'Originele velg', colBoltPattern: 'Steekmaat',
    colConfidence: 'Betrouwbaarheid bron',
    confidence: { high: 'Hoog', medium: 'Gemiddeld', low: 'Laag' },
    confidenceNote: 'De betrouwbaarheid geldt per regel, niet per pagina: ze geeft aan hoe direct Atlas die specifieke regel kon onderbouwen. Bronnen en kanttekeningen staan op de pagina van elk voertuig.',
    vehiclePageLink: 'Voertuigpagina openen',
    compareHeading: 'Geometrisch vergelijkbare maten',
    compareIntro: 'Andere maten in de referentie waarvan de berekende buitendiameter minder dan 3 % afwijkt van deze:',
    compareEmpty: 'Geen enkele andere maat in de referentie ligt binnen 3 % van deze diameter.',
    compareLabel: 'Vergelijken',
    colSize: 'Maat', colDiameter: 'Buitendiameter', colDifference: 'Verschil',
    compareCaveat: 'Dit is een geometrische vergelijking, geen montageadvies. Een vergelijkbare diameter maakt een maat niet veilig monteerbaar: velgbreedte, belastings- en snelheidsindex, vrije ruimte binnen en buiten en de door de fabrikant goedgekeurde maten tellen ook mee. Controleer de eisen van de fabrikant voor uw voertuig voordat u van maat wisselt.',
    ctaHeading: 'Reken het zelf na',
    ctaNote: 'Beide tools openen vooraf ingevuld met deze maat.',
    relatedHeading: 'Gerelateerde gegevens',
    backToHub: 'Alle bandenmaten',
    faqHeading: 'Veelgestelde vragen',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `Is ${notation} een gangbare bandenmaat?`, a: vehicles > 0 ? `Atlas heeft deze maat gedocumenteerd op ${vehicles} ${plural(vehicles, 'voertuig', 'voertuigen')}${makes ? ` (${makes})` : ''}. Dat is een gedocumenteerde steekproef, geen marktaandeel.` : 'Ze staat in de Atlas-referentie van geproduceerde maten. Zonder gedocumenteerde koppeling noemt Atlas geen marktaandeel en geen goedkeuring voor een voertuig.' },
      { q: `Welke voertuigen rijden op ${notation}?`, a: vehicles > 0 ? `De voertuigen op deze pagina: ${makes}. Elk voertuig linkt naar een eigen pagina met steekmaat, velgmaat en aanhaalmoment.` : 'Geen enkel voertuig in de Atlas-referentie is momenteel aan deze maat gekoppeld.' },
      { q: 'Kan ik in plaats daarvan een andere maat monteren?', a: 'Vaak wel, maar alleen binnen de grenzen die de fabrikant stelt. De geometrische vergelijking hierboven laat zien welke maten binnen 3 % van dezelfde diameter blijven: dat is een eerste filter, geen toestemming. Velgbreedte, belastings- en snelheidsindex en vrije ruimte moeten ook kloppen; de sticker en het instructieboekje van het voertuig zijn leidend.' },
      { q: `Wat betekent de ${rim} in ${notation}?`, a: `Dat is de velgdiameter in inch: deze band past op een velg van ${rim} inch. De eerste twee getallen zijn metrisch (millimeters en een percentage) — een bandencode mengt bewust eenheden.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Bandenmaten',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Wat is het metrische equivalent van ${notation}?`, a: `Bandenmaat ${notation} is ${f.diameterMm} mm (${f.diameterIn} inch) hoog en ${f.widthIn} inch breed, met een wang van ${f.sidewallIn} inch.${f.metricEquivalents ? ` De dichtstbijzijnde metrische maten op dezelfde velg zijn ${f.metricEquivalents}.` : ''}` }
        : { q: `Hoe groot is een band ${notation} in inch?`, a: `${f.diameterIn} inch (${f.diameterMm} mm) buitendiameter, ${f.widthIn} inch breed en een wang van ${f.sidewallIn} inch.${f.inchClass ? ` Het is dus een band van ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'Op deze pagina', specs: 'Afmetingen', alternatives: 'Alternatieven', vehicles: 'Voertuigen', code: 'Code', faq: 'FAQ' },
    specCols: { measure: 'Maat', metric: 'Metrisch', imperial: 'Inch' },
    revsLabel: 'Omwentelingen',
    answerLabels: { diameter: 'Diameter', width: 'Breedte', sidewall: 'Wang', circumference: 'Omtrek' },
    lookup: { label: 'Bandenmaat', placeholder: 'bijv. 205/55 R16', button: 'Tonen', notFound: 'Deze maat staat nog niet in de referentie. Controleer de notatie, bijv. 205/55 R16.', heading: 'Bandenmaat opzoeken', intro: 'Voer de maat in die op de wang staat en zie direct de diameter, omtrek en alternatieven.' },
    flotationKicker: 'Maat in inch (flotation)',
    flotationNote: 'Een flotationmaat geeft de buitendiameter en de breedte rechtstreeks in inch, gevolgd door de velg. Het is de gebruikelijke notatie voor terreinbanden en pick-upbanden van Noord-Amerikaanse oorsprong.',
    flotationLead: (diameter, width, rim) => `Een band van ${diameter} inch hoog en ${width} inch breed, op een velg van ${rim} inch.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Buitendiameter', detail: `${diameter} inch hoog, opgepompt en onbelast.` },
      { token: width, label: 'Bandbreedte', detail: `${width} inch van wang tot wang.` },
      { token: 'R', label: 'Radiaalconstructie', detail: 'De karkaslagen lopen radiaal.' },
      { token: rim, label: 'Velgdiameter', detail: `Past op een velg van ${rim} inch.` },
    ],
    diameter: {
      title: (n) => `Banden van ${n} inch: alle overeenkomende maten`,
      description: (n, count, ex) => `Welke bandenmaten zijn ${n} inch hoog? ${count} maten per velg, met de exacte hoogte in inch en mm — bijv. ${ex}.`,
      kicker: 'Maten per hoogte',
      h1: (n) => `Banden van ${n} inch`,
      lead: (n, count) => `${count} geproduceerde maten in de Atlas-referentie zijn ongeveer ${n} inch hoog. Ze staan per velg gerangschikt met de berekende diameter, breedte en wang.`,
      ruleNote: (n) => `„${n} inch” betekent hier een buitendiameter die afgerond ${n} is (van ${String(n - 0.5).replace('.', ',')} tot net onder ${String(n + 0.5).replace('.', ',')} inch). Echte banden wijken per merk iets af.`,
      tableHeading: (n) => `Maten van ${n} inch per velg`,
      rimGroup: (rim) => `Velg ${rim}″`,
      colSize: 'Maat', colDiameter: 'Exacte diameter', colWidth: 'Breedte', colSidewall: 'Wang',
      flotationTag: 'flotation',
      popularHeading: (n) => `De meest exacte maat van ${n} inch op elke velg`,
      popularIntro: 'Per velg de maat waarvan de berekende diameter het dichtst bij het hele getal ligt:',
      neighboursHeading: 'Andere bandhoogtes',
      groupLink: (n) => `Banden ${n}″`,
      hubHeading: 'Zoeken op bandhoogte',
      hubIntro: 'Alle maten gegroepeerd op buitendiameter in inch, zoals terreinbanden en pick-upbanden vaak worden aangeduid:',
      sizeLink: (n) => `Alle maten van ${n} inch`,
      faqs: (n, ex, flot) => [
        { q: `Welke maat is een band van ${n} inch?`, a: `Er is niet één maat: elke metrische maat van ongeveer ${n} inch hoog telt mee. De dichtstbijzijnde op gangbare velgen zijn ${ex}.` },
        ...(flot ? [{ q: `Welke flotationmaten zijn ${n} inch?`, a: `In flotationnotatie is de hoogte het eerste getal: ${flot}.` }] : []),
        { q: `Kan ik overstappen op een band van ${n} inch?`, a: 'Een hogere band verandert de aanwijzing van de snelheidsmeter, de overbrenging en de vrije ruimte. De tabellen beschrijven alleen de geometrie; controleer eerst de velgbreedte, de belastingsindex, de vrije ruimte en de goedgekeurde maten voor uw voertuig.' },
      ],
      breadcrumb: (n) => `Banden ${n} inch`,
    },
  },
  'tr': {
    hubTitle: 'Lastik ebatları: ölçüler, çaplar ve araçlar',
    hubDescription: 'Üretilen tüm lastik ebatları: hesaplanmış yanak, çap ve çevre ölçüleri, muadil ebatlar ve Atlas tarafından belgelenmiş araçlar.',
    hubKicker: 'Lastik ebadı referansı',
    hubH1: 'Atlas referansındaki lastik ebatları',
    hubLead: (count, vehicles) => `Atlas referansında üretilen ${plural(count, 'lastik ebadı', 'lastik ebadı')} sayısı: ${count}. Bunlara ${plural(vehicles, 'belgelenmiş araç', 'belgelenmiş araç')} sayısı ${vehicles} olan araçların orijinal ebatları da dahildir. Her sayfa kendi geometrisini ve gerçek muadillerini hesaplar; araçlar yalnızca belgelenmiş bir eşleşme olduğunda gösterilir.`,
    notationHeading: 'Lastik ebadı nasıl okunur?',
    notationIntro: '205/55 R16 gibi metrik bir lastik kodu, üç ayrı ölçüyü ve bir yapı harfini tek satırda toplar:',
    notationParts: [
      { token: '205', label: 'Kesit genişliği', detail: 'Şişirilmiş lastiğin bir yanaktan diğerine genişliği, milimetre cinsinden.' },
      { token: '55', label: 'Profil oranı (seri)', detail: 'Yanak yüksekliğinin genişliğe oranı, yüzde olarak — 55, yanağın 205 mm’nin %55’i kadar olduğu anlamına gelir.' },
      { token: 'R', label: 'Radyal yapı', detail: 'Karkas katları radyal olarak dizilmiştir. Günümüzün binek lastiklerinin neredeyse tamamı radyaldir.' },
      { token: '16', label: 'Jant çapı', detail: 'Lastiğin takıldığı jantın çapı, inç cinsinden — aksi hâlde metrik olan koddaki tek inç değeri.' },
    ],
    searchLabel: 'Ebatları filtreleyin',
    searchPlaceholder: 'örn. 205/55 veya R17',
    searchEmpty: 'Referansta bu filtreye uyan lastik ebadı yok.',
    countLabel: (n) => `${n} ${plural(n, 'ebat', 'ebat')}`,
    groupHeading: (rim) => `${String(rim).replace('.', ',')} inç jantlar`,
    jumpLabel: 'Jant çapına git',
    listedAs: (vehicles) => vehicles > 0 ? `${vehicles} ${plural(vehicles, 'araç', 'araç')}` : 'Referans ebat',
    toolsHeading: 'Bu ebatlarla hesaplayın',
    calculatorCta: 'Lastik ebadı hesaplayıcı (İngilizce)',
    calculatorCtaDetail: 'Her ebat için yanak, çap, çevre ve tur sayısı',
    comparisonCta: 'Lastik karşılaştırma (İngilizce)',
    comparisonCtaDetail: 'İki ebadı gerçek çap farkıyla yan yana görün',
    vehiclesCta: 'Araç referansı',
    vehiclesCtaDetail: 'Araca göre orijinal lastik ebadı, bijon aralığı ve sıkma torku',
    boltHubCta: 'Bijon aralıkları',
    boltHubCtaDetail: 'Aynı araçların bijon aralığı ve göbek çapı',

    detailKicker: 'Lastik ebadı',
    detailTitle: (notation, f) => f.commercial
      ? `${notation} hafif ticari lastik: ölçüler ve muadiller`
      : f.flotation
        ? `${notation} lastik: mm ölçüsü ve metrik muadili`
        : `${notation} lastik ebadı: çap ${f.diameterMm} mm ve muadiller`,
    detailDescription: (notation, f, vehicles) => f.flotation
      ? `${notation} metrik ölçüleri: ${f.diameterMm} mm çap, ${f.rim} inç jantta ${f.sidewallIn}″ yanak. Metrik muadil ebatlar ve kilometre saati sapması${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'araç', 'araç')}` : ''}.`
      : `Lastik ebadı ${notation}: ${f.diameterMm} mm çap (${f.diameterIn}″), ${f.sidewallMm} mm yanak, ${f.circumferenceMm} mm çevre. Muadiller ve kilometre saati sapması${vehicles > 0 ? `, ${vehicles} ${plural(vehicles, 'araç', 'araç')}` : ''}.`,
    detailH1: (notation) => `${notation} lastik ebadı`,
    commercialKicker: 'Hafif ticari (C) lastik',
    commercialNote: '“C” harfi, panelvan gibi hafif ticari araçlar için güçlendirilmiş lastiği belirtir. Nominal ölçüleri aynı rakamları taşıyan binek ebadıyla aynıdır, ancak daha yüksek yükler için üretilmiştir ve genellikle daha yüksek basınçla şişirilir. Binek lastiği, yük taşıma kapasitesi açısından C lastiğinin yerini tutmaz.',
    commercialBreakdown: { label: 'Hafif ticari', detail: 'Panelvanlar için güçlendirilmiş yapı: daha yüksek yük kapasitesi, genellikle daha yüksek basınç.' },
    commercialTwinLink: (twin) => `Binek versiyonu: ${twin}`,
    passengerTwinLink: (twin) => `Hafif ticari (C) versiyonu: ${twin}`,
    inchHeading: 'İnç cinsinden ölçüler',
    inchIntro: (shorthand) => `İnç cinsinden bu ebat yaklaşık şöyledir: ${shorthand} — belirtilen jantta dış çap × kesit genişliği.`,
    inchLabels: { diameter: 'Dış çap', width: 'Kesit genişliği', sidewall: 'Yanak yüksekliği', circumference: 'Çevre' },
    alternativesHeading: 'Diğer jantlardaki muadil ebatlar',
    alternativesIntro: 'Dış çapı en fazla %3 sapan, bir inç küçükten iki inç büyüğe kadar jantlarda her adımda uygun genişliğe sahip üretilen ebatlar. Kilometre saati sütunu, gösterge 100 km/h gösterirken gerçek hızı verir.',
    alternativesEmpty: 'Referansta, komşu bir jantta uygun genişlikle bu çapı %3 içinde tutan üretilen bir ebat yok.',
    rimRowLabel: (rim, delta) => delta === 0 ? `${rim}″ (aynı jant)` : `${rim}″ (${delta > 0 ? '+' : '−'}${Math.abs(delta)} inç)`,
    colSpeed: 'Gerçek hız (gösterge 100)',
    speedBase: { indicated: 100, unit: 'km/h' },
    neighboursHeading: 'Aynı janttaki komşu ebatlar',
    neighboursIntro: 'Bir kademe daha geniş veya dar, ya da bir seri daha yüksek veya alçak:',
    colFitment: 'Donanım',
    fitmentStandard: 'Orijinal',
    fitmentOption: 'Fabrika opsiyonu',
    detailLead: (width, aspect, rim) => `Genişliği ${width} mm, yanak yüksekliği bu genişliğin %${aspect} kadarı olan ve jant çapı ${rim} inç olan bir lastik.`,
    metricsHeading: 'Hesaplanan ölçüler',
    metrics: {
      sectionWidth: 'Kesit genişliği', aspectRatio: 'Profil oranı', sidewallHeight: 'Yanak yüksekliği',
      rimDiameterIn: 'Jant çapı', rimDiameterMm: 'Jant çapı (metrik)', overallDiameter: 'Dış çap',
      circumference: 'Çevre', revsPerKm: 'Km başına tur', revsPerMile: 'Mil başına tur',
    },
    metricNote: 'Bu sayfadaki her değer, lastik ebadı hesaplayıcısının kullandığı geometri fonksiyonlarıyla koddan hesaplanır — hiçbir sayfada elle girilmiş değer yoktur. Gerçek lastikler üreticiye ve diş desenine göre nominal ölçüden biraz sapar.',
    breakdownHeading: 'Kodun anlamı',
    breakdownParts: (width, aspect, rim) => [
      { token: String(width), label: 'Kesit genişliği', detail: `Lastik şişirilmiş ve yüksüzken bir yanaktan diğerine ${width} mm.` },
      { token: String(aspect), label: 'Profil oranı', detail: `Yanak yüksekliği, ${width} mm genişliğin %${aspect} kadarıdır.` },
      { token: 'R', label: 'Radyal yapı', detail: 'Karkas katları radyaldir — binek lastiklerinde standarttır.' },
      { token: String(rim), label: 'Jant çapı', detail: `Jant çapı ${rim} inç olan jantlara takılır.` },
    ],
    visualHeading: 'Bu ebatta kesit görünümü',
    crossAria: (notation) => `Lastik ebadı ${notation} için kesit şeması: kesit genişliği, yanak yüksekliği, sırt, topuk ve jant`,
    crossTread: 'Sırt',
    crossSidewall: 'Yanak',
    crossBead: 'Topuk',
    crossRimCaption: 'jantın üzerindeki iç boşluk',
    visualNote: 'Bu ebadın gerçek kesit genişliği ve yanak yüksekliğiyle, hesaplayıcıyla aynı geometri fonksiyonu kullanılarak çizilmiştir — oranlar süs değil, hesaplanmıştır.',
    vehiclesHeading: 'Bu ebadı kullanan araçlar',
    vehiclesIntro: (n) => `Atlas bu ebatla ${n} ${plural(n, 'belgelenmiş araç', 'belgelenmiş araç')} listeliyor. Donanım paketleri ve model yılları farklılık gösterir — her zaman ilgili aracın üzerindeki etiketi kontrol edin.`,
    vehiclesEmpty: 'Bu üretilen ebat belgelenmiştir, ancak Atlas’ta henüz bu ebadı kullanan belgelenmiş bir araç yok. Bu bir kapsam sınırıdır, ebat hakkında bir değerlendirme değildir.',
    colVehicle: 'Araç', colGeneration: 'Nesil', colWheel: 'Orijinal jant', colBoltPattern: 'Bijon aralığı',
    colConfidence: 'Kaynak güvenilirliği',
    confidence: { high: 'Yüksek', medium: 'Orta', low: 'Düşük' },
    confidenceNote: 'Güvenilirlik sayfa bazında değil, satır bazında verilir: Atlas’ın o satır için bulduğu kaynakların ne kadar doğrudan olduğunu gösterir. Kaynaklar ve çekinceler her aracın kendi sayfasındadır.',
    vehiclePageLink: 'Araç sayfasını açın',
    compareHeading: 'Geometrik olarak yakın ebatlar',
    compareIntro: 'Referanstaki, hesaplanan dış çapı bu ebattan en fazla %3 sapan diğer ebatlar:',
    compareEmpty: 'Referansta bu çapa %3’ten daha yakın başka bir ebat yok.',
    compareLabel: 'Karşılaştır',
    colSize: 'Ebat', colDiameter: 'Dış çap', colDifference: 'Fark',
    compareCaveat: 'Bu bir geometrik karşılaştırmadır, montaj önerisi değildir. Benzer bir dış çap, bir ebadı güvenle takılabilir yapmaz: jant genişliği, yük ve hız endeksi, iç ve dış boşluk ile araç üreticisinin onayladığı ebatlar da önemlidir. Ebat değiştirmeden önce aracınızın orijinal gereksinimlerini kontrol edin.',
    ctaHeading: 'Hesabı kendiniz yapın',
    ctaNote: 'Her iki araç da bu ebat önceden girilmiş olarak açılır.',
    relatedHeading: 'İlgili veriler',
    backToHub: 'Tüm lastik ebatları',
    faqHeading: 'Sık sorulan sorular',
    faqs: ({ notation, vehicles, makes, rim }) => [
      { q: `Lastik ebadı ${notation} yaygın mı?`, a: vehicles > 0 ? `Atlas bu ebadı ${vehicles} ${plural(vehicles, 'araçta', 'araçta')} belgeledi${makes ? ` (${makes})` : ''}. Bu belgelenmiş bir örneklemdir, pazar payı değildir.` : 'Atlas’ın üretilen ebatlar referansında yer alıyor. Belgelenmiş bir eşleşme olmadan Atlas ne pazar payı ne de bir araç için onay iddia eder.' },
      { q: `Hangi araçlar ${notation} lastik kullanıyor?`, a: vehicles > 0 ? `Bu sayfada listelenen araçlar: ${makes}. Her biri bijon aralığı, jant ölçüsü ve sıkma torkunu içeren kendi sayfasına bağlanır.` : 'Atlas referansında şu anda bu ebatla ilişkilendirilmiş bir araç yok.' },
      { q: 'Bunun yerine başka bir ebat takabilir miyim?', a: 'Çoğu zaman evet, ancak yalnızca araç üreticisinin belirlediği sınırlar içinde. Yukarıdaki geometrik karşılaştırma, hangi ebatların aynı dış çapın %3 yakınında kaldığını gösterir: bu bir ilk filtredir, izin değildir. Jant genişliği, yük ve hız endeksi ile boşluk da uygun olmalıdır; esas olan aracın etiketi ve kullanım kılavuzudur.' },
      { q: `Lastik ebadı ${notation} içindeki ${rim} sayısı ne anlama gelir?`, a: `İnç cinsinden jant çapıdır: bu lastik, jant çapı ${rim} inç olan jantlara takılır. İlk iki sayı metriktir (milimetre ve yüzde) — lastik kodu birimleri bilerek karıştırır.` },
    ],
    breadcrumbHome: 'Ana sayfa', breadcrumbHub: 'Lastik ebatları',
    sizeFaqs: (notation, f, flotation) => [
      flotation
        ? { q: `Lastik ebadı ${notation}: metrik karşılığı nedir?`, a: `Bu lastiğin yüksekliği ${f.diameterMm} mm (${f.diameterIn} inç), genişliği ${f.widthIn} inç, yanak yüksekliği ${f.sidewallIn} inçtir.${f.metricEquivalents ? ` Aynı janttaki en yakın metrik ebatlar: ${f.metricEquivalents}.` : ''}` }
        : { q: `Lastik ebadı ${notation}: inç cinsinden ölçüleri nedir?`, a: `Dış çap ${f.diameterIn} inç (${f.diameterMm} mm), genişlik ${f.widthIn} inç, yanak yüksekliği ${f.sidewallIn} inç.${f.inchClass ? ` Yani lastik sınıfı: ${f.inchClass}.` : ''}` },
    ],
    pageNav: { label: 'Bu sayfada', specs: 'Ölçüler', alternatives: 'Muadiller', vehicles: 'Araçlar', code: 'Kod', faq: 'SSS' },
    specCols: { measure: 'Ölçü', metric: 'Metrik', imperial: 'İnç' },
    revsLabel: 'Tur sayısı',
    answerLabels: { diameter: 'Çap', width: 'Genişlik', sidewall: 'Yanak', circumference: 'Çevre' },
    lookup: { label: 'Lastik ebadı', placeholder: 'örn. 205/55 R16', button: 'Göster', notFound: 'Bu ebat henüz referansta yok. Biçimi kontrol edin, örn. 205/55 R16.', heading: 'Lastik ebadı arayın', intro: 'Lastik yanağında yazan ebadı girin; çapını, çevresini ve muadillerini hemen görün.' },
    flotationKicker: 'İnç cinsinden ebat (flotation)',
    flotationNote: '“Flotation” ebadı, dış çapı ve genişliği doğrudan inç cinsinden, ardından jant çapını belirtir. Kuzey Amerika kökenli arazi ve pick-up lastiklerinde kullanılan olağan gösterimdir.',
    flotationLead: (diameter, width, rim) => `Yüksekliği ${diameter} inç, genişliği ${width} inç olan ve jant çapı ${rim} inç olan jantlara takılan bir lastik.`,
    flotationParts: (diameter, width, rim) => [
      { token: diameter, label: 'Dış çap', detail: `Yükseklik ${diameter} inç; şişirilmiş ve yüksüz ölçülür.` },
      { token: width, label: 'Kesit genişliği', detail: `Bir yanaktan diğerine ${width} inç.` },
      { token: 'R', label: 'Radyal yapı', detail: 'Karkas katları radyaldir.' },
      { token: rim, label: 'Jant çapı', detail: `Jant çapı ${rim} inç olan jantlara takılır.` },
    ],
    diameter: {
      title: (n) => `${n} inç lastikler: tüm muadil ebatlar`,
      description: (n, count, ex) => `Hangi metrik lastik ebatları ${n} inç yüksekliğinde? Janta göre ${count} ebat, inç ve mm cinsinden tam yükseklikleriyle — örn. ${ex}.`,
      kicker: 'Yüksekliğe göre ebatlar',
      h1: (n) => `${n} inç lastikler`,
      lead: (n, count) => `Atlas referansındaki üretilen ebatlardan ${count} tanesi yaklaşık ${n} inç yüksekliğindedir. Hesaplanan çap, genişlik ve yanak yüksekliğiyle janta göre sıralanmıştır.`,
      ruleNote: (n) => `Burada “${n} inç”, yuvarlandığında ${n} eden bir dış çap anlamına gelir (${String(n - 0.5).replace('.', ',')} inçten ${String(n + 0.5).replace('.', ',')} inçin biraz altına kadar). Gerçek lastikler markaya göre biraz farklılık gösterir.`,
      tableHeading: (n) => `Janta göre ${n} inç ebatlar`,
      rimGroup: (rim) => `${rim}″ jant`,
      colSize: 'Ebat', colDiameter: 'Tam çap', colWidth: 'Genişlik', colSidewall: 'Yanak',
      flotationTag: 'flotation',
      popularHeading: (n) => `Her jantta ${n} inçe en yakın ebat`,
      popularIntro: 'Her jant için hesaplanan çapı tam sayıya en yakın olan ebat:',
      neighboursHeading: 'Diğer lastik yükseklikleri',
      groupLink: (n) => `${n}″ lastikler`,
      hubHeading: 'Lastik yüksekliğine göre göz atın',
      hubIntro: 'Tüm ebatlar, inç cinsinden dış çaplarına göre gruplanmıştır — arazi ve pick-up lastikleri genellikle bu şekilde tanımlanır:',
      sizeLink: (n) => `Tüm ${n} inç ebatlar`,
      faqs: (n, ex, flot) => [
        { q: `${n} inç lastik hangi metrik ebada karşılık gelir?`, a: `Tek bir ebat yoktur: yaklaşık ${n} inç yüksekliğindeki her metrik ebat bu gruba girer. Yaygın jantlardaki en yakın ebatlar: ${ex}.` },
        ...(flot ? [{ q: `Hangi flotation ebatları ${n} inç?`, a: `Flotation gösteriminde yükseklik ilk sayıdır: ${flot}.` }] : []),
        { q: `${n} inç bir lastiğe geçebilir miyim?`, a: 'Daha yüksek bir lastik, kilometre saati göstergesini, aktarma oranını ve boşluğu değiştirir. Tablolar yalnızca geometriyi gösterir; önce jant genişliğini, yük endeksini, boşluğu ve aracınız için onaylı ebatları kontrol edin.' },
      ],
      breadcrumb: (n) => `${n} inç lastikler`,
    },
  },
});

export const boltPatternPageText: Readonly<Record<EntityLocale, BoltPatternText>> = Object.freeze({
  en: {
    hubTitle: 'Bolt Patterns: PCD, Lug Count & Vehicles',
    hubDescription: 'Browse Atlas bolt patterns with lug count, PCD, measurable hole spacing and the documented vehicle records behind each pattern.',
    hubKicker: 'Bolt pattern reference',
    hubH1: 'Bolt patterns in the Atlas fitment reference',
    hubLead: (count, vehicles) => `${count} bolt ${plural(count, 'pattern appears', 'patterns appear')} across the ${vehicles} sourced ${plural(vehicles, 'vehicle', 'vehicles')} in the Atlas reference. Each pattern below has its own page with the vehicles it is listed on, their center bore values, and their referenced tire sizes.`,
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
    detailTitle: (notation) => `${notation} Bolt Pattern: PCD & Vehicles`,
    detailDescription: (notation, lugs, pcd, vehicles) => `${notation} means ${lugs} lugs on a ${pcd} mm pitch circle. See hole spacing, center bores and ${vehicles} documented Atlas ${plural(vehicles, 'vehicle', 'vehicles')}.`,
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
    colVehicle: 'Vehicle', colTireSize: 'Referenced tire size', colCenterBore: 'Center bore', colWheel: 'Referenced wheel', colTorque: 'Wheel torque', colFastener: 'Fastener',
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
    relatedTireIntro: 'Referenced tire sizes on the vehicles that use this pattern:',
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
    hubTitle: 'Lochkreise: LK, Lochzahl & Fahrzeuge',
    hubDescription: 'Atlas-Lochkreise mit Lochzahl, Lochkreisdurchmesser, messbarem Lochabstand und den belegten Fahrzeugeinträgen je Lochkreis.',
    hubKicker: 'Lochkreis-Referenz',
    hubH1: 'Lochkreise in der Atlas-Fitment-Referenz',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'Lochkreis kommt', 'Lochkreise kommen')} bei den ${vehicles} belegten Fahrzeugen der Atlas-Referenz vor. Jeder Lochkreis hat eine eigene Seite mit den gelisteten Fahrzeugen, ihren Mittenlochwerten und den Werksreifengrößen, die sie fahren.`,
    notationHeading: 'So lesen Sie einen Lochkreis',
    notationIntro: (example, lugs, pcd) => `Ein Lochkreis wie ${example} besteht aus zwei Zahlen: der Lochzahl und dem Lochkreisdurchmesser (LK). ${example} bedeutet ${lugs} gleichmäßig verteilte Radbohrungen auf einem gedachten Kreis mit ${dec(pcd)} mm Durchmesser, gemessen durch die Radmitte.`,
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
    tireHubCtaDetail: 'Reifengrößen derselben Fahrzeugdaten',

    detailKicker: 'Lochkreis',
    detailTitle: (notation) => `Lochkreis ${notation}: Maße & Fahrzeuge`,
    detailDescription: (notation, lugs, pcd, vehicles) => `${notation} bedeutet ${lugs} Bohrungen auf ${dec(pcd)} mm Lochkreis. Dazu: Lochabstand, Mittenlöcher und ${vehicles} belegte Atlas-Fahrzeuge.`,
    detailH1: (notation) => `Lochkreis ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} gleichmäßig verteilte Radbohrungen auf einem Lochkreis von ${dec(pcd)} mm.`,
    metricsHeading: 'Maße des Lochkreises',
    metrics: { lugCount: 'Lochzahl', pcdMm: 'Lochkreisdurchmesser', pcdIn: 'LK in Zoll', holeSpacing: 'Lochabstand', vehicleCount: 'Gelistete Fahrzeuge', centerBore: 'Mittenlochmaße in der Atlas-Referenz' },
    metricNote: 'Lochkreisdurchmesser und Lochzahl stammen direkt aus den Fahrzeugeinträgen unten. Der Lochabstand wird daraus berechnet und nicht separat recherchiert.',
    holeSpacingNote: 'Sehne zwischen zwei benachbarten Bohrungen, berechnet als LK × sin(180° ÷ Lochzahl) — der Abstand, den Sie an der Nabe messen.',
    diagramHeading: 'Anordnung der Bohrungen',
    diagramNote: (lugs, pcd) => `${lugs} Bohrungen im echten Winkelabstand auf einem Lochkreis von ${dec(pcd)} mm. Die Winkel stimmen exakt; die Zeichnung ist eingepasst skaliert — messen Sie also kein echtes Rad am Bildschirm ab.`,
    diagramAria: (lugs, pcd) => `Diagramm mit ${lugs} gleichmäßig verteilten Radbohrungen auf einem Lochkreis von ${dec(pcd)} Millimetern`,
    pcdLabel: 'LK',
    vehiclesHeading: 'Fahrzeuge mit diesem Lochkreis',
    vehiclesIntro: (n) => `Atlas führt ${n} ${plural(n, 'belegtes Fahrzeug', 'belegte Fahrzeuge')} mit diesem Lochkreis. Mittenloch, Felgengröße und Drehmoment unterscheiden sich dabei — genau deshalb bedeutet ein gleicher Lochkreis noch keine Austauschbarkeit.`,
    vehiclesEmpty: 'Atlas hat für diesen Lochkreis noch keine belegte Fahrzeugzuordnung.',
    colVehicle: 'Fahrzeug', colTireSize: 'Referenz-Reifengröße', colCenterBore: 'Mittenloch', colWheel: 'Referenzfelge', colTorque: 'Anzugsdrehmoment', colFastener: 'Befestigung',
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
      { q: `Was bedeutet ${notation}?`, a: `${lugs} gleichmäßig verteilte Radbohrungen auf einem Kreis mit ${dec(pcd)} mm Durchmesser. Die erste Zahl ist die Lochzahl, die zweite der Lochkreisdurchmesser in Millimetern.` },
      { q: `Welche Fahrzeuge haben ${notation}?`, a: vehicles > 0 ? `In der Atlas-Referenz: ${makes}. Jedes verlinkt auf seine eigene Fitment-Seite mit Werksreifengröße, Felgengröße und Anzugsdrehmoment.` : 'Atlas hat für diesen Lochkreis noch keine belegte Fahrzeugzuordnung.' },
      { q: `Passt eine ${notation}-Felge von einem dieser Autos an ein anderes?`, a: 'Nicht zwangsläufig — und das liegt nicht am Lochkreis. Mittenloch, Einpresstiefe, Felgenbreite, Bremsenfreigang, Sitzform und Tragfähigkeit müssen ebenfalls passen. Der Lochkreis sagt nur, dass die Bohrungen fluchten.' },
      { q: 'Wie messe ich diesen Lochkreis selbst?', a: `Messen Sie den Abstand zwischen zwei benachbarten Bohrungen von Mitte zu Mitte und rechnen Sie ihn in den Lochkreisdurchmesser um. Für ${notation} ergibt sich der oben angegebene Lochabstand. Der Lochkreis-Rechner übernimmt die Umrechnung für jede Lochzahl.` },
    ],
    breadcrumbHome: 'Startseite', breadcrumbHub: 'Lochkreise',
  },

  es: {
    hubTitle: 'Patrones de birlos: PCD y vehículos',
    hubDescription: 'Patrones Atlas con número de birlos, PCD, separación medible entre agujeros y los vehículos documentados con cada patrón.',
    hubKicker: 'Referencia de patrones',
    hubH1: 'Patrones de birlos en la referencia Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'patrón aparece', 'patrones aparecen')} entre los ${vehicles} ${plural(vehicles, 'vehículo documentado', 'vehículos documentados')} de la referencia Atlas. Cada patrón tiene su propia página con los vehículos en los que figura, sus valores de centro de rueda y las medidas de neumático de origen que montan.`,
    notationHeading: 'Cómo se lee un patrón de birlos',
    notationIntro: (example, lugs, pcd) => `Un patrón como ${example} son dos números: el número de birlos y el diámetro del círculo de paso (PCD). ${example} significa ${lugs} agujeros repartidos por igual sobre un círculo imaginario de ${dec(pcd)} mm de diámetro, medido por el centro de la rueda.`,
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
    tireHubCtaDetail: 'Las medidas de neumático de los mismos vehículos',

    detailKicker: 'Patrón de birlos',
    detailTitle: (notation) => `Patrón ${notation}: PCD y vehículos`,
    detailDescription: (notation, lugs, pcd, vehicles) => `${notation} significa ${lugs} birlos sobre un PCD de ${dec(pcd)} mm. Consulte separación, centros y ${vehicles} ${plural(vehicles, 'vehículo Atlas', 'vehículos Atlas')}.`,
    detailH1: (notation) => `Patrón de birlos ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} agujeros repartidos por igual sobre un círculo de paso de ${dec(pcd)} mm.`,
    metricsHeading: 'Dimensiones del patrón',
    metrics: { lugCount: 'Número de birlos', pcdMm: 'Diámetro del círculo de paso', pcdIn: 'PCD en pulgadas', holeSpacing: 'Separación entre agujeros', vehicleCount: 'Vehículos documentados', centerBore: 'Centros de rueda en la referencia Atlas' },
    metricNote: 'El PCD y el número de birlos salen directamente de las fichas de vehículo de abajo. La separación entre agujeros se calcula a partir de ellos, no se documenta aparte.',
    holeSpacingNote: 'Cuerda entre dos agujeros contiguos, calculada como PCD × sen(180° ÷ número de birlos) — la distancia que se mide en el buje.',
    diagramHeading: 'Disposición de los agujeros',
    diagramNote: (lugs, pcd) => `${lugs} agujeros dibujados con su separación angular real sobre un círculo de paso de ${dec(pcd)} mm. Los ángulos son exactos; el dibujo está escalado para encajar, así que no mida una rueda real sobre la pantalla.`,
    diagramAria: (lugs, pcd) => `Diagrama de ${lugs} agujeros repartidos por igual sobre un círculo de paso de ${dec(pcd)} milímetros`,
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
      { q: `¿Qué significa ${notation}?`, a: `${lugs} agujeros repartidos por igual sobre un círculo de ${dec(pcd)} mm de diámetro. El primer número es el número de birlos y el segundo, el diámetro del círculo de paso en milímetros.` },
      { q: `¿Qué vehículos usan ${notation}?`, a: vehicles > 0 ? `En la referencia Atlas: ${makes}. Cada uno enlaza con su ficha, con la medida de origen, el tamaño de llanta y el par de apriete.` : 'Ningún vehículo de la referencia de equipo original de Atlas figura actualmente con este patrón.' },
      { q: `¿Una llanta ${notation} de uno de estos coches vale para otro?`, a: 'No necesariamente, y no por el patrón. El centro de rueda, el offset, el ancho de llanta, la holgura de frenos, el tipo de asiento y la capacidad de carga también tienen que coincidir: el patrón solo indica que los agujeros encajan.' },
      { q: '¿Cómo mido yo mismo este patrón?', a: `Mida la distancia entre dos agujeros contiguos, de centro a centro, y conviértala en diámetro del círculo de paso. Para ${notation} esa distancia es la indicada arriba. La Calculadora de patrón de birlos hace la conversión para cualquier número de birlos.` },
    ],
    breadcrumbHome: 'Inicio', breadcrumbHub: 'Patrones de birlos',
  },
  fr: {
    hubTitle: 'Entraxes de jantes : PCD et véhicules',
    hubDescription: 'Entraxes Atlas avec nombre de trous, diamètre PCD, écart mesurable entre deux trous et véhicules documentés pour chaque entraxe.',
    hubKicker: 'Référence des entraxes',
    hubH1: 'Entraxes de jantes dans la référence Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'entraxe apparaît', 'entraxes apparaissent')} parmi les ${vehicles} ${plural(vehicles, 'véhicule documenté', 'véhicules documentés')} de la référence Atlas. Chaque entraxe a sa page avec les véhicules concernés, leurs alésages centraux et les tailles de pneus d’origine.`,
    notationHeading: 'Comment lire un entraxe',
    notationIntro: (example, lugs, pcd) => `Un entraxe comme ${example} se compose de deux nombres : le nombre de trous et le diamètre du cercle de perçage (PCD). ${example} signifie ${lugs} trous répartis régulièrement sur un cercle imaginaire de ${dec(pcd)} mm de diamètre, centré sur le moyeu.`,
    notationParts: [
      { label: 'Nombre de trous', detail: 'Combien de goujons ou de vis fixent la roue — le premier nombre.' },
      { label: 'Diamètre du cercle de perçage (PCD)', detail: 'Le diamètre, en millimètres, du cercle sur lequel se trouvent les trous — le second nombre.' },
      { label: 'Écart entre deux trous', detail: 'Ce que l’on peut réellement mesurer à la règle entre deux trous voisins ; le calculateur d’entraxe le reconvertit en PCD.' },
    ],
    searchLabel: 'Filtrer les entraxes',
    searchPlaceholder: 'ex. 5x112 ou 4x',
    searchEmpty: 'Aucun entraxe de la référence ne correspond à ce filtre.',
    countLabel: (n) => `${n} ${plural(n, 'entraxe', 'entraxes')}`,
    groupHeading: (lugs) => `Entraxes à ${lugs} trous`,
    jumpLabel: 'Aller à un nombre de trous',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'véhicule', 'véhicules')}`,
    toolsHeading: 'Mesurer et vérifier le montage',
    calculatorCta: 'Calculateur d’entraxe (en anglais)',
    calculatorCtaDetail: 'Convertir une mesure entre deux trous en PCD',
    fitmentCta: 'Calculateur de déport ET (en anglais)',
    fitmentCtaDetail: 'L’autre moitié de la question : la jante s’adapte-t-elle vraiment ?',
    vehiclesCta: 'Référence véhicules',
    vehiclesCtaDetail: 'Taille d’origine, entraxe et couple de serrage par véhicule',
    tireHubCta: 'Dimensions de pneus',
    tireHubCtaDetail: 'Les tailles de pneus des mêmes véhicules',

    detailKicker: 'Entraxe',
    detailTitle: (notation) => `Entraxe ${notation} : PCD et véhicules compatibles`,
    detailDescription: (notation, lugs, pcd, vehicles) => `L’entraxe ${notation} correspond à ${lugs} trous sur un PCD de ${dec(pcd)} mm. Écart entre trous, alésages et ${vehicles} ${plural(vehicles, 'véhicule Atlas', 'véhicules Atlas')}.`,
    detailH1: (notation) => `Entraxe ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} trous répartis régulièrement sur un cercle de perçage de ${dec(pcd)} mm.`,
    metricsHeading: 'Dimensions de l’entraxe',
    metrics: { lugCount: 'Nombre de trous', pcdMm: 'Diamètre du cercle de perçage', pcdIn: 'PCD en pouces', holeSpacing: 'Écart entre deux trous', vehicleCount: 'Véhicules documentés', centerBore: 'Alésages centraux dans la référence' },
    metricNote: 'Le PCD et le nombre de trous proviennent directement des fiches véhicules ci-dessous. L’écart entre deux trous en est calculé, il n’est pas saisi séparément.',
    holeSpacingNote: 'Corde entre deux trous voisins, calculée comme PCD × sin(180° ÷ nombre de trous) — la distance que l’on mesure sur le moyeu.',
    diagramHeading: 'Disposition des trous',
    diagramNote: (lugs, pcd) => `${lugs} trous dessinés avec leur écart angulaire réel sur un cercle de ${dec(pcd)} mm. Les angles sont exacts ; le dessin est mis à l’échelle de l’écran, ne mesurez pas une vraie roue dessus.`,
    diagramAria: (lugs, pcd) => `Schéma de ${lugs} trous répartis régulièrement sur un cercle de perçage de ${dec(pcd)} millimètres`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Véhicules avec cet entraxe',
    vehiclesIntro: (n) => `Atlas recense ${n} ${plural(n, 'véhicule', 'véhicules')} avec cet entraxe. Alésage, taille de jante et couple varient entre eux — c’est précisément pourquoi un même entraxe ne signifie pas interchangeabilité.`,
    vehiclesEmpty: 'Aucun véhicule de la référence Atlas n’est actuellement associé à cet entraxe.',
    colVehicle: 'Véhicule', colTireSize: 'Taille d’origine', colCenterBore: 'Alésage central', colWheel: 'Jante d’origine', colTorque: 'Couple de serrage', colFastener: 'Fixation',
    colConfidence: 'Fiabilité de la source',
    confidence: { high: 'Élevée', medium: 'Moyenne', low: 'Faible' },
    confidenceNote: 'La fiabilité est indiquée par ligne, pas par page : elle reflète la solidité des sources trouvées par Atlas pour cette ligne précise. Sources et réserves figurent sur la fiche de chaque véhicule.',
    torqueUnconfirmedTitle: 'Extrapolé ou non confirmé de façon indépendante — vérifiez dans le manuel avant de serrer.',
    lugNut: 'Écrous', wheelBolt: 'Vis',
    vehiclePageLink: 'Ouvrir la fiche du véhicule',
    safetyHeading: 'Même entraxe ne veut pas dire jante compatible',
    safetyLead: 'Deux véhicules au même entraxe ont seulement des trous qui coïncident. Cela ne dit rien du montage en sécurité de la jante. Tout ceci doit aussi correspondre :',
    safetyFactors: [
      { label: 'Alésage central', detail: 'La jante doit se centrer sur le moyeu, pas sur les goujons. Un alésage trop petit ne passe pas ; un plus grand exige la bonne bague de centrage.' },
      { label: 'Déport (ET)', detail: 'Il fixe la position de la roue dans le passage de roue — un mauvais déport provoque frottements, contact avec les suspensions ou charges anormales sur les roulements.' },
      { label: 'Largeur de jante', detail: 'Elle doit convenir à la largeur du pneu et au passage de roue. Un même entraxe se vend dans des largeurs qui ne vont pas toutes sur la même voiture.' },
      { label: 'Dégagement des freins', detail: 'La forme des branches et la profondeur du voile doivent dégager l’étrier. Beaucoup de jantes au même entraxe touchent des freins plus grands.' },
      { label: 'Portée et visserie', detail: 'Portées conique, sphérique et plate ne sont pas interchangeables ; pas de filetage et longueur doivent correspondre au moyeu.' },
      { label: 'Charge admissible', detail: 'La jante doit être homologuée pour la charge à l’essieu — crucial sur les véhicules lourds, fourgons et pick-up.' },
    ],
    safetyClose: 'Servez-vous de l’entraxe pour éliminer des jantes, jamais pour les valider. Comparez avec la spécification constructeur et faites vérifier tout doute par un professionnel.',
    ctaHeading: 'Vérifier une mesure',
    ctaNote: 'Le calculateur s’ouvre prérempli avec le nombre de trous et l’écart de cet entraxe.',
    relatedHeading: 'Données associées',
    relatedTireIntro: 'Tailles de pneus d’origine des véhicules qui utilisent cet entraxe :',
    backToHub: 'Tous les entraxes',
    faqHeading: 'Questions fréquentes',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `Que signifie l’entraxe ${notation} ?`, a: `${lugs} trous répartis régulièrement sur un cercle de ${dec(pcd)} mm de diamètre. Le premier nombre est le nombre de trous, le second le diamètre du cercle de perçage en millimètres.` },
      { q: `Quels véhicules ont un entraxe ${notation} ?`, a: vehicles > 0 ? `Dans la référence Atlas : ${makes}. Chacun renvoie à sa fiche avec la taille de pneu d’origine, la taille de jante et le couple de serrage.` : 'Aucun véhicule de la référence Atlas n’est actuellement associé à cet entraxe.' },
      { q: `Une jante ${notation} d’une de ces voitures va-t-elle sur une autre ?`, a: 'Pas forcément, et pas à cause de l’entraxe. Alésage, déport, largeur de jante, dégagement des freins, type de portée et charge admissible doivent aussi correspondre : l’entraxe dit seulement que les trous coïncident.' },
      { q: 'Comment mesurer cet entraxe soi-même ?', a: `Mesurez la distance entre deux trous voisins, de centre à centre, puis convertissez-la en diamètre de cercle de perçage. Pour ${notation}, cette distance est indiquée plus haut ; le calculateur d’entraxe fait la conversion pour tout nombre de trous.` },
    ],
    breadcrumbHome: 'Accueil', breadcrumbHub: 'Entraxes',
  },
  'it': {
    hubTitle: 'Forature cerchi: PCD e veicoli',
    hubDescription: 'Forature Atlas con numero di fori, PCD, distanza misurabile tra due fori e veicoli documentati per ogni foratura.',
    hubKicker: 'Riferimento forature (PCD)',
    hubH1: 'Forature dei cerchi nel riferimento Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'foratura compare', 'forature compaiono')} tra i ${vehicles} ${plural(vehicles, 'veicolo documentato', 'veicoli documentati')} del riferimento Atlas. Ogni foratura ha la sua pagina con i veicoli interessati, i loro fori centrali e le misure di pneumatici di serie.`,
    notationHeading: 'Come leggere una foratura',
    notationIntro: (example, lugs, pcd) => `Una foratura come ${example} è composta da due numeri: il numero di fori e il diametro della circonferenza dei fori (PCD, o interasse). ${example} significa ${lugs} fori distribuiti in modo uniforme su una circonferenza immaginaria di ${dec(pcd)} mm di diametro, centrata sul mozzo.`,
    notationParts: [
      { label: 'Numero di fori', detail: 'Quante colonnette o bulloni fissano la ruota: il primo numero.' },
      { label: 'Diametro della circonferenza dei fori (PCD)', detail: 'Il diametro, in millimetri, della circonferenza su cui si trovano i fori: il secondo numero.' },
      { label: 'Distanza tra due fori', detail: 'Ciò che si può davvero misurare con un righello tra due fori adiacenti; il calcolatore di foratura la riconverte in PCD.' },
    ],
    searchLabel: 'Filtra le forature',
    searchPlaceholder: 'es. 5x112 o 4x',
    searchEmpty: 'Nessuna foratura del riferimento corrisponde a questo filtro.',
    countLabel: (n) => `${n} ${plural(n, 'foratura', 'forature')}`,
    groupHeading: (lugs) => `Forature a ${lugs} fori`,
    jumpLabel: 'Vai a un numero di fori',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'veicolo', 'veicoli')}`,
    toolsHeading: 'Misurare e verificare il montaggio',
    calculatorCta: 'Calcolatore di foratura (in inglese)',
    calculatorCtaDetail: 'Converte la distanza tra due fori in PCD',
    fitmentCta: 'Calcolatore offset ET (in inglese)',
    fitmentCtaDetail: 'L’altra metà della questione: il cerchio si monta davvero?',
    vehiclesCta: 'Riferimento veicoli',
    vehiclesCtaDetail: 'Misura di serie, foratura e coppia di serraggio per veicolo',
    tireHubCta: 'Misure pneumatici',
    tireHubCtaDetail: 'Le misure di pneumatici degli stessi veicoli',

    detailKicker: 'Foratura',
    detailTitle: (notation) => `Foratura ${notation}: PCD e veicoli compatibili`,
    detailDescription: (notation, lugs, pcd, vehicles) => `La foratura ${notation} corrisponde a ${lugs} fori su un PCD di ${dec(pcd)} mm. Distanza tra i fori, fori centrali e ${vehicles} ${plural(vehicles, 'veicolo Atlas', 'veicoli Atlas')}.`,
    detailH1: (notation) => `Foratura ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} fori distribuiti in modo uniforme su una circonferenza di ${dec(pcd)} mm.`,
    metricsHeading: 'Dimensioni della foratura',
    metrics: { lugCount: 'Numero di fori', pcdMm: 'Diametro della circonferenza dei fori', pcdIn: 'PCD in pollici', holeSpacing: 'Distanza tra due fori', vehicleCount: 'Veicoli documentati', centerBore: 'Fori centrali nel riferimento' },
    metricNote: 'Il PCD e il numero di fori provengono direttamente dalle schede veicolo qui sotto. La distanza tra due fori è calcolata da questi valori, non inserita separatamente.',
    holeSpacingNote: 'Corda tra due fori adiacenti, calcolata come PCD × sin(180° ÷ numero di fori): la distanza che si misura sul mozzo.',
    diagramHeading: 'Disposizione dei fori',
    diagramNote: (lugs, pcd) => `${lugs} fori disegnati con la loro reale spaziatura angolare su una circonferenza di ${dec(pcd)} mm. Gli angoli sono esatti; il disegno è adattato allo schermo, quindi non va usato per misurare una ruota reale.`,
    diagramAria: (lugs, pcd) => `Schema di ${lugs} fori distribuiti in modo uniforme su una circonferenza di ${dec(pcd)} millimetri`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Veicoli con questa foratura',
    vehiclesIntro: (n) => `Atlas registra ${n} ${plural(n, 'veicolo', 'veicoli')} con questa foratura. Foro centrale, misura del cerchio e coppia variano tra loro: proprio per questo la stessa foratura non significa intercambiabilità.`,
    vehiclesEmpty: 'Nessun veicolo del riferimento Atlas è attualmente associato a questa foratura.',
    colVehicle: 'Veicolo', colTireSize: 'Misura di serie', colCenterBore: 'Foro centrale', colWheel: 'Cerchio di serie', colTorque: 'Coppia di serraggio', colFastener: 'Fissaggio',
    colConfidence: 'Affidabilità della fonte',
    confidence: { high: 'Alta', medium: 'Media', low: 'Bassa' },
    confidenceNote: 'L’affidabilità è indicata per riga, non per pagina: riflette la solidità delle fonti trovate da Atlas per quella riga specifica. Fonti e riserve sono riportate nella scheda di ciascun veicolo.',
    torqueUnconfirmedTitle: 'Valore estrapolato o non confermato in modo indipendente — verificare nel manuale prima del serraggio.',
    lugNut: 'Dadi ruota', wheelBolt: 'Bulloni ruota',
    vehiclePageLink: 'Apri la scheda del veicolo',
    safetyHeading: 'Stessa foratura non significa cerchio compatibile',
    safetyLead: 'Due veicoli con la stessa foratura hanno soltanto i fori che coincidono. Questo non dice nulla sul montaggio sicuro del cerchio. Devono corrispondere anche tutti questi elementi:',
    safetyFactors: [
      { label: 'Foro centrale', detail: 'Il cerchio deve centrarsi sul mozzo, non sulle colonnette. Un foro troppo piccolo non entra; uno più grande richiede l’anello di centraggio corretto.' },
      { label: 'Offset (ET)', detail: 'Determina la posizione della ruota nel passaruota: un offset errato provoca sfregamenti, contatto con le sospensioni o carichi anomali sui cuscinetti.' },
      { label: 'Larghezza del cerchio', detail: 'Deve essere adatta alla larghezza dello pneumatico e al passaruota. La stessa foratura si vende in larghezze che non vanno tutte bene sulla stessa auto.' },
      { label: 'Spazio per i freni', detail: 'La forma delle razze e la profondità del canale devono lasciare spazio alla pinza. Molti cerchi con la stessa foratura toccano freni più grandi.' },
      { label: 'Sede e bulloneria', detail: 'Le sedi conica, sferica e piana non sono intercambiabili; passo della filettatura e lunghezza devono corrispondere al mozzo.' },
      { label: 'Carico ammesso', detail: 'Il cerchio deve essere omologato per il carico sull’asse: fondamentale su veicoli pesanti, furgoni e pick-up.' },
    ],
    safetyClose: 'Usare la foratura per escludere dei cerchi, mai per approvarli. Confrontare con la specifica del costruttore e far verificare ogni dubbio da un professionista.',
    ctaHeading: 'Verifica una misura',
    ctaNote: 'Il calcolatore si apre precompilato con il numero di fori e la distanza tra i fori di questa foratura.',
    relatedHeading: 'Dati correlati',
    relatedTireIntro: 'Misure di pneumatici di serie dei veicoli che usano questa foratura:',
    backToHub: 'Tutte le forature',
    faqHeading: 'Domande frequenti',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `Cosa significa la foratura ${notation}?`, a: `${lugs} fori distribuiti in modo uniforme su una circonferenza di ${dec(pcd)} mm di diametro. Il primo numero è il numero di fori, il secondo il diametro della circonferenza dei fori in millimetri.` },
      { q: `Quali veicoli hanno la foratura ${notation}?`, a: vehicles > 0 ? `Nel riferimento Atlas: ${makes}. Ognuno rimanda alla propria scheda con misura di pneumatico di serie, misura del cerchio e coppia di serraggio.` : 'Nessun veicolo del riferimento Atlas è attualmente associato a questa foratura.' },
      { q: `Un cerchio ${notation} di una di queste auto va bene su un’altra?`, a: 'Non necessariamente, e non per via della foratura. Anche foro centrale, offset, larghezza del cerchio, spazio per i freni, tipo di sede e carico ammesso devono corrispondere: la foratura dice solo che i fori coincidono.' },
      { q: 'Come si misura questa foratura?', a: `Misurare la distanza tra due fori adiacenti, da centro a centro, poi convertirla nel diametro della circonferenza dei fori. Per ${notation} questa distanza è indicata più sopra; il calcolatore di foratura esegue la conversione per qualsiasi numero di fori.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Forature cerchi',
  },
  'pt-br': {
    hubTitle: 'Furação de rodas: PCD e veículos',
    hubDescription: 'Furações da Atlas com número de furos, diâmetro PCD, distância medível entre dois furos e veículos documentados para cada furação.',
    hubKicker: 'Referência de furações',
    hubH1: 'Furação de rodas na referência Atlas',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'furação aparece', 'furações aparecem')} entre os ${vehicles} ${plural(vehicles, 'veículo documentado', 'veículos documentados')} da referência Atlas. Cada furação tem sua página com os veículos correspondentes, seus furos centrais e as medidas de pneus originais.`,
    notationHeading: 'Como ler uma furação',
    notationIntro: (example, lugs, pcd) => `Uma furação como ${example} é formada por dois números: o número de furos e o diâmetro do círculo dos furos (PCD). ${example} significa ${lugs} furos distribuídos por igual em um círculo imaginário de ${dec(pcd)} mm de diâmetro, centrado no cubo.`,
    notationParts: [
      { label: 'Número de furos', detail: 'Quantos prisioneiros ou parafusos fixam a roda — o primeiro número.' },
      { label: 'Diâmetro do círculo dos furos (PCD)', detail: 'O diâmetro, em milímetros, do círculo onde ficam os furos — o segundo número.' },
      { label: 'Distância entre dois furos', detail: 'O que se pode realmente medir com uma régua entre dois furos vizinhos; a calculadora de furação converte essa medida de volta em PCD.' },
    ],
    searchLabel: 'Filtrar furações',
    searchPlaceholder: 'ex.: 5x112 ou 4x',
    searchEmpty: 'Nenhuma furação da referência corresponde a esse filtro.',
    countLabel: (n) => `${n} ${plural(n, 'furação', 'furações')}`,
    groupHeading: (lugs) => `Furações de ${lugs} furos`,
    jumpLabel: 'Ir para um número de furos',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'veículo', 'veículos')}`,
    toolsHeading: 'Medir e verificar a montagem',
    calculatorCta: 'Calculadora de furação (em inglês)',
    calculatorCtaDetail: 'Converter uma medida entre dois furos em PCD',
    fitmentCta: 'Calculadora de offset ET (em inglês)',
    fitmentCtaDetail: 'A outra metade da questão: a roda serve mesmo?',
    vehiclesCta: 'Referência de veículos',
    vehiclesCtaDetail: 'Medida original, furação e torque de aperto por veículo',
    tireHubCta: 'Medidas de pneus',
    tireHubCtaDetail: 'As medidas de pneus dos mesmos veículos',

    detailKicker: 'Furação',
    detailTitle: (notation) => `Furação ${notation}: PCD e veículos compatíveis`,
    detailDescription: (notation, lugs, pcd, vehicles) => `A furação ${notation} corresponde a ${lugs} furos em um PCD de ${dec(pcd)} mm. Distância entre furos, furos centrais e ${vehicles} ${plural(vehicles, 'veículo Atlas', 'veículos Atlas')}.`,
    detailH1: (notation) => `Furação ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} furos distribuídos por igual em um círculo de ${dec(pcd)} mm.`,
    metricsHeading: 'Dimensões da furação',
    metrics: { lugCount: 'Número de furos', pcdMm: 'Diâmetro do círculo dos furos', pcdIn: 'PCD em polegadas', holeSpacing: 'Distância entre dois furos', vehicleCount: 'Veículos documentados', centerBore: 'Furos centrais na referência' },
    metricNote: 'O PCD e o número de furos vêm diretamente das fichas de veículos abaixo. A distância entre dois furos é calculada a partir deles, não informada separadamente.',
    holeSpacingNote: 'Corda entre dois furos vizinhos, calculada como PCD × sen(180° ÷ número de furos) — a distância que se mede no cubo.',
    diagramHeading: 'Disposição dos furos',
    diagramNote: (lugs, pcd) => `${lugs} furos desenhados com o espaçamento angular real em um círculo de ${dec(pcd)} mm. Os ângulos são exatos; o desenho é ajustado à tela, então não meça uma roda de verdade por ele.`,
    diagramAria: (lugs, pcd) => `Diagrama de ${lugs} furos distribuídos por igual em um círculo de ${dec(pcd)} milímetros`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Veículos com esta furação',
    vehiclesIntro: (n) => `A Atlas lista ${n} ${plural(n, 'veículo', 'veículos')} com esta furação. Furo central, medida da roda e torque variam entre eles — justamente por isso a mesma furação não significa intercambialidade.`,
    vehiclesEmpty: 'No momento, nenhum veículo da referência Atlas está associado a esta furação.',
    colVehicle: 'Veículo', colTireSize: 'Medida original', colCenterBore: 'Furo central', colWheel: 'Roda original', colTorque: 'Torque de aperto', colFastener: 'Fixação',
    colConfidence: 'Confiabilidade da fonte',
    confidence: { high: 'Alta', medium: 'Média', low: 'Baixa' },
    confidenceNote: 'A confiabilidade é indicada por linha, não por página: ela reflete a solidez das fontes que a Atlas encontrou para aquela linha específica. Fontes e ressalvas estão na página de cada veículo.',
    torqueUnconfirmedTitle: 'Extrapolado ou não confirmado de forma independente — confira no manual antes de apertar.',
    lugNut: 'Porcas', wheelBolt: 'Parafusos',
    vehiclePageLink: 'Abrir a página do veículo',
    safetyHeading: 'Mesma furação não quer dizer roda compatível',
    safetyLead: 'Dois veículos com a mesma furação só têm furos que coincidem. Isso não diz nada sobre a montagem segura da roda. Tudo isto também precisa corresponder:',
    safetyFactors: [
      { label: 'Furo central', detail: 'A roda deve se centralizar no cubo, não nos prisioneiros. Um furo menor não entra; um maior exige o anel de centralização correto.' },
      { label: 'Offset (ET)', detail: 'Define a posição da roda na caixa de roda — um offset errado causa atrito, contato com a suspensão ou cargas anormais nos rolamentos.' },
      { label: 'Largura da roda', detail: 'Precisa combinar com a largura do pneu e com a caixa de roda. A mesma furação é vendida em larguras que nem sempre servem no mesmo carro.' },
      { label: 'Folga dos freios', detail: 'O formato dos raios e a profundidade da roda precisam livrar a pinça. Muitas rodas com a mesma furação encostam em freios maiores.' },
      { label: 'Assento e fixadores', detail: 'Assentos cônico, esférico e plano não são intercambiáveis; o passo da rosca e o comprimento devem corresponder ao cubo.' },
      { label: 'Capacidade de carga', detail: 'A roda deve ser homologada para a carga do eixo — crucial em veículos pesados, vans e picapes.' },
    ],
    safetyClose: 'Use a furação para descartar rodas, nunca para aprová-las. Compare com a especificação do fabricante e peça a um profissional que verifique qualquer dúvida.',
    ctaHeading: 'Verificar uma medida',
    ctaNote: 'A calculadora abre já preenchida com o número de furos e a distância entre furos desta furação.',
    relatedHeading: 'Dados relacionados',
    relatedTireIntro: 'Medidas de pneus originais dos veículos que usam esta furação:',
    backToHub: 'Todas as furações',
    faqHeading: 'Perguntas frequentes',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `O que significa a furação ${notation}?`, a: `${lugs} furos distribuídos por igual em um círculo de ${dec(pcd)} mm de diâmetro. O primeiro número é a quantidade de furos; o segundo, o diâmetro do círculo dos furos em milímetros.` },
      { q: `Quais veículos têm furação ${notation}?`, a: vehicles > 0 ? `Na referência Atlas: ${makes}. Cada um leva à sua página com a medida de pneu original, a medida da roda e o torque de aperto.` : 'No momento, nenhum veículo da referência Atlas está associado a esta furação.' },
      { q: `Uma roda ${notation} de um desses carros serve em outro?`, a: 'Não necessariamente, e não por causa da furação. Furo central, offset, largura da roda, folga dos freios, tipo de assento e capacidade de carga também precisam corresponder: a furação só indica que os furos coincidem.' },
      { q: 'Como medir esta furação você mesmo?', a: `Meça a distância entre dois furos vizinhos, de centro a centro, e converta-a em diâmetro do círculo dos furos. Para ${notation}, essa distância aparece mais acima; a calculadora de furação faz a conversão para qualquer número de furos.` },
    ],
    breadcrumbHome: 'Início', breadcrumbHub: 'Furações',
  },
  'pl': {
    hubTitle: 'Rozstawy śrub: PCD i pojazdy',
    hubDescription: 'Rozstawy śrub w bazie Atlas: liczba otworów, średnica PCD, mierzalny odstęp między otworami i udokumentowane pojazdy dla każdego rozstawu.',
    hubKicker: 'Baza rozstawów śrub',
    hubH1: 'Rozstawy śrub w bazie Atlas',
    hubLead: (count, vehicles) => `Rozstawy śrub występujące wśród udokumentowanych pojazdów w bazie Atlas — ${plural(count, 'rozstaw', 'rozstawy')}: ${count}, ${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}. Każdy rozstaw ma własną stronę z pojazdami, ich otworami centralnymi i fabrycznymi rozmiarami opon.`,
    notationHeading: 'Jak odczytać rozstaw śrub',
    notationIntro: (example, lugs, pcd) => `Rozstaw śrub, taki jak ${example}, składa się z dwóch liczb: liczby otworów i średnicy okręgu otworów (PCD). ${example} oznacza, że otwory (liczba: ${lugs}) są rozmieszczone równomiernie na umownym okręgu o średnicy ${dec(pcd)} mm, wyśrodkowanym na piaście.`,
    notationParts: [
      { label: 'Liczba otworów', detail: 'Ile szpilek lub śrub mocuje koło — pierwsza liczba.' },
      { label: 'Średnica okręgu otworów (PCD)', detail: 'Średnica okręgu, na którym leżą otwory, w milimetrach — druga liczba.' },
      { label: 'Odstęp między dwoma otworami', detail: 'To, co można faktycznie zmierzyć linijką między dwoma sąsiednimi otworami; kalkulator rozstawu śrub przelicza to na PCD.' },
    ],
    searchLabel: 'Filtruj rozstawy śrub',
    searchPlaceholder: 'np. 5x112 lub 4x',
    searchEmpty: 'Żaden rozstaw w bazie nie pasuje do tego filtra.',
    countLabel: (n) => `${plural(n, 'rozstaw', 'rozstawy')}: ${n}`,
    groupHeading: (lugs) => `Rozstawy ${lugs}-otworowe`,
    jumpLabel: 'Przejdź do liczby otworów',
    listedAs: (vehicles) => `${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}`,
    toolsHeading: 'Zmierz i sprawdź dopasowanie',
    calculatorCta: 'Kalkulator rozstawu śrub (po angielsku)',
    calculatorCtaDetail: 'Przelicz odstęp między dwoma otworami na PCD',
    fitmentCta: 'Kalkulator odsadzenia ET (po angielsku)',
    fitmentCtaDetail: 'Druga połowa pytania: czy felga naprawdę pasuje?',
    vehiclesCta: 'Baza pojazdów',
    vehiclesCtaDetail: 'Rozmiar fabryczny, rozstaw śrub i moment dokręcania dla każdego pojazdu',
    tireHubCta: 'Rozmiary opon',
    tireHubCtaDetail: 'Rozmiary opon tych samych pojazdów',

    detailKicker: 'Rozstaw śrub',
    detailTitle: (notation) => `Rozstaw śrub ${notation}: PCD i pojazdy`,
    detailDescription: (notation, lugs, pcd, vehicles) => `Rozstaw śrub ${notation}: liczba otworów ${lugs}, PCD ${dec(pcd)} mm. Odstęp między otworami, otwory centralne i pojazdy Atlas — ${plural(vehicles, 'pojazd', 'pojazdy')}: ${vehicles}.`,
    detailH1: (notation) => `Rozstaw śrub ${notation}`,
    detailLead: (lugs, pcd) => `Liczba otworów: ${lugs} — rozmieszczone równomiernie na okręgu o średnicy ${dec(pcd)} mm.`,
    metricsHeading: 'Wymiary rozstawu',
    metrics: { lugCount: 'Liczba otworów', pcdMm: 'Średnica okręgu otworów', pcdIn: 'PCD w calach', holeSpacing: 'Odstęp między dwoma otworami', vehicleCount: 'Udokumentowane pojazdy', centerBore: 'Otwory centralne w bazie' },
    metricNote: 'PCD i liczba otworów pochodzą bezpośrednio z poniższych danych pojazdów. Odstęp między dwoma otworami jest z nich obliczany, a nie wprowadzany osobno.',
    holeSpacingNote: 'Cięciwa między dwoma sąsiednimi otworami, obliczona jako PCD × sin(180° ÷ liczba otworów) — odległość, którą mierzy się na piaście.',
    diagramHeading: 'Rozmieszczenie otworów',
    diagramNote: (lugs, pcd) => `Otwory (liczba: ${lugs}) narysowane z rzeczywistym odstępem kątowym na okręgu ${dec(pcd)} mm. Kąty są dokładne; rysunek jest przeskalowany do ekranu — nie należy mierzyć na nim prawdziwego koła.`,
    diagramAria: (lugs, pcd) => `Schemat: otwory w liczbie ${lugs} rozmieszczone równomiernie na okręgu o średnicy ${dec(pcd)} milimetrów`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Pojazdy z tym rozstawem śrub',
    vehiclesIntro: (n) => `Pojazdy z tym rozstawem w bazie Atlas — ${plural(n, 'pojazd', 'pojazdy')}: ${n}. Otwór centralny, rozmiar felgi i moment dokręcania różnią się między nimi — właśnie dlatego ten sam rozstaw nie oznacza zamienności.`,
    vehiclesEmpty: 'Żaden pojazd w bazie Atlas nie jest obecnie powiązany z tym rozstawem śrub.',
    colVehicle: 'Pojazd', colTireSize: 'Rozmiar fabryczny', colCenterBore: 'Otwór centralny', colWheel: 'Felga fabryczna', colTorque: 'Moment dokręcania', colFastener: 'Mocowanie',
    colConfidence: 'Wiarygodność źródła',
    confidence: { high: 'Wysoka', medium: 'Średnia', low: 'Niska' },
    confidenceNote: 'Wiarygodność jest podawana dla każdego wiersza, a nie dla całej strony: pokazuje, jak solidne źródła Atlas znalazł dla tego konkretnego wiersza. Źródła i zastrzeżenia są na stronie każdego pojazdu.',
    torqueUnconfirmedTitle: 'Wartość ekstrapolowana lub niepotwierdzona niezależnie — przed dokręceniem należy sprawdzić w instrukcji.',
    lugNut: 'Nakrętki koła', wheelBolt: 'Śruby koła',
    vehiclePageLink: 'Otwórz stronę pojazdu',
    safetyHeading: 'Ten sam rozstaw nie znaczy, że felga pasuje',
    safetyLead: 'Dwa pojazdy o tym samym rozstawie mają jedynie pokrywające się otwory. Nie mówi to nic o tym, czy felgę można bezpiecznie zamontować. Zgadzać muszą się również:',
    safetyFactors: [
      { label: 'Otwór centralny', detail: 'Felga musi centrować się na piaście, a nie na szpilkach. Za mały otwór nie wejdzie; większy wymaga właściwego pierścienia centrującego.' },
      { label: 'Odsadzenie (ET)', detail: 'Określa położenie koła w nadkolu — złe odsadzenie powoduje ocieranie, kontakt z zawieszeniem lub nieprawidłowe obciążenie łożysk.' },
      { label: 'Szerokość felgi', detail: 'Musi pasować do szerokości opony i do nadkola. Ten sam rozstaw sprzedaje się w szerokościach, które nie wszystkie pasują do tego samego auta.' },
      { label: 'Luz dla hamulców', detail: 'Kształt ramion i głębokość felgi muszą zapewniać miejsce dla zacisku. Wiele felg o tym samym rozstawie ociera o większe hamulce.' },
      { label: 'Gniazdo i elementy mocujące', detail: 'Gniazda stożkowe, kuliste i płaskie nie są zamienne; skok gwintu i długość śruby muszą pasować do piasty.' },
      { label: 'Nośność', detail: 'Felga musi być dopuszczona do obciążenia osi — kluczowe w cięższych pojazdach, autach dostawczych i pick-upach.' },
    ],
    safetyClose: 'Rozstaw śrub służy do wykluczania felg, nigdy do ich zatwierdzania. Należy porównać dane ze specyfikacją producenta pojazdu, a wszelkie wątpliwości skonsultować z fachowcem.',
    ctaHeading: 'Sprawdź pomiar',
    ctaNote: 'Kalkulator otwiera się z wpisaną liczbą otworów i odstępem dla tego rozstawu.',
    relatedHeading: 'Powiązane dane',
    relatedTireIntro: 'Fabryczne rozmiary opon pojazdów z tym rozstawem:',
    backToHub: 'Wszystkie rozstawy',
    faqHeading: 'Najczęściej zadawane pytania',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `Co oznacza rozstaw śrub ${notation}?`, a: `Otwory w liczbie ${lugs} rozmieszczone równomiernie na okręgu o średnicy ${dec(pcd)} mm. Pierwsza liczba to liczba otworów, druga — średnica okręgu otworów w milimetrach.` },
      { q: `Które pojazdy mają rozstaw śrub ${notation}?`, a: vehicles > 0 ? `W bazie Atlas: ${makes}. Każdy prowadzi do swojej strony z fabrycznym rozmiarem opon, rozmiarem felgi i momentem dokręcania.` : 'Żaden pojazd w bazie Atlas nie jest obecnie powiązany z tym rozstawem śrub.' },
      { q: `Czy felga ${notation} z jednego z tych aut pasuje do innego?`, a: 'Niekoniecznie, i nie z powodu rozstawu. Otwór centralny, odsadzenie, szerokość felgi, luz dla hamulców, typ gniazda i nośność też muszą się zgadzać: rozstaw mówi jedynie, że otwory się pokrywają.' },
      { q: 'Jak samodzielnie zmierzyć ten rozstaw?', a: `Należy zmierzyć odległość między dwoma sąsiednimi otworami, od środka do środka, a następnie przeliczyć ją na średnicę okręgu otworów. Dla ${notation} ta odległość jest podana wyżej; kalkulator rozstawu śrub wykonuje przeliczenie dla dowolnej liczby otworów.` },
    ],
    breadcrumbHome: 'Strona główna', breadcrumbHub: 'Rozstawy śrub',
  },
  'nl': {
    hubTitle: 'Steekmaten: PCD en voertuigen',
    hubDescription: 'Atlas-steekmaten met aantal gaten, PCD-diameter, meetbare afstand tussen twee gaten en gedocumenteerde voertuigen per steekmaat.',
    hubKicker: 'Referentie steekmaten',
    hubH1: 'Steekmaten van velgen in de Atlas-referentie',
    hubLead: (count, vehicles) => `${count} ${plural(count, 'steekmaat komt', 'steekmaten komen')} voor bij de ${vehicles} ${plural(vehicles, 'gedocumenteerd voertuig', 'gedocumenteerde voertuigen')} in de Atlas-referentie. Elke steekmaat heeft een eigen pagina met de betreffende voertuigen, hun naafgaten en de originele bandenmaten.`,
    notationHeading: 'Zo leest u een steekmaat',
    notationIntro: (example, lugs, pcd) => `Een steekmaat (PCD) zoals ${example} bestaat uit twee getallen: het aantal gaten en de diameter van de steekcirkel (PCD). ${example} betekent ${lugs} gaten, gelijkmatig verdeeld over een denkbeeldige cirkel van ${dec(pcd)} mm diameter, gecentreerd op de naaf.`,
    notationParts: [
      { label: 'Aantal gaten', detail: 'Hoeveel tapeinden of wielbouten het wiel vastzetten — het eerste getal.' },
      { label: 'Steekcirkeldiameter (PCD)', detail: 'De diameter in millimeters van de cirkel waarop de gaten liggen — het tweede getal.' },
      { label: 'Afstand tussen twee gaten', detail: 'Wat u werkelijk met een liniaal kunt meten tussen twee naastgelegen gaten; de steekmaatcalculator rekent dat terug naar de PCD.' },
    ],
    searchLabel: 'Steekmaten filteren',
    searchPlaceholder: 'bijv. 5x112 of 4x',
    searchEmpty: 'Geen enkele steekmaat in de referentie past bij dit filter.',
    countLabel: (n) => `${n} ${plural(n, 'steekmaat', 'steekmaten')}`,
    groupHeading: (lugs) => `Steekmaten met ${lugs} gaten`,
    jumpLabel: 'Naar aantal gaten',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'voertuig', 'voertuigen')}`,
    toolsHeading: 'Meten en montage controleren',
    calculatorCta: 'Steekmaatcalculator (in het Engels)',
    calculatorCtaDetail: 'Een meting tussen twee gaten omrekenen naar PCD',
    fitmentCta: 'ET-calculator (in het Engels)',
    fitmentCtaDetail: 'De andere helft van de vraag: past de velg echt?',
    vehiclesCta: 'Voertuigreferentie',
    vehiclesCtaDetail: 'Originele bandenmaat, steekmaat en aanhaalmoment per voertuig',
    tireHubCta: 'Bandenmaten',
    tireHubCtaDetail: 'De bandenmaten van dezelfde voertuigen',

    detailKicker: 'Steekmaat',
    detailTitle: (notation) => `Steekmaat ${notation}: PCD en passende voertuigen`,
    detailDescription: (notation, lugs, pcd, vehicles) => `Steekmaat ${notation} betekent ${lugs} gaten op een PCD van ${dec(pcd)} mm. Afstand tussen gaten, naafgaten en ${vehicles} ${plural(vehicles, 'Atlas-voertuig', 'Atlas-voertuigen')}.`,
    detailH1: (notation) => `Steekmaat ${notation}`,
    detailLead: (lugs, pcd) => `${lugs} gaten, gelijkmatig verdeeld over een steekcirkel van ${dec(pcd)} mm.`,
    metricsHeading: 'Afmetingen van de steekmaat',
    metrics: { lugCount: 'Aantal gaten', pcdMm: 'Steekcirkeldiameter', pcdIn: 'PCD in inch', holeSpacing: 'Afstand tussen twee gaten', vehicleCount: 'Gedocumenteerde voertuigen', centerBore: 'Naafgaten in de referentie' },
    metricNote: 'De PCD en het aantal gaten komen rechtstreeks uit de voertuiggegevens hieronder. De afstand tussen twee gaten is daaruit berekend, niet apart ingevoerd.',
    holeSpacingNote: 'Koorde tussen twee naastgelegen gaten, berekend als PCD × sin(180° ÷ aantal gaten) — de afstand die u op de naaf meet.',
    diagramHeading: 'Gatenpatroon',
    diagramNote: (lugs, pcd) => `${lugs} gaten getekend met hun werkelijke hoekafstand op een cirkel van ${dec(pcd)} mm. De hoeken zijn exact; de tekening is geschaald naar het scherm, dus meet er geen echt wiel op na.`,
    diagramAria: (lugs, pcd) => `Tekening van ${lugs} gaten, gelijkmatig verdeeld over een steekcirkel van ${dec(pcd)} millimeter`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Voertuigen met deze steekmaat',
    vehiclesIntro: (n) => `Atlas vermeldt ${n} ${plural(n, 'voertuig', 'voertuigen')} met deze steekmaat. Naafgat, velgmaat en aanhaalmoment verschillen onderling — precies daarom betekent dezelfde steekmaat niet dat velgen uitwisselbaar zijn.`,
    vehiclesEmpty: 'Geen enkel voertuig in de Atlas-referentie is momenteel aan deze steekmaat gekoppeld.',
    colVehicle: 'Voertuig', colTireSize: 'Originele bandenmaat', colCenterBore: 'Naafgat', colWheel: 'Originele velg', colTorque: 'Aanhaalmoment', colFastener: 'Bevestiging',
    colConfidence: 'Betrouwbaarheid bron',
    confidence: { high: 'Hoog', medium: 'Gemiddeld', low: 'Laag' },
    confidenceNote: 'De betrouwbaarheid geldt per regel, niet per pagina: ze geeft aan hoe direct Atlas die specifieke regel kon onderbouwen. Bronnen en kanttekeningen staan op de pagina van elk voertuig.',
    torqueUnconfirmedTitle: 'Geëxtrapoleerd of niet onafhankelijk bevestigd — controleer het instructieboekje voordat u aanhaalt.',
    lugNut: 'Wielmoeren', wheelBolt: 'Wielbouten',
    vehiclePageLink: 'Voertuigpagina openen',
    safetyHeading: 'Dezelfde steekmaat betekent niet dat de velg past',
    safetyLead: 'Twee voertuigen met dezelfde steekmaat hebben alleen gaten die op elkaar aansluiten. Dat zegt niets over een veilige montage van de velg. Ook al het volgende moet kloppen:',
    safetyFactors: [
      { label: 'Naafgat', detail: 'De velg moet op de naaf centreren, niet op de tapeinden. Een te klein naafgat past niet; een groter naafgat vraagt de juiste centreerring.' },
      { label: 'Inpersdiepte (ET)', detail: 'Bepaalt waar het wiel in de wielkast staat — een verkeerde ET veroorzaakt aanlopen, contact met de ophanging of afwijkende belasting op de lagers.' },
      { label: 'Velgbreedte', detail: 'Moet passen bij de bandbreedte en de wielkast. Dezelfde steekmaat wordt verkocht in breedtes die niet allemaal onder dezelfde auto passen.' },
      { label: 'Vrije ruimte voor de remmen', detail: 'Spaakvorm en velgdiepte moeten de remklauw vrijlaten. Veel velgen met dezelfde steekmaat lopen aan tegen grotere remmen.' },
      { label: 'Zitting en bevestigingsmateriaal', detail: 'Conische, bolle en vlakke zittingen zijn niet uitwisselbaar; schroefdraad en lengte moeten bij de naaf passen.' },
      { label: 'Draagvermogen', detail: 'De velg moet goedgekeurd zijn voor de asbelasting — cruciaal bij zware voertuigen, bestelwagens en pick-ups.' },
    ],
    safetyClose: 'Gebruik de steekmaat om velgen uit te sluiten, nooit om ze goed te keuren. Vergelijk met de specificatie van de fabrikant en laat bij twijfel een vakman controleren.',
    ctaHeading: 'Een meting controleren',
    ctaNote: 'De calculator opent vooraf ingevuld met het aantal gaten en de gatafstand van deze steekmaat.',
    relatedHeading: 'Gerelateerde gegevens',
    relatedTireIntro: 'Originele bandenmaten van de voertuigen met deze steekmaat:',
    backToHub: 'Alle steekmaten',
    faqHeading: 'Veelgestelde vragen',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `Wat betekent steekmaat ${notation}?`, a: `${lugs} gaten, gelijkmatig verdeeld over een cirkel van ${dec(pcd)} mm diameter. Het eerste getal is het aantal gaten, het tweede de steekcirkeldiameter in millimeters.` },
      { q: `Welke voertuigen hebben steekmaat ${notation}?`, a: vehicles > 0 ? `In de Atlas-referentie: ${makes}. Elk voertuig linkt naar een eigen pagina met de originele bandenmaat, velgmaat en het aanhaalmoment.` : 'Geen enkel voertuig in de Atlas-referentie is momenteel aan deze steekmaat gekoppeld.' },
      { q: `Past een velg ${notation} van een van deze auto’s op een andere?`, a: 'Niet per se, en niet vanwege de steekmaat. Naafgat, inpersdiepte, velgbreedte, vrije ruimte voor de remmen, type zitting en draagvermogen moeten ook kloppen: de steekmaat zegt alleen dat de gaten op elkaar aansluiten.' },
      { q: 'Hoe meet ik deze steekmaat zelf?', a: `Meet de afstand tussen twee naastgelegen gaten, van hart tot hart, en reken die om naar de steekcirkeldiameter. Voor ${notation} staat deze afstand hierboven; de steekmaatcalculator doet de omrekening voor elk aantal gaten.` },
    ],
    breadcrumbHome: 'Home', breadcrumbHub: 'Steekmaten',
  },
  'tr': {
    hubTitle: 'Bijon aralıkları: PCD ve araçlar',
    hubDescription: 'Atlas bijon aralıkları: bijon sayısı, PCD çapı, iki delik arası ölçülebilir mesafe ve her bijon aralığı için belgelenmiş araçlar.',
    hubKicker: 'Bijon aralığı referansı',
    hubH1: 'Atlas referansındaki bijon aralıkları',
    hubLead: (count, vehicles) => `Atlas referansındaki belgelenmiş araç sayısı: ${vehicles} (${plural(vehicles, 'araç', 'araç')}); bu araçlarda görülen ${plural(count, 'bijon aralığı', 'bijon aralığı')} sayısı: ${count}. Her bijon aralığının; ilgili araçları, göbek çaplarını ve orijinal lastik ebatlarını gösteren kendi sayfası vardır.`,
    notationHeading: 'Bijon aralığı nasıl okunur?',
    notationIntro: (example, lugs, pcd) => `Bijon aralığı (örnek: ${example}) iki sayıdan oluşur: bijon deliği sayısı ve bijon dairesi çapı (PCD). Bu örnek, göbeğe merkezlenmiş, çapı ${dec(pcd)} mm olan hayali bir daire üzerine eşit aralıklarla dizilmiş ${lugs} bijon deliği anlamına gelir.`,
    notationParts: [
      { label: 'Bijon sayısı', detail: 'Tekerleği kaç saplama veya cıvatanın tuttuğu — ilk sayı.' },
      { label: 'Bijon dairesi çapı (PCD)', detail: 'Deliklerin üzerinde bulunduğu dairenin milimetre cinsinden çapı — ikinci sayı.' },
      { label: 'İki delik arası mesafe', detail: 'İki komşu delik arasında cetvelle gerçekten ölçebileceğiniz değer; bijon aralığı hesaplayıcısı bunu tekrar PCD’ye çevirir.' },
    ],
    searchLabel: 'Bijon aralıklarını filtreleyin',
    searchPlaceholder: 'örn. 5x112 veya 4x',
    searchEmpty: 'Referansta bu filtreye uyan bijon aralığı yok.',
    countLabel: (n) => `${n} ${plural(n, 'bijon aralığı', 'bijon aralığı')}`,
    groupHeading: (lugs) => `${lugs} delikli bijon aralıkları`,
    jumpLabel: 'Bijon sayısına git',
    listedAs: (vehicles) => `${vehicles} ${plural(vehicles, 'araç', 'araç')}`,
    toolsHeading: 'Ölçün ve uyumu kontrol edin',
    calculatorCta: 'Bijon aralığı hesaplayıcı (İngilizce)',
    calculatorCtaDetail: 'İki delik arası ölçüyü PCD’ye çevirin',
    fitmentCta: 'ET ofset hesaplayıcı (İngilizce)',
    fitmentCtaDetail: 'Sorunun diğer yarısı: jant gerçekten uyuyor mu?',
    vehiclesCta: 'Araç referansı',
    vehiclesCtaDetail: 'Araca göre orijinal lastik ebadı, bijon aralığı ve sıkma torku',
    tireHubCta: 'Lastik ebatları',
    tireHubCtaDetail: 'Aynı araçların lastik ebatları',

    detailKicker: 'Bijon aralığı',
    detailTitle: (notation) => `${notation} bijon aralığı: PCD ve uyumlu araçlar`,
    detailDescription: (notation, lugs, pcd, vehicles) => `Bijon aralığı ${notation}: ${dec(pcd)} mm PCD üzerinde ${lugs} delik. Delik arası mesafe, göbek çapları ve ${vehicles} ${plural(vehicles, 'Atlas aracı', 'Atlas aracı')}.`,
    detailH1: (notation) => `${notation} bijon aralığı`,
    detailLead: (lugs, pcd) => `Çapı ${dec(pcd)} mm olan bijon dairesi üzerine eşit aralıklarla dizilmiş ${lugs} bijon deliği.`,
    metricsHeading: 'Bijon aralığı ölçüleri',
    metrics: { lugCount: 'Bijon sayısı', pcdMm: 'Bijon dairesi çapı', pcdIn: 'İnç cinsinden PCD', holeSpacing: 'İki delik arası mesafe', vehicleCount: 'Belgelenmiş araçlar', centerBore: 'Referanstaki göbek çapları' },
    metricNote: 'PCD ve bijon sayısı doğrudan aşağıdaki araç kayıtlarından gelir. İki delik arası mesafe bunlardan hesaplanır, ayrıca girilmez.',
    holeSpacingNote: 'İki komşu delik arasındaki kiriş; PCD × sin(180° ÷ bijon sayısı) olarak hesaplanır — göbek üzerinde ölçtüğünüz mesafedir.',
    diagramHeading: 'Delik yerleşimi',
    diagramNote: (lugs, pcd) => `${lugs} delik, çapı ${dec(pcd)} mm olan daire üzerinde gerçek açısal aralıklarıyla çizilmiştir. Açılar kesindir; çizim ekrana göre ölçeklenmiştir, gerçek bir jantı ekrandan ölçmeyin.`,
    diagramAria: (lugs, pcd) => `Çapı ${dec(pcd)} milimetre olan bijon dairesi üzerine eşit aralıklarla dizilmiş ${lugs} bijon deliğinin şeması`,
    pcdLabel: 'PCD',
    vehiclesHeading: 'Bu bijon aralığına sahip araçlar',
    vehiclesIntro: (n) => `Atlas bu bijon aralığıyla ${n} ${plural(n, 'araç', 'araç')} listeliyor. Göbek çapı, jant ölçüsü ve sıkma torku araçtan araca değişir — aynı bijon aralığının birbirinin yerine kullanılabilirlik anlamına gelmemesinin nedeni tam olarak budur.`,
    vehiclesEmpty: 'Atlas referansında şu anda bu bijon aralığıyla ilişkilendirilmiş bir araç yok.',
    colVehicle: 'Araç', colTireSize: 'Orijinal lastik ebadı', colCenterBore: 'Göbek çapı', colWheel: 'Orijinal jant', colTorque: 'Sıkma torku', colFastener: 'Bağlantı',
    colConfidence: 'Kaynak güvenilirliği',
    confidence: { high: 'Yüksek', medium: 'Orta', low: 'Düşük' },
    confidenceNote: 'Güvenilirlik sayfa bazında değil, satır bazında verilir: Atlas’ın o satır için bulduğu kaynakların ne kadar doğrudan olduğunu gösterir. Kaynaklar ve çekinceler her aracın kendi sayfasındadır.',
    torqueUnconfirmedTitle: 'Tahmini veya bağımsız olarak doğrulanmamış — sıkmadan önce araç kullanım kılavuzunu kontrol edin.',
    lugNut: 'Bijon somunları', wheelBolt: 'Bijon cıvataları',
    vehiclePageLink: 'Araç sayfasını açın',
    safetyHeading: 'Aynı bijon aralığı, jantın uyduğu anlamına gelmez',
    safetyLead: 'İki aracın bijon aralığının aynı olması yalnızca deliklerin denk geldiğini gösterir. Jantın güvenle takılıp takılamayacağı hakkında hiçbir şey söylemez. Aşağıdakilerin hepsi de uymalıdır:',
    safetyFactors: [
      { label: 'Göbek çapı', detail: 'Jant saplamalara değil, göbeğe oturarak merkezlenmelidir. Küçük bir göbek deliği takılmaz; daha büyüğü doğru merkezleme halkasını gerektirir.' },
      { label: 'Ofset (ET)', detail: 'Tekerleğin çamurluk içindeki konumunu belirler — yanlış ofset sürtünmeye, süspansiyona temasa veya rulmanlarda anormal yüklere yol açar.' },
      { label: 'Jant genişliği', detail: 'Lastik genişliğine ve çamurluk boşluğuna uygun olmalıdır. Aynı bijon aralığı, hepsi aynı araca uymayan farklı genişliklerde satılır.' },
      { label: 'Fren boşluğu', detail: 'Kol tasarımı ve jant derinliği kaliperi rahat geçmelidir. Aynı bijon aralığındaki birçok jant büyük frenlere temas eder.' },
      { label: 'Oturma yüzeyi ve bağlantı elemanları', detail: 'Konik, küresel ve düz oturma yüzeyleri birbirinin yerine kullanılamaz; diş adımı ve cıvata uzunluğu da göbeğe uymalıdır.' },
      { label: 'Yük kapasitesi', detail: 'Jant aks yüküne göre onaylı olmalıdır — ağır araçlarda, panelvanlarda ve pick-up’larda bu çok önemlidir.' },
    ],
    safetyClose: 'Bijon aralığını jantları elemek için kullanın, asla onaylamak için değil. Araç üreticisinin spesifikasyonuyla karşılaştırın ve emin olmadığınız her şeyi bir uzmana kontrol ettirin.',
    ctaHeading: 'Bir ölçümü kontrol edin',
    ctaNote: 'Hesaplayıcı, bu bijon aralığının delik sayısı ve iki delik arası mesafesi önceden girilmiş olarak açılır.',
    relatedHeading: 'İlgili veriler',
    relatedTireIntro: 'Bu bijon aralığını kullanan araçların orijinal lastik ebatları:',
    backToHub: 'Tüm bijon aralıkları',
    faqHeading: 'Sık sorulan sorular',
    faqs: ({ notation, lugs, pcd, vehicles, makes }) => [
      { q: `Bijon aralığı ${notation} ne anlama gelir?`, a: `Çapı ${dec(pcd)} mm olan bir daire üzerine eşit aralıklarla dizilmiş ${lugs} delik. İlk sayı bijon sayısı, ikincisi milimetre cinsinden bijon dairesi çapıdır.` },
      { q: `Hangi araçlarda ${notation} bijon aralığı var?`, a: vehicles > 0 ? `Atlas referansında: ${makes}. Her biri orijinal lastik ebadı, jant ölçüsü ve sıkma torkunu içeren kendi sayfasına bağlanır.` : 'Atlas referansında şu anda bu bijon aralığıyla ilişkilendirilmiş bir araç yok.' },
      { q: `Bu araçlardan birinin ${notation} jantı diğerine takılır mı?`, a: 'Her zaman değil — ve bunun nedeni bijon aralığı değildir. Göbek çapı, ofset, jant genişliği, fren boşluğu, oturma yüzeyi tipi ve yük kapasitesi de uymalıdır: bijon aralığı yalnızca deliklerin denk geldiğini söyler.' },
      { q: 'Bu bijon aralığını kendim nasıl ölçebilirim?', a: `İki komşu delik arasındaki mesafeyi merkezden merkeze ölçün, ardından bunu bijon dairesi çapına çevirin. Bijon aralığı ${notation} için bu mesafe yukarıda verilmiştir; bijon aralığı hesaplayıcısı her bijon sayısı için dönüşümü yapar.` },
    ],
    breadcrumbHome: 'Ana sayfa', breadcrumbHub: 'Bijon aralıkları',
  },
});
