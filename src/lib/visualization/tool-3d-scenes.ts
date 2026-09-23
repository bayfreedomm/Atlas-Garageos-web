import { annulusCylinder, box, circleLine, cylinder, type Annotation3D, type Line3D, type Mesh3D, type Scene3D, type TireWheelProduct3D, type Vec3 } from './canvas-3d';
import type { VisualizationPalette } from './scene-builders';
import type { Additional3DToolId, Tool3DLocale } from '../../localization/tool-3d-catalog';
import { calculateFuelCostTool } from '../../features/tools/utility-tools';
import { NEWTON_METERS_PER_POUND_FOOT, PASCALS_PER_PSI, WATTS_PER_MECHANICAL_HP } from '../../core/units/automotive';

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
const annotation = (start: Vec3, end: Vec3, label: string, color: string): Annotation3D => ({ start, end, label, color });

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

/** An exposed axle / mass module, deliberately not a vehicle-specific car model. */
function vehicleModule(x: number, palette: VisualizationPalette): Mesh3D[] {
  return [
    box(1.82, .07, .08, '#9eb5c3', v(x, -.25, -.34), 1, 0, metal),
    box(1.82, .07, .08, '#9eb5c3', v(x, -.25, .34), 1, 0, metal),
    box(.08, .07, .7, '#718b9b', v(x - .61, -.25, 0), 1, 0, metal),
    box(.08, .07, .7, '#718b9b', v(x + .61, -.25, 0), 1, 0, metal),
    box(.79, .34, .5, palette.current, v(x, -.02, 0), 1, 0, metal),
    box(.83, .045, .54, '#b7cbd6', v(x, .17, 0), 1, 0, metal),
    box(.22, .09, .7, palette.hub, v(x, -.3, 0), 1, 0, metal),
    annulusCylinder(.29, .18, .18, '#25343e', v(x - .62, -.49, .45), 1, satin),
    annulusCylinder(.29, .18, .18, '#25343e', v(x + .62, -.49, .45), 1, satin),
    cylinder(.17, .2, '#b6cbd6', v(x - .62, -.49, .48), 1, metal),
    cylinder(.17, .2, '#b6cbd6', v(x + .62, -.49, .48), 1, metal),
  ];
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
  const length = 2.75;
  const meshes: Mesh3D[] = [box(length, .05, 1.05, '#31485a', v(0, -.87, 0), 1, 0, satin), ...vehicleModule(-.92, palette)];
  const lines: Line3D[] = [{ points: [v(-1.3, -.83, .52), v(1.3, -.83, .52)], color: palette.guide, width: 2, dashed: true }];
  if (isReturn) lines.push({ points: [v(1.3, -.83, -.54), v(-1.3, -.83, -.54)], color: palette.proposed, width: 2, dashed: true });
  meshes.push(box(.14, .48, .14, palette.current, v(-1.28, -.63, -.53), 1, 0, metal), box(.14, .48, .14, palette.proposed, v(1.28, -.63, -.53), 1, 0, metal));
  if (extras > 0) meshes.push(box(.5, clamp(extras / 60, .12, .8), .45, palette.proposed, v(.88, -.45, -.7), 1, 0, metal));
  return { meshes, lines, annotations: [annotation(v(-1.26, .54, .38), v(1.26, .54, .38), `${distance.toFixed(0)} ${isReturn ? '× 2' : ''}`, palette.accent)], shadows: floor(1.65), fitRadius: 1.9 };
}

