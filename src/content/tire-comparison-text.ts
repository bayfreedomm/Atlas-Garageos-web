/**
 * Copy for the "X vs Y" tire-size comparison pages and the two tire-page sections that link
 * into them ("compared with" and "car models on this size"), in every entity locale.
 *
 * Every figure arrives preformatted for the locale (decimal comma, percent placement). The
 * "can I use" answer only states geometry and names the same 3% band the alternatives table
 * uses; it never turns a geometric comparison into a fitment verdict.
 */
import type { EntityLocale } from '../seo/entity-routes';

export type Side = 'a' | 'b' | 'equal';

export interface ComparisonFigures {
  /** Display notations ("205/55 R16" outside English). */
  readonly a: string;
  readonly b: string;
  readonly diameterA: string;
  readonly diameterB: string;
  /** Absolute values, preformatted. */
  readonly diameterPct: string;
  readonly diameterMm: string;
  readonly widthMm: string;
  readonly sidewallMm: string;
  /** Which size is larger in overall diameter / wider / has the taller sidewall. */
  readonly larger: Side;
  readonly wider: Side;
  readonly tallerSidewall: Side;
  /** Speedometer calibrated for A, B fitted: indicated → true speed. */
  readonly speedShown: string;
  readonly speedTrue: string;
  readonly speedUnit: string;
  readonly within3: boolean;
  /** Vehicle names that carry both sizes from the factory (may be empty). */
  readonly sharedVehicles: string;
}

export interface TireComparisonText {
  readonly kicker: string;
  readonly title: (f: ComparisonFigures) => string;
  readonly description: (f: ComparisonFigures) => string;
  readonly lead: (f: ComparisonFigures) => string;
  readonly answer: { readonly diameter: string; readonly speed: string; readonly width: string; readonly sidewall: string };
  readonly specHeading: string;
  readonly colDifference: string;
  readonly speedHeading: string;
  readonly speedIntro: (f: ComparisonFigures) => string;
  readonly colIndicated: string;
  readonly colTrue: string;
  readonly vehiclesHeading: string;
  readonly bothSizes: string;
  readonly onSize: (size: string) => string;
  readonly vehiclesEmpty: string;
  readonly reasonSame: string;
  readonly reasonPlus: string;
  readonly toolCta: string;
  readonly toolCtaDetail: string;
  readonly sizeCta: (size: string) => string;
  readonly sizeCtaDetail: string;
  readonly relatedHeading: string;
  readonly faqHeading: string;
  readonly faqs: (f: ComparisonFigures) => readonly { readonly q: string; readonly a: string }[];
  /** Tire-size page: section linking the comparisons that include this size. */
  readonly sizeSectionHeading: (size: string) => string;
  readonly sizeSectionIntro: string;
  /** Tire-size page: ANKUSI car models whose wheel records list this size. */
  readonly modelsHeading: (size: string) => string;
  readonly modelsIntro: string;
}

const larger = (f: ComparisonFigures): string => (f.larger === 'b' ? f.b : f.a);
const largerDiameter = (f: ComparisonFigures): string => (f.larger === 'b' ? f.diameterB : f.diameterA);
const smallerDiameter = (f: ComparisonFigures): string => (f.larger === 'b' ? f.diameterA : f.diameterB);

