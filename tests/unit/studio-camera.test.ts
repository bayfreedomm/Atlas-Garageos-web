import { describe, expect, it } from 'vitest';
import { studioCameraText, studioCameraView } from '../../src/lib/visualization/studio-camera';

describe('3D inspection cameras', () => {
  const opening = { yaw: -0.72, pitch: 0.22, zoom: 1.18 };

  it('keeps the authored studio camera as the reset target', () => {
    expect(studioCameraView(opening, 'studio')).toEqual(opening);
    expect(opening).toEqual({ yaw: -0.72, pitch: 0.22, zoom: 1.18 });
  });

  it('offers orthogonal views without changing the underlying scene', () => {
    expect(studioCameraView(opening, 'front')).toEqual({ yaw: 0, pitch: 0, zoom: 1.08 });
    expect(studioCameraView(opening, 'profile')).toEqual({ yaw: -Math.PI / 2, pitch: 0.04, zoom: 1.08 });
  });

  it('labels every view in every published locale', () => {
    for (const locale of ['en', 'de', 'es'] as const) {
      for (const view of ['studio', 'front', 'profile'] as const) {
        expect(studioCameraText[locale][view].length).toBeGreaterThan(3);
      }
    }
  });
});
