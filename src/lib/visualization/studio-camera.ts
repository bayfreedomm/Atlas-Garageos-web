import type { View3D } from './canvas-3d';
import type { AtlasLocale } from '../../localization/locales';

export type StudioCamera = 'studio' | 'front' | 'profile';
export type StudioCameraLocale = AtlasLocale;

export const studioCameraText: Record<StudioCameraLocale, Record<StudioCamera, string>> = {
  en: { studio: 'Studio angle', front: 'Front view', profile: 'Side profile' },
  de: { studio: 'Studioansicht', front: 'Vorderansicht', profile: 'Seitenprofil' },
  es: { studio: 'Vista de estudio', front: 'Vista frontal', profile: 'Perfil lateral' },
  fr: { studio: 'Vue studio', front: 'Vue de face', profile: 'Profil latéral' },
  it: { studio: 'Vista studio', front: 'Vista frontale', profile: 'Profilo laterale' },
  'pt-br': { studio: 'Vista de estúdio', front: 'Vista frontal', profile: 'Perfil lateral' },
  pl: { studio: 'Widok studyjny', front: 'Widok z przodu', profile: 'Profil boczny' },
  nl: { studio: 'Studioweergave', front: 'Vooraanzicht', profile: 'Zijprofiel' },
  tr: { studio: 'Stüdyo görünümü', front: 'Önden görünüm', profile: 'Yan profil' },
};

/** Camera angles change presentation only; geometry and measurements stay canonical. */
export function studioCameraView(opening: View3D, preset: StudioCamera): View3D {
  if (preset === 'front') return { yaw: 0, pitch: 0, zoom: Math.min(opening.zoom, 1.08) };
  if (preset === 'profile') return { yaw: -Math.PI / 2, pitch: 0.04, zoom: Math.min(opening.zoom, 1.08) };
  return { ...opening };
}
