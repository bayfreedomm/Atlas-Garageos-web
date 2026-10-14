/**
 * Fitment cross-section drawing: one large, true-scale cut through the wheel axis with the
 * current setup (blue) and the new setup (orange) overlaid — tire carcass, rim barrel and
 * flanges, wheel face, and in wheel mode the fixed hub mounting face, brake disc and
 * suspension/fender reference lines.
 *
 * Pure string output (no DOM), so the same function renders the server-side initial state on
 * static pages and re-renders the live state in the calculators' client scripts.
 *
 * Geometry is drawn to scale from the entered numbers. Tire carcass curvature, rim flange height
 * and the wheel face are drawn from typical proportions; they illustrate shape, not a measured
 * product. Strut and fender lines in wheel mode are fixed reference marks, not vehicle data.
 */

export interface SectionSetup {
  /** Legend label, e.g. "205/55 R16" or "8J ET40". */
  readonly label: string;
  /** Tire section width (mm) and aspect ratio. Omit both for a rim-only setup. */
  readonly tireWidthMm?: number;
  readonly aspectRatio?: number;
  readonly rimInches: number;
  /** Rim width in inches (J). Defaults to a typical width for the tire. */
  readonly wheelWidthInches?: number;
  /** ET in mm. Only used in wheel mode. */
  readonly offsetMm?: number;
}

export interface SectionLabels {
  readonly current: string;
  readonly next: string;
  readonly hub?: string;
  readonly suspension?: string;
  readonly fender?: string;
  readonly inner?: string;
  readonly outer?: string;
  readonly aria: string;
}

export interface SectionOptions {
  readonly mode: 'tire' | 'wheel';
  readonly current: SectionSetup;
  readonly next: SectionSetup;
  readonly labels: SectionLabels;
  /** Decimal comma for every locale except English. */
  readonly decimalComma?: boolean;
}

const FLANGE = 17;
const DROP = 20;

const escapeXml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Typical rim width for a tire section width (≈ 85 % of the section, nearest half inch). */
export function typicalRimWidthInches(tireWidthMm: number): number {
  return Math.max(4, Math.round((tireWidthMm * 0.85) / 25.4 * 2) / 2);
}

interface Geometry {
  readonly centerX: number;
  readonly rimRadius: number;
  readonly halfRim: number;
  readonly tire?: { readonly halfSection: number; readonly sidewall: number; readonly outerRadius: number };
  readonly face: number;
}

function geometry(setup: SectionSetup, mode: 'tire' | 'wheel'): Geometry {
  const rimRadius = (setup.rimInches * 25.4) / 2;
  const wheelWidth = setup.wheelWidthInches ?? (setup.tireWidthMm ? typicalRimWidthInches(setup.tireWidthMm) : 7);
  const halfRim = (wheelWidth * 25.4) / 2;
  // Positive ET puts the wheel centreline inboard (left) of the fixed mounting face at x = 0.
  const offset = mode === 'wheel' ? setup.offsetMm ?? 0 : 38;
  const centerX = mode === 'wheel' ? -offset : 0;
  const face = centerX + offset;
  const tire = setup.tireWidthMm && setup.aspectRatio
    ? { halfSection: setup.tireWidthMm / 2, sidewall: (setup.tireWidthMm * setup.aspectRatio) / 100, outerRadius: rimRadius + (setup.tireWidthMm * setup.aspectRatio) / 100 }
    : undefined;
  return { centerX, rimRadius, halfRim, face, ...(tire ? { tire } : {}) };
}

