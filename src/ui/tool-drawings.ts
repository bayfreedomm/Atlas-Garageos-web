/**
 * Calculator drawings in one visual language (light, thin-line, two accent colours), drawn to
 * the entered numbers. Pure string output — the same function renders the server-side initial
 * state and the live client state, so a drawing can never disagree with the calculator.
 *
 * Every renderer returns the SVG and a one-line readout. Words come in through `labels` (already
 * localized by the caller); the drawings themselves lean on numbers, units and symbols.
 */
import { renderFitmentSection } from './fitment-section';
import { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { pcdFromAdjacentHoleSpacingMm } from '../data/bolt-pattern-geometry';
import { calculateEvChargingCostTool } from '../features/tools/ev-charging-tool';
import type { FuelEconomyUnit, PowerUnit, PressureUnit, TorqueUnit, WeightUnit } from '../domain/utility-calculators';

export type DrawingKind =
  | 'psi-bar-converter' | 'hp-kw-converter' | 'nm-lb-ft-converter' | 'mpg-l100km-converter'
  | 'power-to-weight-calculator' | 'towing-capacity-calculator' | 'quarter-mile-calculator'
  | 'fuel-cost-calculator' | 'road-trip-cost-calculator' | 'tire-load-speed-rating' | 'tire-date-code-decoder'
  | 'measure-my-car' | 'fitment-map' | 'vehicle-fitment-finder' | 'speedometer' | 'compression' | 'bolt-pattern' | 'fitment-setup' | 'ev-charge';

export type DrawingValues = Readonly<Record<string, string | undefined>>;
export type DrawingLabels = Readonly<Record<string, string | undefined>>;

export interface Drawing { readonly svg: string; readonly readout: string; }

/** Form defaults, so the server render equals the first client render. */
export const DRAWING_DEFAULTS: Readonly<Record<DrawingKind, DrawingValues>> = {
  'psi-bar-converter': { value: '32', unit: 'psi' },
  'hp-kw-converter': { value: '180', unit: 'hp' },
  'nm-lb-ft-converter': { value: '300', unit: 'nm' },
  'mpg-l100km-converter': { value: '30', unit: 'us-mpg' },
  'power-to-weight-calculator': { power: '180', powerUnit: 'hp', weight: '1350', weightUnit: 'kg' },
  'towing-capacity-calculator': { unit: 'lb', gcwr: '17000', curbWeight: '5500', loadWeight: '500' },
  'quarter-mile-calculator': { weight: '3400', weightUnit: 'lb', power: '300', powerUnit: 'hp' },
  'fuel-cost-calculator': { system: 'metric', distance: '500', economy: '7.2', price: '1.144', currency: 'USD' },
  'road-trip-cost-calculator': { system: 'metric', distance: '420', economy: '6.5', price: '1.144', currency: 'USD', tripType: 'one', extraCost: '0', people: '1' },
  'tire-load-speed-rating': { loadIndex: '91', speedRating: 'V' },
  'tire-date-code-decoder': { code: '2219' },
  'measure-my-car': {},
  'fitment-map': {},
  'vehicle-fitment-finder': {},
  speedometer: { 'original-widthMm': '225', 'original-aspectRatio': '45', 'original-rimDiameterInches': '18', 'new-widthMm': '235', 'new-aspectRatio': '40', 'new-rimDiameterInches': '19', indicatedSpeed: '100', unit: 'km/h' },
  compression: { bore: '86', stroke: '86', chamber: '48', otherVolume: '4' },
  'bolt-pattern': { lugCount: '5', spacing: '67.1', spacingUnit: 'mm' },
  'ev-charge': { batteryCapacityKwh: '64', pricePerKwh: '0.18', currency: 'USD', startPercent: '20', endPercent: '80', chargerPowerKw: '11', chargingEfficiency: '90' },
  'fitment-setup': { 'current-tireWidthMm': '225', 'current-tireAspectRatio': '45', 'current-rimDiameterInches': '18', 'current-wheelWidthInches': '8', 'current-wheelOffsetMm': '40', 'proposed-tireWidthMm': '235', 'proposed-tireAspectRatio': '40', 'proposed-rimDiameterInches': '19', 'proposed-wheelWidthInches': '8.5', 'proposed-wheelOffsetMm': '35' },
};

const esc = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f1 = (n: number): string => n.toFixed(1);

interface Ctx { readonly comma: boolean; readonly labels: DrawingLabels; }

const fmt = (ctx: Ctx, value: number, digits: number): string => {
  if (!Number.isFinite(value)) return '—';
  const [whole, fraction] = Math.abs(value).toFixed(digits).split('.');
  const grouped = (whole ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ctx.comma ? '\u202f' : ',');
  const local = fraction === undefined ? grouped : `${grouped}${ctx.comma ? ',' : '.'}${fraction}`;
  return value < 0 ? `−${local}` : local;
};
const L = (ctx: Ctx, key: string, fallback = ''): string => esc(ctx.labels[key] ?? fallback);
const num = (values: DrawingValues, key: string): number => Number.parseFloat(String(values[key] ?? '').replace(',', '.'));

const svg = (kind: string, width: number, height: number, body: string, aria: string): string =>
  `<svg class="tool-drawing tool-drawing--${kind}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(aria)}">${body}</svg>`;
const text = (x: number, y: number, content: string, cls = 'td-text', anchor: 'start' | 'middle' | 'end' = 'middle'): string =>
  `<text class="${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}">${content}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, cls: string): string => `<path class="${cls}" d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}"/>`;
const arrow = (x1: number, y1: number, x2: number, y2: number, cls: string): string => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = (x: number, y: number, a: number): string => `M${f1(x + 12 * Math.cos(a + 2.7))} ${f1(y + 12 * Math.sin(a + 2.7))}L${f1(x)} ${f1(y)}L${f1(x + 12 * Math.cos(a - 2.7))} ${f1(y + 12 * Math.sin(a - 2.7))}`;
  return `<path class="${cls}" d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}${head(x2, y2, angle)}"/>`;
};
const dimension = (x1: number, x2: number, y: number, label: string, cls = 'td-dim'): string =>
  `<g class="${cls}">${line(x1, y, x2, y, 'td-dim-line')}${line(x1, y - 9, x1, y + 9, 'td-dim-line')}${line(x2, y - 9, x2, y + 9, 'td-dim-line')}${text((x1 + x2) / 2, y - 14, label, 'td-dim-text')}</g>`;

