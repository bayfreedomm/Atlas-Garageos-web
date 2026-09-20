import { calculateSpeedometerTool, calculateTireSizeTool, calculateWheelOffsetTool, compareTireSizesTool, nearEquivalentSizesTool, speedometerTableTool, type NearEquivalentSize, type SpeedometerTableRow, type TireToolInput } from '../features/tools/calculator-tools';
import { speedometerMetrics, speedometerSummary, tireCalculatorMetrics, tireCalculatorSummary, tireComparisonMetrics, tireComparisonSummary, toolIssueText, wheelOffsetMetrics, wheelOffsetSummary, type PresentedMetric } from './tool-presentation';
import { tireScaleMapping, wheelOffsetVisualMapping } from './fitment-visualizer-model';
import { getPageLocale } from './page-locale';
import { computeTireCrossSection } from './tire-cross-section';

const numberValue = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));
const tireValue = (form: HTMLFormElement, prefix: string): TireToolInput => ({ widthMm: numberValue(form, `${prefix}widthMm`), aspectRatio: numberValue(form, `${prefix}aspectRatio`), rimDiameterInches: numberValue(form, `${prefix}rimDiameterInches`) });

// Direction-phrase fragments shared across the wheel-offset visuals. Kept in one
// place so the same German/Spanish wording is used everywhere the same concept
// (an edge moving farther in/out, toward the fender, toward the suspension) appears.
const WHEEL_DIRECTION_TEXT = {
  en: {
    fartherInward: 'farther inward',
    lessInward: 'less inward',
    moreInnerClearance: 'more inner clearance',
    fartherOutward: 'farther outward',
    lessOutward: 'less outward',
    towardFender: 'farther toward the fender',
    inward: 'inward',
    towardSuspension: 'toward the suspension',
    awayFromSuspension: 'away from the suspension',
  },
  de: {
    fartherInward: 'weiter nach innen',
    lessInward: 'weniger weit nach innen',
    moreInnerClearance: 'mehr Freiraum nach innen',
    fartherOutward: 'weiter nach außen',
    lessOutward: 'weniger weit nach außen',
    towardFender: 'weiter Richtung Kotflügel',
    inward: 'nach innen',
    towardSuspension: 'Richtung Fahrwerk',
    awayFromSuspension: 'vom Fahrwerk weg',
  },
  es: {
    fartherInward: 'más hacia adentro',
    lessInward: 'menos hacia adentro',
    moreInnerClearance: 'más holgura interior',
    fartherOutward: 'más hacia afuera',
    lessOutward: 'menos hacia afuera',
    towardFender: 'más hacia el guardabarros',
    inward: 'hacia adentro',
    towardSuspension: 'hacia la suspensión',
    awayFromSuspension: 'alejándose de la suspensión',
  },
} as const;

function renderMetrics(container: HTMLDListElement, metrics: readonly PresentedMetric[]): void {
  container.replaceChildren(...metrics.map((metric) => {
    const wrapper = document.createElement('div');
    const term = document.createElement('dt'); term.textContent = metric.label;
    const value = document.createElement('dd'); value.textContent = metric.value;
    wrapper.append(term, value); return wrapper;
  }));
}

function renderIssues(container: HTMLElement, issues: readonly Parameters<typeof toolIssueText>[0][]): void {
  const list = document.createElement('ul');
  for (const issue of issues) { const item = document.createElement('li'); item.textContent = toolIssueText(issue); list.append(item); }
  container.replaceChildren(list); container.hidden = false;
}

function setSummary(form: HTMLFormElement, summary: string): void {
  const element = form.querySelector<HTMLElement>('[data-result-summary]');
  if (element) { element.hidden = false; element.textContent = summary; element.classList.remove('is-pending'); }
}

function hideSummary(form: HTMLFormElement): void {
  const element = form.querySelector<HTMLElement>('[data-result-summary]');
  if (element) element.hidden = true;
}

function setTireVisual(form: HTMLFormElement, input: TireToolInput, currentDiameterMm: number, proposed?: TireToolInput, proposedDiameterMm?: number): void {
  const visual = form.querySelector<HTMLElement>('[data-fitment-visualizer]');
  if (!visual) return;
  const model = proposed && proposedDiameterMm !== undefined
    ? tireScaleMapping({ currentDiameterMm, currentRimDiameterInches: input.rimDiameterInches, proposedDiameterMm, proposedRimDiameterInches: proposed.rimDiameterInches })
    : tireScaleMapping({ currentDiameterMm, currentRimDiameterInches: input.rimDiameterInches });
  visual.querySelector<SVGCircleElement>('[data-current-tire]')?.setAttribute('r', String(model.currentTireRadius));
  visual.querySelector<SVGCircleElement>('[data-current-rim]')?.setAttribute('r', String(model.currentRimRadius));
  visual.querySelector<SVGCircleElement>('[data-new-tire]')?.setAttribute('r', String(model.proposedTireRadius));
  visual.querySelector<SVGCircleElement>('[data-new-rim]')?.setAttribute('r', String(model.proposedRimRadius));
  const currentLabel = visual.querySelector<HTMLElement>('[data-current-tire-label]');
  const proposedLabel = visual.querySelector<HTMLElement>('[data-new-tire-label]');
  if (currentLabel) currentLabel.textContent = `${input.widthMm}/${input.aspectRatio} R${input.rimDiameterInches} · ${currentDiameterMm.toFixed(1)} mm`;
  if (proposedLabel && proposed && proposedDiameterMm !== undefined) proposedLabel.textContent = `${proposed.widthMm}/${proposed.aspectRatio} R${proposed.rimDiameterInches} · ${proposedDiameterMm.toFixed(1)} mm`;
}


