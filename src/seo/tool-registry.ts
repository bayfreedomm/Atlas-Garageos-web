export const SITE_ORIGIN = 'https://atlasgarageos.com';
export const SUPPORTED_LOCALES = ['en'] as const;
export type SiteLocale = (typeof SUPPORTED_LOCALES)[number];

export type ToolId = 'fitment-studio' | 'tire-size-calculator' | 'tire-size-comparison' | 'wheel-offset-calculator' | 'speedometer-error-calculator' | 'gear-ratio-calculator' | 'fitment-map' | 'measure-my-car' | 'fuel-cost-calculator' | 'road-trip-cost-calculator' | 'mpg-l100km-converter' | 'psi-bar-converter' | 'hp-kw-converter' | 'nm-lb-ft-converter' | 'power-to-weight-calculator';
export type ToolCategory = 'Tires & Wheels' | 'Fuel & Trips' | 'Converters' | 'Performance';

export const TOOL_CATEGORY_ORDER: readonly ToolCategory[] = Object.freeze(['Fuel & Trips', 'Tires & Wheels', 'Converters', 'Performance']);

export const platformPageRegistry = Object.freeze([
  { id: 'home', pathname: '/en/', title: 'Atlas GarageOS', description: 'Fast, accurate automotive calculators for tires, fuel, road trips, pressure, power, torque, and fitment.' },
  { id: 'tools-hub', pathname: '/en/tools/', title: 'Automotive Tools', description: 'Explore fast automotive tools for fuel costs, road trips, tires, wheels, pressure, power, torque, and fitment.' },
] as const);

export interface ToolDefinition {
  readonly id: ToolId;
  readonly slug: string;
  readonly locale: SiteLocale;
  readonly title: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly relatedToolIds: readonly ToolId[];
  readonly status: 'implemented';
  readonly indexable: true;
  readonly kind: 'flagship' | 'tool';
}