const en: TireComparisonText = {
  kicker: 'Tire size comparison',
  title: (f) => `${f.a} vs ${f.b}: Diameter & Speedometer`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b}: practically the same overall diameter (${f.diameterA} mm). Width, sidewall and speedometer compared side by side.`
    : `${f.a} vs ${f.b}: ${f.b} is ${f.diameterPct} ${f.larger === 'b' ? 'taller' : 'shorter'} (${f.diameterB} vs ${f.diameterA} mm). At an indicated ${f.speedShown} ${f.speedUnit} you drive ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} and ${f.b} have practically the same overall diameter (${f.diameterA} mm), so the speedometer reading does not change.`
    : `${f.b} is ${f.diameterPct} ${f.larger === 'b' ? 'larger' : 'smaller'} in overall diameter than ${f.a} (${f.diameterB} mm against ${f.diameterA} mm). With a speedometer set up for ${f.a}, an indicated ${f.speedShown} ${f.speedUnit} means a true ${f.speedTrue} ${f.speedUnit} on ${f.b}.`,
  answer: { diameter: 'Diameter', speed: 'True speed', width: 'Width', sidewall: 'Sidewall' },
  specHeading: 'Dimensions side by side',
  colDifference: 'Difference',
  speedHeading: 'Speedometer difference',
  speedIntro: (f) => `Speedometer calibrated for ${f.a}, car running on ${f.b}.`,
  colIndicated: 'Speedometer shows',
  colTrue: 'True speed',
  vehiclesHeading: 'Vehicles on these sizes',
  bothSizes: 'Factory fitment with both sizes',
  onSize: (size) => `On ${size}`,
  vehiclesEmpty: 'No vehicle in the Atlas dataset lists either size yet.',
  reasonSame: 'Both sizes are factory fitments on the same vehicle.',
  reasonPlus: 'The closest manufactured size one rim size away.',
  toolCta: 'Open in the tire size comparison calculator',
  toolCtaDetail: 'Change either size and see clearance, speed and visual differences',
  sizeCta: (size) => `${size} tire size`,
  sizeCtaDetail: 'Full dimensions, alternatives and vehicles',
  relatedHeading: 'More comparisons',
  faqHeading: 'Frequently asked questions',
  faqs: (f) => [
    {
      q: `Which is bigger, ${f.a} or ${f.b}?`,
      a: f.larger === 'equal'
        ? `Neither — both are about ${f.diameterA} mm in overall diameter. ${f.wider === 'equal' ? 'They are also the same width.' : `${f.wider === 'b' ? f.b : f.a} is ${f.widthMm} mm wider.`}`
        : `${larger(f)} is bigger: ${largerDiameter(f)} mm against ${smallerDiameter(f)} mm overall diameter, a difference of ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Both have the same section width.' : `${f.wider === 'b' ? f.b : f.a} is ${f.widthMm} mm wider.`} ${f.tallerSidewall === 'equal' ? '' : `The sidewall of ${f.tallerSidewall === 'b' ? f.b : f.a} is ${f.sidewallMm} mm taller.`}`.trim(),
    },
    {
      q: `How does ${f.b} change the speedometer compared with ${f.a}?`,
      a: f.larger === 'equal'
        ? `Practically not at all: the overall diameters are the same, so an indicated ${f.speedShown} ${f.speedUnit} stays about ${f.speedTrue} ${f.speedUnit}.`
        : `With a speedometer calibrated for ${f.a}, the speedometer reads ${f.larger === 'b' ? 'low' : 'high'} on ${f.b}: at an indicated ${f.speedShown} ${f.speedUnit} you are really doing ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Can I use ${f.b} instead of ${f.a}?`,
      a: `${f.larger === 'equal' ? 'The overall diameters are practically identical' : `The overall diameters differ by ${f.diameterPct}`}, which is ${f.within3 ? 'inside' : 'outside'} the 3% range Atlas uses when listing alternative sizes. Diameter is only part of the answer: wheel width, load index and speed rating, clearance and the sizes approved for your vehicle decide whether it fits.${f.sharedVehicles ? ` Both sizes are factory fitments on: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} compared with`,
  sizeSectionIntro: 'Side-by-side comparisons with the factory and plus/minus-one sizes people weigh against this one.',
  modelsHeading: (size) => `Car models listed with ${size}`,
  modelsIntro: 'Models whose wheel records in the open ANKUSI dataset list this tire size.',
};

const de: TireComparisonText = {
  kicker: 'Reifengrößen-Vergleich',
  title: (f) => `${f.a} vs. ${f.b}: Unterschied & Tacho`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs. ${f.b}: praktisch gleicher Gesamtdurchmesser (${f.diameterA} mm). Breite, Flanke und Tacho im direkten Vergleich.`
    : `${f.a} vs. ${f.b}: ${f.b} ist ${f.diameterPct} ${f.larger === 'b' ? 'größer' : 'kleiner'} (${f.diameterB} statt ${f.diameterA} mm). Bei Tacho ${f.speedShown} ${f.speedUnit} fahren Sie ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} und ${f.b} haben praktisch denselben Gesamtdurchmesser (${f.diameterA} mm); die Tachoanzeige ändert sich nicht.`
    : `${f.b} hat einen um ${f.diameterPct} ${f.larger === 'b' ? 'größeren' : 'kleineren'} Gesamtdurchmesser als ${f.a} (${f.diameterB} mm statt ${f.diameterA} mm). Ist der Tacho auf ${f.a} abgestimmt, bedeutet eine Anzeige von ${f.speedShown} ${f.speedUnit} mit ${f.b} tatsächlich ${f.speedTrue} ${f.speedUnit}.`,
  answer: { diameter: 'Durchmesser', speed: 'Echtes Tempo', width: 'Breite', sidewall: 'Flanke' },
  specHeading: 'Maße im direkten Vergleich',
  colDifference: 'Unterschied',
  speedHeading: 'Tachoabweichung',
  speedIntro: (f) => `Tacho auf ${f.a} abgestimmt, Fahrzeug fährt auf ${f.b}.`,
  colIndicated: 'Tacho zeigt',
  colTrue: 'Tatsächlich',
  vehiclesHeading: 'Fahrzeuge mit diesen Größen',
  bothSizes: 'Ab Werk mit beiden Größen',
  onSize: (size) => `Auf ${size}`,
  vehiclesEmpty: 'Im Atlas-Datensatz führt noch kein Fahrzeug eine dieser Größen.',
  reasonSame: 'Beide Größen sind Werksbereifungen desselben Fahrzeugs.',
  reasonPlus: 'Die nächstliegende hergestellte Größe eine Felgengröße daneben.',
  toolCta: 'Im Reifengrößen-Vergleichsrechner öffnen',
  toolCtaDetail: 'Größen ändern und Freigang, Tempo und Darstellung vergleichen',
  sizeCta: (size) => `Reifengröße ${size}`,
  sizeCtaDetail: 'Alle Maße, Umrüstgrößen und Fahrzeuge',
  relatedHeading: 'Weitere Vergleiche',
  faqHeading: 'Häufige Fragen',
  faqs: (f) => [
    {
      q: `Welcher Reifen ist größer, ${f.a} oder ${f.b}?`,
      a: f.larger === 'equal'
        ? `Keiner — beide haben etwa ${f.diameterA} mm Gesamtdurchmesser. ${f.wider === 'equal' ? 'Sie sind auch gleich breit.' : `${f.wider === 'b' ? f.b : f.a} ist ${f.widthMm} mm breiter.`}`
        : `${larger(f)} ist größer: ${largerDiameter(f)} mm gegenüber ${smallerDiameter(f)} mm Gesamtdurchmesser, ein Unterschied von ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Beide sind gleich breit.' : `${f.wider === 'b' ? f.b : f.a} ist ${f.widthMm} mm breiter.`} ${f.tallerSidewall === 'equal' ? '' : `Die Flanke von ${f.tallerSidewall === 'b' ? f.b : f.a} ist ${f.sidewallMm} mm höher.`}`.trim(),
    },
    {
      q: `Wie verändert ${f.b} gegenüber ${f.a} die Tachoanzeige?`,
      a: f.larger === 'equal'
        ? `Praktisch gar nicht: Die Gesamtdurchmesser sind gleich, eine Anzeige von ${f.speedShown} ${f.speedUnit} bleibt etwa ${f.speedTrue} ${f.speedUnit}.`
        : `Ist der Tacho auf ${f.a} abgestimmt, zeigt er mit ${f.b} ${f.larger === 'b' ? 'zu wenig' : 'zu viel'} an: Bei angezeigten ${f.speedShown} ${f.speedUnit} fahren Sie tatsächlich ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Kann ich ${f.b} statt ${f.a} fahren?`,
      a: `${f.larger === 'equal' ? 'Die Gesamtdurchmesser sind praktisch gleich' : `Die Gesamtdurchmesser unterscheiden sich um ${f.diameterPct}`} — das liegt ${f.within3 ? 'innerhalb' : 'außerhalb'} der 3-%-Spanne, die Atlas für Umrüstgrößen verwendet. Der Durchmesser ist nur ein Teil der Antwort: Felgenbreite, Trag- und Geschwindigkeitsindex, Freigang und die für Ihr Fahrzeug eingetragenen bzw. freigegebenen Größen entscheiden.${f.sharedVehicles ? ` Beide Größen sind ab Werk verbaut bei: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} im Vergleich mit`,
  sizeSectionIntro: 'Direkte Vergleiche mit den Werks- und Umrüstgrößen, die man gegen diese Größe abwägt.',
  modelsHeading: (size) => `Automodelle mit ${size}`,
  modelsIntro: 'Modelle, deren Felgendatensätze im offenen ANKUSI-Datensatz diese Reifengröße nennen.',
};

const es: TireComparisonText = {
  kicker: 'Comparación de medidas',
  title: (f) => `${f.a} vs ${f.b}: diferencia y velocímetro`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b}: prácticamente el mismo diámetro total (${f.diameterA} mm). Ancho, flanco y velocímetro comparados lado a lado.`
    : `${f.a} vs ${f.b}: ${f.b} es un ${f.diameterPct} ${f.larger === 'b' ? 'más grande' : 'más pequeño'} (${f.diameterB} frente a ${f.diameterA} mm). Marcando ${f.speedShown} ${f.speedUnit} va a ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} y ${f.b} tienen prácticamente el mismo diámetro total (${f.diameterA} mm), así que la lectura del velocímetro no cambia.`
    : `${f.b} tiene un diámetro total un ${f.diameterPct} ${f.larger === 'b' ? 'mayor' : 'menor'} que ${f.a} (${f.diameterB} mm frente a ${f.diameterA} mm). Con el velocímetro ajustado para ${f.a}, marcar ${f.speedShown} ${f.speedUnit} con ${f.b} significa ir realmente a ${f.speedTrue} ${f.speedUnit}.`,
  answer: { diameter: 'Diámetro', speed: 'Velocidad real', width: 'Ancho', sidewall: 'Flanco' },
  specHeading: 'Dimensiones lado a lado',
  colDifference: 'Diferencia',
  speedHeading: 'Diferencia en el velocímetro',
  speedIntro: (f) => `Velocímetro ajustado para ${f.a}, coche rodando con ${f.b}.`,
  colIndicated: 'El velocímetro marca',
  colTrue: 'Velocidad real',
  vehiclesHeading: 'Vehículos con estas medidas',
  bothSizes: 'De fábrica con ambas medidas',
  onSize: (size) => `Con ${size}`,
  vehiclesEmpty: 'Ningún vehículo del conjunto de datos de Atlas lista todavía estas medidas.',
  reasonSame: 'Ambas medidas son de fábrica en el mismo vehículo.',
  reasonPlus: 'La medida fabricada más cercana con una pulgada de llanta de diferencia.',
  toolCta: 'Abrir en la calculadora de comparación de neumáticos',
  toolCtaDetail: 'Cambie cualquiera de las medidas y vea holgura, velocidad y diferencias visuales',
  sizeCta: (size) => `Medida ${size}`,
  sizeCtaDetail: 'Dimensiones, alternativas y vehículos',
  relatedHeading: 'Más comparaciones',
  faqHeading: 'Preguntas frecuentes',
  faqs: (f) => [
    {
      q: `¿Cuál es más grande, ${f.a} o ${f.b}?`,
      a: f.larger === 'equal'
        ? `Ninguna: ambas miden unos ${f.diameterA} mm de diámetro total. ${f.wider === 'equal' ? 'También tienen el mismo ancho.' : `${f.wider === 'b' ? f.b : f.a} es ${f.widthMm} mm más ancha.`}`
        : `${larger(f)} es más grande: ${largerDiameter(f)} mm frente a ${smallerDiameter(f)} mm de diámetro total, una diferencia de ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Ambas tienen el mismo ancho de sección.' : `${f.wider === 'b' ? f.b : f.a} es ${f.widthMm} mm más ancha.`} ${f.tallerSidewall === 'equal' ? '' : `El flanco de ${f.tallerSidewall === 'b' ? f.b : f.a} es ${f.sidewallMm} mm más alto.`}`.trim(),
    },
    {
      q: `¿Cómo cambia el velocímetro con ${f.b} en lugar de ${f.a}?`,
      a: f.larger === 'equal'
        ? `Prácticamente nada: los diámetros totales son iguales, así que marcar ${f.speedShown} ${f.speedUnit} sigue siendo unos ${f.speedTrue} ${f.speedUnit}.`
        : `Con el velocímetro ajustado para ${f.a}, con ${f.b} marca ${f.larger === 'b' ? 'de menos' : 'de más'}: marcando ${f.speedShown} ${f.speedUnit} va realmente a ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `¿Puedo montar ${f.b} en lugar de ${f.a}?`,
      a: `${f.larger === 'equal' ? 'Los diámetros totales son prácticamente idénticos' : `Los diámetros totales difieren un ${f.diameterPct}`}, ${f.within3 ? 'dentro' : 'fuera'} del margen del 3 % que Atlas usa para listar medidas alternativas. El diámetro es solo parte de la respuesta: el ancho de llanta, los índices de carga y velocidad, la holgura y las medidas homologadas para su vehículo deciden si cabe.${f.sharedVehicles ? ` Ambas medidas son de fábrica en: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} comparada con`,
  sizeSectionIntro: 'Comparaciones lado a lado con las medidas de fábrica y de una pulgada más o menos que se suelen valorar frente a esta.',
  modelsHeading: (size) => `Modelos de coche con ${size}`,
  modelsIntro: 'Modelos cuyos registros de llanta en el conjunto abierto ANKUSI indican esta medida.',
};

const fr: TireComparisonText = {
  kicker: 'Comparaison de dimensions',
  title: (f) => `${f.a} vs ${f.b} : différence et compteur`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b} : diamètre extérieur pratiquement identique (${f.diameterA} mm). Largeur, flanc et compteur comparés côte à côte.`
    : `${f.a} vs ${f.b} : ${f.b} est ${f.diameterPct} plus ${f.larger === 'b' ? 'grand' : 'petit'} (${f.diameterB} contre ${f.diameterA} mm). À ${f.speedShown} ${f.speedUnit} au compteur, vous roulez à ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} et ${f.b} ont pratiquement le même diamètre extérieur (${f.diameterA} mm) ; l’affichage du compteur ne change pas.`
    : `${f.b} a un diamètre extérieur ${f.diameterPct} plus ${f.larger === 'b' ? 'grand' : 'petit'} que ${f.a} (${f.diameterB} mm contre ${f.diameterA} mm). Avec un compteur réglé pour ${f.a}, ${f.speedShown} ${f.speedUnit} affichés correspondent en réalité à ${f.speedTrue} ${f.speedUnit} en ${f.b}.`,
  answer: { diameter: 'Diamètre', speed: 'Vitesse réelle', width: 'Largeur', sidewall: 'Flanc' },
  specHeading: 'Dimensions côte à côte',
  colDifference: 'Écart',
  speedHeading: 'Écart au compteur',
  speedIntro: (f) => `Compteur réglé pour ${f.a}, véhicule roulant en ${f.b}.`,
  colIndicated: 'Le compteur affiche',
  colTrue: 'Vitesse réelle',
  vehiclesHeading: 'Véhicules dans ces dimensions',
  bothSizes: 'Montées d’origine dans les deux dimensions',
  onSize: (size) => `En ${size}`,
  vehiclesEmpty: 'Aucun véhicule du jeu de données Atlas ne liste encore ces dimensions.',
  reasonSame: 'Les deux dimensions sont des montes d’origine du même véhicule.',
  reasonPlus: 'La dimension fabriquée la plus proche, une taille de jante plus loin.',
  toolCta: 'Ouvrir dans le comparateur de dimensions de pneus',
  toolCtaDetail: 'Modifiez une dimension et voyez dégagement, vitesse et écarts visuels',
  sizeCta: (size) => `Dimension ${size}`,
  sizeCtaDetail: 'Toutes les cotes, alternatives et véhicules',
  relatedHeading: 'Autres comparaisons',
  faqHeading: 'Questions fréquentes',
  faqs: (f) => [
    {
      q: `Lequel est le plus grand, ${f.a} ou ${f.b} ?`,
      a: f.larger === 'equal'
        ? `Aucun : les deux font environ ${f.diameterA} mm de diamètre extérieur. ${f.wider === 'equal' ? 'Ils ont aussi la même largeur.' : `${f.wider === 'b' ? f.b : f.a} est plus large de ${f.widthMm} mm.`}`
        : `${larger(f)} est le plus grand : ${largerDiameter(f)} mm contre ${smallerDiameter(f)} mm de diamètre extérieur, soit ${f.diameterMm} mm d’écart (${f.diameterPct}). ${f.wider === 'equal' ? 'Les deux ont la même largeur de section.' : `${f.wider === 'b' ? f.b : f.a} est plus large de ${f.widthMm} mm.`} ${f.tallerSidewall === 'equal' ? '' : `Le flanc de ${f.tallerSidewall === 'b' ? f.b : f.a} est plus haut de ${f.sidewallMm} mm.`}`.trim(),
    },
    {
      q: `Comment ${f.b} modifie-t-il le compteur par rapport à ${f.a} ?`,
      a: f.larger === 'equal'
        ? `Pratiquement pas : les diamètres extérieurs sont identiques, ${f.speedShown} ${f.speedUnit} affichés restent environ ${f.speedTrue} ${f.speedUnit}.`
        : `Avec un compteur réglé pour ${f.a}, le compteur ${f.larger === 'b' ? 'sous-estime' : 'surestime'} la vitesse en ${f.b} : à ${f.speedShown} ${f.speedUnit} affichés, vous roulez réellement à ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Puis-je monter ${f.b} à la place de ${f.a} ?`,
      a: `${f.larger === 'equal' ? 'Les diamètres extérieurs sont pratiquement identiques' : `Les diamètres extérieurs diffèrent de ${f.diameterPct}`}, ${f.within3 ? 'à l’intérieur' : 'en dehors'} de la marge de 3 % qu’Atlas utilise pour lister les dimensions alternatives. Le diamètre n’est qu’une partie de la réponse : largeur de jante, indices de charge et de vitesse, dégagement et dimensions homologuées pour votre véhicule décident du montage.${f.sharedVehicles ? ` Les deux dimensions sont montées d’origine sur : ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} comparé à`,
  sizeSectionIntro: 'Comparaisons côte à côte avec les dimensions d’origine et à un pouce près que l’on met en balance avec celle-ci.',
  modelsHeading: (size) => `Modèles de voiture en ${size}`,
  modelsIntro: 'Modèles dont les fiches de jantes du jeu de données ouvert ANKUSI indiquent cette dimension.',
};

const it: TireComparisonText = {
  kicker: 'Confronto misure pneumatici',
  title: (f) => `${f.a} vs ${f.b}: differenza e tachimetro`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b}: diametro esterno praticamente uguale (${f.diameterA} mm). Larghezza, spalla e tachimetro a confronto.`
    : `${f.a} vs ${f.b}: ${f.b} è più ${f.larger === 'b' ? 'grande' : 'piccolo'} del ${f.diameterPct} (${f.diameterB} contro ${f.diameterA} mm). Con ${f.speedShown} ${f.speedUnit} sul tachimetro vai a ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} e ${f.b} hanno praticamente lo stesso diametro esterno (${f.diameterA} mm), quindi la lettura del tachimetro non cambia.`
    : `${f.b} ha un diametro esterno ${f.larger === 'b' ? 'maggiore' : 'minore'} del ${f.diameterPct} rispetto a ${f.a} (${f.diameterB} mm contro ${f.diameterA} mm). Con il tachimetro tarato per ${f.a}, ${f.speedShown} ${f.speedUnit} indicati con ${f.b} corrispondono a ${f.speedTrue} ${f.speedUnit} reali.`,
  answer: { diameter: 'Diametro', speed: 'Velocità reale', width: 'Larghezza', sidewall: 'Spalla' },
  specHeading: 'Misure a confronto',
  colDifference: 'Differenza',
  speedHeading: 'Differenza sul tachimetro',
  speedIntro: (f) => `Tachimetro tarato per ${f.a}, auto montata con ${f.b}.`,
  colIndicated: 'Il tachimetro segna',
  colTrue: 'Velocità reale',
  vehiclesHeading: 'Veicoli con queste misure',
  bothSizes: 'Di serie con entrambe le misure',
  onSize: (size) => `Con ${size}`,
  vehiclesEmpty: 'Nessun veicolo nel dataset Atlas riporta ancora queste misure.',
  reasonSame: 'Entrambe le misure sono di primo equipaggiamento sullo stesso veicolo.',
  reasonPlus: 'La misura in produzione più vicina, con un pollice di cerchio di differenza.',
  toolCta: 'Apri nel calcolatore di confronto pneumatici',
  toolCtaDetail: 'Modifica una misura e confronta ingombri, velocità e differenze visive',
  sizeCta: (size) => `Misura ${size}`,
  sizeCtaDetail: 'Tutte le quote, alternative e veicoli',
  relatedHeading: 'Altri confronti',
  faqHeading: 'Domande frequenti',
  faqs: (f) => [
    {
      q: `Qual è più grande, ${f.a} o ${f.b}?`,
      a: f.larger === 'equal'
        ? `Nessuno dei due: entrambi misurano circa ${f.diameterA} mm di diametro esterno. ${f.wider === 'equal' ? 'Hanno anche la stessa larghezza.' : `${f.wider === 'b' ? f.b : f.a} è più largo di ${f.widthMm} mm.`}`
        : `${larger(f)} è più grande: ${largerDiameter(f)} mm contro ${smallerDiameter(f)} mm di diametro esterno, una differenza di ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Entrambi hanno la stessa larghezza di sezione.' : `${f.wider === 'b' ? f.b : f.a} è più largo di ${f.widthMm} mm.`} ${f.tallerSidewall === 'equal' ? '' : `La spalla di ${f.tallerSidewall === 'b' ? f.b : f.a} è più alta di ${f.sidewallMm} mm.`}`.trim(),
    },
    {
      q: `Come cambia il tachimetro con ${f.b} al posto di ${f.a}?`,
      a: f.larger === 'equal'
        ? `Praticamente per nulla: i diametri esterni sono uguali, ${f.speedShown} ${f.speedUnit} indicati restano circa ${f.speedTrue} ${f.speedUnit}.`
        : `Con il tachimetro tarato per ${f.a}, con ${f.b} il tachimetro segna ${f.larger === 'b' ? 'meno' : 'più'} del reale: a ${f.speedShown} ${f.speedUnit} indicati si viaggia in realtà a ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Posso montare ${f.b} al posto di ${f.a}?`,
      a: `${f.larger === 'equal' ? 'I diametri esterni sono praticamente identici' : `I diametri esterni differiscono del ${f.diameterPct}`}, ${f.within3 ? 'entro' : 'oltre'} il margine del 3% che Atlas usa per elencare le misure alternative. Il diametro è solo una parte della risposta: larghezza del cerchio, indici di carico e velocità, ingombri e misure omologate per il proprio veicolo decidono se si può montare.${f.sharedVehicles ? ` Entrambe le misure sono di serie su: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} a confronto con`,
  sizeSectionIntro: 'Confronti diretti con le misure di serie e di un pollice in più o in meno che si valutano rispetto a questa.',
  modelsHeading: (size) => `Modelli di auto con ${size}`,
  modelsIntro: 'Modelli i cui dati cerchi nel dataset aperto ANKUSI indicano questa misura.',
};

const ptBr: TireComparisonText = {
  kicker: 'Comparação de medidas de pneu',
  title: (f) => `${f.a} vs ${f.b}: diferença e velocímetro`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b}: praticamente o mesmo diâmetro externo (${f.diameterA} mm). Largura, flanco e velocímetro lado a lado.`
    : `${f.a} vs ${f.b}: o ${f.b} é ${f.diameterPct} ${f.larger === 'b' ? 'maior' : 'menor'} (${f.diameterB} contra ${f.diameterA} mm). Marcando ${f.speedShown} ${f.speedUnit}, você anda a ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} e ${f.b} têm praticamente o mesmo diâmetro externo (${f.diameterA} mm), então a leitura do velocímetro não muda.`
    : `O ${f.b} tem diâmetro externo ${f.diameterPct} ${f.larger === 'b' ? 'maior' : 'menor'} que o ${f.a} (${f.diameterB} mm contra ${f.diameterA} mm). Com o velocímetro calibrado para o ${f.a}, marcar ${f.speedShown} ${f.speedUnit} com o ${f.b} significa andar de verdade a ${f.speedTrue} ${f.speedUnit}.`,
  answer: { diameter: 'Diâmetro', speed: 'Velocidade real', width: 'Largura', sidewall: 'Flanco' },
  specHeading: 'Dimensões lado a lado',
  colDifference: 'Diferença',
  speedHeading: 'Diferença no velocímetro',
  speedIntro: (f) => `Velocímetro calibrado para ${f.a}, carro rodando com ${f.b}.`,
  colIndicated: 'O velocímetro marca',
  colTrue: 'Velocidade real',
  vehiclesHeading: 'Veículos com essas medidas',
  bothSizes: 'De fábrica com as duas medidas',
  onSize: (size) => `Com ${size}`,
  vehiclesEmpty: 'Nenhum veículo do conjunto de dados da Atlas lista essas medidas ainda.',
  reasonSame: 'As duas medidas são originais de fábrica no mesmo veículo.',
  reasonPlus: 'A medida fabricada mais próxima com uma polegada de aro de diferença.',
  toolCta: 'Abrir na calculadora de comparação de pneus',
  toolCtaDetail: 'Altere qualquer medida e veja folga, velocidade e diferenças visuais',
  sizeCta: (size) => `Medida ${size}`,
  sizeCtaDetail: 'Todas as dimensões, alternativas e veículos',
  relatedHeading: 'Mais comparações',
  faqHeading: 'Perguntas frequentes',
  faqs: (f) => [
    {
      q: `Qual é maior, ${f.a} ou ${f.b}?`,
      a: f.larger === 'equal'
        ? `Nenhum: os dois têm cerca de ${f.diameterA} mm de diâmetro externo. ${f.wider === 'equal' ? 'Também têm a mesma largura.' : `O ${f.wider === 'b' ? f.b : f.a} é ${f.widthMm} mm mais largo.`}`
        : `O ${larger(f)} é maior: ${largerDiameter(f)} mm contra ${smallerDiameter(f)} mm de diâmetro externo, uma diferença de ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Os dois têm a mesma largura de seção.' : `O ${f.wider === 'b' ? f.b : f.a} é ${f.widthMm} mm mais largo.`} ${f.tallerSidewall === 'equal' ? '' : `O flanco do ${f.tallerSidewall === 'b' ? f.b : f.a} é ${f.sidewallMm} mm mais alto.`}`.trim(),
    },
    {
      q: `Como o ${f.b} muda o velocímetro em relação ao ${f.a}?`,
      a: f.larger === 'equal'
        ? `Praticamente nada: os diâmetros externos são iguais, então ${f.speedShown} ${f.speedUnit} no velocímetro continuam sendo cerca de ${f.speedTrue} ${f.speedUnit}.`
        : `Com o velocímetro calibrado para o ${f.a}, com o ${f.b} ele marca ${f.larger === 'b' ? 'menos' : 'mais'} do que o real: marcando ${f.speedShown} ${f.speedUnit}, você está de verdade a ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Posso usar ${f.b} no lugar de ${f.a}?`,
      a: `${f.larger === 'equal' ? 'Os diâmetros externos são praticamente idênticos' : `Os diâmetros externos diferem ${f.diameterPct}`}, ${f.within3 ? 'dentro' : 'fora'} da margem de 3% que a Atlas usa para listar medidas alternativas. O diâmetro é só parte da resposta: largura da roda, índices de carga e velocidade, folga e as medidas homologadas para o seu veículo decidem se serve.${f.sharedVehicles ? ` As duas medidas são de fábrica em: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} comparado com`,
  sizeSectionIntro: 'Comparações lado a lado com as medidas de fábrica e de uma polegada a mais ou a menos que se costuma avaliar contra esta.',
  modelsHeading: (size) => `Modelos de carro com ${size}`,
  modelsIntro: 'Modelos cujos registros de roda no conjunto aberto ANKUSI indicam esta medida.',
};

const pl: TireComparisonText = {
  kicker: 'Porównanie rozmiarów opon',
  title: (f) => `${f.a} vs ${f.b}: różnica i licznik`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b}: praktycznie ta sama średnica zewnętrzna (${f.diameterA} mm). Szerokość, profil i prędkościomierz obok siebie.`
    : `${f.a} vs ${f.b}: ${f.b} ma o ${f.diameterPct} ${f.larger === 'b' ? 'większą' : 'mniejszą'} średnicę (${f.diameterB} zamiast ${f.diameterA} mm). Przy ${f.speedShown} ${f.speedUnit} na liczniku jedziesz ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} i ${f.b} mają praktycznie tę samą średnicę zewnętrzną (${f.diameterA} mm), więc wskazania prędkościomierza się nie zmieniają.`
    : `${f.b} ma o ${f.diameterPct} ${f.larger === 'b' ? 'większą' : 'mniejszą'} średnicę zewnętrzną niż ${f.a} (${f.diameterB} mm zamiast ${f.diameterA} mm). Przy prędkościomierzu ustawionym na ${f.a} wskazanie ${f.speedShown} ${f.speedUnit} na ${f.b} oznacza rzeczywiste ${f.speedTrue} ${f.speedUnit}.`,
  answer: { diameter: 'Średnica', speed: 'Realna prędkość', width: 'Szerokość', sidewall: 'Bok opony' },
  specHeading: 'Wymiary obok siebie',
  colDifference: 'Różnica',
  speedHeading: 'Różnica wskazań prędkościomierza',
  speedIntro: (f) => `Prędkościomierz ustawiony na ${f.a}, samochód na oponach ${f.b}.`,
  colIndicated: 'Prędkościomierz wskazuje',
  colTrue: 'Prędkość rzeczywista',
  vehiclesHeading: 'Pojazdy na tych rozmiarach',
  bothSizes: 'Fabrycznie w obu rozmiarach',
  onSize: (size) => `Na ${size}`,
  vehiclesEmpty: 'Żaden pojazd w danych Atlas nie ma jeszcze tych rozmiarów.',
  reasonSame: 'Oba rozmiary są fabrycznymi rozmiarami tego samego pojazdu.',
  reasonPlus: 'Najbliższy produkowany rozmiar o jeden cal felgi dalej.',
  toolCta: 'Otwórz w kalkulatorze porównania opon',
  toolCtaDetail: 'Zmień dowolny rozmiar i porównaj prześwit, prędkość i wygląd',
  sizeCta: (size) => `Rozmiar ${size}`,
  sizeCtaDetail: 'Wszystkie wymiary, zamienniki i pojazdy',
  relatedHeading: 'Więcej porównań',
  faqHeading: 'Najczęstsze pytania',
  faqs: (f) => [
    {
      q: `Która opona jest większa, ${f.a} czy ${f.b}?`,
      a: f.larger === 'equal'
        ? `Żadna: obie mają około ${f.diameterA} mm średnicy zewnętrznej. ${f.wider === 'equal' ? 'Mają też tę samą szerokość.' : `${f.wider === 'b' ? f.b : f.a} jest szersza o ${f.widthMm} mm.`}`
        : `Większa jest ${larger(f)}: ${largerDiameter(f)} mm wobec ${smallerDiameter(f)} mm średnicy zewnętrznej, różnica ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Obie mają tę samą szerokość.' : `${f.wider === 'b' ? f.b : f.a} jest szersza o ${f.widthMm} mm.`} ${f.tallerSidewall === 'equal' ? '' : `Bok opony ${f.tallerSidewall === 'b' ? f.b : f.a} jest wyższy o ${f.sidewallMm} mm.`}`.trim(),
    },
    {
      q: `Jak ${f.b} zmienia wskazania prędkościomierza w porównaniu z ${f.a}?`,
      a: f.larger === 'equal'
        ? `Praktycznie wcale: średnice zewnętrzne są takie same, więc wskazanie ${f.speedShown} ${f.speedUnit} to nadal około ${f.speedTrue} ${f.speedUnit}.`
        : `Przy prędkościomierzu ustawionym na ${f.a}, na ${f.b} pokazuje on ${f.larger === 'b' ? 'za mało' : 'za dużo'}: przy wskazaniu ${f.speedShown} ${f.speedUnit} jedziesz naprawdę ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Czy mogę założyć ${f.b} zamiast ${f.a}?`,
      a: `${f.larger === 'equal' ? 'Średnice zewnętrzne są praktycznie identyczne' : `Średnice zewnętrzne różnią się o ${f.diameterPct}`}, czyli ${f.within3 ? 'mieszczą się w' : 'wykraczają poza'} 3-procentowym zakresie, którego Atlas używa przy zamiennikach. Średnica to tylko część odpowiedzi: o montażu decydują szerokość felgi, indeksy nośności i prędkości, prześwity oraz rozmiary dopuszczone dla danego pojazdu.${f.sharedVehicles ? ` Oba rozmiary są fabryczne w: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} w porównaniu z`,
  sizeSectionIntro: 'Porównania z rozmiarami fabrycznymi i o cal większymi lub mniejszymi, które rozważa się zamiast tego.',
  modelsHeading: (size) => `Modele samochodów z ${size}`,
  modelsIntro: 'Modele, których rekordy felg w otwartym zbiorze ANKUSI podają ten rozmiar opony.',
};

const nl: TireComparisonText = {
  kicker: 'Bandenmaten vergelijken',
  title: (f) => `${f.a} vs ${f.b}: verschil en teller`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} vs ${f.b}: vrijwel dezelfde buitendiameter (${f.diameterA} mm). Breedte, wang en snelheidsmeter naast elkaar.`
    : `${f.a} vs ${f.b}: ${f.b} is ${f.diameterPct} ${f.larger === 'b' ? 'groter' : 'kleiner'} (${f.diameterB} tegen ${f.diameterA} mm). Bij ${f.speedShown} ${f.speedUnit} op de teller rijdt u ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} en ${f.b} hebben vrijwel dezelfde buitendiameter (${f.diameterA} mm), dus de snelheidsmeter wijkt niet af.`
    : `${f.b} heeft een ${f.diameterPct} ${f.larger === 'b' ? 'grotere' : 'kleinere'} buitendiameter dan ${f.a} (${f.diameterB} mm tegen ${f.diameterA} mm). Met een teller afgestemd op ${f.a} betekent ${f.speedShown} ${f.speedUnit} op de teller met ${f.b} in werkelijkheid ${f.speedTrue} ${f.speedUnit}.`,
  answer: { diameter: 'Diameter', speed: 'Echte snelheid', width: 'Breedte', sidewall: 'Wang' },
  specHeading: 'Afmetingen naast elkaar',
  colDifference: 'Verschil',
  speedHeading: 'Afwijking snelheidsmeter',
  speedIntro: (f) => `Teller afgestemd op ${f.a}, auto rijdt op ${f.b}.`,
  colIndicated: 'Teller geeft aan',
  colTrue: 'Werkelijke snelheid',
  vehiclesHeading: 'Voertuigen op deze maten',
  bothSizes: 'Af fabriek met beide maten',
  onSize: (size) => `Op ${size}`,
  vehiclesEmpty: 'Nog geen voertuig in de Atlas-gegevens heeft een van deze maten.',
  reasonSame: 'Beide maten zijn fabrieksmaten van hetzelfde voertuig.',
  reasonPlus: 'De dichtstbijzijnde geproduceerde maat één velgmaat verder.',
  toolCta: 'Openen in de bandenmaat-vergelijker',
  toolCtaDetail: 'Wijzig een maat en vergelijk vrije ruimte, snelheid en beeld',
  sizeCta: (size) => `Bandenmaat ${size}`,
  sizeCtaDetail: 'Alle afmetingen, alternatieven en voertuigen',
  relatedHeading: 'Meer vergelijkingen',
  faqHeading: 'Veelgestelde vragen',
  faqs: (f) => [
    {
      q: `Welke is groter, ${f.a} of ${f.b}?`,
      a: f.larger === 'equal'
        ? `Geen van beide: ze zijn allebei ongeveer ${f.diameterA} mm in buitendiameter. ${f.wider === 'equal' ? 'Ze zijn ook even breed.' : `${f.wider === 'b' ? f.b : f.a} is ${f.widthMm} mm breder.`}`
        : `${larger(f)} is groter: ${largerDiameter(f)} mm tegen ${smallerDiameter(f)} mm buitendiameter, een verschil van ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'Beide hebben dezelfde breedte.' : `${f.wider === 'b' ? f.b : f.a} is ${f.widthMm} mm breder.`} ${f.tallerSidewall === 'equal' ? '' : `De wang van ${f.tallerSidewall === 'b' ? f.b : f.a} is ${f.sidewallMm} mm hoger.`}`.trim(),
    },
    {
      q: `Hoe verandert ${f.b} de snelheidsmeter ten opzichte van ${f.a}?`,
      a: f.larger === 'equal'
        ? `Vrijwel niet: de buitendiameters zijn gelijk, dus ${f.speedShown} ${f.speedUnit} op de teller blijft ongeveer ${f.speedTrue} ${f.speedUnit}.`
        : `Met een teller afgestemd op ${f.a} geeft de teller op ${f.b} ${f.larger === 'b' ? 'te weinig' : 'te veel'} aan: bij ${f.speedShown} ${f.speedUnit} op de teller rijdt u werkelijk ${f.speedTrue} ${f.speedUnit}.`,
    },
    {
      q: `Kan ik ${f.b} in plaats van ${f.a} gebruiken?`,
      a: `${f.larger === 'equal' ? 'De buitendiameters zijn vrijwel gelijk' : `De buitendiameters verschillen ${f.diameterPct}`}, ${f.within3 ? 'binnen' : 'buiten'} de marge van 3 % die Atlas voor alternatieve maten gebruikt. De diameter is maar een deel van het antwoord: velgbreedte, belastings- en snelheidsindex, vrije ruimte en de goedgekeurde maten voor uw voertuig bepalen of het past.${f.sharedVehicles ? ` Beide maten zijn af fabriek gemonteerd op: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} vergeleken met`,
  sizeSectionIntro: 'Vergelijkingen naast elkaar met de fabrieksmaten en de maten één inch groter of kleiner die men tegen deze maat afweegt.',
  modelsHeading: (size) => `Automodellen met ${size}`,
  modelsIntro: 'Modellen waarvan de velggegevens in de open ANKUSI-dataset deze bandenmaat noemen.',
};

const tr: TireComparisonText = {
  kicker: 'Lastik ebadı karşılaştırma',
  title: (f) => `${f.a} vs ${f.b}: çap farkı ve hız sapması`,
  description: (f) => f.larger === 'equal'
    ? `${f.a} ile ${f.b}: dış çap neredeyse aynı (${f.diameterA} mm). Genişlik, yanak yüksekliği ve kilometre saati yan yana.`
    : `${f.a} ile ${f.b}: ${f.b} ${f.diameterPct} daha ${f.larger === 'b' ? 'büyük' : 'küçük'} (${f.diameterA} yerine ${f.diameterB} mm). Gösterge ${f.speedShown} ${f.speedUnit} iken gerçek hız ${f.speedTrue} ${f.speedUnit}.`,
  lead: (f) => f.larger === 'equal'
    ? `${f.a} ve ${f.b} neredeyse aynı dış çapa sahip (${f.diameterA} mm); kilometre saati değişmez.`
    : `${f.b}, ${f.a} ebadından ${f.diameterPct} daha ${f.larger === 'b' ? 'büyük' : 'küçük'} dış çapa sahip (${f.diameterA} mm yerine ${f.diameterB} mm). Kilometre saati ${f.a} için ayarlıysa, ${f.b} ile gösterge ${f.speedShown} ${f.speedUnit} derken gerçek hız ${f.speedTrue} ${f.speedUnit} olur.`,
  answer: { diameter: 'Çap farkı', speed: 'Gerçek hız', width: 'Genişlik farkı', sidewall: 'Yanak farkı' },
  specHeading: 'Ölçüler yan yana',
  colDifference: 'Fark',
  speedHeading: 'Kilometre saati sapması',
  speedIntro: (f) => `Kilometre saati ${f.a} için ayarlı, araç ${f.b} ile gidiyor.`,
  colIndicated: 'Gösterge',
  colTrue: 'Gerçek hız',
  vehiclesHeading: 'Bu ebatları kullanan araçlar',
  bothSizes: 'Fabrikadan iki ebatla da sunulanlar',
  onSize: (size) => `${size} kullananlar`,
  vehiclesEmpty: 'Atlas veri setinde henüz bu ebatları kullanan araç yok.',
  reasonSame: 'İki ebat da aynı aracın fabrika ebadı.',
  reasonPlus: 'Bir jant çapı ötedeki en yakın üretilen ebat.',
  toolCta: 'Lastik ebadı karşılaştırma aracında aç',
  toolCtaDetail: 'Ebatları değiştirip boşluk, hız ve görsel farkı karşılaştırın',
  sizeCta: (size) => `${size} lastik ebadı`,
  sizeCtaDetail: 'Tüm ölçüler, muadil ebatlar ve araçlar',
  relatedHeading: 'Diğer karşılaştırmalar',
  faqHeading: 'Sık sorulan sorular',
  faqs: (f) => [
    {
      q: `${f.a} mi büyük, ${f.b} mi?`,
      a: f.larger === 'equal'
        ? `İkisi de yaklaşık ${f.diameterA} mm dış çapa sahip. ${f.wider === 'equal' ? 'Genişlikleri de aynı.' : `${f.wider === 'b' ? f.b : f.a} ${f.widthMm} mm daha geniş.`}`
        : `${larger(f)} daha büyük: dış çap ${smallerDiameter(f)} mm yerine ${largerDiameter(f)} mm, fark ${f.diameterMm} mm (${f.diameterPct}). ${f.wider === 'equal' ? 'İkisinin taban genişliği aynı.' : `${f.wider === 'b' ? f.b : f.a} ${f.widthMm} mm daha geniş.`} ${f.tallerSidewall === 'equal' ? '' : `${f.tallerSidewall === 'b' ? f.b : f.a} ebadının yanağı ${f.sidewallMm} mm daha yüksek.`}`.trim(),
    },
    {
      q: `${f.b}, ${f.a} ebadına göre kilometre saatini nasıl değiştirir?`,
      a: f.larger === 'equal'
        ? `Neredeyse hiç: dış çaplar aynı, gösterge ${f.speedShown} ${f.speedUnit} derken gerçek hız yaklaşık ${f.speedTrue} ${f.speedUnit} kalır.`
        : `Kilometre saati ${f.a} için ayarlıysa ${f.b} ile ${f.larger === 'b' ? 'olduğundan düşük' : 'olduğundan yüksek'} gösterir: gösterge ${f.speedShown} ${f.speedUnit} iken gerçekte ${f.speedTrue} ${f.speedUnit} ile gidersiniz.`,
    },
    {
      q: `${f.a} yerine ${f.b} takılır mı?`,
      a: `${f.larger === 'equal' ? 'Dış çaplar neredeyse aynı' : `Dış çaplar arasında ${f.diameterPct} fark var`}; bu, Atlas'ın muadil ebat listelerken kullandığı %3 aralığının ${f.within3 ? 'içinde' : 'dışında'}. Çap, cevabın yalnızca bir parçası: jant genişliği, yük ve hız endeksi, çamurluk boşluğu ve aracınız için onaylı ebatlar takılıp takılamayacağını belirler.${f.sharedVehicles ? ` İki ebat da fabrikadan şu araçlarda var: ${f.sharedVehicles}.` : ''}`,
    },
  ],
  sizeSectionHeading: (size) => `${size} karşılaştırmaları`,
  sizeSectionIntro: 'Bu ebatla kıyaslanan fabrika ebatları ve bir inç büyük/küçük muadillerle yan yana karşılaştırmalar.',
  modelsHeading: (size) => `${size} kullanan otomobil modelleri`,
  modelsIntro: 'Açık ANKUSI veri setindeki jant kayıtlarında bu lastik ebadı geçen modeller.',
};

export const tireComparisonText: Readonly<Record<EntityLocale, TireComparisonText>> = Object.freeze({
  en, de, es, fr, it, 'pt-br': ptBr, pl, nl, tr,
});