const NEAR_SIZES_TEXT = {
  en: {
    heading: 'Near-equivalent sizes',
    note: 'Calculated matches within about 3% of this diameter at nearby rim sizes — not confirmed against a real tire catalog.',
    diff: (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}% diameter`,
  },
  de: {
    heading: 'Ähnliche Ersatzgrößen',
    note: 'Berechnete Übereinstimmungen innerhalb von etwa 3 % dieses Durchmessers bei benachbarten Felgengrößen — nicht mit einem echten Reifenkatalog abgeglichen.',
    diff: (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(1).replace('.', ',')}% Durchmesser`,
  },
  es: {
    heading: 'Tamaños equivalentes cercanos',
    note: 'Coincidencias calculadas dentro de aproximadamente un 3% de este diámetro en llantas de tamaño cercano — no confirmadas en un catálogo real de neumáticos.',
    diff: (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(1).replace('.', ',')}% de diámetro`,
  },
} as const;

function renderNearEquivalentSizes(form: HTMLFormElement, input: TireToolInput): void {
  const container = form.querySelector<HTMLElement>('[data-near-sizes]');
  if (!container) return;
  const result = nearEquivalentSizesTool(input);
  if (!result.ok || result.value.length === 0) { container.hidden = true; return; }
  const t = NEAR_SIZES_TEXT[getPageLocale()];
  const heading = container.querySelector<HTMLElement>('[data-near-sizes-heading]');
  const note = container.querySelector<HTMLElement>('[data-near-sizes-note]');
  const list = container.querySelector<HTMLUListElement>('[data-near-sizes-list]');
  if (heading) heading.textContent = t.heading;
  if (note) note.textContent = t.note;
  if (list) {
    list.replaceChildren(...result.value.map((candidate: NearEquivalentSize) => {
      const item = document.createElement('li');
      const size = document.createElement('span'); size.className = 'near-sizes__size';
      size.textContent = `${candidate.tire.widthMm}/${candidate.tire.aspectRatio}R${candidate.tire.rimDiameterInches}`;
      const diff = document.createElement('span'); diff.className = 'near-sizes__diff';
      diff.textContent = t.diff(candidate.diameterDifferencePercent);
      item.append(size, diff);
      return item;
    }));
  }
  container.hidden = false;
}

const SPEED_TABLE_TEXT = {
  en: {
    heading: 'At other speeds',
    indicated: 'Indicated',
    actual: 'Actual',
  },
  de: {
    heading: 'Bei anderen Geschwindigkeiten',
    indicated: 'Angezeigt',
    actual: 'Tatsächlich',
  },
  es: {
    heading: 'A otras velocidades',
    indicated: 'Indicada',
    actual: 'Real',
  },
} as const;

function renderSpeedTable(form: HTMLFormElement, original: TireToolInput, proposed: TireToolInput, unit: 'km/h' | 'mph'): void {
  const container = form.querySelector<HTMLElement>('[data-speed-table]');
  if (!container) return;
  const result = speedometerTableTool(original, proposed, unit);
  if (!result.ok || result.value.length === 0) { container.hidden = true; return; }
  const t = SPEED_TABLE_TEXT[getPageLocale()];
  const heading = container.querySelector<HTMLElement>('[data-speed-table-heading]');
  const head = container.querySelector<HTMLTableRowElement>('[data-speed-table-head]');
  const body = container.querySelector<HTMLTableSectionElement>('[data-speed-table-body]');
  if (heading) heading.textContent = t.heading;
  if (head) {
    const indicated = document.createElement('th'); indicated.scope = 'col'; indicated.textContent = `${t.indicated} (${unit})`;
    const actual = document.createElement('th'); actual.scope = 'col'; actual.textContent = `${t.actual} (${unit})`;
    head.replaceChildren(indicated, actual);
  }
  if (body) {
    body.replaceChildren(...result.value.map((row: SpeedometerTableRow) => {
      const tr = document.createElement('tr');
      const indicated = document.createElement('th'); indicated.scope = 'row'; indicated.textContent = String(row.indicatedSpeed);
      const actual = document.createElement('td'); actual.textContent = row.actualSpeed.toFixed(1);
      tr.append(indicated, actual); return tr;
    }));
  }
  container.hidden = false;
}

const SINGLE_TIRE_TEXT = {
  en: {
    width: (widthMm: number) => `${widthMm} mm width`,
    rim: (rimInches: number) => `${rimInches} in rim`,
    taller: 'A taller sidewall is more visually pronounced.',
    lowerProfile: 'A lower-profile sidewall puts more visual emphasis on the rim.',
    balanced: 'This profile keeps a balanced sidewall-to-rim proportion.',
    suffix: ' The drawing follows the entered proportions.',
    rimCavityCaption: (rim: string) => `${rim} · inner cavity above the rim`,
  },
  de: {
    width: (widthMm: number) => `${widthMm} mm Breite`,
    rim: (rimInches: number) => `${rimInches} Zoll Felge`,
    taller: 'Eine höhere Flanke wirkt optisch ausgeprägter.',
    lowerProfile: 'Eine niedrigere Flanke legt den optischen Schwerpunkt stärker auf die Felge.',
    balanced: 'Dieses Profil hält ein ausgewogenes Verhältnis zwischen Flanke und Felge.',
    suffix: ' Die Zeichnung folgt den eingegebenen Proportionen.',
    rimCavityCaption: (rim: string) => `${rim} · Hohlraum über der Felge`,
  },
  es: {
    width: (widthMm: number) => `${widthMm} mm de ancho`,
    rim: (rimInches: number) => `${rimInches} pulg. de llanta`,
    taller: 'Un flanco más alto es visualmente más pronunciado.',
    lowerProfile: 'Un perfil más bajo pone más énfasis visual en la llanta.',
    balanced: 'Este perfil mantiene una proporción equilibrada entre el flanco y la llanta.',
    suffix: ' El dibujo sigue las proporciones introducidas.',
    rimCavityCaption: (rim: string) => `${rim} · cavidad interior sobre la llanta`,
  },
} as const;

// Geometry constants shared with TireSizeTechnicalVisual.astro's static
// markup. The outer tire radius is fixed on purpose: only the rim/tire ratio
// (a real ratio, rimDiameterMm / overallDiameterMm) drives the drawing, so
// every valid input produces a geometrically consistent picture rather than
// an independently-clamped, potentially-colliding one.
const TIRE_CENTER_X = 175;
const TIRE_CENTER_Y = 150;
const TIRE_OUTER_R = 92;
const TIRE_MIN_RIM_RATIO = 0.22;
const TIRE_MAX_RIM_RATIO = 0.9;
const TIRE_LUG_ANGLES_DEG = [-90, -18, 54, 126, 198];

function setSingleTireTechnicalVisual(form: HTMLFormElement, input: TireToolInput, result: Extract<ReturnType<typeof calculateTireSizeTool>, { ok: true }>['value']): void {
  const visual = form.querySelector<HTMLElement>('[data-single-tire-visual]');
  if (!visual) return;
  visual.hidden = false;
  const locale = getPageLocale();
  const text = SINGLE_TIRE_TEXT[locale];
  const q = <T extends Element>(selector: string): T | null => visual.querySelector<T>(selector);
  const setAttr = (selector: string, name: string, value: string): void => { q<SVGElement>(selector)?.setAttribute(name, value); };
  const setText = (selector: string, value: string): void => { const el = q<HTMLElement>(selector); if (el) el.textContent = value; };

  const rimDiameterMm = input.rimDiameterInches * 25.4;
  const rawRatio = result.overallDiameterMm > 0 ? rimDiameterMm / result.overallDiameterMm : 0.7;
  const ratio = Math.min(TIRE_MAX_RIM_RATIO, Math.max(TIRE_MIN_RIM_RATIO, rawRatio));
  const rimR = TIRE_OUTER_R * ratio;
  const hubR = rimR * 0.3;
  const spokeR = rimR * 0.74;
  const lugR = hubR + 6;

  setAttr('[data-single-tire-rim-seat]', 'r', (rimR + 6).toFixed(1));
  setAttr('[data-single-tire-rim]', 'r', rimR.toFixed(1));
  setAttr('[data-single-tire-hub]', 'r', hubR.toFixed(1));
  const spokes = visual.querySelectorAll<SVGPathElement>('[data-single-spokes] .single-spoke');
  const lugs = visual.querySelectorAll<SVGCircleElement>('[data-single-lugs] .single-lug');
  TIRE_LUG_ANGLES_DEG.forEach((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const spoke = spokes[i];
    if (spoke) spoke.setAttribute('d', `M${TIRE_CENTER_X} ${TIRE_CENTER_Y} L${(TIRE_CENTER_X + Math.cos(rad) * spokeR).toFixed(1)} ${(TIRE_CENTER_Y + Math.sin(rad) * spokeR).toFixed(1)}`);
    const lug = lugs[i];
    if (lug) { lug.setAttribute('cx', (TIRE_CENTER_X + Math.cos(rad) * lugR).toFixed(1)); lug.setAttribute('cy', (TIRE_CENTER_Y + Math.sin(rad) * lugR).toFixed(1)); }
  });

  // Sidewall-height dimension (left, rim edge to tread edge, top radius).
  const sidewallTopY = TIRE_CENTER_Y - rimR;
  const treadTopY = TIRE_CENTER_Y - TIRE_OUTER_R;
  setAttr('[data-single-sidewall-tick1]', 'd', `M${TIRE_CENTER_X} ${sidewallTopY.toFixed(1)}H66`);
  setAttr('[data-single-sidewall-tick2]', 'd', `M${TIRE_CENTER_X} ${treadTopY.toFixed(1)}H66`);
  setAttr('[data-single-sidewall-line]', 'd', `M66 ${sidewallTopY.toFixed(1)}V${treadTopY.toFixed(1)}`);
  setAttr('[data-single-sidewall-text]', 'y', ((sidewallTopY + treadTopY) / 2).toFixed(1));
  setText('[data-single-sidewall-text]', `${result.sidewallHeightMm.toFixed(1)} mm`);

  // Overall-diameter dimension (right) always spans the fixed outer radius —
  // only its label changes, since the drawing is normalized to fill the box.
  setText('[data-single-diameter-text]', `⌀ ${result.overallDiameterMm.toFixed(1)} mm`);

  // Rim-diameter dimension (bottom, spans the rim's own width).
  const rimLeft = TIRE_CENTER_X - rimR;
  const rimRight = TIRE_CENTER_X + rimR;
  setAttr('[data-single-rim-tick1]', 'd', `M${rimLeft.toFixed(1)} ${TIRE_CENTER_Y}V280`);
  setAttr('[data-single-rim-tick2]', 'd', `M${rimRight.toFixed(1)} ${TIRE_CENTER_Y}V280`);
  setAttr('[data-single-rim-line]', 'd', `M${rimLeft.toFixed(1)} 280H${rimRight.toFixed(1)}`);
  setText('[data-single-rim-text]', `⌀ ${text.rim(input.rimDiameterInches)}`);

  // Cross-section panel: a real tire cross-sectional shape (bulging
  // sidewall, tread/crown, bead, a separate rim block, hollow inner
  // cavity), driven by the same computeTireCrossSection() geometry the
  // static markup used for its defaults — one scale factor, one source of
  // truth, so the JS-updated drawing never drifts from the SSR'd one.
  const cs = computeTireCrossSection(input.widthMm, result.sidewallHeightMm);
  setAttr('[data-single-cross-group]', 'transform', `translate(${cs.originX.toFixed(1)} ${cs.baselineY.toFixed(1)})`);
  setAttr('[data-single-cross-outer]', 'd', cs.outerPathD);
  setAttr('[data-single-cross-cavity]', 'd', cs.cavityPathD);
  const crownTicks = visual.querySelectorAll<SVGLineElement>('[data-single-cross-tread-ticks] line');
  [-0.32, -0.16, 0, 0.16, 0.32].forEach((f, i) => {
    const x = (cs.hw * 0.5 * f).toFixed(1);
    const tick = crownTicks[i];
    if (tick) { tick.setAttribute('x1', x); tick.setAttribute('x2', x); tick.setAttribute('y1', (-cs.Hs + 2).toFixed(1)); tick.setAttribute('y2', (-cs.Hs + 9).toFixed(1)); }
  });
  setAttr('[data-single-cross-rim-bar]', 'x', cs.rim.barX.toFixed(1)); setAttr('[data-single-cross-rim-bar]', 'y', cs.rim.barY.toFixed(1));
  setAttr('[data-single-cross-rim-bar]', 'width', cs.rim.barW.toFixed(1)); setAttr('[data-single-cross-rim-bar]', 'height', cs.rim.barH.toFixed(1));
  setAttr('[data-single-cross-flange-l]', 'x', cs.rim.flangeLX.toFixed(1)); setAttr('[data-single-cross-flange-l]', 'y', cs.rim.flangeY.toFixed(1));
  setAttr('[data-single-cross-flange-l]', 'width', cs.rim.flangeW.toFixed(1)); setAttr('[data-single-cross-flange-l]', 'height', cs.rim.flangeH.toFixed(1));
  setAttr('[data-single-cross-flange-r]', 'x', cs.rim.flangeRX.toFixed(1)); setAttr('[data-single-cross-flange-r]', 'y', cs.rim.flangeY.toFixed(1));
  setAttr('[data-single-cross-flange-r]', 'width', cs.rim.flangeW.toFixed(1)); setAttr('[data-single-cross-flange-r]', 'height', cs.rim.flangeH.toFixed(1));

  setAttr('[data-single-cross-width-tick1]', 'd', `M${(cs.originX - cs.hw).toFixed(1)} ${cs.widthLineY.toFixed(1)}V${(cs.widthLineY + 6).toFixed(1)}`);
  setAttr('[data-single-cross-width-tick2]', 'd', `M${(cs.originX + cs.hw).toFixed(1)} ${cs.widthLineY.toFixed(1)}V${(cs.widthLineY + 6).toFixed(1)}`);
  setAttr('[data-single-cross-width-line]', 'd', `M${(cs.originX - cs.hw).toFixed(1)} ${cs.widthLineY.toFixed(1)}H${(cs.originX + cs.hw).toFixed(1)}`);
  setAttr('[data-single-cross-width-text]', 'x', cs.originX.toFixed(1)); setAttr('[data-single-cross-width-text]', 'y', (cs.widthLineY - 6).toFixed(1));
  setText('[data-single-cross-width-text]', `${input.widthMm} mm`);

  setAttr('[data-single-cross-height-tick1]', 'd', `M${cs.heightLineX.toFixed(1)} ${cs.heightLineTopY.toFixed(1)}H${(cs.heightLineX + 6).toFixed(1)}`);
  setAttr('[data-single-cross-height-tick2]', 'd', `M${cs.heightLineX.toFixed(1)} ${cs.heightLineBottomY.toFixed(1)}H${(cs.heightLineX + 6).toFixed(1)}`);
  setAttr('[data-single-cross-height-line]', 'd', `M${cs.heightLineX.toFixed(1)} ${cs.heightLineTopY.toFixed(1)}V${cs.heightLineBottomY.toFixed(1)}`);
  setAttr('[data-single-cross-height-text]', 'x', (cs.heightLineX + 10).toFixed(1)); setAttr('[data-single-cross-height-text]', 'y', ((cs.heightLineTopY + cs.heightLineBottomY) / 2).toFixed(1));
  setText('[data-single-cross-height-text]', `${result.sidewallHeightMm.toFixed(1)} mm`);

  setAttr('[data-single-cross-tread-leader]', 'd', `M${cs.leaderStartX.toFixed(1)} ${cs.treadLabelY.toFixed(1)}H${cs.treadLeaderX2.toFixed(1)}`);
  setAttr('[data-single-cross-sidewall-leader]', 'd', `M${cs.leaderStartX.toFixed(1)} ${cs.sidewallLabelY.toFixed(1)}H${cs.sidewallLeaderX2.toFixed(1)}`);
  setAttr('[data-single-cross-bead-leader]', 'd', `M${cs.leaderStartX.toFixed(1)} ${cs.beadLabelY.toFixed(1)}H${cs.beadLeaderX2.toFixed(1)}`);
  setAttr('[data-single-cross-tread-label]', 'x', cs.legendX.toFixed(1)); setAttr('[data-single-cross-tread-label]', 'y', cs.treadLabelY.toFixed(1));
  setAttr('[data-single-cross-sidewall-label]', 'x', cs.legendX.toFixed(1)); setAttr('[data-single-cross-sidewall-label]', 'y', cs.sidewallLabelY.toFixed(1));
  setAttr('[data-single-cross-bead-label]', 'x', cs.legendX.toFixed(1)); setAttr('[data-single-cross-bead-label]', 'y', cs.beadLabelY.toFixed(1));
  setAttr('[data-single-cross-rim-label]', 'x', cs.originX.toFixed(1)); setAttr('[data-single-cross-rim-label]', 'y', cs.rimLabelY.toFixed(1));
  setText('[data-single-cross-rim-label]', text.rimCavityCaption(`⌀ ${text.rim(input.rimDiameterInches)}`));

  setText('[data-single-size-label]', `${input.widthMm} / ${input.aspectRatio} R${input.rimDiameterInches}`);
  setText('[data-single-sidewall]', `${result.sidewallHeightMm.toFixed(1)} mm`);
  setText('[data-single-diameter]', `${result.overallDiameterMm.toFixed(1)} mm`);
  const profile = input.aspectRatio >= 55 ? 'taller' : input.aspectRatio <= 35 ? 'lower-profile' : 'balanced';
  setText('[data-single-meaning]', `${profile === 'taller' ? text.taller : profile === 'lower-profile' ? text.lowerProfile : text.balanced}${text.suffix}`);
}

function setWheelVisual(form: HTMLFormElement, inner: number, outer: number): void {
  const visual = form.querySelector<HTMLElement>('[data-fitment-visualizer]');
  if (!visual) return;
  const text = WHEEL_DIRECTION_TEXT[getPageLocale()];
  const model = wheelOffsetVisualMapping(inner, outer);
  const proposed = visual.querySelector<SVGRectElement>('[data-new-wheel]');
  proposed?.setAttribute('x', String(model.proposedX)); proposed?.setAttribute('width', String(model.proposedWidth));
  const innerLabel = visual.querySelector<HTMLElement>('[data-inner-label]'); const outerLabel = visual.querySelector<HTMLElement>('[data-outer-label]');
  if (innerLabel) innerLabel.textContent = `${Math.abs(inner).toFixed(2)} mm ${inner >= 0 ? text.fartherInward : text.lessInward}`;
  if (outerLabel) outerLabel.textContent = `${Math.abs(outer).toFixed(2)} mm ${outer >= 0 ? text.fartherOutward : text.lessOutward}`;
}


function signed(value: number, digits = 1): string {
  const rounded = Math.abs(value).toFixed(digits).replace(/\.0$/, '');
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${rounded}`;
}

function setLineX(path: SVGPathElement | null, left: number, right: number, y: number): void {
  path?.setAttribute('d', `M${left.toFixed(1)} ${y}H${right.toFixed(1)}`);
}


const TIRE_COMPARISON_TEXT = {
  en: {
    sameDiameter: 'The new tire has the same nominal overall diameter.',
    diffDiameter: (mm: string, taller: boolean) => `The new tire is ${mm} mm ${taller ? 'taller' : 'shorter'} overall.`,
    actualSpeed: (kmh: string) => `${kmh} km/h actual`,
    sideMeaning: (mm: string, taller: boolean, rideMm: string) => `New diameter is ${mm} mm ${taller ? 'taller' : 'shorter'}; static ride height changes by about ${rideMm} mm.`,
    widthSame: 'Both tires have the same nominal section width.',
    widthDiff: (mm: string, wider: boolean) => `The new tire is ${mm} mm ${wider ? 'wider' : 'narrower'} by nominal section width.`,
    vehicleSame: 'Both sizes produce the same nominal static ride height.',
    vehicleDiff: (mm: string, higher: boolean) => `Nominal static ride height is about ${mm} mm ${higher ? 'higher' : 'lower'} with the new tire.`,
  },
  de: {
    sameDiameter: 'Der neue Reifen hat denselben nominalen Gesamtdurchmesser.',
    diffDiameter: (mm: string, taller: boolean) => `Der neue Reifen hat insgesamt einen um ${mm} mm ${taller ? 'größeren' : 'kleineren'} Gesamtdurchmesser.`,
    actualSpeed: (kmh: string) => `${kmh} km/h tatsächlich`,
    sideMeaning: (mm: string, taller: boolean, rideMm: string) => `Der neue Durchmesser ist ${mm} mm ${taller ? 'größer' : 'kleiner'}; die statische Bodenfreiheit ändert sich um etwa ${rideMm} mm.`,
    widthSame: 'Beide Reifen haben dieselbe nominale Querschnittsbreite.',
    widthDiff: (mm: string, wider: boolean) => `Der neue Reifen ist bei der nominalen Querschnittsbreite ${mm} mm ${wider ? 'breiter' : 'schmaler'}.`,
    vehicleSame: 'Beide Größen ergeben dieselbe nominale statische Bodenfreiheit.',
    vehicleDiff: (mm: string, higher: boolean) => `Die nominale statische Bodenfreiheit ist mit dem neuen Reifen um etwa ${mm} mm ${higher ? 'höher' : 'niedriger'}.`,
  },
  es: {
    sameDiameter: 'El nuevo neumático tiene el mismo diámetro total nominal.',
    diffDiameter: (mm: string, taller: boolean) => `El nuevo neumático tiene un diámetro total ${mm} mm ${taller ? 'mayor' : 'menor'}.`,
    actualSpeed: (kmh: string) => `${kmh} km/h real`,
    sideMeaning: (mm: string, taller: boolean, rideMm: string) => `El nuevo diámetro es ${mm} mm ${taller ? 'mayor' : 'menor'}; la altura estática cambia en unos ${rideMm} mm.`,
    widthSame: 'Ambos neumáticos tienen el mismo ancho de sección nominal.',
    widthDiff: (mm: string, wider: boolean) => `El nuevo neumático es ${mm} mm ${wider ? 'más ancho' : 'más estrecho'} en ancho de sección nominal.`,
    vehicleSame: 'Ambos tamaños producen la misma altura estática nominal.',
    vehicleDiff: (mm: string, higher: boolean) => `Con el nuevo neumático, la altura estática nominal es unos ${mm} mm ${higher ? 'mayor' : 'menor'}.`,
  },
} as const;

function setTireComparisonPrimaryResult(
  form: HTMLFormElement,
  result: Extract<ReturnType<typeof compareTireSizesTool>, { ok: true }>['value'],
): void {
  const panel = form.querySelector<HTMLElement>('[data-tire-primary-result]');
  if (!panel) return;

  const text = TIRE_COMPARISON_TEXT[getPageLocale()];
  const percent = result.diameterDifferencePercent;
  const actualAt100Kmh = 100 * (result.proposed.overallDiameterMm / result.current.overallDiameterMm);

  const percentNode = panel.querySelector<HTMLElement>('[data-tire-primary-percent]');
  const copyNode = panel.querySelector<HTMLElement>('[data-tire-primary-copy]');
  const speedNode = panel.querySelector<HTMLElement>('[data-tire-speed-example]');

  if (percentNode) percentNode.textContent = `${signed(percent, 2)}%`;
  if (copyNode) {
    copyNode.textContent = result.diameterDifferenceMm === 0
      ? text.sameDiameter
      : text.diffDiameter(Math.abs(result.diameterDifferenceMm).toFixed(1), result.diameterDifferenceMm > 0);
  }
  if (speedNode) speedNode.textContent = text.actualSpeed(actualAt100Kmh.toFixed(1));

  panel.classList.remove('is-pending');
  panel.dataset.direction = percent < 0 ? 'negative' : percent > 0 ? 'positive' : 'zero';
}

function setTireComparisonTechnicalVisual(
  form: HTMLFormElement,
  original: TireToolInput,
  proposed: TireToolInput,
  result: Extract<ReturnType<typeof compareTireSizesTool>, { ok: true }>['value'],
): void {
  const visual = form.querySelector<HTMLElement>('[data-tire-tech-visual]');
  if (!visual) return;
  const text = TIRE_COMPARISON_TEXT[getPageLocale()];

  const maxDiameter = Math.max(result.current.overallDiameterMm, result.proposed.overallDiameterMm);
  const sideScale = 76 / maxDiameter;
  const currentRadius = result.current.overallDiameterMm * sideScale;
  const proposedRadius = result.proposed.overallDiameterMm * sideScale;
  const currentRimRadius = original.rimDiameterInches * 25.4 * sideScale;
  const proposedRimRadius = proposed.rimDiameterInches * 25.4 * sideScale;
  visual.querySelector<SVGCircleElement>('[data-current-side-tire]')?.setAttribute('r', currentRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-new-side-tire]')?.setAttribute('r', proposedRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-current-side-rim]')?.setAttribute('r', currentRimRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-new-side-rim]')?.setAttribute('r', proposedRimRadius.toFixed(2));

  const currentTop = 116 - currentRadius;
  const currentBottom = 116 + currentRadius;
  const proposedTop = 116 - proposedRadius;
  const proposedBottom = 116 + proposedRadius;
  visual.querySelector<SVGPathElement>('[data-current-diameter-line]')?.setAttribute('d', `M76 ${currentTop.toFixed(1)}V${currentBottom.toFixed(1)}`);
  visual.querySelector<SVGPathElement>('[data-new-diameter-line]')?.setAttribute('d', `M284 ${proposedTop.toFixed(1)}V${proposedBottom.toFixed(1)}`);
  const currentDiameterText = visual.querySelector<SVGTextElement>('[data-current-diameter-text]');
  const proposedDiameterText = visual.querySelector<SVGTextElement>('[data-new-diameter-text]');
  if (currentDiameterText) currentDiameterText.textContent = `${result.current.overallDiameterMm.toFixed(1)} mm`;
  if (proposedDiameterText) proposedDiameterText.textContent = `${result.proposed.overallDiameterMm.toFixed(1)} mm`;

  const maxWidth = Math.max(original.widthMm, proposed.widthMm);
  const maxFrontPixels = 104;
  const currentPixels = original.widthMm / maxWidth * maxFrontPixels;
  const proposedPixels = proposed.widthMm / maxWidth * maxFrontPixels;
  const updateFront = (prefix: 'current' | 'new', center: number, pixels: number): void => {
    const body = visual.querySelector<SVGRectElement>(`[data-${prefix}-front-body]`);
    const tread = visual.querySelector<SVGRectElement>(`[data-${prefix}-front-tread]`);
    if (body) { body.setAttribute('x', (-pixels / 2).toFixed(1)); body.setAttribute('width', pixels.toFixed(1)); }
    if (tread) { tread.setAttribute('x', (-pixels / 2 + 4).toFixed(1)); tread.setAttribute('width', Math.max(10, pixels - 8).toFixed(1)); }
    setLineX(visual.querySelector<SVGPathElement>(`[data-${prefix}-width-line]`), center - pixels / 2, center + pixels / 2, 29);
  };
  updateFront('current', 105, currentPixels);
  updateFront('new', 255, proposedPixels);
  const currentWidthText = visual.querySelector<SVGTextElement>('[data-current-width-text]');
  const proposedWidthText = visual.querySelector<SVGTextElement>('[data-new-width-text]');
  if (currentWidthText) currentWidthText.textContent = `${original.widthMm} mm`;
  if (proposedWidthText) proposedWidthText.textContent = `${proposed.widthMm} mm`;
  const currentSizeLabel = visual.querySelector<SVGTextElement>('[data-current-size-label]');
  const proposedSizeLabel = visual.querySelector<SVGTextElement>('[data-new-size-label]');
  if (currentSizeLabel) currentSizeLabel.textContent = `${original.widthMm}/${original.aspectRatio} R${original.rimDiameterInches}`;
  if (proposedSizeLabel) proposedSizeLabel.textContent = `${proposed.widthMm}/${proposed.aspectRatio} R${proposed.rimDiameterInches}`;

  const widthDifference = proposed.widthMm - original.widthMm;
  const setText = (selector: string, value: string): void => { const node = visual.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
  setText('[data-diff-diameter]', `${signed(result.diameterDifferenceMm)} mm`);
  setText('[data-diff-width]', `${signed(widthDifference, 0)} mm`);
  setText('[data-diff-sidewall]', `${signed(result.sidewallDifferenceMm)} mm`);
  setText('[data-diff-ride]', `${signed(result.rideHeightDifferenceMm)} mm`);
  const maxima = Math.max(Math.abs(result.diameterDifferenceMm), Math.abs(widthDifference), Math.abs(result.sidewallDifferenceMm), Math.abs(result.rideHeightDifferenceMm), 1);
  const setBar = (selector: string, value: number): void => {
    const node = visual.querySelector<HTMLElement>(selector);
    if (!node) return;
    node.style.setProperty('--difference-size', `${Math.max(7, Math.abs(value) / maxima * 100).toFixed(1)}%`);
    node.dataset.direction = value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero';
  };
  setBar('[data-diff-diameter-bar]', result.diameterDifferenceMm);
  setBar('[data-diff-width-bar]', widthDifference);
  setBar('[data-diff-sidewall-bar]', result.sidewallDifferenceMm);
  setBar('[data-diff-ride-bar]', result.rideHeightDifferenceMm);
  const sideMeaning = visual.querySelector<HTMLElement>('[data-side-meaning]');
  if (sideMeaning) sideMeaning.textContent = text.sideMeaning(Math.abs(result.diameterDifferenceMm).toFixed(1), result.diameterDifferenceMm >= 0, Math.abs(result.rideHeightDifferenceMm).toFixed(1));
  const widthMeaning = visual.querySelector<HTMLElement>('[data-width-meaning]');
  if (widthMeaning) widthMeaning.textContent = widthDifference === 0 ? text.widthSame : text.widthDiff(String(Math.abs(widthDifference)), widthDifference > 0);

  // Vehicle view: both tires sit on the same road line. A larger radius lifts the hub/body.
  const vehicleMaxRadius = 54;
  const currentVehicleRadius = result.current.overallDiameterMm / maxDiameter * vehicleMaxRadius;
  const proposedVehicleRadius = result.proposed.overallDiameterMm / maxDiameter * vehicleMaxRadius;
  const vehicleGroundY = 213;
  const currentVehicleCenterY = vehicleGroundY - currentVehicleRadius;
  const proposedVehicleCenterY = vehicleGroundY - proposedVehicleRadius;
  visual.querySelector<SVGGElement>('[data-current-vehicle-group]')?.setAttribute('transform', `translate(94 ${currentVehicleCenterY.toFixed(2)})`);
  visual.querySelector<SVGGElement>('[data-new-vehicle-group]')?.setAttribute('transform', `translate(266 ${proposedVehicleCenterY.toFixed(2)})`);
  visual.querySelector<SVGCircleElement>('[data-current-vehicle-tire]')?.setAttribute('r', currentVehicleRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-new-vehicle-tire]')?.setAttribute('r', proposedVehicleRadius.toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-current-vehicle-rim]')?.setAttribute('r', (original.rimDiameterInches * 25.4 / maxDiameter * vehicleMaxRadius).toFixed(2));
  visual.querySelector<SVGCircleElement>('[data-new-vehicle-rim]')?.setAttribute('r', (proposed.rimDiameterInches * 25.4 / maxDiameter * vehicleMaxRadius).toFixed(2));
  const rideArrow = visual.querySelector<SVGPathElement>('[data-vehicle-ride-arrow]');
  const currentReferenceY = currentVehicleCenterY - 70;
  const proposedReferenceY = proposedVehicleCenterY - 70;
  if (rideArrow) {
    const upper = Math.min(currentReferenceY, proposedReferenceY);
    const lower = Math.max(currentReferenceY, proposedReferenceY);
    rideArrow.setAttribute('d', `M173 ${upper.toFixed(1)}H183M178 ${upper.toFixed(1)}V${lower.toFixed(1)}M173 ${lower.toFixed(1)}H183`);
  }
  const rideText = visual.querySelector<SVGTextElement>('[data-vehicle-ride-text]');
  if (rideText) {
    rideText.setAttribute('y', (Math.min(currentReferenceY, proposedReferenceY) - 8).toFixed(1));
    rideText.textContent = `${signed(result.rideHeightDifferenceMm)} mm`;
  }
  const vehicleMeaning = visual.querySelector<HTMLElement>('[data-vehicle-meaning]');
  if (vehicleMeaning) vehicleMeaning.textContent = result.rideHeightDifferenceMm === 0
    ? text.vehicleSame
    : text.vehicleDiff(Math.abs(result.rideHeightDifferenceMm).toFixed(1), result.rideHeightDifferenceMm > 0);
}



