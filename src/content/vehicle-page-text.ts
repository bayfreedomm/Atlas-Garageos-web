import type { VehicleFitment } from '../data/vehicle-fitment';
import { torquePresentation } from '../ui/vehicle-torque';

import type { EntityLocale } from '../seo/entity-routes';

export type VehicleLocale = EntityLocale;

export interface VehiclePageText {
  readonly kicker: string;
  readonly h1: (v: VehicleFitment) => string;
  readonly intro: (v: VehicleFitment) => string;
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
  readonly confidenceNote: string;
  readonly sourcesLabel: string;
  readonly notesLabel: string;
  readonly disclaimer: string;
  readonly toolsHeading: string;
  readonly openTireTool: string;
  readonly openBoltTool: string;
  readonly openTorqueTool: string;
  readonly fuelHeading: string;
  readonly fuelCardTitle: string;
  readonly fuelCardCopy: string;
  readonly tripCardTitle: string;
  readonly tripCardCopy: string;
  readonly faqHeading: string;
  readonly faqTireQ: (v: VehicleFitment) => string;
  readonly faqTireA: (v: VehicleFitment) => string;
  readonly faqBoltQ: (v: VehicleFitment) => string;
  readonly faqBoltA: (v: VehicleFitment) => string;
  readonly faqTorqueQ: (v: VehicleFitment) => string;
  readonly faqTorqueA: (v: VehicleFitment) => string;
  readonly hubTitle: string;
  readonly hubDescription: string;
  readonly hubLead: string;
  readonly hubUsMarket: string;
  readonly hubEuMarket: string;
  readonly breadcrumbHome: string;
  readonly breadcrumbVehicles: string;
  readonly title: (v: VehicleFitment) => string;
  readonly description: (v: VehicleFitment) => string;
  readonly market: string;
}


/**
 * Search-result title and description for a vehicle page: answer first. Search Console
 * (2026-10-15) shows these pages ranking 5–9 for "<model> bolt pattern" queries with ~0 % CTR
 * while the old titles named only the topic, so the bolt pattern and tire size now appear in
 * the title itself. Every value comes from the curated row; nothing is added.
 */
interface MetaWords {
  readonly pcd: string; readonly tire: string; readonly bore: string; readonly wheel: string; readonly and: string; readonly tail: string;
  readonly title: (name: string, pcd: string, tire: string) => readonly string[];
}
// 58 + " — Atlas GarageOS" stays within the 75-character audit budget (an & renders as &amp;).
const fitTitle = (candidates: readonly string[]): string => candidates.find((c) => c.replace(/&/g, '&amp;').length <= 58) ?? candidates[candidates.length - 1]!;
const spacedTire = (v: VehicleFitment): string => v.tireSize.replace(/R(\d)/, ' R$1');
const decimal = (value: number, locale: VehicleLocale): string => (locale === 'en' ? String(value) : String(value).replace('.', ','));
function metaTitle(v: VehicleFitment, w: MetaWords): string {
  return fitTitle(w.title(`${v.make} ${v.model}`, v.boltPattern, spacedTire(v)));
}
function metaDescription(v: VehicleFitment, locale: VehicleLocale, w: MetaWords): string {
  const facts = [`${w.pcd} ${v.boltPattern}`, ...(v.centerBoreMm !== undefined ? [`${w.bore} ${decimal(v.centerBoreMm, locale)} mm`] : []), `${w.tire} ${spacedTire(v)}`, `${w.wheel} ${v.wheelSize}`];
  const list = `${facts.slice(0, -1).join(', ')} ${w.and} ${facts[facts.length - 1]}`;
  const withGeneration = `${v.make} ${v.model} (${v.generation}): ${list}. ${w.tail}`;
  return withGeneration.length <= 175 ? withGeneration : `${v.make} ${v.model}: ${list}. ${w.tail}`;
}
const META: Readonly<Record<VehicleLocale, MetaWords>> = {
  en: { pcd: 'bolt pattern', bore: 'center bore', tire: 'tire', wheel: 'wheel', and: 'and', tail: 'Sourced, confidence-rated.', title: (n, p, t) => [`${n} Bolt Pattern ${p}, Tire Size ${t}`, `${n} Bolt Pattern ${p}, Tires ${t}`, `${n} Bolt Pattern (PCD): ${p}`] },
  de: { pcd: 'Lochkreis', bore: 'Nabenbohrung', tire: 'Reifen', wheel: 'Felge', and: 'und', tail: 'Mit Quellen und Verlässlichkeit.', title: (n, p, t) => [`${n} Lochkreis ${p}, Reifengröße ${t}`, `${n} Lochkreis ${p}, Reifen ${t}`, `${n} Lochkreis (PCD): ${p}`] },
  es: { pcd: 'patrón de birlos (PCD)', bore: 'centro de rueda', tire: 'neumático', wheel: 'llanta', and: 'y', tail: 'Con fuentes y nivel de confianza.', title: (n, p, t) => [`${n}: PCD ${p} y neumáticos ${t}`, `${n}: PCD ${p}, neumático ${t}`, `${n}: patrón de birlos (PCD) ${p}`, `${n}: PCD ${p}`] },
  fr: { pcd: 'entraxe', bore: 'alésage', tire: 'pneu', wheel: 'jante', and: 'et', tail: 'Avec sources et niveau de confiance.', title: (n, p, t) => [`${n} : entraxe ${p} et pneu ${t}`, `${n} : entraxe ${p}, pneu ${t}`, `${n} : entraxe (PCD) ${p}`] },
  it: { pcd: 'foratura', bore: 'foro centrale', tire: 'pneumatico', wheel: 'cerchio', and: 'e', tail: 'Con fonti e livello di affidabilità.', title: (n, p, t) => [`${n}: foratura ${p} e pneumatici ${t}`, `${n}: foratura ${p}, gomme ${t}`, `${n}: foratura (PCD) ${p}`] },
  'pt-br': { pcd: 'furação', bore: 'furo central', tire: 'pneu', wheel: 'roda', and: 'e', tail: 'Com fontes e nível de confiança.', title: (n, p, t) => [`${n}: furação ${p} e pneu ${t}`, `${n}: furação ${p}, pneu ${t}`, `${n}: furação (PCD) ${p}`] },
  pl: { pcd: 'rozstaw śrub', bore: 'otwór centralny', tire: 'opony', wheel: 'felga', and: 'i', tail: 'Ze źródłami i poziomem pewności.', title: (n, p, t) => [`${n}: rozstaw śrub ${p} i opony ${t}`, `${n}: rozstaw śrub ${p}, opony ${t}`, `${n}: rozstaw śrub (PCD) ${p}`] },
  nl: { pcd: 'steekmaat', bore: 'naafgat', tire: 'band', wheel: 'velg', and: 'en', tail: 'Met bronnen en betrouwbaarheid.', title: (n, p, t) => [`${n}: steekmaat ${p} en bandenmaat ${t}`, `${n}: steekmaat ${p}, banden ${t}`, `${n}: steekmaat (PCD) ${p}`] },
  tr: { pcd: 'bijon aralığı', bore: 'göbek çapı', tire: 'lastik', wheel: 'jant', and: 've', tail: 'Kaynaklı veri.', title: (n, p, t) => [`${n} bijon aralığı ${p} ve lastik ${t}`, `${n} bijon aralığı ${p}, lastik ${t}`, `${n} bijon aralığı (PCD): ${p}`] },
};

