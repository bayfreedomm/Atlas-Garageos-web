import { annulusCylinder, box, circleLine, cylinder, type Annotation3D, type Line3D, type Mesh3D, type Scene3D, type TireWheelProduct3D, type Vec3 } from './canvas-3d';
import type { VisualizationPalette } from './scene-builders';
import { singleTireScene } from './scene-builders';
import { buildTireComparison3DModel } from './parametric-3d-model';
import type { Additional3DToolId, Tool3DLocale } from '../../localization/tool-3d-catalog';
import { calculateFuelCostTool } from '../../features/tools/utility-tools';
import { NEWTON_METERS_PER_POUND_FOOT, PASCALS_PER_PSI, WATTS_PER_MECHANICAL_HP } from '../../core/units/automotive';
import { vehicleById } from '../../data/vehicle-fitment';

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });
const metal = { ambient: .42, diffuse: .68, specular: .4, shininess: 32, metallic: .72 };
const satin = { ambient: .36, diffuse: .77, specular: .16, shininess: 18, metallic: .14 };
const dark = '#253b4b';
const floor = (radius = 1.5) => [{ center: v(0, -1.1, 0), radiusX: radius, radiusZ: .8, alpha: .22 }];
const n = (values: Readonly<Record<string, string>>, key: string, fallback: number): number => {
  const value = Number(values[key]);
  return Number.isFinite(value) ? value : fallback;
};
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const local = (locale: Tool3DLocale, en: string, de: string, es: string) => ({ en, de, es })[locale];
const annotation = (start: Vec3, end: Vec3, label: string, color: string): Annotation3D => ({ start, end, label, color });
const referenceTire = (() => {
  const model = buildTireComparison3DModel(
    { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 },
    { widthMm: 225, aspectRatio: 45, rimDiameterInches: 18 },
  );
  if (!model) throw new Error('Validated visual reference tire is unavailable');
  return model;
})();

function productTire(palette: VisualizationPalette, locale: Tool3DLocale, fallbackMeshes: boolean): Scene3D<TireWheelProduct3D> {
  const source = singleTireScene(referenceTire, palette, fallbackMeshes, locale);
  return { ...source, annotations: [], fitRadius: 1.55 };
}

function wheel(center: Vec3, radius: number, palette: VisualizationPalette): Mesh3D[] {
  const meshes: Mesh3D[] = [
    annulusCylinder(radius, radius * .52, .42, '#27323c', center, 1, satin),
    annulusCylinder(radius * .75, radius * .55, .46, '#9fb4c2', center, 1, metal),
    annulusCylinder(radius * .54, radius * .16, .5, '#61798a', center, 1, metal),
    cylinder(radius * .15, .54, palette.hub, center, 1, metal),
  ];
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI / 4;
    const r = radius * .36;
    meshes.push(box(radius * .56, radius * .08, .07, '#bdcbd4', v(center.x + Math.cos(a) * r, center.y + Math.sin(a) * r, center.z + .28), 1, a, metal));
  }
  return meshes;
}

function gauge(level: number, palette: VisualizationPalette): Scene3D {
  const a = Math.PI * (.8 - 1.6 * clamp(level, 0, 1));
  return {
    meshes: [annulusCylinder(1, .8, .22, '#a4bac7', v(0, 0, 0), 1, metal), cylinder(.79, .18, '#183044', v(0, 0, .02), 1, satin), cylinder(.085, .24, palette.proposed, v(0, 0, .17), 1, metal)],
    lines: [{ points: [v(0, 0, .18), v(Math.cos(a) * .65, Math.sin(a) * .65, .2)], color: palette.proposed, width: 4 }, circleLine(.72, palette.accent, .2, 48)],
    shadows: floor(), fitRadius: 1.48,
  };
}