const WHEEL_OFFSET_COPY = {
  en: {
    sameOuter: 'The outer wheel edge stays in the same nominal position.',
    diffOuter: (mm: string, towardFender: boolean) => `The outer edge moves ${mm} mm ${towardFender ? 'farther toward the fender.' : 'inward.'}`,
    sameInner: 'The inner wheel edge stays in the same nominal position.',
    diffInner: (mm: string, towardSuspension: boolean) => `The inner edge moves ${mm} mm ${towardSuspension ? 'toward the suspension.' : 'away from the suspension.'}`,
    innerMeaningSame: 'Inner edge stays in the same position.',
    innerMeaningDiff: (mm: string, towardSuspension: boolean) => `Inner edge moves ${mm} mm ${towardSuspension ? 'toward the suspension' : 'away from the suspension'}.`,
    outerMeaningSame: 'Outer edge stays in the same position.',
    outerMeaningDiff: (mm: string, towardFender: boolean) => `Outer edge moves ${mm} mm ${towardFender ? 'toward the fender' : 'inward'}.`,
  },
  de: {
    sameOuter: 'Die Außenkante der Felge bleibt in der gleichen nominalen Position.',
    diffOuter: (mm: string, towardFender: boolean) => `Die Außenkante verschiebt sich um ${mm} mm ${towardFender ? 'weiter Richtung Kotflügel.' : 'nach innen.'}`,
    sameInner: 'Die Innenkante der Felge bleibt in der gleichen nominalen Position.',
    diffInner: (mm: string, towardSuspension: boolean) => `Die Innenkante verschiebt sich um ${mm} mm ${towardSuspension ? 'Richtung Fahrwerk.' : 'vom Fahrwerk weg.'}`,
    innerMeaningSame: 'Die Innenkante bleibt in derselben Position.',
    innerMeaningDiff: (mm: string, towardSuspension: boolean) => `Die Innenkante verschiebt sich um ${mm} mm ${towardSuspension ? 'Richtung Fahrwerk' : 'vom Fahrwerk weg'}.`,
    outerMeaningSame: 'Die Außenkante bleibt in derselben Position.',
    outerMeaningDiff: (mm: string, towardFender: boolean) => `Die Außenkante verschiebt sich um ${mm} mm ${towardFender ? 'Richtung Kotflügel' : 'nach innen'}.`,
  },
  es: {
    sameOuter: 'El borde exterior de la llanta permanece en la misma posición nominal.',
    diffOuter: (mm: string, towardFender: boolean) => `El borde exterior se desplaza ${mm} mm ${towardFender ? 'más hacia el guardabarros.' : 'hacia adentro.'}`,
    sameInner: 'El borde interior de la llanta permanece en la misma posición nominal.',
    diffInner: (mm: string, towardSuspension: boolean) => `El borde interior se desplaza ${mm} mm ${towardSuspension ? 'hacia la suspensión.' : 'alejándose de la suspensión.'}`,
    innerMeaningSame: 'El borde interior permanece en la misma posición.',
    innerMeaningDiff: (mm: string, towardSuspension: boolean) => `El borde interior se desplaza ${mm} mm ${towardSuspension ? 'hacia la suspensión' : 'alejándose de la suspensión'}.`,
    outerMeaningSame: 'El borde exterior permanece en la misma posición.',
    outerMeaningDiff: (mm: string, towardFender: boolean) => `El borde exterior se desplaza ${mm} mm ${towardFender ? 'hacia el guardabarros' : 'hacia adentro'}.`,
  },
} as const;