export const toolRegistry: readonly ToolDefinition[] = Object.freeze([
  { id: 'fitment-studio', slug: 'fitment-studio', locale: 'en', title: 'Fitment Studio', description: 'Compare tire and wheel geometry, measure real clearances, and explore fitment combinations.', category: 'Tires & Wheels', relatedToolIds: ['tire-size-comparison', 'wheel-offset-calculator', 'measure-my-car'], status: 'implemented', indexable: true, kind: 'flagship' },
  { id: 'tire-size-calculator', slug: 'tire-size-calculator', locale: 'en', title: 'Tire Size Calculator', description: 'Calculate tire sidewall, diameter, circumference, and revolutions from a metric tire size.', category: 'Tires & Wheels', relatedToolIds: ['tire-size-comparison', 'speedometer-error-calculator', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'tire-size-comparison', slug: 'tire-size-comparison', locale: 'en', title: 'Tire Size Comparison', description: 'Compare two tire sizes with transparent diameter, sidewall, circumference, and speedometer differences.', category: 'Tires & Wheels', relatedToolIds: ['tire-size-calculator', 'speedometer-error-calculator', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'wheel-offset-calculator', slug: 'wheel-offset-calculator', locale: 'en', title: 'Wheel Offset Calculator', description: 'Compare wheel width and offset to calculate inner-position and outer-poke changes.', category: 'Tires & Wheels', relatedToolIds: ['measure-my-car', 'fitment-map', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'speedometer-error-calculator', slug: 'speedometer-error-calculator', locale: 'en', title: 'Speedometer Error Calculator', description: 'Compare original and new tire diameters to estimate actual speed at a chosen indicated speed.', category: 'Tires & Wheels', relatedToolIds: ['tire-size-comparison', 'tire-size-calculator', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'gear-ratio-calculator', slug: 'gear-ratio-calculator', locale: 'en', title: 'Gear Ratio Calculator', description: 'Compare effective axle ratio after a tire diameter change and explore a transparent RPM matrix.', category: 'Performance', relatedToolIds: ['tire-size-calculator', 'speedometer-error-calculator', 'power-to-weight-calculator'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'fitment-map', slug: 'fitment-map', locale: 'en', title: 'Fitment Map', description: 'Understand the measurements, states, and controls used to explore wheel width and offset combinations.', category: 'Tires & Wheels', relatedToolIds: ['measure-my-car', 'wheel-offset-calculator', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'measure-my-car', slug: 'measure-my-car', locale: 'en', title: 'Measure My Car', description: 'Prepare and record real inner and outer clearance measurements for transparent fitment projections.', category: 'Tires & Wheels', relatedToolIds: ['wheel-offset-calculator', 'fitment-map', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'fuel-cost-calculator', slug: 'fuel-cost-calculator', locale: 'en', title: 'Fuel Cost Calculator', description: 'Estimate fuel required, total cost, and cost per distance in metric or US units.', category: 'Fuel & Trips', relatedToolIds: ['road-trip-cost-calculator', 'mpg-l100km-converter', 'tire-size-calculator'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'road-trip-cost-calculator', slug: 'road-trip-cost-calculator', locale: 'en', title: 'Road Trip Cost Calculator', description: 'Estimate one-way or return journey costs, optional extras, and the cost per person.', category: 'Fuel & Trips', relatedToolIds: ['fuel-cost-calculator', 'mpg-l100km-converter', 'tire-size-calculator'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'mpg-l100km-converter', slug: 'mpg-l100km-converter', locale: 'en', title: 'MPG to L/100km Converter', description: 'Convert US MPG, Imperial MPG, and L/100km with the gallon standards kept explicit.', category: 'Converters', relatedToolIds: ['fuel-cost-calculator', 'road-trip-cost-calculator', 'tire-size-calculator'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'psi-bar-converter', slug: 'psi-bar-converter', locale: 'en', title: 'PSI to Bar Converter', description: 'Convert pressure instantly between PSI, bar, and kilopascals without inventing a recommended pressure.', category: 'Converters', relatedToolIds: ['tire-size-calculator', 'tire-size-comparison', 'fitment-studio'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'hp-kw-converter', slug: 'hp-kw-converter', locale: 'en', title: 'HP to kW Converter', description: 'Convert mechanical horsepower and kilowatts with an explicit horsepower standard.', category: 'Converters', relatedToolIds: ['power-to-weight-calculator', 'nm-lb-ft-converter'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'nm-lb-ft-converter', slug: 'nm-lb-ft-converter', locale: 'en', title: 'Nm to lb-ft Converter', description: 'Convert torque instantly between newton-metres and pound-feet.', category: 'Converters', relatedToolIds: ['hp-kw-converter', 'power-to-weight-calculator'], status: 'implemented', indexable: true, kind: 'tool' },
  { id: 'power-to-weight-calculator', slug: 'power-to-weight-calculator', locale: 'en', title: 'Power-to-Weight Calculator', description: 'Compare power and vehicle weight as hp per tonne, kW per tonne, and watts per kilogram.', category: 'Performance', relatedToolIds: ['hp-kw-converter', 'nm-lb-ft-converter'], status: 'implemented', indexable: true, kind: 'tool' },
]);

export function routeForTool(tool: ToolDefinition): string {
  return tool.kind === 'flagship' ? `/${tool.locale}/${tool.slug}/` : `/${tool.locale}/tools/${tool.slug}/`;
}

export function canonicalForPath(pathname: string): string {
  const cleanPath = pathname.split('#', 1)[0]!.split('?', 1)[0]!;
  return new URL(cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`, SITE_ORIGIN).toString();
}

export function toolById(id: ToolId): ToolDefinition {
  const tool = toolRegistry.find((candidate) => candidate.id === id);
  if (!tool) throw new Error(`Unknown tool id: ${id}`);
  return tool;
}

export function relatedTools(tool: ToolDefinition): readonly ToolDefinition[] {
  return tool.relatedToolIds.map(toolById);
}

export const indexableRoutes = Object.freeze([
  ...platformPageRegistry.map(({ pathname }) => pathname),
  ...toolRegistry.filter((tool) => tool.indexable && tool.status === 'implemented').map(routeForTool),
]);

export interface SeoPageModel {
  readonly locale: SiteLocale;
  readonly pathname: string;
  readonly canonical: string;
  readonly indexable: boolean;
  readonly kind: 'tool' | 'tire-size' | 'comparison' | 'vehicle';
}

export function createSeoPageModel(input: Omit<SeoPageModel, 'canonical'>): SeoPageModel {
  if (!SUPPORTED_LOCALES.includes(input.locale)) throw new Error(`Unsupported locale: ${input.locale}`);
  if (!/^\/[a-z0-9/-]+\/$/.test(input.pathname)) throw new Error(`Invalid SEO pathname: ${input.pathname}`);
  return Object.freeze({ ...input, canonical: canonicalForPath(input.pathname) });
}