function pathScene(distance: number, isReturn: boolean, palette: VisualizationPalette, extras = 0): Scene3D {
  const meshes: Mesh3D[] = [
    box(2.95, .12, 1.02, '#243b4a', v(0, -.78, 0), 1, 0, satin),
    box(2.95, .035, .06, '#a2bac9', v(0, -.69, -.42), 1, 0, metal),
    box(2.95, .035, .06, '#a2bac9', v(0, -.69, .42), 1, 0, metal),
    cylinder(.15, .25, palette.current, v(-1.24, -.5, 0), 1, metal),
    cylinder(.15, .25, palette.proposed, v(1.24, -.5, 0), 1, metal),
  ];
  for (let i = 0; i < 15; i += 1) meshes.push(box(.012, .018, i % 5 === 0 ? .43 : .21, i % 5 === 0 ? palette.accent : palette.guide, v(-1.12 + i * .16, -.69, .03), .85, 0, metal));
  const lines: Line3D[] = [{ points: [v(-1.24, -.5, 0), v(1.24, -.5, 0)], color: palette.current, width: 3 }];
  if (isReturn) lines.push({ points: [v(1.24, -.45, -.27), v(-1.24, -.45, -.27)], color: palette.proposed, width: 2, dashed: true });
  if (extras > 0) meshes.push(box(.38, clamp(extras / 80, .1, .55), .38, palette.proposed, v(.88, -.4, -.69), 1, 0, metal));
  return { meshes, lines, annotations: [annotation(v(-1.24, .28, .3), v(1.24, .28, .3), `${distance.toFixed(0)} ${isReturn ? '× 2' : ''}`, palette.accent)], shadows: floor(1.65), fitRadius: 1.8 };
}

function clearanceScene(palette: VisualizationPalette, variant: 'measure' | 'map', locale: Tool3DLocale, fallbackMeshes: boolean): Scene3D<TireWheelProduct3D> {
  const tire = productTire(palette, locale, fallbackMeshes);
  const meshes: Mesh3D[] = [
    ...tire.meshes,
    box(.12, 2, 1.05, palette.hub, v(-1.13, 0, 0), .8, 0, satin),
    box(.12, 2, 1.05, palette.proposed, v(1.13, 0, 0), .55, 0, satin),
  ];
  const annotations = [
    annotation(v(-1.06, -.68, .47), v(-.82, -.68, .47), variant === 'measure' ? { en: 'INNER GAP', de: 'INNENABSTAND', es: 'HOLGURA INTERIOR' }[locale] : { en: 'WIDTH', de: 'BREITE', es: 'ANCHO' }[locale], palette.current),
    annotation(v(.82, -.68, .47), v(1.06, -.68, .47), variant === 'measure' ? { en: 'OUTER GAP', de: 'AUSSENABSTAND', es: 'HOLGURA EXTERIOR' }[locale] : 'ET', palette.proposed),
  ];
  if (variant === 'map') {
    for (let i = -2; i <= 2; i += 1) {
      meshes.push(box(.018, .018, 1.3, palette.guide, v(i * .36, -1.02, 0), .65, 0, satin));
      meshes.push(box(1.9, .018, .018, palette.guide, v(0, -1.02, i * .24), .65, 0, satin));
    }
  }
  return { meshes, products: tire.products ?? [], annotations, shadows: floor(), fitRadius: 1.55 };
}

export interface Tool3DResult { readonly scene: Scene3D; readonly readout: string; readonly detail: string; }

