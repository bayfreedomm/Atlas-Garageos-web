import type { ToolId } from '../seo/tool-registry';

export const LOCALE_CODES = ['en', 'de', 'es', 'pt-br', 'fr'] as const;
export type AtlasLocale = (typeof LOCALE_CODES)[number];

export interface LocaleDefinition {
  readonly code: AtlasLocale;
  readonly htmlLang: string;
  readonly hreflang: string;
  readonly label: string;
  readonly nativeLabel: string;
  readonly firstWave: boolean;
  readonly published: boolean;
}

export const localeDefinitions: Readonly<Record<AtlasLocale, LocaleDefinition>> = Object.freeze({
  en: { code: 'en', htmlLang: 'en', hreflang: 'en', label: 'English', nativeLabel: 'English', firstWave: true, published: true },
  de: { code: 'de', htmlLang: 'de', hreflang: 'de', label: 'German', nativeLabel: 'Deutsch', firstWave: true, published: true },
  es: { code: 'es', htmlLang: 'es', hreflang: 'es', label: 'Spanish', nativeLabel: 'Español', firstWave: true, published: true },
  'pt-br': { code: 'pt-br', htmlLang: 'pt-BR', hreflang: 'pt-BR', label: 'Brazilian Portuguese', nativeLabel: 'Português (Brasil)', firstWave: true, published: false },
  fr: { code: 'fr', htmlLang: 'fr', hreflang: 'fr', label: 'French', nativeLabel: 'Français', firstWave: true, published: false },
});