function setWheelOffsetPrimaryResult(
  form: HTMLFormElement,
  result: Extract<ReturnType<typeof calculateWheelOffsetTool>, { ok: true }>['value'],
): void {
  const panel = form.querySelector<HTMLElement>('[data-wheel-primary-result]');
  if (!panel) return;

  const copy = WHEEL_OFFSET_COPY[getPageLocale()];
  const outerNode = panel.querySelector<HTMLElement>('[data-wheel-primary-outer]');
  const outerCopyNode = panel.querySelector<HTMLElement>('[data-wheel-primary-outer-copy]');
  const innerNode = panel.querySelector<HTMLElement>('[data-wheel-primary-inner]');
  const innerCopyNode = panel.querySelector<HTMLElement>('[data-wheel-primary-inner-copy]');

  if (outerNode) outerNode.textContent = `${signed(result.outerPokeChangeMm, 2)} mm`;
  if (outerCopyNode) {
    outerCopyNode.textContent = result.outerPokeChangeMm === 0
      ? copy.sameOuter
      : copy.diffOuter(Math.abs(result.outerPokeChangeMm).toFixed(2), result.outerPokeChangeMm > 0);
  }

  if (innerNode) innerNode.textContent = `${signed(result.innerPositionChangeMm, 2)} mm`;
  if (innerCopyNode) {
    innerCopyNode.textContent = result.innerPositionChangeMm === 0
      ? copy.sameInner
      : copy.diffInner(Math.abs(result.innerPositionChangeMm).toFixed(2), result.innerPositionChangeMm > 0);
  }

  panel.classList.remove('is-pending');
  panel.dataset.outerDirection = result.outerPokeChangeMm < 0 ? 'inward' : result.outerPokeChangeMm > 0 ? 'outward' : 'zero';
}


