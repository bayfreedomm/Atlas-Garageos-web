import { tireComparisonPairs } from '../../src/data/tire-comparisons';
import { describe, expect, it } from 'vitest';
import decisionComponent from '../../src/components/DecisionGraph.astro?raw';
import tireComponent from '../../src/components/TireSizeEntity.astro?raw';
import boltComponent from '../../src/components/BoltPatternEntity.astro?raw';
import enVehiclePage from '../../src/pages/vehicles/[id].astro?raw';
import deVehiclePage from '../../src/pages/de/fahrzeuge/[id].astro?raw';
import esVehiclePage from '../../src/pages/es/vehiculos/[id].astro?raw';
import vehicleBody from '../../src/components/VehicleEntityBody.astro?raw';
import fuelActionPanel from '../../src/components/FuelActionPanel.astro?raw';
import { vehicleFitmentData } from '../../src/data/vehicle-fitment';
import { tireSizeCatalog } from '../../src/data/tire-size-catalog';
import { boltPatternCatalog } from '../../src/data/bolt-pattern-catalog';
import { entityLocales } from '../../src/seo/entity-routes';
import { sitemapEntries } from '../../src/seo/sitemap';
import { boltDecisionGraph, fuelDecisionGraph, tireDecisionGraph, vehicleDecisionGraph } from '../../src/ui/decision-graph';
import { tireDiameterGroups } from '../../src/ui/entity-page-model';
import { boltMakes } from '../../src/ui/bolt-make';

