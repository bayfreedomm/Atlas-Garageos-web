import type { VehicleFitment } from '../data/vehicle-fitment';
import { torquePresentation } from '../ui/vehicle-torque';

export type VehicleLocale = 'en' | 'de' | 'es';

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
}

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
    faqTireA: (v) => `A ${v.make} ${v.model} (${v.generation}) commonly comes with ${v.tireSize} tires on a ${v.wheelSize} wheel. Trims vary, so check your door-jamb sticker for your exact vehicle.`,
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
    faqTireA: (v) => `Ein ${v.make} ${v.model} (${v.generation}) wird üblicherweise mit ${v.tireSize} Reifen auf einer ${v.wheelSize}-Felge ausgeliefert. Je nach Ausstattung kann es Abweichungen geben — prüfen Sie den Aufkleber an der Fahrertür für Ihr genaues Fahrzeug.`,
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
    faqTireA: (v) => `Un ${v.make} ${v.model} (${v.generation}) suele llevar neumáticos ${v.tireSize} sobre una llanta ${v.wheelSize}. Puede variar según el acabado — consulte la etiqueta del pilar de la puerta de su vehículo concreto.`,
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
  },
};
