/** Per-make bolt pattern charts built from the ANKUSI wheel records in src/data/cars.ts. */
import { type CarMake, type CarModel, carMakes, frequent } from '../data/cars';
import { boltMakeText } from '../content/bolt-make-text';
import { boltPatternPageText } from '../content/entity-page-text';
import { entityAlternates, entityDetailPath, entityHubPath, type EntityLocale } from '../seo/entity-routes';
import { homePath, type EntityPageMeta } from './entity-page-model';

export interface BoltMakeRow {
  readonly model: CarModel;
  readonly years: string;
  readonly pcds: readonly string[];
  readonly bores: readonly number[];
  readonly factory: string | undefined;
  readonly max: string | undefined;
}

export interface BoltMake { readonly make: string; readonly makeSlug: string; readonly rows: readonly BoltMakeRow[]; readonly top: readonly string[]; }

export const boltMakes: readonly BoltMake[] = Object.freeze(carMakes
  .filter((make: CarMake) => make.models.some((model) => model.wheels.length > 0))
  .map((make) => {
    const rows = make.models.filter((model) => model.wheels.length > 0).map((model) => {
      const years = model.wheels.flatMap((w) => [w[1], w[2]]).filter((y): y is number => y !== null);
      return {
        model,
        years: years.length ? (Math.min(...years) === Math.max(...years) ? String(years[0]) : `${Math.min(...years)}–${Math.max(...years)}`) : '—',
        pcds: frequent(model.wheels.map((w) => w[4])),
        bores: frequent(model.wheels.map((w) => w[5])),
        factory: frequent(model.wheels.map((w) => w[8]))[0],
        max: frequent(model.wheels.map((w) => w[10]))[0],
      };
    });
    return { make: make.make, makeSlug: make.makeSlug, rows: Object.freeze(rows), top: frequent(make.models.flatMap((model) => model.wheels.map((w) => w[4]))).slice(0, 3) };
  }));

const bySlug = new Map(boltMakes.map((make) => [make.makeSlug, make]));
export const boltMakeBySlug = (slug: string): BoltMake | undefined => bySlug.get(slug);

export function boltMakePath(locale: EntityLocale, makeSlug: string): string {
  return entityDetailPath('bolt-pattern', locale, makeSlug);
}

export function boltMakeMeta(make: BoltMake, locale: EntityLocale): EntityPageMeta {
  const t = boltMakeText[locale];
  const b = boltPatternPageText[locale];
  const pathname = boltMakePath(locale, make.makeSlug);
  const title = t.title(make.make);
  return Object.freeze({
    title: title.length <= 58 ? title : t.h1(make.make).slice(0, 58),
    description: t.description(make.make, make.rows.length, make.top.join(', ') || '—').slice(0, 180),
    pathname,
    alternates: entityAlternates('bolt-pattern', make.makeSlug),
    breadcrumbs: Object.freeze([
      { name: b.breadcrumbHome, href: homePath(locale) },
      { name: b.breadcrumbHub, href: entityHubPath('bolt-pattern', locale) },
      { name: make.make, href: pathname },
    ]),
  });
}

/** Makes and models recorded with a bolt pattern, for the bolt-pattern detail page. */
export function makesUsingPattern(pcd: string): readonly { readonly make: BoltMake; readonly models: readonly string[] }[] {
  return boltMakes
    .map((make) => ({ make, models: make.rows.filter((row) => row.pcds.includes(pcd)).map((row) => row.model.model) }))
    .filter((entry) => entry.models.length > 0)
    .sort((a, b) => b.models.length - a.models.length || a.make.make.localeCompare(b.make.make));
}