function clearanceScene(palette: VisualizationPalette, variant: 'measure' | 'map', locale: Tool3DLocale): Scene3D<TireWheelProduct3D> {
  const meshes: Mesh3D[] = [
    ...wheel(v(0, 0, 0), .86, palette),
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
  return { meshes, annotations, shadows: floor(), fitRadius: 1.55 };
}

export interface Tool3DResult { readonly scene: Scene3D; readonly readout: string; readonly detail: string; }

/** Explanatory geometry only. Canonical numerical results remain in the calculator UI. */
export function sceneForTool(id: Additional3DToolId, values: Readonly<Record<string, string>>, palette: VisualizationPalette, locale: Tool3DLocale = 'en'): Tool3DResult {
  const input = (key: string, fallback: number) => n(values, key, fallback);
  if (id === 'fitment-map' || id === 'measure-my-car') return { scene: clearanceScene(palette, id === 'fitment-map' ? 'map' : 'measure', locale), readout: id === 'fitment-map' ? 'WIDTH × ET' : 'INNER ↔ OUTER', detail: 'Static geometry · measure on your vehicle' };

  if (id === 'fuel-cost-calculator') {
    const distance = Math.max(0, input('distance', 100));
    const economy = Math.max(.1, input('economy', 7));
    const price = Math.max(0, input('price', 0));
    const calculated = calculateFuelCostTool({ system: values.system === 'imperial' ? 'imperial' : 'metric', distance, economy, price });
    const fuelRequired = calculated.ok ? calculated.value.fuelRequired : 0;
    const level = clamp(fuelRequired / (values.system === 'imperial' ? 16 : 60), 0, 1);
    const tank: Mesh3D[] = [
      ...vehicleModule(-1.05, palette),
      cylinder(.76, .54, '#193246', v(.91, -.05, 0), 1, metal),
      annulusCylinder(.77, .68, .58, '#aac0ce', v(.91, -.05, 0), 1, metal),
      cylinder(.12, .62, palette.hub, v(.91, -.05, .31), 1, metal),
      box(.8, .1, .55, '#668294', v(.91, -.84, 0), 1, 0, metal),
    ];
    for (let i = 0; i < 8; i += 1) {
      tank.push(box(.11, .14, .07, i / 8 < level ? palette.proposed : '#395366', v(.42 + i * .14, -.61, .37), 1, 0, satin));
    }
    return { scene: { meshes: tank, lines: [{ points: [v(-.15, -.42, .12), v(-.15, .5, .12), v(.05, .72, .12), v(.49, .72, .12)], color: palette.proposed, width: 3 }], shadows: floor(1.8), fitRadius: 1.8 }, readout: calculated.ok ? `${fuelRequired.toFixed(1)} ${values.system === 'imperial' ? 'US gal' : 'L'}` : '—', detail: 'Fuel required from canonical calculation' };
  }
  if (id === 'road-trip-cost-calculator') {
    const distance = input('distance', 250);
    const isReturn = values.tripType === 'round';
    return { scene: pathScene(distance, isReturn, palette, input('extraCost', 0)), readout: `${distance.toFixed(0)}${isReturn ? ' × 2' : ''}`, detail: isReturn ? 'Return route' : 'One-way route' };
  }
  if (id === 'mpg-l100km-converter') {
    const value = input('value', 30);
    const scene = pathScene(clamp(value * 4, 10, 400), false, palette);
    return { scene: { ...scene, meshes: [...scene.meshes, box(.62, .62, .62, palette.proposed, v(1.06, -.42, -.78), 1, 0, metal)] }, readout: `${value.toFixed(1)} ${values.unit ?? 'US mpg'}`, detail: 'Distance and fuel volume · unit relationship' };
  }
  if (id === 'psi-bar-converter') {
    const value = input('value', 32);
    const psi = values.unit === 'bar' ? value * 100000 / PASCALS_PER_PSI : values.unit === 'kpa' ? value * 1000 / PASCALS_PER_PSI : value;
    return { scene: gauge(psi / 100, palette), readout: `${value.toFixed(1)} ${values.unit ?? 'psi'}`, detail: 'Illustrative gauge · not a pressure recommendation' };
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
    return { scene: { meshes, shadows: floor(), fitRadius: 1.42 }, readout: `${value.toFixed(1)} ${values.unit ?? 'hp'}`, detail: 'Mechanical output · unit conversion' };
  }
  if (id === 'nm-lb-ft-converter') {
    const value = input('value', 300);
    const moment = values.unit === 'lb-ft' ? value * NEWTON_METERS_PER_POUND_FOOT : value;
    const angle = .2 + clamp(moment / 800, 0, 1) * .9;
    return { scene: { meshes: [cylinder(.38, .56, palette.hub, v(0, 0, 0), 1, metal), box(1.8, .17, .23, palette.metal, v(.76 * Math.cos(angle), .76 * Math.sin(angle), .33), 1, angle, metal), cylinder(.14, .37, palette.proposed, v(1.55 * Math.cos(angle), 1.55 * Math.sin(angle), .32), 1, metal)], lines: [circleLine(.72, palette.proposed, .36, 54)], fitRadius: 1.6 }, readout: `${value.toFixed(1)} ${values.unit ?? 'Nm'}`, detail: 'One moment about the same axle' };
  }
  if (id === 'power-to-weight-calculator') {
    const power = input('power', 180), mass = input('weight', 1350);
    return { scene: { meshes: [...vehicleModule(0, palette), box(.55, clamp(mass / 1800, .24, 1), .52, palette.proposed, v(1.1, -.75 + clamp(mass / 1800, .24, 1) / 2, 0), 1, 0, metal), cylinder(clamp(power / 600, .18, .65), .23, palette.accent, v(-1.15, -.45, .14), 1, metal)], shadows: floor(1.8), fitRadius: 1.8 }, readout: `${power.toFixed(0)} / ${mass.toFixed(0)}`, detail: 'Power ÷ mass · entered units' };
  }
  if (id === 'tire-load-speed-rating') {
    const load = values.loadIndex ?? '91';
    const rating = values.speedRating ?? 'V';
    return { scene: { meshes: wheel(v(0, 0, 0), 1, palette).concat(box(.62, .23, .14, palette.proposed, v(0, -.64, .44), 1, 0, metal)), annotations: [annotation(v(-.8, 1.15, .24), v(.8, 1.15, .24), `${load}${rating}`, palette.accent)], shadows: floor(), fitRadius: 1.5 }, readout: `${load}${rating}`, detail: 'Standards lookup · verify vehicle requirements' };
  }
  if (id === 'tire-date-code-decoder') {
    const code = (values.code ?? '2219').replace(/[^0-9]/g, '').slice(0, 4);
    return { scene: { meshes: wheel(v(0, 0, 0), 1, palette).concat(box(.84, .22, .1, palette.proposed, v(0, -.72, .43), 1, 0, metal)), annotations: [annotation(v(-.65, 1.12, .26), v(.65, 1.12, .26), `DOT ${code || 'WWYY'}`, palette.accent)], shadows: floor(), fitRadius: 1.5 }, readout: `DOT ${code || 'WWYY'}`, detail: 'Last four digits · week / year' };
  }
  if (id === 'towing-capacity-calculator') {
    const gcwr = Math.max(0, input('gcwr', 17000));
    const vehicle = Math.max(0, input('curbWeight', 5500) + input('loadWeight', 500));
    const ratio = clamp((gcwr - vehicle) / Math.max(1, gcwr), .08, .8);
    const meshes = [...vehicleModule(-.85, palette), box(.87 + ratio, .55, .68, palette.proposed, v(.83, -.2, 0), 1, 0, metal), cylinder(.22, .17, dark, v(.87, -.63, .42), 1, satin), cylinder(.22, .17, dark, v(1.43, -.63, .42), 1, satin)];
    return { scene: { meshes, lines: [{ points: [v(-.01, -.46, 0), v(.38, -.46, 0)], color: palette.accent, width: 3 }], annotations: [annotation(v(-1.45, .72, 0), v(1.5, .72, 0), 'GCWR', palette.accent)], shadows: floor(1.8), fitRadius: 1.88 }, readout: `${gcwr.toFixed(0)} − ${vehicle.toFixed(0)}`, detail: 'GCWR − loaded vehicle · entered units' };
  }
  if (id === 'quarter-mile-calculator') {
    const weight = input('weight', 3400), power = input('power', 300);
    const scene = pathScene(.25, false, palette);
    return { scene: { ...scene, annotations: [annotation(v(-1.3, .62, .1), v(1.3, .62, .1), '¼ MI · 402.3 M', palette.accent)] }, readout: `${weight.toFixed(0)} / ${power.toFixed(0)}`, detail: 'Weight / power · illustrative course' };
  }
  const make = values.make || '—', model = values.model || '—';
  return { scene: { meshes: [...wheel(v(-.8, 0, 0), .8, palette), annulusCylinder(.78, .27, .18, palette.metal, v(.9, 0, 0), 1, metal), ...Array.from({ length: 5 }, (_, i) => { const a = i * Math.PI * 2 / 5; return cylinder(.095, .23, dark, v(.9 + Math.cos(a) * .53, Math.sin(a) * .53, .12), 1, satin); })], shadows: floor(1.7), fitRadius: 1.75 }, readout: `${make} · ${model}`, detail: 'Reference tire + bolt plate · check sourced record' };
}
