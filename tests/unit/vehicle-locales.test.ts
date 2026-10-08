import { describe, expect, it } from 'vitest';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { vehiclePageText } from '../../src/content/vehicle-page-text';
import { vehicleAlternates, vehicleHubPath, vehicleLink, vehiclePagePath } from '../../src/ui/entity-page-model';
import { sitemapEntries } from '../../src/seo/sitemap';

const LOCALES = ['en', 'de', 'es', 'fr'] as const;

describe('vehicles in every language', () => {
  it('publishes every vehicle in EN, DE, ES and FR with reciprocal hreflang', () => {
    const urls = new Set(sitemapEntries());
    for (const vehicle of vehicleFitmentData) {
      for (const locale of LOCALES) expect(urls.has(`https://atlasgarageos.com${vehiclePagePath(locale, vehicle.id)}`), `${vehicle.id} ${locale}`).toBe(true);
    }
    expect(vehicleAlternates('vw-golf').map((alt) => alt.hreflang)).toEqual(['en', 'de', 'es', 'fr', 'x-default']);
    expect(vehicleHubPath('fr')).toBe('/fr/vehicules/');
    expect(urls.has('https://atlasgarageos.com/fr/vehicules/')).toBe(true);
  });

  it('keeps vehicle links in the reader\'s language', () => {
    const golf = vehicleFitmentData.find((vehicle) => vehicle.id === 'vw-golf')!;
    expect(vehicleLink(golf, 'en')).toMatchObject({ href: '/vehicles/vw-golf/', crossLocale: false });
    expect(vehicleLink(golf, 'fr')).toMatchObject({ href: '/fr/vehicules/vw-golf/', crossLocale: false });
  });

  it('keeps every vehicle title and description within the audit budget', () => {
    for (const vehicle of vehicleFitmentData) {
      for (const locale of LOCALES) {
        const t = vehiclePageText[locale];
        expect(`${t.title(vehicle)} — Atlas GarageOS`.replace(/&/g, '&amp;').length, `${vehicle.id} ${locale}`).toBeLessThanOrEqual(75);
        expect(t.description(vehicle).length, `${vehicle.id} ${locale}`).toBeLessThanOrEqual(180);
      }
    }
  });
});
