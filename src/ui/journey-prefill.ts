import { compareSetupInputs, type SetupInput } from '../features/compare/compare-setups';

export interface JourneyPrefill { readonly current: SetupInput; readonly proposed: SetupInput; readonly source: 'tire' | 'wheel' | 'combined'; }

function tireToken(token: string | null): readonly [number, number, number] | null {
  if (!token || token.length > 24 || !/^\d{2,3}-\d{2,3}-\d{2}(?:\.5)?$/.test(token)) return null;
  const values = token.split('-').map(Number);
  return values.length === 3 && values.every(Number.isFinite) ? values as unknown as readonly [number, number, number] : null;
}

function finiteToken(token: string | null): number | null {
  if (!token || token.length > 12 || !/^-?\d+(?:\.\d+)?$/.test(token)) return null;
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

export function parseJourneyPrefill(search: string, baselineCurrent: SetupInput, baselineProposed: SetupInput): JourneyPrefill | null {
  if (search.length > 300) return null;
  const params = new URLSearchParams(search);
  const hasTire = params.has('current') || params.has('new');
  const hasWheel = ['ow', 'oe', 'nw', 'ne'].some((key) => params.has(key));
  if (!hasTire && !hasWheel) return null;
  let current = { ...baselineCurrent };
  let proposed = { ...baselineProposed };
  if (hasTire) {
    const old = tireToken(params.get('current'));
    const next = tireToken(params.get('new'));
    if (!old || !next) return null;
    current = { ...current, tireWidthMm: old[0], tireAspectRatio: old[1], rimDiameterInches: old[2] };
    proposed = { ...proposed, tireWidthMm: next[0], tireAspectRatio: next[1], rimDiameterInches: next[2] };
  }
  if (hasWheel) {
    const values = ['ow', 'oe', 'nw', 'ne'].map((key) => finiteToken(params.get(key)));
    if (values.some((value) => value === null)) return null;
    current = { ...current, wheelWidthInches: values[0]!, wheelOffsetMm: values[1]! };
    proposed = { ...proposed, wheelWidthInches: values[2]!, wheelOffsetMm: values[3]! };
  }
  if (!compareSetupInputs(current, proposed).ok) return null;
  return Object.freeze({ current: Object.freeze(current), proposed: Object.freeze(proposed), source: hasTire && hasWheel ? 'combined' : hasTire ? 'tire' : 'wheel' });
}