/** A ruler from `x0` to `x1` mapping [0, max] with ticks every `step`. */
function ruler(ctx: Ctx, x0: number, x1: number, y: number, max: number, step: number, unit: string, marker: number, cls: 'a' | 'b', below = false): string {
  const scale = (v: number): number => x0 + (Math.min(Math.max(v, 0), max) / max) * (x1 - x0);
  let ticks = '';
  for (let v = 0; v <= max + 1e-9; v += step) {
    ticks += line(scale(v), y, scale(v), y + (below ? 12 : -12), 'td-tick');
    ticks += text(scale(v), below ? y + 36 : y - 22, fmt(ctx, v, step < 1 ? 1 : 0), 'td-tick-text');
  }
  const mx = scale(marker);
  return `<g>${line(x0, y, x1, y, 'td-axis')}${ticks}${text(x1 + 14, y + 8, unit, 'td-unit', 'start')}<circle class="td-marker td-marker--${cls}" cx="${f1(mx)}" cy="${f1(y)}" r="10"/></g>`;
}

const niceMax = (value: number, steps: readonly number[]): [number, number] => {
  for (const step of steps) {
    const max = Math.ceil((value * 1.25) / step) * step;
    if (max / step <= 8) return [Math.max(max, step * 4), step];
  }
  const step = steps[steps.length - 1]!;
  return [Math.ceil((value * 1.25) / step) * step, step];
};