export function renderFitmentSection(options: SectionOptions): string {
  const { mode, labels } = options;
  const a = geometry(options.current, mode);
  const b = geometry(options.next, mode);
  const num = (value: number, digits = 1): string => {
    const text = Math.abs(value).toFixed(digits);
    return options.decimalComma ? text.replace('.', ',') : text;
  };

  // Scale: the tallest setup is drawn about 560 units tall; the viewBox is then fitted tightly
  // around the drawing, so it fills its frame at any size.
  const radius = (g: Geometry): number => g.tire?.outerRadius ?? g.rimRadius + FLANGE;
  const maxRadius = Math.max(radius(a), radius(b));
  const lateral = (g: Geometry): [number, number] => {
    const half = Math.max(g.halfRim + 6, g.tire?.halfSection ?? 0);
    return [g.centerX - half, g.centerX + half];
  };
  const [aL, aR] = lateral(a);
  const [bL, bR] = lateral(b);
  const minX = Math.min(aL, bL, mode === 'wheel' ? -70 : Infinity);
  const maxX = Math.max(aR, bR, mode === 'wheel' ? 10 : -Infinity);
  const scale = Math.min(0.95, 560 / (2 * maxRadius));
  const cx = 0;
  const cy = 0;
  const X = (x: number): number => cx + x * scale;
  const Y = (r: number, flip: boolean): number => (flip ? cy + r * scale : cy - r * scale);
  const pt = (x: number, r: number, flip: boolean): string => `${X(x).toFixed(1)} ${Y(r, flip).toFixed(1)}`;

  const tirePath = (g: Geometry, flip: boolean): string => {
    if (!g.tire) return '';
    const { halfSection: s, sidewall: h, outerRadius: ro } = g.tire;
    const c = g.centerX;
    const rr = g.rimRadius;
    const bead = Math.min(g.halfRim + 2, s - 4);
    const tread = s * 0.8;
    return `M${pt(c - bead, rr + FLANGE * 0.6, flip)}`
      + ` C${pt(c - bead - s * 0.08, rr + h * 0.22, flip)} ${pt(c - s, rr + h * 0.24, flip)} ${pt(c - s, rr + h * 0.52, flip)}`
      + ` C${pt(c - s, rr + h * 0.86, flip)} ${pt(c - s * 0.93, ro, flip)} ${pt(c - tread, ro, flip)}`
      + ` L${pt(c + tread, ro, flip)}`
      + ` C${pt(c + s * 0.93, ro, flip)} ${pt(c + s, rr + h * 0.86, flip)} ${pt(c + s, rr + h * 0.52, flip)}`
      + ` C${pt(c + s, rr + h * 0.24, flip)} ${pt(c + bead + s * 0.08, rr + h * 0.22, flip)} ${pt(c + bead, rr + FLANGE * 0.6, flip)}`;
  };

  const treadLines = (g: Geometry, flip: boolean): string => {
    if (!g.tire) return '';
    const { halfSection: s, outerRadius: ro } = g.tire;
    const grooves = [-0.42, -0.14, 0.14, 0.42].map((f) => g.centerX + f * s * 1.6);
    return grooves.map((x) => `M${pt(x, ro, flip)} L${pt(x, ro - 7, flip)}`).join(' ');
  };

  const rimPath = (g: Geometry, flip: boolean): string => {
    const c = g.centerX;
    const w = g.halfRim;
    const rr = g.rimRadius;
    return `M${pt(c - w - 5, rr + FLANGE, flip)} Q${pt(c - w, rr + FLANGE, flip)} ${pt(c - w, rr + FLANGE - 6, flip)}`
      + ` L${pt(c - w, rr + 1, flip)} L${pt(c - w + 14, rr, flip)} L${pt(c - w + 22, rr - DROP, flip)}`
      + ` L${pt(c + w - 22, rr - DROP, flip)} L${pt(c + w - 14, rr, flip)} L${pt(c + w, rr + 1, flip)}`
      + ` L${pt(c + w, rr + FLANGE - 6, flip)} Q${pt(c + w, rr + FLANGE, flip)} ${pt(c + w + 5, rr + FLANGE, flip)}`;
  };

  const facePath = (g: Geometry, flip: boolean): string => {
    const f = Math.max(g.centerX - g.halfRim + 26, Math.min(g.centerX + g.halfRim - 26, g.face));
    const rr = g.rimRadius;
    const spokeEnd = Math.min(g.centerX + g.halfRim - 24, f + Math.min(46, g.halfRim * 0.45));
    return `M${pt(f, 36, flip)} L${pt(f, rr * 0.42, flip)} C${pt(f, rr * 0.7, flip)} ${pt(spokeEnd, rr * 0.62, flip)} ${pt(spokeEnd, rr - DROP, flip)}`;
  };

  const setup = (g: Geometry, key: 'current' | 'next'): string => {
    const halves = [false, true].map((flip) => `
      ${g.tire ? `<path class="fs-tire" d="${tirePath(g, flip)}"/><path class="fs-tread" d="${treadLines(g, flip)}"/>` : ''}
      <path class="fs-rim" d="${rimPath(g, flip)}"/>
      <path class="fs-face" d="${facePath(g, flip)}"/>`).join('');
    return `<g class="fs-setup fs-setup--${key}">${halves}
      <path class="fs-centerline" d="M${X(g.centerX).toFixed(1)} ${(Y(radius(g), false) - 10).toFixed(1)}V${(Y(radius(g), true) + 10).toFixed(1)}"/></g>`;
  };

  const parts: string[] = [];
  // Bounds of everything drawn, for the tight viewBox.
  let x0 = X(minX) - 20;
  let x1 = X(maxX) + 20;
  let y0 = Y(maxRadius, false) - 20;
  let y1 = Y(maxRadius, true) + 20;
  const grow = (x: number, y: number): void => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  // Bounds are reserved for the larger phone text sizes (see the CSS media query).
  const textWidth = (text: string, size = 30): number => text.length * size * (text === text.toUpperCase() ? 0.74 : 0.58);

  if (mode === 'wheel') {
    const minRim = Math.min(a.rimRadius, b.rimRadius);
    const innerMost = Math.min(aL, bL);
    const outerMost = Math.max(aR, bR);
    // Hub body and brake disc sit inboard of the fixed mounting face (x = 0).
    parts.push(`<rect class="fs-disc" x="${X(-40).toFixed(1)}" y="${Y(minRim - 38, false).toFixed(1)}" width="${(24 * scale).toFixed(1)}" height="${(2 * (minRim - 38) * scale).toFixed(1)}" rx="${(3 * scale).toFixed(1)}"/>`);
    parts.push(`<rect class="fs-hub" x="${X(-60).toFixed(1)}" y="${Y(62, false).toFixed(1)}" width="${(60 * scale).toFixed(1)}" height="${(124 * scale).toFixed(1)}" rx="${(6 * scale).toFixed(1)}"/>`);
    const faceTop = Y(minRim + 34, false);
    const faceBottom = Y(minRim + 34, true);
    parts.push(`<path class="fs-hubface" d="M${X(0).toFixed(1)} ${faceTop.toFixed(1)}V${faceBottom.toFixed(1)}"/>`);
    // Reference marks (not vehicle data): a strut inboard of the inner lip and a fender lip
    // outboard of the outer lip.
    const strutX = X(innerMost) - 34;
    const strutTop = Y(maxRadius + 40, false);
    const strutBottom = Y(30, false);
    parts.push(`<path class="fs-ref" d="M${(strutX - 16).toFixed(1)} ${strutTop.toFixed(1)}L${strutX.toFixed(1)} ${strutBottom.toFixed(1)}"/>`);
    const fenderX = X(outerMost) + 40;
    const fenderTop = Y(maxRadius + 46, false);
    parts.push(`<path class="fs-ref" d="M${(fenderX - 60).toFixed(1)} ${fenderTop.toFixed(1)}Q${fenderX.toFixed(1)} ${fenderTop.toFixed(1)} ${fenderX.toFixed(1)} ${(fenderTop + 70).toFixed(1)}"/>`);
    grow(strutX - 20, strutTop);
    grow(fenderX + 10, fenderTop);
    if (labels.suspension) {
      const x = strutX;
      const y = strutBottom + 30;
      parts.push(`<text class="fs-ref-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${escapeXml(labels.suspension)}</text>`);
      grow(x - textWidth(labels.suspension, 22) / 2, y + 4);
      grow(x + textWidth(labels.suspension, 22) / 2, y + 4);
    }
    if (labels.fender) {
      const x = fenderX;
      const y = fenderTop + 100;
      parts.push(`<text class="fs-ref-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${escapeXml(labels.fender)}</text>`);
      grow(x - textWidth(labels.fender, 22) / 2, y + 4);
      grow(x + textWidth(labels.fender, 22) / 2, y + 4);
    }
    if (labels.hub) {
      const y = faceBottom + 24;
      parts.push(`<text class="fs-ref-label" x="${X(0).toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">${escapeXml(labels.hub)}</text>`);
      grow(X(0) - textWidth(labels.hub, 22) / 2, y + 4);
      grow(X(0) + textWidth(labels.hub, 22) / 2, y + 4);
    }
  } else {
    // Illustrative hub at the (assumed) wheel face — shape context only, not a measured part.
    const face = Math.min(a.face, b.face);
    parts.push(`<rect class="fs-hub" x="${X(face - 50).toFixed(1)}" y="${Y(42, false).toFixed(1)}" width="${(50 * scale).toFixed(1)}" height="${(84 * scale).toFixed(1)}" rx="${(5 * scale).toFixed(1)}"/>`);
  }
  parts.unshift(`<path class="fs-axis" d="M${(X(minX) - 50).toFixed(1)} ${cy}H${(X(maxX) + 50).toFixed(1)}"/>`);

  parts.push(setup(a, 'current'));
  parts.push(setup(b, 'next'));

  // Dimension lines.
  const dims: string[] = [];
  const vDim = (x: number, r: number, cls: string, text: string, anchor: 'start' | 'end'): string => {
    const top = Y(r, false);
    const bottom = Y(r, true);
    const label = `Ø ${text}`;
    const tx = anchor === 'end' ? x - 10 : x + 10;
    grow(anchor === 'end' ? tx - textWidth(label) : tx + textWidth(label), cy);
    return `<g class="fs-dim ${cls}"><path d="M${x.toFixed(1)} ${top.toFixed(1)}V${bottom.toFixed(1)}M${(x - 6).toFixed(1)} ${top.toFixed(1)}h12M${(x - 6).toFixed(1)} ${bottom.toFixed(1)}h12"/>`
      + `<text x="${tx.toFixed(1)}" y="${(cy + 8).toFixed(1)}" text-anchor="${anchor}">${label}</text></g>`;
  };
  const hDim = (left: number, right: number, y: number, cls: string, text: string): string => {
    grow(left, y - 44);
    grow(right, y + 8);
    return `<g class="fs-dim ${cls}"><path d="M${left.toFixed(1)} ${y.toFixed(1)}H${right.toFixed(1)}M${left.toFixed(1)} ${(y - 6).toFixed(1)}v12M${right.toFixed(1)} ${(y - 6).toFixed(1)}v12"/>`
      + `<text x="${((left + right) / 2).toFixed(1)}" y="${(y - 9).toFixed(1)}" text-anchor="middle">${text}</text></g>`;
  };

  if (mode === 'tire' && a.tire && b.tire) {
    dims.push(vDim(X(Math.min(aL, bL)) - 30, a.tire.outerRadius, 'fs-dim--current', `${num(a.tire.outerRadius * 2)} mm`, 'end'));
    dims.push(vDim(X(Math.max(aR, bR)) + 30, b.tire.outerRadius, 'fs-dim--next', `${num(b.tire.outerRadius * 2)} mm`, 'start'));
    const topY = Y(maxRadius, false) - 20;
    dims.push(hDim(X(a.centerX - a.tire.halfSection), X(a.centerX + a.tire.halfSection), topY - 48, 'fs-dim--current', `${num(a.tire.halfSection * 2, 0)} mm`));
    dims.push(hDim(X(b.centerX - b.tire.halfSection), X(b.centerX + b.tire.halfSection), topY, 'fs-dim--next', `${num(b.tire.halfSection * 2, 0)} mm`));
  }
  if (mode === 'wheel') {
    const signedText = (value: number): string => `${value > 0.004 ? '+' : value < -0.004 ? '−' : ''}${num(value, 2)} mm`;
    const bottomY = Y(maxRadius, true) + 96;
    const edge = (fromX: number, toX: number, text: string, side: 'inner' | 'outer'): string => {
      const left = Math.min(fromX, toX);
      const right = Math.max(fromX, toX);
      // Each label sits centred under its own bracket, inner and outer on separate rows.
      const mid = (left + right) / 2;
      const ty = bottomY + (side === 'inner' ? 38 : 80);
      grow(mid - textWidth(text) / 2, ty + 6);
      grow(mid + textWidth(text) / 2, ty + 6);
      return `<g class="fs-dim fs-dim--delta"><path d="M${fromX.toFixed(1)} ${(bottomY - 22).toFixed(1)}V${(bottomY + 6).toFixed(1)}M${toX.toFixed(1)} ${(bottomY - 22).toFixed(1)}V${(bottomY + 6).toFixed(1)}M${left.toFixed(1)} ${bottomY.toFixed(1)}H${right.toFixed(1)}"/>`
        + `<text x="${mid.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle">${text}</text></g>`;
    };
    const innerMm = (a.centerX - a.halfRim) - (b.centerX - b.halfRim);
    const outerMm = (b.centerX + b.halfRim) - (a.centerX + a.halfRim);
    dims.push(edge(X(a.centerX - a.halfRim), X(b.centerX - b.halfRim), `${escapeXml(labels.inner ?? '')} ${signedText(innerMm)}`, 'inner'));
    dims.push(edge(X(a.centerX + a.halfRim), X(b.centerX + b.halfRim), `${escapeXml(labels.outer ?? '')} ${signedText(outerMm)}`, 'outer'));
    const topY = Y(maxRadius, false) - 22;
    dims.push(hDim(X(a.centerX - a.halfRim), X(a.centerX + a.halfRim), topY - 48, 'fs-dim--current', `${num(a.halfRim * 2 / 25.4, 1)}″`));
    dims.push(hDim(X(b.centerX - b.halfRim), X(b.centerX + b.halfRim), topY, 'fs-dim--next', `${num(b.halfRim * 2 / 25.4, 1)}″`));
  }

  // Legend under the drawing.
  const legendY = y1 + 46;
  const lineA = labels.current ? `${labels.current} · ${options.current.label}` : options.current.label;
  const lineB = labels.next ? `${labels.next} · ${options.next.label}` : options.next.label;
  const legendX = (x0 + x1) / 2 - (textWidth(lineA, 26) + textWidth(lineB, 26) + 90) / 2;
  const legend = `<g class="fs-legend"><rect class="fs-swatch fs-swatch--current" x="${legendX.toFixed(1)}" y="${(legendY - 9).toFixed(1)}" width="26" height="8" rx="3"/><text x="${(legendX + 30).toFixed(1)}" y="${legendY.toFixed(1)}">${escapeXml(lineA)}</text>`
    + `<rect class="fs-swatch fs-swatch--next" x="${(legendX + 60 + textWidth(lineA, 26)).toFixed(1)}" y="${(legendY - 9).toFixed(1)}" width="26" height="8" rx="3"/><text x="${(legendX + 90 + textWidth(lineA, 26)).toFixed(1)}" y="${legendY.toFixed(1)}">${escapeXml(lineB)}</text></g>`;
  grow(legendX - 10, legendY + 16);
  grow(legendX + 100 + textWidth(lineA, 26) + textWidth(lineB, 26), legendY + 12);

  const pad = 12;
  const box = `${(x0 - pad).toFixed(0)} ${(y0 - pad).toFixed(0)} ${(x1 - x0 + 2 * pad).toFixed(0)} ${(y1 - y0 + 2 * pad).toFixed(0)}`;
  return `<svg class="fitment-section fitment-section--${mode}" viewBox="${box}" role="img" aria-label="${escapeXml(labels.aria)}">${parts.join('')}${dims.join('')}${legend}</svg>`;
}
