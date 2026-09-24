import { localizedToolPath } from '../localization/locales';
import { localizedTool, type ContentLocale } from '../localization/site-catalog';
import { toolById, type ToolId } from '../seo/tool-registry';
import type { DecisionGraphModel } from './decision-graph';

type NextStep = Readonly<{ tool: ToolId; en: string; de: string; es: string }>;

// The recommendation answers a concrete follow-up question for each tool.
// Supporting links are the existing crawlable topic cluster, not safety claims.
const NEXT: Readonly<Record<ToolId, NextStep>> = {
  'fitment-studio': { tool: 'measure-my-car', en: 'Replace assumptions with your vehicle’s measured inner and outer gaps.', de: 'Ersetzen Sie Annahmen durch gemessene innere und äußere Abstände.', es: 'Sustituya suposiciones por holguras interiores y exteriores medidas.' },
  'tire-size-calculator': { tool: 'tire-size-comparison', en: 'Put this size beside your current tire to see what actually changes.', de: 'Vergleichen Sie diese Größe mit dem aktuellen Reifen.', es: 'Compare esta medida con el neumático actual.' },
  'tire-fit-check': { tool: 'measure-my-car', en: 'Geometry is only half the answer: measure the real gaps on your car before buying.', de: 'Geometrie ist nur die halbe Antwort: Messen Sie vor dem Kauf die echten Abstände an Ihrem Auto.', es: 'La geometría es solo la mitad de la respuesta: mida las holguras reales de su coche antes de comprar.' },
  'tire-size-comparison': { tool: 'speedometer-error-calculator', en: 'Check the theoretical speed effect of the diameter change.', de: 'Prüfen Sie die theoretische Tachoabweichung.', es: 'Compruebe el efecto teórico en el velocímetro.' },
  'wheel-offset-calculator': { tool: 'measure-my-car', en: 'Measure real inner and outer gaps before interpreting wheel movement as clearance.', de: 'Messen Sie reale Innen- und Außenabstände vor einer Freigangbewertung.', es: 'Mida las holguras reales antes de interpretar el movimiento como espacio disponible.' },
  'speedometer-error-calculator': { tool: 'wheel-offset-calculator', en: 'The speed calculation covers tire diameter; check the wheel’s inner and outer position separately.', de: 'Die Tacho-Rechnung betrifft den Reifendurchmesser; prüfen Sie die Radposition getrennt.', es: 'El cálculo de velocidad trata el diámetro; compruebe por separado la posición de la llanta.' },
  'gear-ratio-calculator': { tool: 'speedometer-error-calculator', en: 'The same tire diameter change also changes the theoretical speed reading.', de: 'Dieselbe Durchmesseränderung beeinflusst auch die theoretische Tachoanzeige.', es: 'El mismo cambio de diámetro también afecta la lectura teórica de velocidad.' },
  'fitment-map': { tool: 'measure-my-car', en: 'Map cells gain meaning only when compared with actual vehicle measurements.', de: 'Kartenfelder werden erst mit echten Fahrzeugmessungen aussagekräftig.', es: 'El mapa cobra sentido al compararlo con medidas reales del vehículo.' },
  'measure-my-car': { tool: 'fitment-studio', en: 'Use your measured gaps with the exact current setup to project a proposed change.', de: 'Nutzen Sie gemessene Abstände mit dem tatsächlichen Ausgangssetup.', es: 'Use sus holguras medidas con la configuración actual exacta.' },
  'fuel-cost-calculator': { tool: 'road-trip-cost-calculator', en: 'Add a return leg, extras and passengers to turn fuel cost into a complete trip budget.', de: 'Ergänzen Sie Rückfahrt, Extras und Mitfahrer zum vollständigen Reisebudget.', es: 'Añada regreso, extras y pasajeros para obtener el presupuesto completo.' },
  'road-trip-cost-calculator': { tool: 'fuel-cost-calculator', en: 'Isolate fuel use and price when you need to understand the fuel portion.', de: 'Betrachten Sie Verbrauch und Preis separat, um den Kraftstoffanteil zu verstehen.', es: 'Separe consumo y precio para entender el coste de combustible.' },
  'ev-charging-cost-calculator': { tool: 'road-trip-cost-calculator', en: 'Plan the wider trip separately; charging cost alone does not model an EV route.', de: 'Planen Sie die gesamte Fahrt getrennt; Ladekosten allein modellieren keine EV-Route.', es: 'Planifique el viaje por separado; el coste de carga no modela una ruta EV.' },
  'mpg-l100km-converter': { tool: 'fuel-cost-calculator', en: 'Use the converted consumption with real distance and a price to estimate cost.', de: 'Nutzen Sie den umgerechneten Verbrauch mit Strecke und Preis für eine Kostenschätzung.', es: 'Use el consumo convertido con distancia y precio para estimar el coste.' },
  'psi-bar-converter': { tool: 'tire-load-speed-rating', en: 'A pressure conversion is not a pressure recommendation; check the tire and vehicle requirements.', de: 'Eine Druckumrechnung ist keine Druckempfehlung; prüfen Sie Reifen- und Fahrzeugvorgaben.', es: 'Convertir presión no es recomendarla; compruebe los requisitos del neumático y vehículo.' },
  'hp-kw-converter': { tool: 'power-to-weight-calculator', en: 'Combine verified power with vehicle weight to understand the ratio.', de: 'Kombinieren Sie belegte Leistung und Fahrzeuggewicht zum Verhältnis.', es: 'Combine potencia verificada y peso para entender la relación.' },
  'nm-lb-ft-converter': { tool: 'hp-kw-converter', en: 'Torque and power describe different things; convert power separately.', de: 'Drehmoment und Leistung sind verschieden; rechnen Sie Leistung getrennt um.', es: 'Par y potencia son magnitudes distintas; convierta potencia por separado.' },
  'power-to-weight-calculator': { tool: 'quarter-mile-calculator', en: 'Explore a separate quarter-mile estimate without treating the ratio as a measured run.', de: 'Erkunden Sie eine separate Viertelmeilen-Schätzung, nicht einen gemessenen Lauf.', es: 'Explore una estimación de cuarto de milla, no una medición real.' },
  'bolt-pattern-calculator': { tool: 'vehicle-fitment-finder', en: 'Compare the calculated PCD with a documented vehicle reference; PCD alone is not fitment.', de: 'Vergleichen Sie den Lochkreis mit einer dokumentierten Fahrzeugreferenz.', es: 'Compare el PCD con una referencia de vehículo documentada.' },
  'tire-load-speed-rating': { tool: 'tire-date-code-decoder', en: 'After checking the sidewall rating, read the manufacturing date as a separate fact.', de: 'Prüfen Sie nach der Flankenkennung das Herstellungsdatum separat.', es: 'Tras comprobar la clasificación, lea por separado la fecha de fabricación.' },
  'tire-date-code-decoder': { tool: 'tire-load-speed-rating', en: 'Manufacturing date does not tell you the tire’s load or speed capability.', de: 'Das Herstellungsdatum sagt nichts über Traglast und Geschwindigkeitskennung.', es: 'La fecha no indica la capacidad de carga ni la velocidad del neumático.' },
  'towing-capacity-calculator': { tool: 'road-trip-cost-calculator', en: 'Budget the journey separately; a weight estimate is not a towing approval.', de: 'Planen Sie Fahrtkosten getrennt; eine Gewichtsschätzung ist keine Anhängerfreigabe.', es: 'Presupueste el viaje por separado; una estimación de peso no es homologación.' },
  'quarter-mile-calculator': { tool: 'power-to-weight-calculator', en: 'Inspect the underlying power-to-weight ratio behind the estimate.', de: 'Prüfen Sie das Leistungsgewicht hinter der Schätzung.', es: 'Examine la relación peso-potencia detrás de la estimación.' },
  'compression-ratio-calculator': { tool: 'power-to-weight-calculator', en: 'Compression ratio does not determine engine output; calculate verified power separately.', de: 'Verdichtung bestimmt nicht allein die Motorleistung; berechnen Sie belegte Leistung separat.', es: 'La compresión no determina la potencia; calcule por separado la potencia verificada.' },
  'vehicle-fitment-finder': { tool: 'tire-size-comparison', en: 'Use a documented reference size as the baseline for a proposed tire change.', de: 'Nutzen Sie eine belegte Referenzgröße als Ausgangspunkt für den Vergleich.', es: 'Use una medida documentada como base para comparar un cambio.' },
  'gas-prices-today': { tool: 'fuel-cost-calculator', en: 'Turn a published market price into a cost using your real consumption.', de: 'Machen Sie aus einem Marktpreis mit Ihrem realen Verbrauch konkrete Kosten.', es: 'Convierta un precio publicado en coste usando su consumo real.' },
};