describe('shared automotive decision graph', () => {
  it('connects a vehicle to reference entities and every required calculator without inventing consumption', () => {
    const vehicle = vehicleFitmentData.find(({ id }) => id === 'toyota-corolla')!;
    const graph = vehicleDecisionGraph(vehicle, 'en');
    const actions = [...graph.actions, ...(graph.supportingActions ?? [])];
    expect(actions.map(({ id }) => id)).toEqual([
      'vehicle-tire', 'vehicle-bolt', 'vehicle-compare', 'vehicle-setup', 'vehicle-trip',
      'vehicle-tire-calculator', 'vehicle-tire-compare', 'vehicle-bolt-calculator', 'vehicle-fuel-cost',
    ]);
    expect(actions.find(({ id }) => id === 'vehicle-tire')?.href).toBe('/tire-sizes/205-55-r16/');
    expect(actions.find(({ id }) => id === 'vehicle-bolt')?.href).toBe('/bolt-patterns/5x100/');
    expect(actions.find(({ id }) => id === 'vehicle-compare')?.href).toBe('/vehicles/compare/?a=toyota-corolla');
    expect(actions.find(({ id }) => id === 'vehicle-tire-compare')?.href).toBe('/tools/tire-size-comparison/?current=205-55-16');
    expect(actions.find(({ id }) => id === 'vehicle-bolt-calculator')?.href).toMatch(/^\/tools\/bolt-pattern-calculator\/\?lugs=5&spacing=/);
    expect(actions.find(({ id }) => id === 'vehicle-fuel-cost')?.detail).toMatch(/does not invent/i);
  });

  it('localizes vehicle actions while preserving the same graph coverage', () => {
    const vehicle = vehicleFitmentData.find(({ id }) => id === 'vw-golf')!;
    const de = [...vehicleDecisionGraph(vehicle, 'de').actions, ...(vehicleDecisionGraph(vehicle, 'de').supportingActions ?? [])];
    const es = [...vehicleDecisionGraph(vehicle, 'es').actions, ...(vehicleDecisionGraph(vehicle, 'es').supportingActions ?? [])];
    expect(de).toHaveLength(9);
    expect(es).toHaveLength(9);
    expect(de.find(({ id }) => id === 'vehicle-tire')?.href).toBe('/de/reifengroessen/205-55-r16/');
    expect(es.find(({ id }) => id === 'vehicle-bolt')?.href).toBe('/es/patrones-birlos/5x112/');
    expect(de.find(({ id }) => id === 'vehicle-trip')?.href).toBe('/de/tools/fahrtkostenrechner/?vehicle=vw-golf');
    expect(es.find(({ id }) => id === 'vehicle-fuel-cost')?.href).toBe('/es/tools/calculadora-coste-combustible/');
  });

  it('prefills tire comparison safely and carries an explicit non-fitment warning', () => {
    const tire = tireSizeCatalog.find(({ notation }) => notation === '225/50R17')!;
    for (const locale of entityLocales()) {
      const graph = tireDecisionGraph(tire, locale);
      expect(graph.actions.find(({ id }) => id === 'tire-compare')?.href).toContain('?current=225-50-17');
      expect(graph.actions.find(({ id }) => id === 'tire-vehicles')?.href).toBe('#entity-vehicles');
      expect(graph.caution).toBeTruthy();
    }
    expect(tireDecisionGraph(tire, 'en').caution).toMatch(/load index.*speed rating.*rim width.*clearance.*OEM approval.*local regulations/i);
  });

  it('connects PCD data to vehicles, measurement, offset and wider setup checks', () => {
    const bolt = boltPatternCatalog.find(({ notation }) => notation === '5x112')!;
    const graph = boltDecisionGraph(bolt, 'en');
    expect(graph.actions.map(({ id }) => id)).toEqual(['bolt-vehicles', 'bolt-measure', 'bolt-offset', 'bolt-setup']);
    expect(graph.actions.find(({ id }) => id === 'bolt-measure')?.href).toBe('/tools/bolt-pattern-calculator/?lugs=5&spacing=65.83');
    expect(graph.actions.find(({ id }) => id === 'bolt-offset')?.href).toBe('/tools/wheel-offset-calculator/');
    expect(graph.caution).toMatch(/PCD match alone.*center bore.*offset.*wheel width.*brake clearance.*hardware/i);
  });

  it('turns every fuel market into practical cost actions without cross-market semantics', () => {
    expect(fuelDecisionGraph('en', 'Pending.').actions.map(({ href }) => href)).toEqual([
      '/tools/fuel-cost-calculator/', '/tools/road-trip-cost-calculator/', '/vehicles/',
    ]);
    expect(fuelDecisionGraph('de', 'Ausstehend.').actions.map(({ href }) => href)).toEqual([
      '/de/tools/spritkostenrechner/', '/de/tools/fahrtkostenrechner/', '/de/fahrzeuge/',
    ]);
    expect(fuelDecisionGraph('es', 'Pendiente.').actions.map(({ href }) => href)).toEqual([
      '/es/tools/calculadora-coste-combustible/', '/es/tools/calculadora-coste-viaje/', '/es/vehiculos/',
    ]);
  });

  it('renders crawlable HTML links through one component on every graph surface', () => {
    expect(decisionComponent).toContain('<a class="decision-action" href={item.href}');
    expect(decisionComponent).not.toContain('client:');
    for (const source of [enVehiclePage, deVehiclePage, esVehiclePage]) {
      expect(source).toContain('<VehicleEntityBody vehicle={vehicle} locale={LOCALE}');
    }
    expect(vehicleBody).toContain('vehicleDecisionGraph(vehicle, locale)');
    expect(vehicleBody).toContain('<DecisionGraph model={decisions}');
    expect(tireComponent).toContain('tireDecisionGraph(entry, locale)');
    expect(boltComponent).toContain('boltDecisionGraph(entry, locale)');
    expect(fuelActionPanel).toContain('fuelDecisionGraph(locale, note)');
  });
});

describe('decision graph route-count guard', () => {
  it('preserves the expanded sourced record and entity URL counts', () => {
    // Growth is expected (more sourced vehicles, C sizes); shrinking below the published
    // baseline is not. The URL count must always equal the catalog size in every locale.
    expect(vehicleFitmentData.length).toBeGreaterThanOrEqual(30);
    expect(tireSizeCatalog.length).toBeGreaterThanOrEqual(950);
    expect(boltPatternCatalog.length).toBeGreaterThanOrEqual(10);
    const entityUrls = sitemapEntries().filter((url) => /\/(tire-sizes|bolt-patterns|reifengroessen|lochkreise|medidas-neumaticos|patrones-birlos|dimensions-pneus|entraxes|misure-pneumatici|foratura-cerchi|medidas-pneus|furacao-rodas|rozmiary-opon|rozstaw-srub|bandenmaten|steekmaten|lastik-ebatlari|bijon-araligi)\//.test(url));
    const expected = entityLocales().length * (2 + tireSizeCatalog.length + tireDiameterGroups().length + boltPatternCatalog.length + boltMakes.length + tireComparisonPairs.length);
    expect(entityUrls.length).toBeGreaterThanOrEqual(1782);
    expect(entityUrls).toHaveLength(expected);
    expect(new Set(entityUrls)).toHaveLength(expected);
  });
});
