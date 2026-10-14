/**
 * Localized /cars/ family: the wheel-fitment view (bolt pattern, center bore, wheel and tire
 * sizes) of every car model that has ANKUSI wheel data, in every entity locale.
 *
 * English keeps its own /cars/ pages (EPA fuel economy first). The other languages get a model
 * page only when there is wheel data, because that is what people search for there
 * ("megane 4 bijon aralığı", "corsa f lochkreis"); EPA-only U.S. models stay English-only.
 * Server-only: it reads the 8 MB cars dataset.
 */
import { carLocaleText } from '../content/car-locale-text';
import { type CarMake, type CarModel, carMakePath, carMakes, carModelPath, frequent, newestFirst, publishedCarModels } from '../data/cars';
import { carName, fit, fitDescription } from './car-pages';
import { entityHreflang, entityLocales, type EntityLocale, type HreflangAlternate } from '../seo/entity-routes';

const SITE = 'https://atlasgarageos.com';

/** Localized path segment of the car directory. */
export const CAR_SEGMENT: Readonly<Record<EntityLocale, string>> = Object.freeze({
  en: 'cars', de: 'autos', es: 'coches', fr: 'voitures', it: 'auto', 'pt-br': 'carros', pl: 'samochody', nl: 'autos', tr: 'otomobil',
});

/** Whether this model has a page in the non-English locales. */
export const hasLocalizedModelPage = (model: CarModel): boolean => model.wheels.length > 0;

/** Models published in every non-English locale. */
export const localizedCarModels: readonly CarModel[] = Object.freeze(publishedCarModels.filter(hasLocalizedModelPage));

const localizedKeys = new Set(localizedCarModels.map((model) => `${model.makeSlug}/${model.modelSlug}`));
export const isLocalizedModel = (model: CarModel): boolean => localizedKeys.has(`${model.makeSlug}/${model.modelSlug}`);

/** Makes with at least one localized model, each with only its localized models. */
export const localizedCarMakes: readonly CarMake[] = Object.freeze(carMakes
  .map((make) => ({ ...make, models: Object.freeze(make.models.filter(isLocalizedModel)) }))
  .filter((make) => make.models.length > 0));

const localizedMakeSlugs = new Set(localizedCarMakes.map((make) => make.makeSlug));
export const isLocalizedMake = (makeSlug: string): boolean => localizedMakeSlugs.has(makeSlug);

export const carHubPathFor = (locale: EntityLocale): string => (locale === 'en' ? '/cars/' : `/${locale}/${CAR_SEGMENT[locale]}/`);
export const carMakePathFor = (locale: EntityLocale, makeSlug: string): string => (locale === 'en' ? carMakePath(makeSlug) : `${carHubPathFor(locale)}${makeSlug}/`);
export const carModelPathFor = (locale: EntityLocale, model: CarModel): string => (locale === 'en' ? carModelPath(model) : `${carMakePathFor(locale, model.makeSlug)}${model.modelSlug}/`);

/** Best available model link for a locale: localized page if it exists, otherwise English. */
export function carModelLinkFor(locale: EntityLocale, model: CarModel): { readonly href: string; readonly crossLocale: boolean } {
  if (locale === 'en' || !isLocalizedModel(model)) return { href: carModelPath(model), crossLocale: locale !== 'en' };
  return { href: carModelPathFor(locale, model), crossLocale: false };
}

function cluster(pathFor: (locale: EntityLocale) => string, localized: boolean): readonly HreflangAlternate[] {
  const locales = localized ? entityLocales() : (['en'] as const);
  return Object.freeze([
    ...locales.map((locale) => ({ hreflang: entityHreflang(locale), href: `${SITE}${pathFor(locale)}` })),
    { hreflang: 'x-default', href: `${SITE}${pathFor('en')}` },
  ]);
}

export const carHubAlternates = (): readonly HreflangAlternate[] => cluster(carHubPathFor, true);
export const carMakeAlternates = (makeSlug: string): readonly HreflangAlternate[] => cluster((locale) => carMakePathFor(locale, makeSlug), isLocalizedMake(makeSlug));
export const carModelAlternates = (model: CarModel): readonly HreflangAlternate[] => cluster((locale) => carModelPathFor(locale, model), isLocalizedModel(model));

/** Every localized car route (hub, makes, models) for the sitemap. */
export function localizedCarRoutes(): readonly string[] {
  const routes: string[] = [];
  for (const locale of entityLocales()) {
    if (locale === 'en') continue;
    routes.push(carHubPathFor(locale));
    for (const make of localizedCarMakes) routes.push(carMakePathFor(locale, make.makeSlug));
    for (const model of localizedCarModels) routes.push(carModelPathFor(locale, model));
  }
  return routes;
}

/** Title and meta description of a localized model page. */
export function carModelLocaleMeta(model: CarModel, locale: EntityLocale): { readonly title: string; readonly description: string } {
  const t = carLocaleText[locale];
  const name = carName(model);
  const pcd = newestFirst(model.wheels, (row) => row[4]).slice(0, 2).join(' / ');
  const years = model.wheels.flatMap((row) => [row[1], row[2]]).filter((year): year is number => year !== null && year > 0);
  const span = years.length ? (Math.min(...years) === Math.max(...years) ? String(Math.min(...years)) : `${Math.min(...years)}–${Math.max(...years)}`) : '';
  const tires = frequent(model.wheels.flatMap((row) => [...(row[11] ?? '').matchAll(/(\d{3})\/(\d{2})\s?Z?R\s?(\d{2}(?:\.5)?)/g)].map((m) => `${m[1]}/${m[2]} R${m[3]}`))).slice(0, 2).join(', ');
  return { title: fit(t.modelTitles(name)), description: fitDescription(t.modelDescription(name, pcd || '—', span, tires)) };
}

/** Title and meta description of a localized make page. */
export function carMakeLocaleMeta(make: CarMake, locale: EntityLocale): { readonly title: string; readonly description: string } {
  const t = carLocaleText[locale];
  return { title: fit(t.makeTitles(make.make)), description: fitDescription(t.makeDescription(make.make, make.models.length)) };
}