function setWheelOffsetTechnicalVisual(
  form: HTMLFormElement,
  originalWidthInches: number,
  originalOffsetMm: number,
  newWidthInches: number,
  newOffsetMm: number,
  innerPositionChangeMm: number,
  outerPokeChangeMm: number,
): void {
  const visual = form.querySelector<HTMLElement>('[data-offset-tech-visual]');
  if (!visual) return;
  const locale = getPageLocale();
  const direction = WHEEL_DIRECTION_TEXT[locale];
  const copy = WHEEL_OFFSET_COPY[locale];
  const hubX = 210;
  const scale = 0.52;
  const position = (widthInches: number, offsetMm: number) => {
    const widthPx = widthInches * 25.4 * scale;
    const centerX = hubX - offsetMm * scale;
    return { widthPx, centerX, left: centerX - widthPx / 2, right: centerX + widthPx / 2 };
  };
  const current = position(originalWidthInches, originalOffsetMm);
  const next = position(newWidthInches, newOffsetMm);
  const setWheel = (prefix: 'current' | 'new', model: ReturnType<typeof position>): void => {
    const body = visual.querySelector<SVGRectElement>(`[data-${prefix}-offset-body]`);
    if (body) { body.setAttribute('x', model.left.toFixed(1)); body.setAttribute('width', model.widthPx.toFixed(1)); }
    visual.querySelector<SVGPathElement>(`[data-${prefix}-centerline]`)?.setAttribute('d', `M${model.centerX.toFixed(1)} 76v98`);
  };
  setWheel('current', current);
  setWheel('new', next);

  const setArrow = (kind: 'inner' | 'outer', from: number, to: number, value: number): void => {
    const y = 210;
    const a = Math.min(from, to); const b = Math.max(from, to);
    visual.querySelector<SVGPathElement>(`[data-${kind}-arrow]`)?.setAttribute('d', `M${a.toFixed(1)} ${y}H${b.toFixed(1)}`);
    const leftHead = visual.querySelector<SVGPathElement>(`[data-${kind}-head-left]`);
    const rightHead = visual.querySelector<SVGPathElement>(`[data-${kind}-head-right]`);
    leftHead?.setAttribute('d', `M${a.toFixed(1)} ${y-4}l-7 4 7 4`);
    rightHead?.setAttribute('d', `M${b.toFixed(1)} ${y-4}l7 4-7 4`);
    const text = visual.querySelector<SVGTextElement>(`[data-${kind}-delta]`);
    if (text) { text.setAttribute('x', ((a+b)/2).toFixed(1)); text.textContent = `${Math.abs(value).toFixed(2)} mm`; }
  };
  setArrow('inner', current.left, next.left, innerPositionChangeMm);
  setArrow('outer', current.right, next.right, outerPokeChangeMm);

  const setText = (selector: string, value: string): void => { const node = visual.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
  setText('[data-original-wheel-spec]', `${originalWidthInches}J · ET${originalOffsetMm}`);
  setText('[data-new-wheel-spec]', `${newWidthInches}J · ET${newOffsetMm}`);
  setText('[data-inner-value]', `${signed(innerPositionChangeMm, 2)} mm`);
  setText('[data-outer-value]', `${signed(outerPokeChangeMm, 2)} mm`);
  setText('[data-inner-copy]', innerPositionChangeMm >= 0 ? direction.fartherInward : direction.moreInnerClearance);
  setText('[data-outer-copy]', outerPokeChangeMm >= 0 ? direction.fartherOutward : direction.lessOutward);
  setText('[data-inner-meaning]', innerPositionChangeMm === 0 ? copy.innerMeaningSame : copy.innerMeaningDiff(Math.abs(innerPositionChangeMm).toFixed(2), innerPositionChangeMm > 0));
  setText('[data-outer-meaning]', outerPokeChangeMm === 0 ? copy.outerMeaningSame : copy.outerMeaningDiff(Math.abs(outerPokeChangeMm).toFixed(2), outerPokeChangeMm > 0));

  // Mini stance view magnifies only the outer-edge movement; the cutaway above stays proportional.
  const currentMini = visual.querySelector<SVGRectElement>('[data-current-mini-wheel]');
  const newMini = visual.querySelector<SVGRectElement>('[data-new-mini-wheel]');
  const baseX = 202;
  const currentMiniWidth = 30;
  const widthRatio = Math.max(.72, Math.min(1.35, newWidthInches / Math.max(.1, originalWidthInches)));
  const newMiniWidth = currentMiniWidth * widthRatio;
  const movementPx = Math.max(-28, Math.min(28, outerPokeChangeMm * .9));
  if (currentMini) { currentMini.setAttribute('x', String(baseX)); currentMini.setAttribute('width', String(currentMiniWidth)); }
  if (newMini) { newMini.setAttribute('x', (baseX + movementPx).toFixed(1)); newMini.setAttribute('width', newMiniWidth.toFixed(1)); }
  const currentOuterX = baseX + currentMiniWidth;
  const newOuterX = baseX + movementPx + newMiniWidth;
  const miniArrow = visual.querySelector<SVGPathElement>('[data-mini-outer-arrow]');
  if (miniArrow) miniArrow.setAttribute('d', `M${currentOuterX.toFixed(1)} 110H${newOuterX.toFixed(1)}`);
  const miniText = visual.querySelector<SVGTextElement>('[data-mini-outer-text]');
  if (miniText) {
    miniText.setAttribute('x', ((currentOuterX + newOuterX) / 2).toFixed(1));
    miniText.textContent = `${signed(outerPokeChangeMm)} mm`;
  }
}

export function initializeToolCalculators(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-size"]').forEach((form) => {
    const results = form.querySelector<HTMLDListElement>('[data-results]')!;
    const errors = form.querySelector<HTMLElement>('[data-errors]')!;
    const calculate = () => {
      const input = { widthMm: numberValue(form, 'widthMm'), aspectRatio: numberValue(form, 'aspectRatio'), rimDiameterInches: numberValue(form, 'rimDiameterInches') };
      const result = calculateTireSizeTool(input);
      if (!result.ok) { results.replaceChildren(); hideSummary(form); renderIssues(errors, result.issues); const visual = form.querySelector<HTMLElement>('[data-single-tire-visual]'); if (visual) visual.hidden = true; const nearSizes = form.querySelector<HTMLElement>('[data-near-sizes]'); if (nearSizes) nearSizes.hidden = true; return; }
      errors.hidden = true; errors.replaceChildren(); setSummary(form, tireCalculatorSummary(result.value)); setTireVisual(form, input, result.value.overallDiameterMm); setSingleTireTechnicalVisual(form, input, result.value); renderMetrics(results, tireCalculatorMetrics(result.value)); renderNearEquivalentSizes(form, input);
    };
    const preview = () => {
      const input = { widthMm: numberValue(form, 'widthMm'), aspectRatio: numberValue(form, 'aspectRatio'), rimDiameterInches: numberValue(form, 'rimDiameterInches') };
      const result = calculateTireSizeTool(input);
      if (result.ok) { setTireVisual(form, input, result.value.overallDiameterMm); setSingleTireTechnicalVisual(form, input, result.value); }
    };
    form.addEventListener('input', () => requestAnimationFrame(preview));
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); }); calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-comparison"]').forEach((form) => {
    const preview = (): void => {
      const original = tireValue(form, 'original-'); const proposed = tireValue(form, 'new-');
      const result = compareTireSizesTool(original, proposed);
      if (result.ok) {
        const results = form.querySelector<HTMLDListElement>('[data-results]');
        const errors = form.querySelector<HTMLElement>('[data-errors]');
        if (errors) { errors.hidden = true; errors.replaceChildren(); }
        setSummary(form, tireComparisonSummary(result.value));
        setTireComparisonPrimaryResult(form, result.value);
        setTireVisual(form, original, result.value.current.overallDiameterMm, proposed, result.value.proposed.overallDiameterMm);
        setTireComparisonTechnicalVisual(form, original, proposed, result.value);
        if (results) renderMetrics(results, tireComparisonMetrics(result.value));
      }
    };
    bindCalculator(form, () => {
      const original = tireValue(form, 'original-'); const proposed = tireValue(form, 'new-');
      const result = compareTireSizesTool(original, proposed);
      if (result.ok) { setSummary(form, tireComparisonSummary(result.value)); setTireComparisonPrimaryResult(form, result.value); setTireVisual(form, original, result.value.current.overallDiameterMm, proposed, result.value.proposed.overallDiameterMm); setTireComparisonTechnicalVisual(form, original, proposed, result.value); }
      return result.ok ? { ok: true as const, metrics: tireComparisonMetrics(result.value) } : result;
    });
    form.addEventListener('input', () => requestAnimationFrame(preview));
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="wheel-offset"]').forEach((form) => {
    const preview = (): void => {
      const result = calculateWheelOffsetTool({ originalWidthInches: numberValue(form, 'originalWidthInches'), originalOffsetMm: numberValue(form, 'originalOffsetMm'), newWidthInches: numberValue(form, 'newWidthInches'), newOffsetMm: numberValue(form, 'newOffsetMm') });
      if (result.ok) {
        const results = form.querySelector<HTMLDListElement>('[data-results]');
        const errors = form.querySelector<HTMLElement>('[data-errors]');
        if (errors) { errors.hidden = true; errors.replaceChildren(); }
        setSummary(form, wheelOffsetSummary(result.value));
        setWheelOffsetPrimaryResult(form, result.value);
        setWheelVisual(form, result.value.innerPositionChangeMm, result.value.outerPokeChangeMm);
        setWheelOffsetTechnicalVisual(form, numberValue(form, 'originalWidthInches'), numberValue(form, 'originalOffsetMm'), numberValue(form, 'newWidthInches'), numberValue(form, 'newOffsetMm'), result.value.innerPositionChangeMm, result.value.outerPokeChangeMm);
        if (results) renderMetrics(results, wheelOffsetMetrics(result.value));
      }
    };
    bindCalculator(form, () => {
      const result = calculateWheelOffsetTool({ originalWidthInches: numberValue(form, 'originalWidthInches'), originalOffsetMm: numberValue(form, 'originalOffsetMm'), newWidthInches: numberValue(form, 'newWidthInches'), newOffsetMm: numberValue(form, 'newOffsetMm') });
      if (result.ok) {
        setSummary(form, wheelOffsetSummary(result.value));
        setWheelOffsetPrimaryResult(form, result.value);
        setWheelVisual(form, result.value.innerPositionChangeMm, result.value.outerPokeChangeMm);
        setWheelOffsetTechnicalVisual(form, numberValue(form, 'originalWidthInches'), numberValue(form, 'originalOffsetMm'), numberValue(form, 'newWidthInches'), numberValue(form, 'newOffsetMm'), result.value.innerPositionChangeMm, result.value.outerPokeChangeMm);
      }
      return result.ok ? { ok: true as const, metrics: wheelOffsetMetrics(result.value) } : result;
    });
    form.addEventListener('input', () => requestAnimationFrame(preview));
  });
  document.querySelectorAll<HTMLFormElement>('[data-calculator="speedometer"]').forEach((form) => {
    bindCalculator(form, () => {
      const unit = new FormData(form).get('unit') === 'mph' ? 'mph' : 'km/h';
      const original = tireValue(form, 'original-'); const proposed = tireValue(form, 'new-');
      const result = calculateSpeedometerTool(original, proposed, numberValue(form, 'indicatedSpeed'), unit);
      if (result.ok) { setSummary(form, speedometerSummary(result.value)); renderSpeedTable(form, original, proposed, unit); }
      else { const speedTable = form.querySelector<HTMLElement>('[data-speed-table]'); if (speedTable) speedTable.hidden = true; }
      return result.ok ? { ok: true as const, metrics: speedometerMetrics(result.value) } : result;
    });
  });
}

function bindCalculator(form: HTMLFormElement, calculate: () => { readonly ok: true; readonly metrics: readonly PresentedMetric[] } | { readonly ok: false; readonly issues: readonly Parameters<typeof toolIssueText>[0][] }): void {
  const results = form.querySelector<HTMLDListElement>('[data-results]')!;
  const errors = form.querySelector<HTMLElement>('[data-errors]')!;
  const run = () => {
    const result = calculate();
    if (!result.ok) { results.replaceChildren(); hideSummary(form); renderIssues(errors, result.issues); return; }
    errors.hidden = true; errors.replaceChildren(); renderMetrics(results, result.metrics);
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); run(); }); run();
}