/** Explanatory geometry only. Canonical numerical results remain in the calculator UI. */
function sceneForToolFallback(id: Additional3DToolId, values: Readonly<Record<string, string>>, palette: VisualizationPalette, locale: Tool3DLocale = 'en', fallbackMeshes = true): Tool3DResult {
  const input = (key: string, fallback: number) => n(values, key, fallback);
  if (id === 'fitment-map' || id === 'measure-my-car') return { scene: clearanceScene(palette, id === 'fitment-map' ? 'map' : 'measure', locale, fallbackMeshes), readout: id === 'fitment-map' ? local(locale, 'WIDTH × ET', 'BREITE × ET', 'ANCHO × ET') : local(locale, 'INNER ↔ OUTER', 'INNEN ↔ AUSSEN', 'INTERIOR ↔ EXTERIOR'), detail: local(locale, 'Static geometry · measure on your vehicle', 'Statische Geometrie · am Fahrzeug messen', 'Geometría estática · mida en su vehículo') };

  if (id === 'fuel-cost-calculator') {
    const distance = Math.max(0, input('distance', 100));
    const economy = Math.max(.1, input('economy', 7));
    const price = Math.max(0, input('price', 0));
    const calculated = calculateFuelCostTool({ system: values.system === 'imperial' ? 'imperial' : 'metric', distance, economy, price });
    const fuelRequired = calculated.ok ? calculated.value.fuelRequired : 0;
    const level = clamp(fuelRequired / (values.system === 'imperial' ? 16 : 60), 0, 1);
    const tank: Mesh3D[] = [
      box(2.7, .1, .76, '#274454', v(0, -.91, 0), 1, 0, satin),
      box(2.5, .035, .05, '#b4c8d4', v(0, -.83, .34), 1, 0, metal),
      cylinder(.68, .58, '#193246', v(.69, -.04, 0), 1, metal),
      annulusCylinder(.69, .6, .61, '#aac0ce', v(.69, -.04, 0), 1, metal),
      cylinder(.12, .64, palette.hub, v(.69, -.04, .33), 1, metal),
      cylinder(.31, .25, '#6e8798', v(-.91, -.3, .1), 1, metal),
      annulusCylinder(.33, .26, .28, palette.current, v(-.91, -.3, .1), 1, metal),
    ];
    for (let i = 0; i < 8; i += 1) {
      tank.push(box(.12, .12, .055, i / 8 < level ? palette.proposed : '#395366', v(.19 + i * .145, -.64, .39), 1, 0, satin));
    }
    return { scene: { meshes: tank, lines: [{ points: [v(-.55, -.3, .28), v(-.38, -.3, .28), v(-.38, .64, .28), v(.69, .64, .28)], color: palette.proposed, width: 3 }], annotations: [annotation(v(-1.2, .92, .25), v(1.2, .92, .25), `${distance.toFixed(0)} ${values.system === 'imperial' ? 'mi' : 'km'}`, palette.accent)], shadows: floor(1.8), fitRadius: 1.8 }, readout: calculated.ok ? `${fuelRequired.toFixed(1)} ${values.system === 'imperial' ? 'US gal' : 'L'}` : '—', detail: local(locale, 'Fuel required from canonical calculation', 'Kraftstoffbedarf aus der maßgeblichen Berechnung', 'Combustible necesario según el cálculo principal') };
  }
  if (id === 'road-trip-cost-calculator') {
    const distance = input('distance', 250);
    const isReturn = values.tripType === 'round';
    return { scene: pathScene(distance, isReturn, palette, input('extraCost', 0)), readout: `${distance.toFixed(0)} ${values.system === 'imperial' ? 'mi' : 'km'}${isReturn ? ' × 2' : ''}`, detail: isReturn ? local(locale, 'Return route', 'Hin- und Rückfahrt', 'Viaje de ida y vuelta') : local(locale, 'One-way route', 'Einfache Fahrt', 'Viaje de ida') };
  }
  if (id === 'mpg-l100km-converter') {
    const value = input('value', 30);
    const scene = pathScene(clamp(value * 4, 10, 400), false, palette);
    return { scene: { ...scene, meshes: [...scene.meshes, box(.62, .62, .62, palette.proposed, v(1.06, -.42, -.78), 1, 0, metal)] }, readout: `${value.toFixed(1)} ${values.unit ?? 'US mpg'}`, detail: local(locale, 'Distance and fuel volume · unit relationship', 'Strecke und Kraftstoffmenge · Einheitenbeziehung', 'Distancia y combustible · relación entre unidades') };
  }
  if (id === 'psi-bar-converter') {
    const value = input('value', 32);
    const psi = values.unit === 'bar' ? value * 100000 / PASCALS_PER_PSI : values.unit === 'kpa' ? value * 1000 / PASCALS_PER_PSI : value;
    return { scene: gauge(psi / 100, palette), readout: `${value.toFixed(1)} ${values.unit ?? 'psi'}`, detail: local(locale, 'Illustrative gauge · not a pressure recommendation', 'Schematische Anzeige · keine Druckempfehlung', 'Indicador ilustrativo · no recomienda una presión') };
  }
  if (id === 'hp-kw-converter') {
    const value = input('value', 180);
    const powerKw = values.unit === 'kw' ? value : value * WATTS_PER_MECHANICAL_HP / 1000;
    const meshes: Mesh3D[] = [annulusCylinder(.89, .36, .42, palette.metal, v(-.14, 0, 0), 1, metal), cylinder(.23, .72, palette.hub, v(-.14, 0, .2), 1, metal)];
    for (let i = 0; i < 7; i += 1) {
      const a = i * Math.PI * 2 / 7;
      meshes.push(box(.54, .12, .22, palette.current, v(-.14 + Math.cos(a) * .53, Math.sin(a) * .53, .28), 1, a, metal));
    }
    meshes.push(box(clamp(powerKw / 150, .12, 1.5), .17, .3, palette.proposed, v(.2, -1, .25), 1, 0, metal));
    return { scene: { meshes, shadows: floor(), fitRadius: 1.42 }, readout: `${value.toFixed(1)} ${values.unit ?? 'hp'}`, detail: local(locale, 'Mechanical output · unit conversion', 'Mechanische Leistung · Einheitenumrechnung', 'Potencia mecánica · conversión de unidades') };
  }
  if (id === 'nm-lb-ft-converter') {
    const value = input('value', 300);
    const moment = values.unit === 'lb-ft' ? value * NEWTON_METERS_PER_POUND_FOOT : value;
    const angle = .2 + clamp(moment / 800, 0, 1) * .9;
    return { scene: { meshes: [cylinder(.38, .56, palette.hub, v(0, 0, 0), 1, metal), box(1.8, .17, .23, palette.metal, v(.76 * Math.cos(angle), .76 * Math.sin(angle), .33), 1, angle, metal), cylinder(.14, .37, palette.proposed, v(1.55 * Math.cos(angle), 1.55 * Math.sin(angle), .32), 1, metal)], lines: [circleLine(.72, palette.proposed, .36, 54)], fitRadius: 1.6 }, readout: `${value.toFixed(1)} ${values.unit ?? 'Nm'}`, detail: local(locale, 'One moment about the same axle', 'Ein Drehmoment an derselben Achse', 'Un par de fuerza sobre el mismo eje') };
  }
  if (id === 'power-to-weight-calculator') {
    const power = input('power', 180), mass = input('weight', 1350);
    const massHeight = clamp(mass / 1800, .24, 1);
    const meshes: Mesh3D[] = [
      box(2.7, .09, .72, '#304b5b', v(0, -.93, 0), 1, 0, satin),
      box(2.3, .07, .08, '#a7bfcd', v(0, -.16, 0), 1, 0, metal),
      cylinder(.55, .26, palette.current, v(-.83, .14, .18), 1, metal),
      annulusCylinder(.57, .3, .3, '#a7c1ce', v(-.83, .14, .18), 1, metal),
      cylinder(.16, .35, palette.hub, v(-.83, .14, .39), 1, metal),
      box(.65, massHeight, .58, palette.proposed, v(.84, -.78 + massHeight / 2, 0), 1, 0, metal),
    ];
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI / 4;
      meshes.push(box(.42, .055, .09, '#c6d5de', v(-.83 + Math.cos(angle) * .34, .14 + Math.sin(angle) * .34, .36), 1, angle, metal));
    }
    return { scene: { meshes, annotations: [annotation(v(-1.28, .9, .3), v(1.28, .9, .3), local(locale, 'POWER ÷ MASS', 'LEISTUNG ÷ MASSE', 'POTENCIA ÷ MASA'), palette.accent)], shadows: floor(1.8), fitRadius: 1.8 }, readout: `${power.toFixed(0)} / ${mass.toFixed(0)}`, detail: local(locale, 'Power ÷ mass · entered units', 'Leistung ÷ Masse · eingegebene Einheiten', 'Potencia ÷ masa · unidades introducidas') };
  }
  if (id === 'tire-load-speed-rating') {
    const load = values.loadIndex ?? '91';
    const rating = values.speedRating ?? 'V';
    const tire = productTire(palette, locale, fallbackMeshes);
    return { scene: { ...tire, meshes: [...tire.meshes, box(.62, .09, .14, palette.proposed, v(0, -.66, .44), 1, 0, metal)], annotations: [annotation(v(-.8, 1.15, .24), v(.8, 1.15, .24), `${load}${rating}`, palette.accent)] }, readout: `${load}${rating}`, detail: local(locale, 'Standards lookup · verify vehicle requirements', 'Normtabelle · Fahrzeuganforderungen prüfen', 'Tabla de normas · verifique los requisitos del vehículo') };
  }
  if (id === 'tire-date-code-decoder') {
    const code = (values.code ?? '2219').replace(/[^0-9]/g, '').slice(0, 4);
    const tire = productTire(palette, locale, fallbackMeshes);
    return { scene: { ...tire, meshes: [...tire.meshes, box(.84, .09, .1, palette.proposed, v(0, -.72, .43), 1, 0, metal)], annotations: [annotation(v(-.65, 1.12, .26), v(.65, 1.12, .26), `DOT ${code || 'WWYY'}`, palette.accent)] }, readout: `DOT ${code || 'WWYY'}`, detail: local(locale, 'Last four digits · week / year', 'Letzte vier Ziffern · Woche / Jahr', 'Últimos cuatro dígitos · semana / año') };
  }
  if (id === 'towing-capacity-calculator') {
    const gcwr = Math.max(0, input('gcwr', 17000));
    const vehicle = Math.max(0, input('curbWeight', 5500) + input('loadWeight', 500));
    const ratio = clamp((gcwr - vehicle) / Math.max(1, gcwr), .08, .8);
    const meshes: Mesh3D[] = [
      box(2.9, .09, .86, '#294455', v(0, -.88, 0), 1, 0, satin),
      box(1.22, .11, .58, '#9fb7c5', v(-.75, -.55, 0), 1, 0, metal),
      box(1.22, .11, .58, '#9fb7c5', v(.76, -.55, 0), 1, 0, metal),
      box(.52, .28, .48, palette.current, v(-.74, -.33, 0), 1, 0, metal),
      box(.52 + ratio, .28, .48, palette.proposed, v(.77, -.33, 0), 1, 0, metal),
      cylinder(.12, .4, palette.accent, v(.02, -.53, 0), 1, metal),
      annulusCylinder(.18, .11, .22, '#b9cbd5', v(.02, -.53, .22), 1, metal),
    ];
    return { scene: { meshes, lines: [{ points: [v(-.59, -.15, .25), v(.59, -.15, .25)], color: palette.accent, width: 3 }], annotations: [annotation(v(-1.38, .72, 0), v(1.4, .72, 0), 'GCWR', palette.accent)], shadows: floor(1.8), fitRadius: 1.88 }, readout: `${gcwr.toFixed(0)} − ${vehicle.toFixed(0)}`, detail: local(locale, 'GCWR − loaded vehicle · entered units', 'Zulässiges Zuggesamtgewicht − beladenes Fahrzeug · Eingabeeinheiten', 'Peso bruto combinado − vehículo cargado · unidades introducidas') };
  }
  if (id === 'quarter-mile-calculator') {
    const weight = input('weight', 3400), power = input('power', 300);
    const scene = pathScene(.25, false, palette);
    return { scene: { ...scene, annotations: [annotation(v(-1.3, .62, .1), v(1.3, .62, .1), '¼ mi · 402.3 m', palette.accent)] }, readout: `${weight.toFixed(0)} / ${power.toFixed(0)}`, detail: local(locale, 'Weight / power · illustrative course', 'Gewicht / Leistung · schematische Strecke', 'Peso / potencia · recorrido ilustrativo') };
  }
  const selected = vehicleById(values.model ?? '');
  const lugCount = selected?.lugCount ?? 0;
  const holes = Array.from({ length: lugCount }, (_, i) => { const a = i * Math.PI * 2 / lugCount; return cylinder(.095, .23, dark, v(.9 + Math.cos(a) * .53, Math.sin(a) * .53, .12), 1, satin); });
  return { scene: { meshes: [...wheel(v(-.8, 0, 0), .8, palette), annulusCylinder(.78, .27, .18, palette.metal, v(.9, 0, 0), 1, metal), ...holes], shadows: floor(1.7), fitRadius: 1.75 }, readout: selected ? `${selected.make} ${selected.model} · ${selected.boltPattern}` : local(locale, 'Select a sourced vehicle', 'Fahrzeug mit Quelle wählen', 'Elija un vehículo documentado'), detail: selected ? local(locale, 'Sourced reference · confirm exact trim', 'Referenz mit Quellen · genaue Ausstattung prüfen', 'Referencia documentada · confirme la versión exacta') : local(locale, 'No bolt pattern shown until a documented vehicle is selected', 'Lochkreis erst nach Auswahl eines dokumentierten Fahrzeugs', 'El patrón de pernos aparece tras elegir un vehículo documentado') };
}