/** Analog gauge: 240° sweep, centre (cx, cy), radius r, needles at values. */
function gauge(ctx: Ctx, cx: number, cy: number, r: number, max: number, step: number, needles: readonly { value: number; cls: 'a' | 'b' }[], innerScale?: { max: number; step: number; factor: number }): string {
  const start = (210 * Math.PI) / 180;
  const sweep = (240 * Math.PI) / 180;
  const angleOf = (v: number, m: number): number => start - (Math.min(Math.max(v, 0), m) / m) * sweep;
  const at = (a: number, radius: number): [number, number] => [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  const [ax, ay] = at(start, r);
  const [bx, by] = at(start - sweep, r);
  let body = `<path class="td-gauge-arc" d="M${f1(ax)} ${f1(ay)}A${r} ${r} 0 1 1 ${f1(bx)} ${f1(by)}"/>`;
  for (let v = 0; v <= max + 1e-9; v += step / 2) {
    const major = Math.abs(v / step - Math.round(v / step)) < 1e-6;
    const [x1, y1] = at(angleOf(v, max), r);
    const [x2, y2] = at(angleOf(v, max), r - (major ? 22 : 11));
    body += line(x1, y1, x2, y2, major ? 'td-tick td-tick--major' : 'td-tick');
    if (major) { const [tx, ty] = at(angleOf(v, max), r - 48); body += text(tx, ty + 8, fmt(ctx, v, 0), 'td-tick-text'); }
  }
  if (innerScale) {
    const ri = r - 70;
    const [ix, iy] = at(start, ri);
    const [jx, jy] = at(start - sweep, ri);
    body += `<path class="td-gauge-arc td-gauge-arc--inner" d="M${f1(ix)} ${f1(iy)}A${ri} ${ri} 0 1 1 ${f1(jx)} ${f1(jy)}"/>`;
    for (let v = 0; v <= innerScale.max + 1e-9; v += innerScale.step) {
      const a = angleOf(v * innerScale.factor, max);
      const [x1, y1] = at(a, ri);
      const [x2, y2] = at(a, ri + 10);
      body += line(x1, y1, x2, y2, 'td-tick td-tick--b');
      const [tx, ty] = at(a, ri - 24);
      body += text(tx, ty + 7, fmt(ctx, v, innerScale.step < 1 ? 1 : 0), 'td-tick-text td-tick-text--b');
    }
  }
  if (needles.length === 2) {
    const [a1, a2] = [angleOf(needles[0]!.value, max), angleOf(needles[1]!.value, max)];
    const rr = r + 14;
    const [p1x, p1y] = at(a1, rr);
    const [p2x, p2y] = at(a2, rr);
    const sweepFlag = a2 < a1 ? 1 : 0;
    body += `<path class="td-gap-arc" d="M${f1(p1x)} ${f1(p1y)}A${rr} ${rr} 0 0 ${sweepFlag} ${f1(p2x)} ${f1(p2y)}"/>`;
  }
  for (const needle of needles) {
    const [nx, ny] = at(angleOf(needle.value, max), r - 30);
    body += `<path class="td-needle td-needle--${needle.cls}" d="M${f1(cx)} ${f1(cy)}L${f1(nx)} ${f1(ny)}"/>`;
  }
  body += `<circle class="td-hub" cx="${cx}" cy="${cy}" r="12"/>`;
  return body;
}

function psi(values: DrawingValues, ctx: Ctx): Drawing {
  const v = num(values, 'value');
  const unit = values.unit === 'bar' || values.unit === 'kpa' ? values.unit : 'psi';
  // Numbers come from the calculator's own converter so the drawing cannot disagree with it.
  const result = convertPressureTool(v, unit as PressureUnit);
  const { psi: p, bar, kpa } = result.ok ? result.value : { psi: 0, bar: 0, kpa: 0 };
  const [max, step] = niceMax(Math.max(p, 1), [5, 10, 20, 50, 100]);
  const barMax = max / 14.503773773;
  const barStep = barMax <= 3 ? 0.5 : barMax <= 8 ? 1 : 2;
  const body = gauge(ctx, 320, 260, 220, max, step, [{ value: p, cls: 'a' }], { max: Math.floor(barMax / barStep) * barStep, step: barStep, factor: 14.503773773 })
    + text(320, 318, 'psi', 'td-unit') + text(320, 346, 'bar', 'td-unit td-unit--b')
    + text(320, 420, `${fmt(ctx, p, 1)} psi`, 'td-big') + text(320, 462, `${fmt(ctx, bar, 2)} bar · ${fmt(ctx, kpa, 0)} kPa`, 'td-text td-text--muted');
  return { svg: svg('psi', 640, 490, body, `${fmt(ctx, p, 1)} psi = ${fmt(ctx, bar, 2)} bar`), readout: `${fmt(ctx, p, 1)} psi = ${fmt(ctx, bar, 3)} bar = ${fmt(ctx, kpa, 1)} kPa` };
}

function power(values: DrawingValues, ctx: Ctx): Drawing {
  const v = num(values, 'value');
  const result = convertPowerTool(v, (values.unit === 'kw' ? 'kw' : 'hp') as PowerUnit);
  const hp = result.ok ? result.value.mechanicalHorsepower : 0;
  const kw = result.ok ? result.value.kilowatts : 0;
  const [max, step] = niceMax(Math.max(hp, 1), [10, 25, 50, 100, 250, 500]);
  const kwMax = max * 0.745699872;
  const kwStep = step * 0.8 >= 50 ? 50 : step * 0.8 >= 20 ? 20 : 10;
  const x0 = 60;
  const x1 = 540;
  const kwScale = (k: number): number => x0 + (k / 0.745699872 / max) * (x1 - x0);
  let kwTicks = '';
  for (let k = 0; k <= kwMax + 1e-9; k += kwStep) kwTicks += line(kwScale(k), 220, kwScale(k), 232, 'td-tick td-tick--b') + text(kwScale(k), 258, fmt(ctx, k, 0), 'td-tick-text td-tick-text--b');
  const mx = x0 + (Math.min(hp, max) / max) * (x1 - x0);
  const body = ruler(ctx, x0, x1, 160, max, step, 'hp', hp, 'a')
    + line(x0, 220, x1, 220, 'td-axis') + kwTicks + text(x1 + 14, 228, 'kW', 'td-unit td-unit--b', 'start')
    + line(mx, 140, mx, 240, 'td-guide') + `<circle class="td-marker td-marker--b" cx="${f1(mx)}" cy="220" r="10"/>`
    + text(320, 52, `${fmt(ctx, hp, 1)} hp = ${fmt(ctx, kw, 1)} kW`, 'td-big')
    + text(320, 320, `1 hp = ${fmt(ctx, 0.745699872, 4)} kW`, 'td-text td-text--muted');
  return { svg: svg('power', 640, 340, body, `${fmt(ctx, hp, 1)} hp = ${fmt(ctx, kw, 1)} kW`), readout: `${fmt(ctx, hp, 1)} hp = ${fmt(ctx, kw, 1)} kW` };
}

function torque(values: DrawingValues, ctx: Ctx): Drawing {
  const v = num(values, 'value');
  const result = convertTorqueTool(v, (values.unit === 'lb-ft' ? 'lb-ft' : 'nm') as TorqueUnit);
  const nm = result.ok ? result.value.newtonMeters : 0;
  const lbft = result.ok ? result.value.poundFeet : 0;
  const forceAt = (meters: number): number => nm / meters;
  // Wrench: bolt at (110, 170), handle to the right, 0.5 m = 420 px.
  const bx = 110;
  const by = 240;
  const px = (m: number): number => bx + m * 840;
  const body = `<polygon class="td-part" points="${[0, 1, 2, 3, 4, 5].map((i) => `${f1(bx + 34 * Math.cos(i * Math.PI / 3))},${f1(by + 34 * Math.sin(i * Math.PI / 3))}`).join(' ')}"/>`
    + `<circle class="td-part-line" cx="${bx}" cy="${by}" r="52"/>`
    + `<path class="td-part" d="M${bx + 40} ${by - 18}H${px(0.5) + 30}a18 18 0 0 1 0 36H${bx + 40}Z"/>`
    + arrow(px(0.25), by - 120, px(0.25), by - 26, 'td-force td-force--b') + arrow(px(0.5), by - 120, px(0.5), by - 26, 'td-force td-force--a')
    + text(px(0.25), by - 134, `${fmt(ctx, forceAt(0.25), 0)} N`, 'td-text td-text--b') + text(px(0.5), by - 134, `${fmt(ctx, forceAt(0.5), 0)} N`, 'td-text td-text--a')
    + dimension(bx, px(0.25), by + 70, ctx.comma ? '0,25 m' : '0.25 m') + dimension(bx, px(0.5), by + 128, ctx.comma ? '0,5 m' : '0.5 m')
    + `<path class="td-accent-arc" d="M${bx - 70} ${by + 20}A74 74 0 0 1 ${bx + 20} ${by - 72}"/>`
    + text(320, 52, `${fmt(ctx, nm, 1)} Nm = ${fmt(ctx, lbft, 1)} lb-ft`, 'td-big')
    + text(px(0.5), by + 196, `≈ ${fmt(ctx, forceAt(0.5) / 9.80665, 0)} kg @ ${ctx.comma ? '0,5' : '0.5'} m`, 'td-text td-text--muted');
  return { svg: svg('torque', 640, 470, body, `${fmt(ctx, nm, 1)} Nm = ${fmt(ctx, lbft, 1)} lb-ft`), readout: `${fmt(ctx, nm, 1)} Nm = ${fmt(ctx, lbft, 1)} lb-ft` };
}

function mpg(values: DrawingValues, ctx: Ctx): Drawing {
  const v = num(values, 'value');
  const unit = values.unit === 'imperial-mpg' || values.unit === 'l100km' ? values.unit : 'us-mpg';
  const result = convertFuelEconomyTool(v, unit as FuelEconomyUnit);
  const us = result.ok ? result.value.usMpg : 0;
  const imp = result.ok ? result.value.imperialMpg : 0;
  const l100 = result.ok ? result.value.litersPer100Km : 0;
  const [maxUs, stepUs] = niceMax(Math.max(us, 1), [5, 10, 20, 50]);
  const [maxImp, stepImp] = niceMax(Math.max(imp, 1), [5, 10, 20, 50]);
  const [maxL, stepL] = niceMax(Math.max(l100, 1), [1, 2, 5, 10, 20]);
  const body = text(320, 52, `${fmt(ctx, us, 1)} US MPG = ${fmt(ctx, imp, 1)} Imp MPG = ${fmt(ctx, l100, 2)} L/100 km`, 'td-big td-big--small')
    + ruler(ctx, 60, 520, 140, maxUs, stepUs, 'US MPG', us, 'a')
    + ruler(ctx, 60, 520, 240, maxImp, stepImp, 'Imp MPG', imp, 'a')
    + ruler(ctx, 60, 520, 340, maxL, stepL, 'L/100 km', l100, 'b');
  return { svg: svg('mpg', 640, 380, body, `${fmt(ctx, us, 1)} US MPG = ${fmt(ctx, l100, 2)} L/100 km`), readout: `${fmt(ctx, us, 1)} US MPG · ${fmt(ctx, imp, 1)} Imp MPG · ${fmt(ctx, l100, 2)} L/100 km` };
}

function powerToWeight(values: DrawingValues, ctx: Ctx): Drawing {
  const p = num(values, 'power');
  const w = num(values, 'weight');
  const result = calculatePowerToWeightTool({ power: p, powerUnit: (values.powerUnit === 'kw' ? 'kw' : 'hp') as PowerUnit, weight: w, weightUnit: (values.weightUnit === 'lb' ? 'lb' : 'kg') as WeightUnit });
  const r = result.ok ? result.value : { watts: 0, kilograms: 1, mechanicalHorsepowerPerTonne: 0, kilowattsPerTonne: 0, wattsPerKilogram: 0 };
  const hp = r.watts / 745.699872;
  const kg = r.kilograms;
  const ratio = r.mechanicalHorsepowerPerTonne;
  const wPerKg = r.wattsPerKilogram;
  const [max, step] = niceMax(Math.max(ratio, 1), [25, 50, 100, 200]);
  const hpBar = Math.min(1, hp / 800) * 400;
  const kgBar = Math.min(1, kg / 3500) * 400;
  const body = text(320, 52, `${fmt(ctx, ratio, 1)} hp/t`, 'td-big')
    + text(60, 120, `${fmt(ctx, hp, 0)} hp`, 'td-text td-text--a', 'start') + `<rect class="td-bar td-bar--a" x="200" y="100" width="${f1(Math.max(hpBar, 4))}" height="26" rx="6"/>`
    + text(60, 172, `${fmt(ctx, kg, 0)} kg`, 'td-text td-text--b', 'start') + `<rect class="td-bar td-bar--b" x="200" y="152" width="${f1(Math.max(kgBar, 4))}" height="26" rx="6"/>`
    + ruler(ctx, 60, 520, 270, max, step, 'hp/t', ratio, 'a')
    + text(320, 340, `${fmt(ctx, wPerKg, 1)} W/kg · ${fmt(ctx, r.kilowattsPerTonne, 1)} kW/t`, 'td-text td-text--muted');
  return { svg: svg('p2w', 640, 370, body, `${fmt(ctx, ratio, 1)} hp/t`), readout: `${fmt(ctx, hp, 0)} hp / ${fmt(ctx, kg, 0)} kg = ${fmt(ctx, ratio, 1)} hp/t` };
}

function towing(values: DrawingValues, ctx: Ctx): Drawing {
  const unit = values.unit === 'kg' ? 'kg' : 'lb';
  const gcwr = num(values, 'gcwr');
  const loaded = num(values, 'curbWeight') + (num(values, 'loadWeight') || 0);
  const trailer = gcwr - loaded;
  const x0 = 50;
  const width = 540;
  const total = Math.max(gcwr, loaded, 1);
  const a = (loaded / total) * width;
  const over = trailer < 0;
  const body = text(320, 52, `${fmt(ctx, Math.max(trailer, 0), 0)} ${unit}`, over ? 'td-big td-big--warn' : 'td-big')
    + text(320, 88, L(ctx, 'allowance'), 'td-caption')
    + `<rect class="td-bar td-bar--a" x="${x0}" y="140" width="${f1(a)}" height="54" rx="8"/>`
    + (over ? '' : `<rect class="td-bar td-bar--b" x="${f1(x0 + a + 4)}" y="140" width="${f1(Math.max(width - a - 4, 0))}" height="54" rx="8"/>`)
    + text(x0 + a / 2, 232, L(ctx, 'loadedVehicle'), 'td-caption') + text(x0 + a / 2, 264, `${fmt(ctx, loaded, 0)} ${unit}`, 'td-text td-text--a')
    + (over ? '' : text(x0 + a + (width - a) / 2, 232, L(ctx, 'trailer'), 'td-caption') + text(x0 + a + (width - a) / 2, 264, `${fmt(ctx, trailer, 0)} ${unit}`, 'td-text td-text--b'))
    + dimension(x0, x0 + width, 318, `GCWR ${fmt(ctx, gcwr, 0)} ${unit}`);
  return { svg: svg('towing', 640, 350, body, `GCWR ${fmt(ctx, gcwr, 0)} ${unit}`), readout: `${fmt(ctx, gcwr, 0)} − ${fmt(ctx, loaded, 0)} = ${fmt(ctx, trailer, 0)} ${unit}` };
}

function quarterMile(values: DrawingValues, ctx: Ctx): Drawing {
  const w = num(values, 'weight');
  const lb = values.weightUnit === 'kg' ? w * 2.2046226218 : w;
  const p = num(values, 'power');
  const hp = values.powerUnit === 'kw' ? p / 0.745699872 : p;
  const ratio = lb / hp;
  const et = 5.825 * Math.cbrt(ratio);
  const trapMph = 234 * Math.cbrt(1 / ratio);
  const trapKmh = trapMph * 1.609344;
  // Idealized constant power: v grows with the cube root of distance.
  const x0 = 70;
  const x1 = 560;
  const y0 = 300;
  const top = 110;
  let d = '';
  for (let i = 0; i <= 40; i += 1) {
    const s = i / 40;
    d += `${i ? 'L' : 'M'}${f1(x0 + s * (x1 - x0))} ${f1(y0 - Math.cbrt(s) * (y0 - top))}`;
  }
  const body = text(200, 52, `${fmt(ctx, et, 2)} s`, 'td-big') + text(200, 84, L(ctx, 'elapsed'), 'td-caption')
    + text(470, 52, `${fmt(ctx, trapKmh, 0)} km/h`, 'td-big') + text(470, 84, `${L(ctx, 'trap')} · ${fmt(ctx, trapMph, 0)} mph`, 'td-caption')
    + line(x0, y0, x1, y0, 'td-axis') + line(x0, y0, x0, top - 10, 'td-axis')
    + `<path class="td-curve td-curve--a" d="${d}"/>` + `<circle class="td-marker td-marker--b" cx="${x1}" cy="${top}" r="10"/>`
    + line(x1, top, x1, y0, 'td-guide')
    + text(x0, y0 + 34, L(ctx, 'start'), 'td-caption') + text(x1, y0 + 34, `${L(ctx, 'finish')} · 402 m`, 'td-caption');
  return { svg: svg('quarter', 640, 360, body, `${fmt(ctx, et, 2)} s · ${fmt(ctx, trapKmh, 0)} km/h`), readout: `${fmt(ctx, et, 2)} s · ${fmt(ctx, trapMph, 0)} mph (${fmt(ctx, trapKmh, 0)} km/h)` };
}

const CURRENCY: Readonly<Record<string, string>> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', TRY: '₺', PLN: 'zł', BRL: 'R$' };
const money = (ctx: Ctx, value: number, currency: string): string => {
  const symbol = CURRENCY[currency] ?? currency;
  const amount = fmt(ctx, value, 2);
  return currency === 'PLN' || (currency === 'TRY' && ctx.comma) ? `${amount} ${symbol}` : `${symbol}${amount}`;
};

function fuelCost(values: DrawingValues, ctx: Ctx): Drawing {
  const metric = values.system !== 'imperial';
  const distance = num(values, 'distance');
  const economy = num(values, 'economy');
  const price = num(values, 'price');
  const currency = values.currency ?? 'USD';
  const result = calculateFuelCostTool({ system: metric ? 'metric' : 'imperial', distance, economy, price });
  const fuel = result.ok ? result.value.fuelRequired : 0;
  const cost = result.ok ? result.value.fuelCost : 0;
  const du = metric ? 'km' : 'mi';
  const fu = metric ? 'L' : 'gal';
  const eu = metric ? 'L/100 km' : 'mpg';
  const card = (x: number, value: string, caption: string, sub: string, cls: string): string =>
    `<rect class="td-card" x="${x}" y="110" width="170" height="130" rx="16"/>${text(x + 85, 172, value, `td-kpi ${cls}`)}${text(x + 85, 206, sub, 'td-caption')}${text(x + 85, 276, caption, 'td-caption')}`;
  const body = card(20, `${fmt(ctx, distance, 0)}`, L(ctx, 'distance'), du, 'td-text--ink')
    + text(213, 184, metric ? '×' : '÷', 'td-op') + card(235, `${fmt(ctx, fuel, 1)}`, L(ctx, 'fuel'), `${fu} · ${fmt(ctx, economy, 1)} ${eu}`, 'td-text--a')
    + text(428, 184, '×', 'td-op') + card(450, money(ctx, cost, currency), L(ctx, 'total'), `${money(ctx, price, currency)} / ${fu}`, 'td-text--b')
    + text(320, 52, `${fmt(ctx, distance, 0)} ${du} → ${fmt(ctx, fuel, 1)} ${fu} → ${money(ctx, cost, currency)}`, 'td-big td-big--small')
    + text(320, 330, `${money(ctx, (cost / distance) * 100, currency)} / 100 ${du}`, 'td-text td-text--muted');
  return { svg: svg('fuel', 640, 360, body, `${fmt(ctx, fuel, 1)} ${fu} · ${money(ctx, cost, currency)}`), readout: `${fmt(ctx, fuel, 1)} ${fu} · ${money(ctx, cost, currency)}` };
}

function roadTrip(values: DrawingValues, ctx: Ctx): Drawing {
  const metric = values.system !== 'imperial';
  const round = values.tripType === 'round';
  const oneWay = num(values, 'distance');
  const distance = round ? oneWay * 2 : oneWay;
  const economy = num(values, 'economy');
  const price = num(values, 'price');
  const extras = num(values, 'extraCost') || 0;
  const people = Math.max(1, Math.round(num(values, 'people') || 1));
  const currency = values.currency ?? 'USD';
  const result = calculateRoadTripCostTool({ system: metric ? 'metric' : 'imperial', distance: oneWay, economy, price, roundTrip: round, extraCost: extras, people });
  const fuelCost = result.ok ? result.value.fuelCost : 0;
  const total = result.ok ? result.value.totalTripCost : 0;
  const du = metric ? 'km' : 'mi';
  const x0 = 60;
  const width = 520;
  const fuelWidth = total > 0 ? (fuelCost / total) * width : width;
  const body = `<path class="td-route" d="M${x0} 150C200 70 330 230 ${x0 + width} 150"/>`
    + `<circle class="td-marker td-marker--a" cx="${x0}" cy="150" r="11"/><circle class="td-marker td-marker--b" cx="${x0 + width}" cy="150" r="11"/>`
    + (round ? `<path class="td-route td-route--return" d="M${x0 + width} 172C430 250 200 100 ${x0} 172"/>` : '')
    + text(320, 52, `${fmt(ctx, distance, 0)} ${du}${round ? ' ⇄' : ''}`, 'td-big') + text(320, 88, L(ctx, 'distance'), 'td-caption')
    + `<rect class="td-bar td-bar--a" x="${x0}" y="236" width="${f1(Math.max(fuelWidth, 4))}" height="34" rx="8"/>`
    + (extras > 0 ? `<rect class="td-bar td-bar--b" x="${f1(x0 + fuelWidth + 4)}" y="236" width="${f1(Math.max(width - fuelWidth - 4, 4))}" height="34" rx="8"/>` : '')
    + text(x0, 302, `${L(ctx, 'fuel')} ${money(ctx, fuelCost, currency)}`, 'td-text td-text--a', 'start')
    + (extras > 0 ? text(x0 + width, 302, `${L(ctx, 'extras')} ${money(ctx, extras, currency)}`, 'td-text td-text--b', 'end') : '')
    + text(320, 352, `${L(ctx, 'total')} ${money(ctx, total, currency)}${people > 1 ? ` · ${money(ctx, total / people, currency)} × ${people}` : ''}`, 'td-text');
  return { svg: svg('trip', 640, 380, body, `${fmt(ctx, distance, 0)} ${du} · ${money(ctx, total, currency)}`), readout: `${fmt(ctx, distance, 0)} ${du} · ${money(ctx, total, currency)}` };
}

const LOAD_INDEX_KG: Readonly<Record<number, number>> = {
  75: 387, 76: 400, 77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500, 85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600,
  91: 615, 92: 630, 93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800, 101: 825, 102: 850, 103: 875, 104: 900, 105: 925,
  106: 950, 107: 975, 108: 1000, 109: 1030, 110: 1060, 111: 1090, 112: 1120, 113: 1150, 114: 1180, 115: 1215, 116: 1250, 117: 1285, 118: 1320,
  119: 1360, 120: 1400, 121: 1450, 122: 1500, 123: 1550, 124: 1600, 125: 1650, 126: 1700,
};
const SPEED_RATING_KMH: Readonly<Record<string, number>> = { L: 120, M: 130, N: 140, P: 150, Q: 160, R: 170, S: 180, T: 190, U: 200, H: 210, V: 240, W: 270, Y: 300 };

/** Tire seen from the side with the code on the sidewall and two decoded callouts. */
function sidewall(code: string, highlight: string, first: { key: string; value: string }, second: { key: string; value: string }): string {
  const cx = 210;
  const cy = 200;
  return `<circle class="td-tire" cx="${cx}" cy="${cy}" r="160"/><circle class="td-rim" cx="${cx}" cy="${cy}" r="98"/><circle class="td-part-line" cx="${cx}" cy="${cy}" r="30"/>`
    + `<rect class="td-chip" x="${cx - 110}" y="${cy - 150}" width="220" height="44" rx="12"/>`
    + text(cx, cy - 119, `${esc(code)} <tspan class="td-text--b">${esc(highlight)}</tspan>`, 'td-code')
    + `<path class="td-callout" d="M${cx + 110} ${cy - 136}H${cx + 160}L${cx + 210} ${cy - 160}"/><path class="td-callout" d="M${cx + 110} ${cy - 120}H${cx + 160}L${cx + 210} ${cy + 20}"/>`
    + text(cx + 222, cy - 166, first.key, 'td-text td-text--b', 'start') + text(cx + 222, cy - 132, first.value, 'td-kpi td-kpi--left', 'start')
    + text(cx + 222, cy + 14, second.key, 'td-text td-text--b', 'start') + text(cx + 222, cy + 48, second.value, 'td-kpi td-kpi--left', 'start');
}

function loadSpeed(values: DrawingValues, ctx: Ctx): Drawing {
  const load = Number.parseInt(values.loadIndex ?? '91', 10);
  const speed = (values.speedRating ?? 'V').toUpperCase();
  const kg = LOAD_INDEX_KG[load];
  const kmh = SPEED_RATING_KMH[speed];
  const body = sidewall('225/45 R17', `${load}${speed}`,
    { key: `${load} = ${L(ctx, 'loadIndex')}`, value: kg ? `${fmt(ctx, kg, 0)} kg` : '—' },
    { key: `${esc(speed)} = ${L(ctx, 'speedRating')}`, value: kmh ? `${kmh} km/h` : '—' });
  return { svg: svg('code', 640, 380, body, `${load}${speed}`), readout: `${load}${speed}${kg ? ` · ${fmt(ctx, kg, 0)} kg` : ''}${kmh ? ` · ${kmh} km/h` : ''}` };
}

function dotDate(values: DrawingValues, ctx: Ctx): Drawing {
  const digits = (values.code ?? '').replace(/\D/g, '').slice(0, 4);
  // Same plausibility rules as the decoder: week 01–53 and a year that is not in the future.
  const week = digits.length === 4 ? Number(digits.slice(0, 2)) : NaN;
  const year = digits.length === 4 ? 2000 + Number(digits.slice(2)) : NaN;
  const ok = week >= 1 && week <= 53 && year <= new Date().getFullYear();
  const shown = digits.padEnd(4, '–');
  const body = sidewall('DOT', shown,
    { key: `${shown.slice(0, 2)} = ${L(ctx, 'week')}`, value: ok ? String(week) : '' },
    { key: `${shown.slice(2)} = ${L(ctx, 'year')}`, value: ok ? String(year) : '' });
  return { svg: svg('code', 640, 380, body, `DOT ${shown}`), readout: ok ? `DOT ${shown} · ${week} / ${year}` : '' };
}

/** Wheel and tire in the arch with the two gaps the measuring guide asks for. */
function measure(_values: DrawingValues, ctx: Ctx): Drawing {
  const body = `<path class="td-part" d="M110 60V330"/><path class="td-part" d="M530 60V330"/>`
    + `<rect class="td-tire-section" x="230" y="70" width="180" height="250" rx="46"/><rect class="td-rim-section" x="252" y="140" width="136" height="110" rx="10"/>`
    + arrow(230, 300, 116, 300, 'td-force td-force--a') + arrow(410, 300, 524, 300, 'td-force td-force--b')
    + text(170, 286, L(ctx, 'inner'), 'td-caption') + text(470, 286, L(ctx, 'outer'), 'td-caption')
    + text(320, 46, L(ctx, 'wheelBody'), 'td-caption');
  return { svg: svg('measure', 640, 350, body, `${L(ctx, 'inner')} · ${L(ctx, 'outer')}`), readout: '' };
}

/** Width × ET plane: each column a wheel width, each mark an offset; the highlighted cell is one setup. */
function fitmentMap(_values: DrawingValues, ctx: Ctx): Drawing {
  const widths = [7, 7.5, 8, 8.5, 9, 9.5];
  const offsets = [20, 25, 30, 35, 40, 45, 50];
  const x = (i: number): number => 120 + i * 80;
  const y = (j: number): number => 300 - j * 34;
  let cells = '';
  widths.forEach((w, i) => {
    cells += text(x(i), 336, `${ctx.comma ? String(w).replace('.', ',') : w}J`, 'td-tick-text');
    offsets.forEach((_, j) => { cells += `<circle class="td-dot" cx="${x(i)}" cy="${y(j)}" r="6"/>`; });
  });
  offsets.forEach((et, j) => { cells += text(78, y(j) + 7, `ET${et}`, 'td-tick-text', 'end'); });
  const body = cells + `<circle class="td-marker td-marker--a" cx="${x(2)}" cy="${y(4)}" r="13"/><circle class="td-marker td-marker--b" cx="${x(3)}" cy="${y(3)}" r="13"/>`
    + arrow(x(2) + 14, y(4) + 4, x(3) - 16, y(3) + 4, 'td-force td-force--b')
    + text(320, 372, L(ctx, 'width'), 'td-caption') + text(320, 44, L(ctx, 'offset'), 'td-caption');
  return { svg: svg('map', 640, 390, body, `${L(ctx, 'width')} × ${L(ctx, 'offset')}`), readout: '' };
}

/** Hub face with lug holes on the bolt circle, the adjacent-hole chord and the PCD. */
function hub(ctx: Ctx, lugs: number, pcd: number, chord: number | undefined, subtitle: string): string {
  const cx = 320;
  const cy = 262;
  const scale = 300 / Math.max(pcd, 60);
  const r = (pcd / 2) * scale;
  const holes = Array.from({ length: lugs }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / lugs;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  const [h0, h1] = [holes[0]!, holes[1]!];
  let body = `<circle class="td-hub-face" cx="${cx}" cy="${cy}" r="${f1(r + 46)}"/><circle class="td-pcd" cx="${cx}" cy="${cy}" r="${f1(r)}"/><circle class="td-part-line" cx="${cx}" cy="${cy}" r="${f1(Math.max(r * 0.42, 24))}"/>`;
  body += holes.map(([hx, hy]) => `<circle class="td-lug" cx="${f1(hx)}" cy="${f1(hy)}" r="15"/>`).join('');
  body += line(cx - r, cy, cx + r, cy, 'td-dim-line td-dim-line--a') + text(cx, cy - 12, `PCD ${fmt(ctx, pcd, 1)} mm`, 'td-text td-text--a');
  if (chord !== undefined) body += line(h0[0], h0[1], h1[0], h1[1], 'td-dim-line td-dim-line--b') + text((h0[0] + h1[0]) / 2 + 44, (h0[1] + h1[1]) / 2 - 30, `${fmt(ctx, chord, 1)} mm`, 'td-text td-text--b', 'start');
  body += text(cx, 40, `${lugs} × ${fmt(ctx, pcd, 1)}`, 'td-big') + text(cx, 492, subtitle, 'td-text td-text--muted');
  return body;
}

function boltPattern(values: DrawingValues, ctx: Ctx): Drawing {
  const lugs = Math.max(3, Math.min(10, Math.round(num(values, 'lugCount') || 5)));
  const raw = num(values, 'spacing');
  const spacing = values.spacingUnit === 'in' ? raw * 25.4 : raw;
  const ok = Number.isFinite(spacing) && spacing > 0;
  const pcd = ok ? pcdFromAdjacentHoleSpacingMm(spacing, lugs) : 0;
  const body = ok ? hub(ctx, lugs, pcd, spacing, `PCD = ${fmt(ctx, spacing, 1)} ÷ sin(180° ÷ ${lugs})`) : '';
  return { svg: svg('pcd', 640, 510, body, ok ? `${lugs} × ${fmt(ctx, pcd, 1)} mm` : ''), readout: ok ? `${lugs} × ${fmt(ctx, pcd, 1)} mm` : '' };
}

function vehicleHub(values: DrawingValues, ctx: Ctx): Drawing {
  const lugs = Math.round(num(values, 'lugs'));
  const pcd = num(values, 'pcd');
  if (!(lugs >= 3 && pcd > 0)) {
    // Before a vehicle is chosen: an unlabelled hub with ghost lug holes, no invented numbers.
    const ghosts = Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `<circle class="td-lug td-lug--ghost" cx="${f1(320 + 120 * Math.cos(a))}" cy="${f1(262 + 120 * Math.sin(a))}" r="15"/>`;
    }).join('');
    const body = `<circle class="td-hub-face" cx="320" cy="262" r="166"/><circle class="td-pcd" cx="320" cy="262" r="120"/><circle class="td-part-line" cx="320" cy="262" r="50"/>` + ghosts + text(320, 40, L(ctx, 'boltPattern'), 'td-caption');
    return { svg: svg('pcd', 640, 510, body, L(ctx, 'boltPattern')), readout: '' };
  }
  const body = hub(ctx, lugs, pcd, undefined, values.tire ? esc(values.tire) : '');
  return { svg: svg('pcd', 640, 510, body, `${lugs} × ${fmt(ctx, pcd, 1)}`), readout: `${lugs} × ${fmt(ctx, pcd, 1)}${values.tire ? ` · ${values.tire}` : ''}` };
}

