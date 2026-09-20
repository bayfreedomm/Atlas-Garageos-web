// Shared geometry for the tire cross-section panel used by both the static
// Astro markup (TireSizeTechnicalVisual.astro, default 225/45R18) and the
// live updater (tool-calculators.ts). Having one function compute every
// coordinate — instead of two hand-duplicated versions — is what keeps the
// static and JS-updated drawings from drifting apart.
//
// The cross-section is a real tire profile: a bulging sidewall, a distinct
// tread/crown, a bead that sits narrower than the shoulder, a separate rim
// (flanged) block underneath, and a hollow inner cavity between the tire's
// inner wall and the rim — not a capsule, blob, trapezoid, or gear.
//
// A single scale factor drives both axes at once, per spec:
//   scale = min(availableWidth / sectionWidth, availableHeight / sectionHeight)
// so the drawing can never independently clamp width vs. height into a
// distorted shape, and every extent computed from `scale` is guaranteed to
// fit inside the reserved viewBox for any valid tire size.

export const CROSS_SECTION_VIEWBOX = { width: 400, height: 210 } as const;

const ORIGIN_X = 200;
const AVAILABLE_W = 230; // → half-width never exceeds 115, leaving an 85px margin each side for labels
const TOP_MARGIN = 30; // reserved above the tread apex for the width dimension line + label
const AVAILABLE_H = 116; // → sidewall height never exceeds 116
const BASELINE_Y = TOP_MARGIN + AVAILABLE_H; // = 146: the bead/rim seat line

export interface TireCrossSectionGeometry {
  readonly originX: number;
  readonly baselineY: number;
  readonly hw: number; // half-width at the shoulder (widest point) — true section-width scale
  readonly bw: number; // half-width at the bead (narrower, resting on the rim)
  readonly Hs: number; // sidewall height, apex to baseline — true sidewall-height scale
  readonly rimDepth: number;
  readonly outerPathD: string;
  readonly cavityPathD: string;
  readonly rim: { readonly barX: number; readonly barY: number; readonly barW: number; readonly barH: number; readonly flangeLX: number; readonly flangeRX: number; readonly flangeY: number; readonly flangeW: number; readonly flangeH: number };
  readonly widthLineY: number;
  readonly heightLineX: number;
  readonly heightLineTopY: number;
  readonly heightLineBottomY: number;
  readonly rimLabelY: number;
  readonly legendX: number;
  readonly leaderStartX: number;
  readonly treadLabelY: number;
  readonly treadLeaderX2: number;
  readonly sidewallLabelY: number;
  readonly sidewallLeaderX2: number;
  readonly beadLabelY: number;
  readonly beadLeaderX2: number;
}

export function computeTireCrossSection(widthMm: number, sidewallHeightMm: number): TireCrossSectionGeometry {
  const safeWidth = Math.max(1, widthMm);
  const safeHeight = Math.max(1, sidewallHeightMm);
  const scale = Math.min(AVAILABLE_W / safeWidth, AVAILABLE_H / safeHeight);
  const hw = (scale * safeWidth) / 2;
  const Hs = scale * safeHeight;
  const bw = hw * 0.58;
  const rw = bw * 1.08;
  const rimDepth = Math.min(30, Math.max(14, Hs * 0.24));
  const shoulderY = -Hs * 0.82;
  const treadEdgeX = hw * 0.55;
  const crownBow = 4;

  const outerPathD = [
    `M${(-bw).toFixed(1)} 0`,
    `C${(-bw).toFixed(1)} ${(shoulderY * 0.4).toFixed(1)} ${(-hw).toFixed(1)} ${(shoulderY * 0.58).toFixed(1)} ${(-hw).toFixed(1)} ${shoulderY.toFixed(1)}`,
    `L${(-treadEdgeX).toFixed(1)} ${(-Hs).toFixed(1)}`,
    `Q0 ${(-Hs - crownBow).toFixed(1)} ${treadEdgeX.toFixed(1)} ${(-Hs).toFixed(1)}`,
    `L${hw.toFixed(1)} ${shoulderY.toFixed(1)}`,
    `C${hw.toFixed(1)} ${(shoulderY * 0.58).toFixed(1)} ${bw.toFixed(1)} ${(shoulderY * 0.4).toFixed(1)} ${bw.toFixed(1)} 0`,
    'Z',
  ].join(' ');

  // Inner cavity: a rounded hollow sitting above the rim and below the tread,
  // inset from the outer wall so a ring of "rubber" remains visible all
  // around it — this is what reads as the tire's true inner air cavity.
  const hwIn = hw * 0.64;
  const cavityTopY = -Hs * 0.86;
  const cavityBaseY = -rimDepth * 0.3;
  const cavityH = Math.max(4, cavityBaseY - cavityTopY);
  const r = Math.min(hwIn * 0.5, cavityH * 0.4, 14);
  const cavityPathD = [
    `M${(-hwIn + r).toFixed(1)} ${cavityBaseY.toFixed(1)}`,
    `L${(hwIn - r).toFixed(1)} ${cavityBaseY.toFixed(1)}`,
    `Q${hwIn.toFixed(1)} ${cavityBaseY.toFixed(1)} ${hwIn.toFixed(1)} ${(cavityBaseY - r).toFixed(1)}`,
    `L${hwIn.toFixed(1)} ${(cavityTopY + r).toFixed(1)}`,
    `Q${hwIn.toFixed(1)} ${cavityTopY.toFixed(1)} ${(hwIn - r).toFixed(1)} ${cavityTopY.toFixed(1)}`,
    `L${(-hwIn + r).toFixed(1)} ${cavityTopY.toFixed(1)}`,
    `Q${(-hwIn).toFixed(1)} ${cavityTopY.toFixed(1)} ${(-hwIn).toFixed(1)} ${(cavityTopY + r).toFixed(1)}`,
    `L${(-hwIn).toFixed(1)} ${(cavityBaseY - r).toFixed(1)}`,
    `Q${(-hwIn).toFixed(1)} ${cavityBaseY.toFixed(1)} ${(-hwIn + r).toFixed(1)} ${cavityBaseY.toFixed(1)}`,
    'Z',
  ].join(' ');

  const flangeW = rw * 0.22;

  return {
    originX: ORIGIN_X,
    baselineY: BASELINE_Y,
    hw,
    bw,
    Hs,
    rimDepth,
    outerPathD,
    cavityPathD,
    rim: {
      barX: -rw, barY: 0, barW: rw * 2, barH: rimDepth,
      flangeLX: -rw - flangeW * 0.4, flangeRX: rw - flangeW * 0.6,
      flangeY: -rimDepth * 0.35, flangeW, flangeH: rimDepth * 0.35 + 3,
    },
    widthLineY: BASELINE_Y - Hs - 12,
    heightLineX: ORIGIN_X + hw + 14,
    heightLineTopY: BASELINE_Y - Hs,
    heightLineBottomY: BASELINE_Y,
    rimLabelY: BASELINE_Y + rimDepth + 18,
    legendX: ORIGIN_X - hw - 14,
    leaderStartX: ORIGIN_X - hw - 10,
    treadLabelY: BASELINE_Y - Hs,
    treadLeaderX2: ORIGIN_X - treadEdgeX,
    sidewallLabelY: BASELINE_Y - Hs * 0.5,
    sidewallLeaderX2: ORIGIN_X - hw * 0.98,
    beadLabelY: BASELINE_Y - 4,
    beadLeaderX2: ORIGIN_X - bw * 0.98,
  };
}