const COPY = {
  en: { eyebrow: 'Decision path', heading: 'Your next useful check', intro: 'Continue from this result. Atlas keeps separate questions separate instead of turning one number into a fitment or safety verdict.', support: 'Other relevant tools', supportDetail: 'Explore the related calculation.' },
  de: { eyebrow: 'Entscheidungsweg', heading: 'Die nächste sinnvolle Prüfung', intro: 'Gehen Sie vom Ergebnis aus weiter. Eine einzelne Zahl ist keine Passform- oder Sicherheitsfreigabe.', support: 'Weitere passende Werkzeuge', supportDetail: 'Zugehörige Berechnung öffnen.' },
  es: { eyebrow: 'Ruta de decisión', heading: 'La siguiente comprobación útil', intro: 'Continúe desde este resultado. Una cifra por sí sola no confirma ajuste ni seguridad.', support: 'Otras herramientas relacionadas', supportDetail: 'Explorar el cálculo relacionado.' },
} as const;

export function toolNextDecision(id: ToolId, locale: 'en' | ContentLocale): DecisionGraphModel {
  const source = toolById(id);
  const next = NEXT[id];
  const target = toolById(next.tool);
  const copy = COPY[locale];
  const href = (toolId: ToolId): string => {
    // The Fitment Studio flagship app now has a published route per locale, but it keeps the
    // same unprefixed slug in every locale (unlike calculators, which get a fully localized
    // slug from localizedToolPath) — so it needs its own locale-prefix-only path here.
    if (toolId === 'fitment-studio') return locale === 'en' ? '/fitment-studio/' : `/${locale}/fitment-studio/`;
    const tool = toolById(toolId);
    return localizedToolPath(locale, toolId, tool.kind);
  };
  const title = (toolId: ToolId): string => (locale === 'en' ? toolById(toolId).title : localizedTool(toolId, locale).title);
  const supporting = source.relatedToolIds.filter((relatedId) => relatedId !== next.tool).slice(0, 2);
  return Object.freeze({
    eyebrow: copy.eyebrow,
    heading: copy.heading,
    intro: copy.intro,
    actions: Object.freeze([{ id: `next-${next.tool}`, href: href(next.tool), title: title(target.id), detail: next[locale] }]),
    supportingActions: Object.freeze(supporting.map((relatedId) => ({ id: `support-${relatedId}`, href: href(relatedId), title: title(relatedId), detail: copy.supportDetail }))),
  });
}