function speedometer(values: DrawingValues, ctx: Ctx): Drawing {
  const dia = (prefix: string): number => num(values, `${prefix}rimDiameterInches`) * 25.4 + 2 * num(values, `${prefix}widthMm`) * num(values, `${prefix}aspectRatio`) / 100;
  const ratio = dia('new-') / dia('original-');
  const shown = num(values, 'indicatedSpeed');
  const unit = values.unit === 'mph' ? 'mph' : 'km/h';
  const actual = shown * ratio;
  const [max, step] = niceMax(Math.max(shown, actual, 1) * 1.2, unit === 'mph' ? [10, 20, 40] : [20, 40, 60]);
  const valid = Number.isFinite(actual) && actual > 0;
  const body = gauge(ctx, 320, 270, 220, max, step, valid ? [{ value: shown, cls: 'a' }, { value: actual, cls: 'b' }] : [])
    + text(320, 210, unit, 'td-unit') + (valid ? text(320, 330, `${ratio >= 1 ? '+' : '−'}${fmt(ctx, Math.abs(ratio - 1) * 100, 1)} %`, 'td-text td-text--b') : '')
    + text(200, 430, valid ? `${fmt(ctx, shown, 0)}` : '—', 'td-big td-text--a') + text(200, 466, L(ctx, 'indicated'), 'td-caption')
    + text(440, 430, valid ? `${fmt(ctx, actual, 1)}` : '—', 'td-big td-text--b') + text(440, 466, L(ctx, 'actual'), 'td-caption');
  return { svg: svg('speed', 640, 490, body, `${fmt(ctx, shown, 0)} → ${fmt(ctx, actual, 1)} ${unit}`), readout: valid ? `${fmt(ctx, shown, 0)} ${unit} → ${fmt(ctx, actual, 1)} ${unit}` : '—' };
}