export const vehiclePageText: Record<VehicleLocale, VehiclePageText> = {
  en: {
    kicker: 'Atlas fitment reference',
    h1: (v) => `${v.make} ${v.model} — Tire Size & Bolt Pattern`,
    intro: (v) => `Reference wheel and tire fitment for the ${v.make} ${v.model} (${v.generation}). Cross-checked against public fitment references — always confirm against your own vehicle's door-jamb sticker or owner's manual before buying parts.`,
    tireSize: 'Referenced tire size',
    boltPattern: 'Bolt pattern (PCD)',
    wheelSize: 'Referenced wheel size',
    centerBore: 'Center bore',
    torque: 'Wheel torque',
    fastener: 'Fastener type',
    lugNut: 'Lug nut',
    wheelBolt: 'Wheel bolt',
    generation: 'Generation / years',
    confidence: { high: 'High confidence', medium: 'Medium confidence — cross-check before use', low: 'Low confidence — verify before use' },
    confidenceNote: 'How sure we are',
    sourcesLabel: 'Sources',
    notesLabel: 'Note',
    disclaimer: 'This is reference data, not a manufacturer feed — always confirm against your own vehicle\'s manual or door-jamb sticker before buying parts or torquing wheels.',
    toolsHeading: 'Use these numbers in a calculator',
    openTireTool: 'Check this tire size in the Tire Size Calculator',
    openBoltTool: 'Check this bolt pattern in the Bolt Pattern Calculator',
    openTorqueTool: 'Convert this torque spec (Nm ↔ lb-ft)',
    fuelHeading: 'Fuel & trip costs',
    fuelCardTitle: "Today's fuel prices",
    fuelCardCopy: 'Current national average for regular gasoline and diesel.',
    tripCardTitle: 'Estimate driving cost',
    tripCardCopy: 'Use this fuel price to estimate cost per trip or per year.',
    faqHeading: 'Frequently asked questions',
    faqTireQ: (v) => `What tire size does a ${v.make} ${v.model} take?`,
    faqTireA: (v) => `A ${v.make} ${v.model} (${v.generation}) commonly comes with ${v.tireSize} tires on a ${v.wheelSize} wheel. Trims vary, so check your door-jamb sticker for your exact vehicle.${v.optionalTireSizes?.length ? ` Factory option sizes for this generation: ${v.optionalTireSizes.join(', ')}.` : ''}`,
    faqBoltQ: (v) => `What is the bolt pattern of a ${v.make} ${v.model}?`,
    faqBoltA: (v) => `The ${v.make} ${v.model} uses a ${v.boltPattern} bolt pattern (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'lug nuts' : 'wheel bolts'}).`,
    faqTorqueQ: (v) => `What is the wheel torque spec for a ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'en');
      return v.torqueNm === undefined
        ? `Atlas does not have a documented torque reference for the ${v.make} ${v.model} yet — check your owner's manual.`
        : `Atlas lists ${torque.value} as a wheel-torque reference for the ${v.make} ${v.model}. ${torque.qualifier ?? 'Confirm it in the vehicle manual before torquing wheels.'}`;
    },
    hubTitle: 'Vehicle Fitment Reference',
    hubDescription: 'Sourced tire size, bolt pattern, and wheel torque reference pages for common vehicles, with confidence ratings.',
    hubLead: 'Pick a vehicle to see its reference tire size, bolt pattern, wheel size, and torque spec — each cross-checked against public fitment sources and rated for confidence.',
    hubUsMarket: 'US market',
    hubEuMarket: 'European market',
    breadcrumbHome: 'Home',
    breadcrumbVehicles: 'Vehicles',
    // The audit counts '&' as '&amp;'; very long model labels fall back to the shorter 'PCD'.
    title: (v) => metaTitle(v, META['en']),
    description: (v) => metaDescription(v, 'en', META['en']),
    market: 'Market',
  },
  de: {
    kicker: 'Atlas-Fitment-Referenz',
    h1: (v) => `${v.make} ${v.model} — Reifengröße & Lochkreis`,
    intro: (v) => `Atlas-Referenzdaten für Räder und Reifen des ${v.make} ${v.model} (${v.generation}), mit öffentlichen Quellen und Verlässlichkeitsstufe. Prüfen Sie vor dem Kauf immer den Aufkleber an der Fahrertür oder das Fahrzeughandbuch.`,
    tireSize: 'Referenz-Reifengröße',
    boltPattern: 'Lochkreis (PCD)',
    wheelSize: 'Referenz-Felgengröße',
    centerBore: 'Nabenbohrung',
    torque: 'Anzugsdrehmoment',
    fastener: 'Befestigungsart',
    lugNut: 'Radmutter',
    wheelBolt: 'Radschraube',
    generation: 'Generation / Baujahre',
    confidence: { high: 'Hohe Verlässlichkeit', medium: 'Mittlere Verlässlichkeit — vor Nutzung gegenprüfen', low: 'Geringe Verlässlichkeit — vor Nutzung prüfen' },
    confidenceNote: 'Wie sicher wir uns sind',
    sourcesLabel: 'Quellen',
    notesLabel: 'Hinweis',
    disclaimer: 'Dies sind Referenzdaten, keine Herstellerdatenbank — prüfen Sie vor Teilekauf oder dem Anziehen der Räder immer das Handbuch oder den Aufkleber an der Fahrertür Ihres Fahrzeugs.',
    toolsHeading: 'Diese Werte in einem Rechner verwenden',
    openTireTool: 'Diese Reifengröße im Reifengrößen-Rechner prüfen',
    openBoltTool: 'Diesen Lochkreis im Lochkreis-Rechner prüfen',
    openTorqueTool: 'Dieses Drehmoment umrechnen (Nm ↔ lb-ft)',
    fuelHeading: 'Kraftstoff & Fahrtkosten',
    fuelCardTitle: 'Kraftstoffpreise heute',
    fuelCardCopy: 'Beobachtete Stichprobe für Super E5, E10 und Diesel.',
    tripCardTitle: 'Fahrtkosten schätzen',
    tripCardCopy: 'Diesen Kraftstoffpreis nutzen, um Kosten pro Fahrt oder pro Jahr zu schätzen.',
    faqHeading: 'Häufige Fragen',
    faqTireQ: (v) => `Welche Reifengröße hat ein ${v.make} ${v.model}?`,
    faqTireA: (v) => `Ein ${v.make} ${v.model} (${v.generation}) wird üblicherweise mit ${v.tireSize} Reifen auf einer ${v.wheelSize}-Felge ausgeliefert. Je nach Ausstattung kann es Abweichungen geben — prüfen Sie den Aufkleber an der Fahrertür für Ihr genaues Fahrzeug.${v.optionalTireSizes?.length ? ` Werksoptional für diese Generation: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `Welchen Lochkreis hat ein ${v.make} ${v.model}?`,
    faqBoltA: (v) => `Der ${v.make} ${v.model} hat einen Lochkreis von ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'Radmuttern' : 'Radschrauben'}).`,
    faqTorqueQ: (v) => `Welches Anzugsdrehmoment gilt für einen ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'de');
      return v.torqueNm === undefined
        ? `Atlas hat noch keinen dokumentierten Drehmoment-Referenzwert für den ${v.make} ${v.model} — prüfen Sie das Fahrzeughandbuch.`
        : `Atlas führt ${torque.value} als Drehmoment-Referenzwert für den ${v.make} ${v.model}. ${torque.qualifier ?? 'Bestätigen Sie den Wert vor dem Anziehen der Räder im Fahrzeughandbuch.'}`;
    },
    hubTitle: 'Fahrzeug-Referenzdaten',
    hubDescription: 'Belegte Referenzseiten mit Reifengröße, Lochkreis und qualifiziertem Anzugsdrehmoment für gängige Fahrzeuge.',
    hubLead: 'Wählen Sie ein Fahrzeug, um dokumentierte Referenzwerte für Reifengröße, Lochkreis, Felgengröße und Anzugsdrehmoment mit Quellen und Verlässlichkeitsstufe zu sehen.',
    hubUsMarket: 'US-Markt',
    hubEuMarket: 'Europäischer Markt',
    breadcrumbHome: 'Start',
    breadcrumbVehicles: 'Fahrzeuge',
    title: (v) => metaTitle(v, META['de']),
    description: (v) => metaDescription(v, 'de', META['de']),
    market: 'Markt',
  },
  es: {
    kicker: 'Referencia de ajuste Atlas',
    h1: (v) => `${v.make} ${v.model} — Medida de Neumático y Patrón de Birlos`,
    intro: (v) => `Datos de referencia Atlas para las ruedas y neumáticos del ${v.make} ${v.model} (${v.generation}), con fuentes públicas y nivel de confianza. Confirme siempre con la etiqueta del pilar de la puerta o el manual antes de comprar piezas.`,
    tireSize: 'Medida de neumático de referencia',
    boltPattern: 'Patrón de birlos (PCD)',
    wheelSize: 'Medida de llanta de referencia',
    centerBore: 'Diámetro de buje',
    torque: 'Par de apriete',
    fastener: 'Tipo de fijación',
    lugNut: 'Tuerca de rueda',
    wheelBolt: 'Birlo de rueda',
    generation: 'Generación / años',
    confidence: { high: 'Confianza alta', medium: 'Confianza media — verifique antes de usar', low: 'Confianza baja — verifique antes de usar' },
    confidenceNote: 'Qué tan seguros estamos',
    sourcesLabel: 'Fuentes',
    notesLabel: 'Nota',
    disclaimer: 'Estos son datos de referencia, no un feed del fabricante — confirme siempre con el manual de su vehículo o la etiqueta del pilar de la puerta antes de comprar piezas o apretar las ruedas.',
    toolsHeading: 'Use estos valores en una calculadora',
    openTireTool: 'Comprobar esta medida en la Calculadora de Tamaño de Neumático',
    openBoltTool: 'Comprobar este patrón en la Calculadora de Patrón de Birlos',
    openTorqueTool: 'Convertir este par de apriete (Nm ↔ lb-ft)',
    fuelHeading: 'Combustible y costes de viaje',
    fuelCardTitle: 'Precio de la gasolina hoy',
    fuelCardCopy: 'Precio medio actual de la gasolina 95 y el diésel.',
    tripCardTitle: 'Estimar coste de conducción',
    tripCardCopy: 'Use este precio de combustible para estimar el coste por viaje o por año.',
    faqHeading: 'Preguntas frecuentes',
    faqTireQ: (v) => `¿Qué medida de neumático lleva un ${v.make} ${v.model}?`,
    faqTireA: (v) => `Un ${v.make} ${v.model} (${v.generation}) suele llevar neumáticos ${v.tireSize} sobre una llanta ${v.wheelSize}. Puede variar según el acabado — consulte la etiqueta del pilar de la puerta de su vehículo concreto.${v.optionalTireSizes?.length ? ` Medidas opcionales de fábrica en esta generación: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `¿Cuál es el patrón de birlos de un ${v.make} ${v.model}?`,
    faqBoltA: (v) => `El ${v.make} ${v.model} usa un patrón de birlos ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'tuercas de rueda' : 'birlos de rueda'}).`,
    faqTorqueQ: (v) => `¿Cuál es el par de apriete de las ruedas de un ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'es');
      return v.torqueNm === undefined
        ? `Atlas todavía no tiene una referencia documentada de par para el ${v.make} ${v.model} — consulte el manual del vehículo.`
        : `Atlas indica ${torque.value} como referencia de par para el ${v.make} ${v.model}. ${torque.qualifier ?? 'Confirme el valor en el manual antes de apretar las ruedas.'}`;
    },
    hubTitle: 'Referencia de Ajuste de Vehículos',
    hubDescription: 'Páginas de referencia con medida de neumático, patrón de birlos y par de apriete para vehículos comunes, con fuentes y nivel de confianza.',
    hubLead: 'Elija un vehículo para ver referencias documentadas de neumático, patrón de birlos, llanta y par, con sus fuentes y nivel de confianza.',
    hubUsMarket: 'Mercado de EE. UU.',
    hubEuMarket: 'Mercado europeo',
    breadcrumbHome: 'Inicio',
    breadcrumbVehicles: 'Vehículos',
    title: (v) => metaTitle(v, META['es']),
    description: (v) => metaDescription(v, 'es', META['es']),
    market: 'Mercado',
  },
  fr: {
    kicker: 'Référence de montage Atlas',
    h1: (v) => `${v.make} ${v.model} — taille de pneu et entraxe`,
    intro: (v) => `Données de référence Atlas pour les jantes et pneus de la ${v.make} ${v.model} (${v.generation}), avec sources publiques et niveau de confiance. Vérifiez toujours l'étiquette de la portière ou le manuel du véhicule avant d'acheter des pièces.`,
    tireSize: 'Taille de pneu de référence',
    boltPattern: 'Entraxe (PCD)',
    wheelSize: 'Taille de jante de référence',
    centerBore: 'Alésage central',
    torque: 'Couple de serrage',
    fastener: 'Type de fixation',
    lugNut: 'Écrou de roue',
    wheelBolt: 'Boulon de roue',
    generation: 'Génération / années',
    confidence: { high: 'Confiance élevée', medium: 'Confiance moyenne — à vérifier avant usage', low: 'Confiance faible — à vérifier avant usage' },
    confidenceNote: 'Notre niveau de certitude',
    sourcesLabel: 'Sources',
    notesLabel: 'Remarque',
    disclaimer: "Ce sont des données de référence, pas un flux constructeur — vérifiez toujours le manuel ou l'étiquette de portière de votre véhicule avant d'acheter des pièces ou de serrer les roues.",
    toolsHeading: 'Utiliser ces valeurs dans un calculateur',
    openTireTool: 'Vérifier cette taille dans le calculateur de pneus',
    openBoltTool: 'Vérifier cet entraxe dans le calculateur',
    openTorqueTool: 'Convertir ce couple (Nm ↔ lb-ft)',
    fuelHeading: 'Carburant et coût des trajets',
    fuelCardTitle: 'Prix du carburant',
    fuelCardCopy: 'Moyenne actuelle de l’essence et du diesel.',
    tripCardTitle: 'Estimer le coût d’un trajet',
    tripCardCopy: 'Utilisez ce prix pour estimer le coût par trajet ou par an.',
    faqHeading: 'Questions fréquentes',
    faqTireQ: (v) => `Quelle taille de pneu pour une ${v.make} ${v.model} ?`,
    faqTireA: (v) => `Une ${v.make} ${v.model} (${v.generation}) est généralement équipée de pneus ${v.tireSize.replace(/R(\d)/, ' R$1')} sur une jante ${v.wheelSize}. Selon la finition, cela peut varier — vérifiez l'étiquette de portière de votre véhicule.${v.optionalTireSizes?.length ? ` Tailles optionnelles d'origine pour cette génération : ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `Quel est l'entraxe d'une ${v.make} ${v.model} ?`,
    faqBoltA: (v) => `La ${v.make} ${v.model} utilise un entraxe ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'écrous de roue' : 'boulons de roue'}).`,
    faqTorqueQ: (v) => `Quel est le couple de serrage des roues d'une ${v.make} ${v.model} ?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'fr');
      return v.torqueNm === undefined
        ? `Atlas n'a pas encore de couple de serrage documenté pour la ${v.make} ${v.model} — consultez le manuel du véhicule.`
        : `Atlas indique ${torque.value} comme couple de référence pour la ${v.make} ${v.model}. ${torque.qualifier ?? 'Confirmez la valeur dans le manuel avant de serrer les roues.'}`;
    },
    hubTitle: 'Référence de montage par véhicule',
    hubDescription: 'Taille de pneu, entraxe, alésage et couple de serrage de référence pour les véhicules courants, avec sources et niveau de confiance.',
    hubLead: 'Choisissez un véhicule pour voir sa taille de pneu, son entraxe, sa taille de jante et son couple de serrage de référence — chaque valeur avec sa source et son niveau de confiance.',
    hubUsMarket: 'Marché américain',
    hubEuMarket: 'Marché européen',
    breadcrumbHome: 'Accueil',
    breadcrumbVehicles: 'Véhicules',
    title: (v) => metaTitle(v, META['fr']),
    description: (v) => metaDescription(v, 'fr', META['fr']),
    market: 'Marché',
  },
  'it': {
    kicker: 'Riferimento di montaggio Atlas',
    h1: (v) => `${v.make} ${v.model} — misura pneumatici e foratura`,
    intro: (v) => `Dati di riferimento Atlas per cerchi e pneumatici di ${v.make} ${v.model} (${v.generation}), con fonti pubbliche e livello di affidabilità. Verificare sempre l’etichetta sul montante della portiera o il manuale del veicolo prima di acquistare ricambi.`,
    tireSize: 'Misura pneumatico di riferimento',
    boltPattern: 'Foratura (PCD)',
    wheelSize: 'Misura cerchio di riferimento',
    centerBore: 'Foro centrale',
    torque: 'Coppia di serraggio',
    fastener: 'Tipo di fissaggio',
    lugNut: 'Dado ruota',
    wheelBolt: 'Bullone ruota',
    generation: 'Generazione / anni',
    confidence: { high: 'Affidabilità alta', medium: 'Affidabilità media — da verificare prima dell’uso', low: 'Affidabilità bassa — da verificare prima dell’uso' },
    confidenceNote: 'Il nostro livello di certezza',
    sourcesLabel: 'Fonti',
    notesLabel: 'Nota',
    disclaimer: "Questi sono dati di riferimento, non un flusso ufficiale del costruttore — verificare sempre il manuale o l'etichetta sulla portiera del proprio veicolo prima di acquistare ricambi o serrare le ruote.",
    toolsHeading: 'Usa questi valori in un calcolatore',
    openTireTool: 'Verifica questa misura nel calcolatore pneumatici',
    openBoltTool: 'Verifica questa foratura nel calcolatore',
    openTorqueTool: 'Converti questa coppia (Nm ↔ lb-ft)',
    fuelHeading: 'Carburante e costo dei viaggi',
    fuelCardTitle: 'Prezzi dei carburanti',
    fuelCardCopy: 'Media attuale di benzina e gasolio.',
    tripCardTitle: 'Stima il costo di un viaggio',
    tripCardCopy: 'Usa questo prezzo per stimare il costo per viaggio o per anno.',
    faqHeading: 'Domande frequenti',
    faqTireQ: (v) => `Che misura di pneumatici monta ${v.make} ${v.model}?`,
    faqTireA: (v) => `${v.make} ${v.model} (${v.generation}) monta di solito pneumatici ${v.tireSize.replace(/R(\d)/, ' R$1')} su cerchio ${v.wheelSize}. Può variare in base all’allestimento: verificare l’etichetta sulla portiera del proprio veicolo.${v.optionalTireSizes?.length ? ` Misure opzionali di fabbrica per questa generazione: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `Qual è la foratura di ${v.make} ${v.model}?`,
    faqBoltA: (v) => `${v.make} ${v.model} usa una foratura ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'dadi ruota' : 'bulloni ruota'}).`,
    faqTorqueQ: (v) => `Qual è la coppia di serraggio delle ruote di ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'it');
      return v.torqueNm === undefined
        ? `Atlas non ha ancora una coppia di serraggio documentata per ${v.make} ${v.model} — consultare il manuale del veicolo.`
        : `Atlas indica ${torque.value} come coppia di riferimento per ${v.make} ${v.model}. ${torque.qualifier ?? 'Confermare il valore nel manuale prima di serrare le ruote.'}`;
    },
    hubTitle: 'Dati di montaggio per veicolo',
    hubDescription: 'Misura pneumatici, foratura, foro centrale e coppia di serraggio di riferimento per i veicoli più diffusi, con fonti e livello di affidabilità.',
    hubLead: 'Selezionare un veicolo per vedere misura pneumatici, foratura, misura del cerchio e coppia di serraggio di riferimento — ogni valore con la sua fonte e il suo livello di affidabilità.',
    hubUsMarket: 'Mercato statunitense',
    hubEuMarket: 'Mercato europeo',
    breadcrumbHome: 'Home',
    breadcrumbVehicles: 'Veicoli',
    title: (v) => metaTitle(v, META['it']),
    description: (v) => metaDescription(v, 'it', META['it']),
    market: 'Mercato',
  },
  'pt-br': {
    kicker: 'Referência de montagem Atlas',
    h1: (v) => `${v.make} ${v.model} — medida de pneu e furação`,
    intro: (v) => `Dados de referência da Atlas para rodas e pneus do ${v.make} ${v.model} (${v.generation}), com fontes públicas e nível de confiança. Confira sempre a etiqueta da porta ou o manual do veículo antes de comprar peças.`,
    tireSize: 'Medida de pneu de referência',
    boltPattern: 'Furação (PCD)',
    wheelSize: 'Medida da roda de referência',
    centerBore: 'Furo central',
    torque: 'Torque de aperto',
    fastener: 'Tipo de fixação',
    lugNut: 'Porca de roda',
    wheelBolt: 'Parafuso de roda',
    generation: 'Geração / anos',
    confidence: { high: 'Confiança alta', medium: 'Confiança média — verifique antes de usar', low: 'Confiança baixa — verifique antes de usar' },
    confidenceNote: 'Nosso nível de certeza',
    sourcesLabel: 'Fontes',
    notesLabel: 'Observação',
    disclaimer: 'Estes são dados de referência, não um feed do fabricante — confira sempre o manual ou a etiqueta da porta do seu veículo antes de comprar peças ou apertar as rodas.',
    toolsHeading: 'Usar estes valores em uma calculadora',
    openTireTool: 'Verificar esta medida na calculadora de pneus',
    openBoltTool: 'Verificar esta furação na calculadora',
    openTorqueTool: 'Converter este torque (Nm ↔ lb-ft)',
    fuelHeading: 'Combustível e custo das viagens',
    fuelCardTitle: 'Preço dos combustíveis',
    fuelCardCopy: 'Média atual da gasolina e do diesel.',
    tripCardTitle: 'Estimar o custo de uma viagem',
    tripCardCopy: 'Use este preço para estimar o custo por viagem ou por ano.',
    faqHeading: 'Perguntas frequentes',
    faqTireQ: (v) => `Qual é a medida de pneu do ${v.make} ${v.model}?`,
    faqTireA: (v) => `O ${v.make} ${v.model} (${v.generation}) geralmente vem com pneus ${v.tireSize.replace(/R(\d)/, ' R$1')} em roda ${v.wheelSize}. Isso pode variar conforme a versão — confira a etiqueta da porta do seu veículo.${v.optionalTireSizes?.length ? ` Medidas opcionais de fábrica para esta geração: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `Qual é a furação do ${v.make} ${v.model}?`,
    faqBoltA: (v) => `O ${v.make} ${v.model} usa furação ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'porcas de roda' : 'parafusos de roda'}).`,
    faqTorqueQ: (v) => `Qual é o torque de aperto das rodas do ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'pt-br');
      return v.torqueNm === undefined
        ? `A Atlas ainda não tem um torque de aperto documentado para o ${v.make} ${v.model} — consulte o manual do veículo.`
        : `A Atlas indica ${torque.value} como torque de aperto de referência para o ${v.make} ${v.model}. ${torque.qualifier ?? 'Confirme o valor no manual antes de apertar as rodas.'}`;
    },
    hubTitle: 'Referência de rodas por veículo',
    hubDescription: 'Medida de pneu, furação, furo central e torque de aperto de referência para os veículos mais comuns, com fontes e nível de confiança.',
    hubLead: 'Escolha um veículo para ver a medida de pneu, a furação, a medida da roda e o torque de aperto de referência — cada valor com sua fonte e seu nível de confiança.',
    hubUsMarket: 'Mercado norte-americano',
    hubEuMarket: 'Mercado europeu',
    breadcrumbHome: 'Início',
    breadcrumbVehicles: 'Veículos',
    title: (v) => metaTitle(v, META['pt-br']),
    description: (v) => metaDescription(v, 'pt-br', META['pt-br']),
    market: 'Mercado',
  },
  'pl': {
    kicker: 'Baza dopasowań Atlas',
    h1: (v) => `${v.make} ${v.model} — rozmiar opon i rozstaw śrub`,
    intro: (v) => `Dane referencyjne Atlas dotyczące felg i opon dla ${v.make} ${v.model} (${v.generation}), ze źródłami publicznymi i poziomem pewności. Przed zakupem części zawsze należy sprawdzić naklejkę na słupku drzwi lub instrukcję pojazdu.`,
    tireSize: 'Referencyjny rozmiar opon',
    boltPattern: 'Rozstaw śrub (PCD)',
    wheelSize: 'Referencyjny rozmiar felgi',
    centerBore: 'Otwór centralny',
    torque: 'Moment dokręcania',
    fastener: 'Typ mocowania',
    lugNut: 'Nakrętka koła',
    wheelBolt: 'Śruba koła',
    generation: 'Generacja / lata',
    confidence: { high: 'Wysoka pewność', medium: 'Średnia pewność — sprawdzić przed użyciem', low: 'Niska pewność — zweryfikować przed użyciem' },
    confidenceNote: 'Poziom naszej pewności',
    sourcesLabel: 'Źródła',
    notesLabel: 'Uwaga',
    disclaimer: "To dane referencyjne, a nie dane producenta — przed zakupem części lub dokręcaniem kół zawsze należy sprawdzić instrukcję lub naklejkę na słupku drzwi własnego pojazdu.",
    toolsHeading: 'Użyj tych wartości w kalkulatorze',
    openTireTool: 'Sprawdź ten rozmiar w kalkulatorze opon',
    openBoltTool: 'Sprawdź ten rozstaw w kalkulatorze',
    openTorqueTool: 'Przelicz ten moment (Nm ↔ lb-ft)',
    fuelHeading: 'Paliwo i koszt przejazdów',
    fuelCardTitle: 'Ceny paliw',
    fuelCardCopy: 'Aktualna średnia cena benzyny i oleju napędowego.',
    tripCardTitle: 'Oszacuj koszt przejazdu',
    tripCardCopy: 'Użyj tej ceny, aby oszacować koszt jednego przejazdu lub roczny.',
    faqHeading: 'Najczęściej zadawane pytania',
    faqTireQ: (v) => `Jaki rozmiar opon ma ${v.make} ${v.model}?`,
    faqTireA: (v) => `${v.make} ${v.model} (${v.generation}) ma zwykle opony ${v.tireSize.replace(/R(\d)/, ' R$1')} na feldze ${v.wheelSize}. Zależnie od wersji może się to różnić — należy sprawdzić naklejkę na słupku drzwi własnego pojazdu.${v.optionalTireSizes?.length ? ` Fabryczne rozmiary opcjonalne dla tej generacji: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `Jaki rozstaw śrub ma ${v.make} ${v.model}?`,
    faqBoltA: (v) => `${v.make} ${v.model} ma rozstaw śrub ${v.boltPattern} (${v.fastenerType === 'lug-nut' ? 'nakrętki koła' : 'śruby koła'}: ${v.lugCount}).`,
    faqTorqueQ: (v) => `Jaki jest moment dokręcania kół dla ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'pl');
      return v.torqueNm === undefined
        ? `Atlas nie ma jeszcze udokumentowanego momentu dokręcania dla ${v.make} ${v.model} — należy sprawdzić instrukcję pojazdu.`
        : `Atlas podaje ${torque.value} jako referencyjny moment dokręcania dla ${v.make} ${v.model}. ${torque.qualifier ?? 'Przed dokręceniem kół należy potwierdzić wartość w instrukcji.'}`;
    },
    hubTitle: 'Dane opon i felg według pojazdu',
    hubDescription: 'Referencyjny rozmiar opon, rozstaw śrub, otwór centralny i moment dokręcania dla popularnych pojazdów, ze źródłami i poziomem pewności.',
    hubLead: 'Wybierz pojazd, aby zobaczyć jego referencyjny rozmiar opon, rozstaw śrub, rozmiar felgi i moment dokręcania — każda wartość ze źródłem i poziomem pewności.',
    hubUsMarket: 'Rynek amerykański',
    hubEuMarket: 'Rynek europejski',
    breadcrumbHome: 'Strona główna',
    breadcrumbVehicles: 'Pojazdy',
    title: (v) => metaTitle(v, META['pl']),
    description: (v) => metaDescription(v, 'pl', META['pl']),
    market: 'Rynek',
  },
  'nl': {
    kicker: 'Atlas-montagereferentie',
    h1: (v) => `${v.make} ${v.model} — bandenmaat en steekmaat`,
    intro: (v) => `Atlas-referentiegegevens voor velgen en banden van de ${v.make} ${v.model} (${v.generation}), met openbare bronnen en betrouwbaarheidsniveau. Controleer altijd de sticker in de deurstijl of het instructieboekje van het voertuig voordat u onderdelen koopt.`,
    tireSize: 'Referentiebandenmaat',
    boltPattern: 'Steekmaat (PCD)',
    wheelSize: 'Referentievelgmaat',
    centerBore: 'Naafgat',
    torque: 'Aanhaalmoment',
    fastener: 'Type bevestiging',
    lugNut: 'Wielmoer',
    wheelBolt: 'Wielbout',
    generation: 'Generatie / bouwjaren',
    confidence: { high: 'Hoge betrouwbaarheid', medium: 'Gemiddelde betrouwbaarheid — controleer vóór gebruik', low: 'Lage betrouwbaarheid — controleer vóór gebruik' },
    confidenceNote: 'Hoe zeker we zijn',
    sourcesLabel: 'Bronnen',
    notesLabel: 'Opmerking',
    disclaimer: "Dit zijn referentiegegevens, geen fabrieksgegevens — controleer altijd het instructieboekje of de sticker in de deurstijl van uw voertuig voordat u onderdelen koopt of wielen aanhaalt.",
    toolsHeading: 'Deze waarden in een calculator gebruiken',
    openTireTool: 'Deze maat controleren in de bandencalculator',
    openBoltTool: 'Deze steekmaat controleren in de calculator',
    openTorqueTool: 'Dit aanhaalmoment omrekenen (Nm ↔ lb-ft)',
    fuelHeading: 'Brandstof en ritkosten',
    fuelCardTitle: 'Brandstofprijzen',
    fuelCardCopy: 'Actueel gemiddelde voor benzine en diesel.',
    tripCardTitle: 'Kosten van een rit schatten',
    tripCardCopy: 'Gebruik deze prijs om de kosten per rit of per jaar te schatten.',
    faqHeading: 'Veelgestelde vragen',
    faqTireQ: (v) => `Welke bandenmaat heeft een ${v.make} ${v.model}?`,
    faqTireA: (v) => `Een ${v.make} ${v.model} (${v.generation}) heeft doorgaans banden ${v.tireSize.replace(/R(\d)/, ' R$1')} op een velg ${v.wheelSize}. Dit kan per uitvoering verschillen — controleer de sticker in de deurstijl van uw voertuig.${v.optionalTireSizes?.length ? ` Optionele fabrieksmaten voor deze generatie: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `Wat is de steekmaat van een ${v.make} ${v.model}?`,
    faqBoltA: (v) => `De ${v.make} ${v.model} heeft steekmaat ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'wielmoeren' : 'wielbouten'}).`,
    faqTorqueQ: (v) => `Wat is het aanhaalmoment van de wielen van een ${v.make} ${v.model}?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'nl');
      return v.torqueNm === undefined
        ? `Atlas heeft nog geen gedocumenteerd aanhaalmoment voor de ${v.make} ${v.model} — raadpleeg het instructieboekje van het voertuig.`
        : `Atlas vermeldt ${torque.value} als referentie-aanhaalmoment voor de ${v.make} ${v.model}. ${torque.qualifier ?? 'Controleer de waarde in het instructieboekje voordat u de wielen aanhaalt.'}`;
    },
    hubTitle: 'Banden en steekmaat per voertuig',
    hubDescription: 'Referentiebandenmaat, steekmaat, naafgat en aanhaalmoment voor gangbare voertuigen, met bronnen en betrouwbaarheidsniveau.',
    hubLead: 'Kies een voertuig om de referentiebandenmaat, steekmaat, velgmaat en het aanhaalmoment te zien — elke waarde met bron en betrouwbaarheidsniveau.',
    hubUsMarket: 'Amerikaanse markt',
    hubEuMarket: 'Europese markt',
    breadcrumbHome: 'Home',
    breadcrumbVehicles: 'Voertuigen',
    title: (v) => metaTitle(v, META['nl']),
    description: (v) => metaDescription(v, 'nl', META['nl']),
    market: 'Markt',
  },
  'tr': {
    kicker: 'Atlas uyum referansı',
    h1: (v) => `${v.make} ${v.model} — lastik ebadı ve bijon aralığı`,
    intro: (v) => `Araç: ${v.make} ${v.model} (${v.generation}). Jant ve lastikler için Atlas referans verileri; kamuya açık kaynaklar ve güven düzeyiyle birlikte. Parça almadan önce her zaman kapı etiketini veya aracın kullanım kılavuzunu kontrol edin.`,
    tireSize: 'Referans lastik ebadı',
    boltPattern: 'Bijon aralığı (PCD)',
    wheelSize: 'Referans jant ölçüsü',
    centerBore: 'Göbek çapı',
    torque: 'Sıkma torku',
    fastener: 'Bağlantı tipi',
    lugNut: 'Bijon somunu',
    wheelBolt: 'Bijon cıvatası',
    generation: 'Nesil / yıllar',
    confidence: { high: 'Yüksek güven', medium: 'Orta güven — kullanmadan önce doğrulayın', low: 'Düşük güven — kullanmadan önce doğrulayın' },
    confidenceNote: 'Ne kadar eminiz',
    sourcesLabel: 'Kaynaklar',
    notesLabel: 'Not',
    disclaimer: 'Bunlar referans verilerdir, üretici verisi değildir — parça almadan veya bijonları sıkmadan önce her zaman aracınızın kullanım kılavuzunu veya kapı etiketini kontrol edin.',
    toolsHeading: 'Bu değerleri bir hesaplayıcıda kullanın',
    openTireTool: 'Bu ebadı lastik hesaplayıcısında kontrol edin',
    openBoltTool: 'Bu bijon aralığını hesaplayıcıda kontrol edin',
    openTorqueTool: 'Bu torku dönüştürün (Nm ↔ lb-ft)',
    fuelHeading: 'Yakıt ve yolculuk maliyeti',
    fuelCardTitle: 'Yakıt fiyatları',
    fuelCardCopy: 'Benzin ve dizel için güncel ortalama.',
    tripCardTitle: 'Yolculuk maliyetini tahmin edin',
    tripCardCopy: 'Bu fiyatla yolculuk başına veya yıllık maliyeti tahmin edin.',
    faqHeading: 'Sık sorulan sorular',
    faqTireQ: (v) => `${v.make} ${v.model} hangi lastik ebadını kullanır?`,
    faqTireA: (v) => `Araç: ${v.make} ${v.model} (${v.generation}). Genellikle ${v.tireSize.replace(/R(\d)/, ' R$1')} lastikler ve ${v.wheelSize} jantla gelir. Donanım paketine göre farklılık olabilir — aracınızın kapı etiketini kontrol edin.${v.optionalTireSizes?.length ? ` Bu nesil için fabrika opsiyonu ebatlar: ${v.optionalTireSizes.map((size) => size.replace(/R(\d)/, ' R$1')).join(', ')}.` : ''}`,
    faqBoltQ: (v) => `${v.make} ${v.model} bijon aralığı nedir?`,
    faqBoltA: (v) => `Araç: ${v.make} ${v.model}. Bijon aralığı: ${v.boltPattern} (${v.lugCount} ${v.fastenerType === 'lug-nut' ? 'bijon somunu' : 'bijon cıvatası'}).`,
    faqTorqueQ: (v) => `${v.make} ${v.model} bijon sıkma torku nedir?`,
    faqTorqueA: (v) => {
      const torque = torquePresentation(v, 'tr');
      return v.torqueNm === undefined
        ? `Atlas’ta henüz şu araç için belgelenmiş bir sıkma torku yok: ${v.make} ${v.model}. Aracın kullanım kılavuzuna bakın.`
        : `Atlas, şu araç için referans sıkma torku olarak ${torque.value} değerini veriyor: ${v.make} ${v.model}. ${torque.qualifier ?? 'Bijonları sıkmadan önce değeri kullanım kılavuzunda doğrulayın.'}`;
    },
    hubTitle: 'Araçlara göre uyum referansı',
    hubDescription: 'Yaygın araçlar için referans lastik ebadı, bijon aralığı, göbek çapı ve sıkma torku; kaynaklar ve güven düzeyiyle birlikte.',
    hubLead: 'Referans lastik ebadını, bijon aralığını, jant ölçüsünü ve sıkma torkunu görmek için bir araç seçin — her değer kaynağı ve güven düzeyiyle birlikte.',
    hubUsMarket: 'ABD pazarı',
    hubEuMarket: 'Avrupa pazarı',
    breadcrumbHome: 'Ana sayfa',
    breadcrumbVehicles: 'Araçlar',
    title: (v) => metaTitle(v, META['tr']),
    description: (v) => metaDescription(v, 'tr', META['tr']),
    market: 'Pazar',
  },
};
