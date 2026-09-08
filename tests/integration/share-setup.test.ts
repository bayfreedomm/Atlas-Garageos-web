import { describe, expect, it } from 'vitest';
import { createSetupShareHash, decodeSetupShare, decodeSetupShareHash, encodeSetupShare, type SetupShareV1 } from '../../src/features/share/setup-share';

const payload: SetupShareV1 = {
  v: 1,
  current: { tireWidthMm: 225, tireAspectRatio: 45, rimDiameterInches: 18, wheelWidthInches: 8, wheelOffsetMm: 40 },
  proposed: { tireWidthMm: 235, tireAspectRatio: 40, rimDiameterInches: 19, wheelWidthInches: 8.5, wheelOffsetMm: 35 },
};

describe('versioned setup sharing', () => {
  it('round-trips a valid version 1 payload', () => {
    expect(decodeSetupShare(encodeSetupShare(payload))).toEqual({ ok: true, value: payload });
    expect(decodeSetupShareHash(createSetupShareHash(payload))).toEqual({ ok: true, value: payload });
  });

  it('keeps accepting the verbose Milestone 1 V1 representation', () => {
    const legacy = encodeURIComponent(JSON.stringify(payload));
    expect(decodeSetupShare(legacy)).toEqual({ ok: true, value: payload });
  });

  it('rejects unknown versions and invalid domain values', () => {
    expect(decodeSetupShare(encodeURIComponent(JSON.stringify({ ...payload, v: 2 })))).toMatchObject({ ok: false });
    const invalidPayload = { ...payload, current: { ...payload.current, tireWidthMm: -1 } };
    expect(decodeSetupShare(encodeURIComponent(JSON.stringify(invalidPayload)))).toMatchObject({ ok: false });
    expect(decodeSetupShareHash('#other=value')).toBeUndefined();
  });
});