function compression(values: DrawingValues, ctx: Ctx): Drawing {
  const bore = num(values, 'bore');
  const stroke = num(values, 'stroke');
  const clearance = (num(values, 'chamber') || 0) + (num(values, 'otherVolume') || 0);
  const swept = (Math.PI / 4) * bore * bore * stroke / 1000;
  const ratio = (swept + clearance) / clearance;
  const valid = bore > 0 && stroke > 0 && clearance > 0;
  if (!valid) return { svg: svg('cr', 640, 460, '', ''), readout: '—' };
  const clearanceHeight = (clearance * 1000) / ((Math.PI / 4) * bore * bore);
  const scale = Math.min(260 / bore, 300 / (stroke + clearanceHeight + 20));
  const w = bore * scale;
  const x = 320 - w / 2;
  const headY = 70;
  const tdcY = headY + clearanceHeight * scale;
  const bdcY = tdcY + stroke * scale;
  const body = `<path class="td-part" d="M${f1(x - 18)} ${headY}H${f1(x + w + 18)}"/>`
    + `<rect class="td-volume td-volume--b" x="${f1(x)}" y="${headY}" width="${f1(w)}" height="${f1(tdcY - headY)}"/>`
    + `<rect class="td-volume td-volume--a" x="${f1(x)}" y="${f1(tdcY)}" width="${f1(w)}" height="${f1(bdcY - tdcY)}"/>`
    + line(x, headY, x, bdcY + 70, 'td-part') + line(x + w, headY, x + w, bdcY + 70, 'td-part')
    + `<rect class="td-piston td-piston--ghost" x="${f1(x + 4)}" y="${f1(tdcY)}" width="${f1(w - 8)}" height="44" rx="4"/>`
    + `<rect class="td-piston" x="${f1(x + 4)}" y="${f1(bdcY)}" width="${f1(w - 8)}" height="44" rx="4"/>`
    + dimension(x, x + w, headY - 22, `Ø ${fmt(ctx, bore, 1)} mm`)
    + `<g class="td-dim">${line(x + w + 40, tdcY, x + w + 40, bdcY, 'td-dim-line')}${text(x + w + 54, (tdcY + bdcY) / 2 + 8, `${fmt(ctx, stroke, 1)} mm`, 'td-dim-text', 'start')}</g>`
    + text(x - 26, (headY + tdcY) / 2 + 8, `Vc ${fmt(ctx, clearance, 1)} cm³`, 'td-text td-text--b', 'end')
    + text(x - 26, (tdcY + bdcY) / 2 + 8, `Vs ${fmt(ctx, swept, 1)} cm³`, 'td-text td-text--a', 'end')
    + text(320, bdcY + 116, `${fmt(ctx, ratio, 2)} : 1`, 'td-big');
  return { svg: svg('cr', 640, Math.ceil(bdcY + 140), body, `${fmt(ctx, ratio, 2)} : 1`), readout: `(${fmt(ctx, swept, 1)} + ${fmt(ctx, clearance, 1)}) ÷ ${fmt(ctx, clearance, 1)} = ${fmt(ctx, ratio, 2)} : 1` };
}