const localizedToolSlugs: Readonly<Record<AtlasLocale, Readonly<Record<ToolId, string>>>> = Object.freeze({
  en: {
    'fitment-studio': 'fitment-studio', 'tire-size-calculator': 'tire-size-calculator', 'tire-size-comparison': 'tire-size-comparison', 'wheel-offset-calculator': 'wheel-offset-calculator', 'speedometer-error-calculator': 'speedometer-error-calculator', 'gear-ratio-calculator': 'gear-ratio-calculator', 'fitment-map': 'fitment-map', 'measure-my-car': 'measure-my-car', 'fuel-cost-calculator': 'fuel-cost-calculator', 'road-trip-cost-calculator': 'road-trip-cost-calculator', 'mpg-l100km-converter': 'mpg-l100km-converter', 'psi-bar-converter': 'psi-bar-converter', 'hp-kw-converter': 'hp-kw-converter', 'nm-lb-ft-converter': 'nm-lb-ft-converter', 'power-to-weight-calculator': 'power-to-weight-calculator', 'ev-charging-cost-calculator': 'ev-charging-cost-calculator',
    'bolt-pattern-calculator': 'bolt-pattern-calculator', 'towing-capacity-calculator': 'towing-capacity-calculator', 'quarter-mile-calculator': 'quarter-mile-calculator', 'tire-load-speed-rating': 'tire-load-speed-rating', 'compression-ratio-calculator': 'compression-ratio-calculator', 'tire-date-code-decoder': 'tire-date-code-decoder', 'vehicle-fitment-finder': 'find-my-vehicle', 'gas-prices-today': 'gas-prices-today',
  },
  de: {
    'fitment-studio': 'felgen-reifen-vergleich', 'tire-size-calculator': 'reifengroesse-rechner', 'tire-size-comparison': 'reifenrechner-vergleich', 'wheel-offset-calculator': 'felgen-et-rechner', 'speedometer-error-calculator': 'tachoabweichung-rechner', 'gear-ratio-calculator': 'uebersetzungsrechner', 'fitment-map': 'felgen-et-karte', 'measure-my-car': 'freigang-messen', 'fuel-cost-calculator': 'spritkostenrechner', 'road-trip-cost-calculator': 'fahrtkostenrechner', 'mpg-l100km-converter': 'mpg-l100km-umrechner', 'psi-bar-converter': 'psi-bar-umrechner', 'hp-kw-converter': 'ps-kw-umrechner', 'nm-lb-ft-converter': 'nm-lb-ft-umrechner', 'power-to-weight-calculator': 'leistungsgewicht-rechner', 'ev-charging-cost-calculator': 'ladekosten-rechner',
    'bolt-pattern-calculator': 'lochkreis-rechner', 'towing-capacity-calculator': 'anhaengelast-rechner', 'quarter-mile-calculator': 'viertelmeile-rechner', 'tire-load-speed-rating': 'reifen-tragfaehigkeit-geschwindigkeitsindex', 'compression-ratio-calculator': 'verdichtungsverhaeltnis-rechner', 'tire-date-code-decoder': 'reifen-dot-code-decoder', 'vehicle-fitment-finder': 'fahrzeug-finden', 'gas-prices-today': 'kraftstoffpreise',
  },
  es: {
    'fitment-studio': 'comparador-llantas-neumaticos', 'tire-size-calculator': 'calculadora-tamano-neumaticos', 'tire-size-comparison': 'comparador-neumaticos', 'wheel-offset-calculator': 'calculadora-offset-llantas', 'speedometer-error-calculator': 'calculadora-error-velocimetro', 'gear-ratio-calculator': 'calculadora-relacion-transmision', 'fitment-map': 'mapa-offset-llantas', 'measure-my-car': 'medir-holgura-coche', 'fuel-cost-calculator': 'calculadora-coste-combustible', 'road-trip-cost-calculator': 'calculadora-coste-viaje', 'mpg-l100km-converter': 'convertidor-mpg-l100km', 'psi-bar-converter': 'convertidor-psi-bar', 'hp-kw-converter': 'convertidor-hp-kw', 'nm-lb-ft-converter': 'convertidor-nm-lb-ft', 'power-to-weight-calculator': 'calculadora-relacion-peso-potencia', 'ev-charging-cost-calculator': 'calculadora-coste-carga-coche-electrico',
    'bolt-pattern-calculator': 'calculadora-patron-birlos', 'towing-capacity-calculator': 'calculadora-capacidad-remolque', 'quarter-mile-calculator': 'calculadora-cuarto-milla', 'tire-load-speed-rating': 'indice-carga-velocidad-neumatico', 'compression-ratio-calculator': 'calculadora-relacion-compresion', 'tire-date-code-decoder': 'decodificador-fecha-neumatico', 'vehicle-fitment-finder': 'encontrar-mi-vehiculo', 'gas-prices-today': 'precio-gasolina-hoy',
  },
  'pt-br': {
    'fitment-studio': 'comparador-rodas-pneus', 'tire-size-calculator': 'calculadora-tamanho-pneus', 'tire-size-comparison': 'comparador-pneus', 'wheel-offset-calculator': 'calculadora-offset-rodas', 'speedometer-error-calculator': 'calculadora-erro-velocimetro', 'gear-ratio-calculator': 'calculadora-relacao-marchas', 'fitment-map': 'mapa-offset-rodas', 'measure-my-car': 'medir-folga-carro', 'fuel-cost-calculator': 'calculadora-gasto-combustivel', 'road-trip-cost-calculator': 'calculadora-custo-viagem', 'mpg-l100km-converter': 'conversor-mpg-l100km', 'psi-bar-converter': 'conversor-psi-bar', 'hp-kw-converter': 'conversor-hp-kw', 'nm-lb-ft-converter': 'conversor-nm-lb-ft', 'power-to-weight-calculator': 'calculadora-peso-potencia', 'ev-charging-cost-calculator': 'calculadora-custo-recarga-eletrica',
    'bolt-pattern-calculator': 'bolt-pattern-calculator', 'towing-capacity-calculator': 'towing-capacity-calculator', 'quarter-mile-calculator': 'quarter-mile-calculator', 'tire-load-speed-rating': 'tire-load-speed-rating', 'compression-ratio-calculator': 'compression-ratio-calculator', 'tire-date-code-decoder': 'tire-date-code-decoder', 'vehicle-fitment-finder': 'encontrar-meu-veiculo', 'gas-prices-today': 'precos-combustiveis-hoje',
  },
  fr: {
    'fitment-studio': 'comparateur-jantes-pneus', 'tire-size-calculator': 'calculateur-taille-pneus', 'tire-size-comparison': 'comparateur-taille-pneus', 'wheel-offset-calculator': 'calculateur-deport-jante', 'speedometer-error-calculator': 'calculateur-erreur-compteur', 'gear-ratio-calculator': 'calculateur-rapport-transmission', 'fitment-map': 'carte-deport-jante', 'measure-my-car': 'mesurer-degagement-roue', 'fuel-cost-calculator': 'calculateur-cout-carburant', 'road-trip-cost-calculator': 'calculateur-cout-trajet', 'mpg-l100km-converter': 'convertisseur-mpg-l100km', 'psi-bar-converter': 'convertisseur-psi-bar', 'hp-kw-converter': 'convertisseur-ch-kw', 'nm-lb-ft-converter': 'convertisseur-nm-lb-ft', 'power-to-weight-calculator': 'calculateur-rapport-poids-puissance', 'ev-charging-cost-calculator': 'calculateur-cout-recharge-electrique',
    'bolt-pattern-calculator': 'bolt-pattern-calculator', 'towing-capacity-calculator': 'towing-capacity-calculator', 'quarter-mile-calculator': 'quarter-mile-calculator', 'tire-load-speed-rating': 'tire-load-speed-rating', 'compression-ratio-calculator': 'compression-ratio-calculator', 'tire-date-code-decoder': 'tire-date-code-decoder', 'vehicle-fitment-finder': 'trouver-mon-vehicule', 'gas-prices-today': 'prix-carburants-aujourdhui',
  },
});

export function localeFor(code: AtlasLocale): LocaleDefinition { return localeDefinitions[code]; }
export function localizedToolSlug(locale: AtlasLocale, id: ToolId): string { return localizedToolSlugs[locale][id]; }
export function localizedToolPath(locale: AtlasLocale, id: ToolId, kind: 'flagship' | 'tool' | 'data-product'): string {
  const slug = localizedToolSlug(locale, id);
  const prefix = locale === 'en' ? '' : `/${locale}`;
  // Calculators live under /<locale>/tools/; the flagship app and data products (e.g. the
  // fuel market dashboard at /de/kraftstoffpreise/) own a top-level localized route.
  return kind === 'tool' ? `${prefix}/tools/${slug}/` : `${prefix}/${slug}/`;
}
export function publishedLocales(): readonly AtlasLocale[] { return LOCALE_CODES.filter((code) => localeDefinitions[code].published); }
