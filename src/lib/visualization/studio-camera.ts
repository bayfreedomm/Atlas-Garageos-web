import type { View3D } from './canvas-3d';

export type StudioCamera = 'studio' | 'front' | 'profile';
export type StudioCameraLocale = 'en' | 'de' | 'es';

export const studioCameraText: Record<StudioCameraLocale, Record<StudioCamera, string>> = {
  en: { studio: 'Studio angle', front: 'Front view', profile: 'Side profile' },
  de: { studio: 'Studioansicht', front: 'Vorderansicht', profile: 'Seitenprofil' },
  es: { studio: 'Vista de estudio', front: 'Vista frontal', profile: 'Perfil lateral' },
};

/** Camera angles change presentation only; geometry and measurements stay canonical. */
export function studioCameraView(opening: View3D, preset: StudioCamera): View3D {
  if (preset === 'front') return { yaw: 0, pitch: 0, zoom: Math.min(opening.zoom, 1.08) };
  if (preset === 'profile') return { yaw: -Math.PI / 2, pitch: 0.04, zoom: Math.min(opening.zoom, 1.08) };
  return { ...opening };
}