/** Full setup (tire on wheel, width and ET) — the shared fitment cross-section in wheel mode. */
function fitmentSetup(values: DrawingValues, ctx: Ctx): Drawing {
  const setup = (prefix: string) => {
    const width = num(values, `${prefix}tireWidthMm`);
    const aspect = num(values, `${prefix}tireAspectRatio`);
    const rim = num(values, `${prefix}rimDiameterInches`);
    const wheel = num(values, `${prefix}wheelWidthInches`);
    const offset = num(values, `${prefix}wheelOffsetMm`);
    const label = `${width}/${aspect} R${rim} · ${ctx.comma ? String(wheel).replace('.', ',') : wheel}J ET${offset}`;
    return { label, tireWidthMm: width, aspectRatio: aspect, rimInches: rim, wheelWidthInches: wheel, offsetMm: offset };
  };
  const current = setup('current-');
  const next = setup('proposed-');
  const valid = [current, next].every((entry) => [entry.tireWidthMm, entry.aspectRatio, entry.rimInches, entry.wheelWidthInches, entry.offsetMm].every(Number.isFinite));
  if (!valid) return { svg: '', readout: '—' };
  const sectionSvg = renderFitmentSection({ mode: 'wheel', current, next, labels: { current: '', next: '', inner: ctx.labels.inner ?? '', outer: ctx.labels.outer ?? '', hub: ctx.labels.hub ?? '', aria: `${current.label} → ${next.label}` }, decimalComma: ctx.comma });
  const innerMm = (-current.offsetMm - (current.wheelWidthInches * 25.4) / 2) - (-next.offsetMm - (next.wheelWidthInches * 25.4) / 2);
  const outerMm = (-next.offsetMm + (next.wheelWidthInches * 25.4) / 2) - (-current.offsetMm + (current.wheelWidthInches * 25.4) / 2);
  const signed = (v: number): string => `${v > 0.004 ? '+' : v < -0.004 ? '−' : ''}${fmt(ctx, Math.abs(v), 1)} mm`;
  return { svg: sectionSvg, readout: `${ctx.labels.inner ?? ''} ${signed(innerMm)} · ${ctx.labels.outer ?? ''} ${signed(outerMm)}`.trim() };
}