/** The native studio is authored per tool; the original bounded meshes stay as Canvas fallback. */
export function sceneForTool(id: Additional3DToolId, values: Readonly<Record<string, string>>, palette: VisualizationPalette, locale: Tool3DLocale = 'en', fallbackMeshes = true): Tool3DResult {
  const result = sceneForToolFallback(id, values, palette, locale, fallbackMeshes);
  if (['fitment-map', 'measure-my-car', 'tire-load-speed-rating', 'tire-date-code-decoder'].includes(id)) return result;
  const input = (key: string, fallback: number) => Math.max(0, n(values, key, fallback));
  const selected = id === 'vehicle-fitment-finder' ? vehicleById(values.model ?? '') : undefined;
  const primary = (() => {
    switch (id) {
      case 'psi-bar-converter': {
        const value = input('value', 32);
        const psi = values.unit === 'bar' ? value * 100000 / PASCALS_PER_PSI : values.unit === 'kpa' ? value * 1000 / PASCALS_PER_PSI : value;
        return clamp(psi / 100, 0, 1);
      }
      case 'fuel-cost-calculator': {
        const calculated = calculateFuelCostTool({ system: values.system === 'imperial' ? 'imperial' : 'metric', distance: input('distance', 100), economy: Math.max(.1, input('economy', 7)), price: input('price', 0) });
        return calculated.ok ? clamp(calculated.value.fuelRequired / (values.system === 'imperial' ? 16 : 60), .02, 1) : .02;
      }
      case 'road-trip-cost-calculator': return clamp(input('distance', 250) / (values.system === 'imperial' ? 800 : 1200), .04, 1);
      case 'mpg-l100km-converter': return clamp(input('value', 30) / (values.unit === 'L/100km' ? 20 : 75), .04, 1);
      case 'hp-kw-converter': return clamp((values.unit === 'kw' ? input('value', 180) : input('value', 180) * WATTS_PER_MECHANICAL_HP / 1000) / 450, .04, 1);
      case 'nm-lb-ft-converter': return clamp((values.unit === 'lb-ft' ? input('value', 300) * NEWTON_METERS_PER_POUND_FOOT : input('value', 300)) / 1000, .04, 1);
      case 'power-to-weight-calculator': return clamp(input('power', 180) / Math.max(1, input('weight', 1350)) * 3, .04, 1);
      case 'towing-capacity-calculator': {
        const gcwr = input('gcwr', 17000);
        return clamp((gcwr - input('curbWeight', 5500) - input('loadWeight', 500)) / Math.max(1, gcwr), .04, 1);
      }
      case 'quarter-mile-calculator': return clamp(input('power', 300) / Math.max(1, input('weight', 3400)) * 5, .04, 1);
      case 'vehicle-fitment-finder': return selected ? clamp(selected.lugCount / 8, .04, 1) : .04;
      default: return .35;
    }
  })();
  const secondary = id === 'road-trip-cost-calculator' ? clamp(input('extraCost', 0) / 250, 0, 1)
    : id === 'towing-capacity-calculator' ? clamp((input('curbWeight', 5500) + input('loadWeight', 500)) / Math.max(1, input('gcwr', 17000)), 0, 1)
      : 0;
  return {
    ...result,
    scene: {
      ...result.scene,
      studio: { kind: 'tool-studio', id, current: palette.current, proposed: palette.proposed, accent: palette.accent, metal: palette.metal, hub: palette.hub, primary, secondary, count: selected?.lugCount ?? 0, returnTrip: values.tripType === 'round' },
      fitRadius: 1.08,
    },
  };
}