/** Battery from the start to the target charge; the added energy, grid energy and time come from the calculator. */
function evCharge(values: DrawingValues, ctx: Ctx): Drawing {
  const start = num(values, 'startPercent');
  const end = num(values, 'endPercent');
  const currency = values.currency ?? 'USD';
  const result = calculateEvChargingCostTool({
    batteryCapacityKwh: num(values, 'batteryCapacityKwh'), startPercent: start, endPercent: end,
    pricePerKwh: num(values, 'pricePerKwh'), chargerPowerKw: num(values, 'chargerPowerKw'), chargingEfficiency: num(values, 'chargingEfficiency'),
  });
  const x0 = 70;
  const width = 460;
  const top = 132;
  const height = 104;
  const at = (percent: number): number => x0 + (Math.max(0, Math.min(100, percent)) / 100) * width;
  let ticks = '';
  for (let p = 10; p < 100; p += 10) ticks += line(at(p), top + height - 14, at(p), top + height - 4, 'td-tick');
  const fills = result.ok
    ? `<rect class="td-bar td-bar--muted" x="${x0 + 6}" y="${top + 6}" width="${f1(Math.max(at(start) - x0 - 6, 0))}" height="${height - 12}" rx="10"/>`
      + `<rect class="td-bar td-bar--a" x="${f1(at(start))}" y="${top + 6}" width="${f1(Math.max(at(end) - at(start) - (end >= 100 ? 6 : 0), 2))}" height="${height - 12}" rx="${start <= 0 ? 10 : 2}"/>`
    : '';
  const hours = result.ok ? result.value.hours : 0;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const time = m === 60 ? `${h + 1} h` : h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
  const marks = Number.isFinite(start) && Number.isFinite(end)
    ? text(at(start), top - 16, `${fmt(ctx, start, 0)} %`, 'td-text td-text--muted') + text(at(end), top - 16, `${fmt(ctx, end, 0)} %`, 'td-text td-text--a')
      + line(at(start), top - 8, at(start), top + height + 8, 'td-guide') + line(at(end), top - 8, at(end), top + height + 8, 'td-guide')
    : '';
  const body = `<rect class="td-part-line" x="${x0}" y="${top}" width="${width}" height="${height}" rx="16"/><rect class="td-part-line" x="${x0 + width + 4}" y="${top + 32}" width="12" height="${height - 64}" rx="4"/>`
    + fills + ticks + marks
    + (result.ok
      ? text(320, 56, `${money(ctx, result.value.cost, currency)} · ${time}`, 'td-big')
        + text((at(start) + at(end)) / 2, top + height + 44, `+${fmt(ctx, result.value.batteryEnergyKwh, 1)} kWh`, 'td-text td-text--a')
      : '');
  const readout = result.ok ? `${fmt(ctx, start, 0)} → ${fmt(ctx, end, 0)} % · ${fmt(ctx, result.value.gridEnergyKwh, 1)} kWh · ${money(ctx, result.value.cost, currency)} · ${time}` : '';
  return { svg: svg('ev', 640, 300, body, readout || 'EV battery'), readout };
}

const RENDERERS: Readonly<Record<DrawingKind, (values: DrawingValues, ctx: Ctx) => Drawing>> = {
  'psi-bar-converter': psi, 'hp-kw-converter': power, 'nm-lb-ft-converter': torque, 'mpg-l100km-converter': mpg,
  'power-to-weight-calculator': powerToWeight, 'towing-capacity-calculator': towing, 'quarter-mile-calculator': quarterMile,
  'fuel-cost-calculator': fuelCost, 'road-trip-cost-calculator': roadTrip, 'tire-load-speed-rating': loadSpeed, 'tire-date-code-decoder': dotDate,
  'measure-my-car': measure, 'fitment-map': fitmentMap, 'vehicle-fitment-finder': vehicleHub, speedometer, compression, 'bolt-pattern': boltPattern,
  'fitment-setup': fitmentSetup, 'ev-charge': evCharge,
};

export const isDrawingKind = (value: string): value is DrawingKind => value in RENDERERS;

export function renderToolDrawing(kind: DrawingKind, values: DrawingValues | undefined, labels: DrawingLabels = {}, decimalComma = false): Drawing {
  // Blank or unreadable numeric fields fall back to the default geometry, but the readout is
  // cleared so the page never states a number the visitor did not enter.
  const defaults = DRAWING_DEFAULTS[kind];
  const merged: Record<string, string | undefined> = { ...defaults };
  let incomplete = false;
  for (const [key, raw] of Object.entries(values ?? {})) {
    const fallback = defaults[key];
    const numericField = fallback !== undefined && Number.isFinite(Number.parseFloat(fallback)) && key !== 'code';
    const text = String(raw ?? '').trim();
    if (numericField && !Number.isFinite(Number.parseFloat(text.replace(',', '.')))) { incomplete = true; continue; }
    if (key === 'code' && text === '') { incomplete = true; continue; }
    merged[key] = raw;
  }
  const drawing = RENDERERS[kind](merged, { comma: decimalComma, labels });
  return incomplete ? { svg: drawing.svg, readout: '' } : drawing;
}
