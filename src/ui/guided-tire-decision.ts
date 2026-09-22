import { localizedToolPath } from '../localization/locales';
import type { TireToolInput } from '../features/tools/calculator-tools';
import type { EntityLocale } from '../seo/entity-routes';

type Difference = 'same' | 'larger' | 'smaller';

export interface GuidedTireDecision {
  readonly observation: string;
  readonly reason: string;
  readonly primaryTitle: string;
  readonly primaryHref: string;
  readonly primaryDetail: string;
  readonly secondaryTitle: string;
  readonly secondaryHref: string;
  readonly secondaryDetail: string;
  readonly finalTitle: string;
  readonly finalHref: string;
  readonly finalDetail: string;
}

const COPY = {
  en: {
    diameter: { same: 'Nominal diameter is unchanged.', larger: 'The proposed tire has a larger nominal diameter.', smaller: 'The proposed tire has a smaller nominal diameter.' },
    width: { same: 'Nominal section width is unchanged.', larger: 'The proposed tire is wider.', smaller: 'The proposed tire is narrower.' },
    speedReason: 'Diameter changes the theoretical speedometer relationship. This is geometry, not a vehicle-specific calibration.',
    widthReason: 'Section width changed. Wheel width, offset and real clearance need separate checks.',
    sameReason: 'Matching nominal dimensions do not prove vehicle compatibility. Check the complete tire specification.',
    speedTitle: 'Check speedometer effect', speedDetail: 'Review the change at your chosen indicated speed.',
    offsetTitle: 'Check wheel width and offset', offsetDetail: 'Compare inner position and outer stance with your actual wheel measurements.',
    specTitle: 'Check load and speed rating', specDetail: 'Compare the proposed tire specification with your vehicle requirements.',
    sizeTitle: 'Inspect the proposed size', sizeDetail: 'Open its nominal dimensions with this size already entered.',
    pcdTitle: 'Check the bolt pattern', pcdDetail: 'Measure lug geometry separately; tire size does not determine PCD.',
    finalTitle: 'Measure real clearance', finalDetail: 'Geometry alone cannot establish fitment or road-use approval.',
  },
  de: {
    diameter: { same: 'Der Nenndurchmesser bleibt gleich.', larger: 'Der neue Reifen hat einen größeren Nenndurchmesser.', smaller: 'Der neue Reifen hat einen kleineren Nenndurchmesser.' },
    width: { same: 'Die Nennbreite bleibt gleich.', larger: 'Der neue Reifen ist breiter.', smaller: 'Der neue Reifen ist schmaler.' },
    speedReason: 'Der Durchmesser verändert die theoretische Tachoabweichung. Das ist Geometrie, keine fahrzeugspezifische Kalibrierung.',
    widthReason: 'Die Breite hat sich geändert. Felgenbreite, ET und realer Freigang müssen getrennt geprüft werden.',
    sameReason: 'Gleiche Nennmaße beweisen keine Fahrzeugfreigabe. Prüfen Sie die vollständige Reifenspezifikation.',
    speedTitle: 'Tachoabweichung prüfen', speedDetail: 'Die Änderung bei einer gewählten angezeigten Geschwindigkeit ansehen.',
    offsetTitle: 'Felgenbreite und ET prüfen', offsetDetail: 'Innere Position und äußeren Stand mit den echten Felgenmaßen vergleichen.',
    specTitle: 'Last- und Geschwindigkeitsindex prüfen', specDetail: 'Die neue Spezifikation mit den Fahrzeuganforderungen vergleichen.',
    sizeTitle: 'Neue Größe prüfen', sizeDetail: 'Nennmaße mit vorausgefüllter Reifengröße öffnen.',
    pcdTitle: 'Lochkreis prüfen', pcdDetail: 'Lochgeometrie separat messen; die Reifengröße bestimmt den PCD nicht.',
    finalTitle: 'Realen Freigang messen', finalDetail: 'Geometrie allein bestätigt weder Passform noch Zulassung.',
  },
  es: {
    diameter: { same: 'El diámetro nominal no cambia.', larger: 'El neumático propuesto tiene mayor diámetro nominal.', smaller: 'El neumático propuesto tiene menor diámetro nominal.' },
    width: { same: 'El ancho nominal de sección no cambia.', larger: 'El neumático propuesto es más ancho.', smaller: 'El neumático propuesto es más estrecho.' },
    speedReason: 'El diámetro cambia la relación teórica del velocímetro. Es geometría, no una calibración específica del vehículo.',
    widthReason: 'Cambió el ancho. El ancho de llanta, el offset y la holgura real requieren comprobaciones separadas.',
    sameReason: 'Las dimensiones nominales iguales no prueban compatibilidad. Compruebe la especificación completa del neumático.',
    speedTitle: 'Comprobar el velocímetro', speedDetail: 'Revisar el efecto a la velocidad indicada que elija.',
    offsetTitle: 'Comprobar ancho y offset', offsetDetail: 'Comparar posición interior y exterior con las medidas reales de llanta.',
    specTitle: 'Comprobar carga y velocidad', specDetail: 'Comparar la especificación con los requisitos del vehículo.',
    sizeTitle: 'Examinar la nueva medida', sizeDetail: 'Abrir sus dimensiones nominales con esta medida precargada.',
    pcdTitle: 'Comprobar el patrón de birlos', pcdDetail: 'Medir por separado; la medida del neumático no determina el PCD.',
    finalTitle: 'Medir la holgura real', finalDetail: 'La geometría sola no confirma ajuste ni homologación.',
  },
} as const;

function direction(value: number): Difference { return value > 0 ? 'larger' : value < 0 ? 'smaller' : 'same'; }

export function guidedTireDecision(
  locale: EntityLocale,
  original: TireToolInput,
  proposed: TireToolInput,
  diameterDifferenceMm: number,
): GuidedTireDecision {
  const copy = COPY[locale];
  const diameterChanged = direction(diameterDifferenceMm) !== 'same';
  const widthDifferenceMm = proposed.widthMm - original.widthMm;
  const widthChanged = direction(widthDifferenceMm) !== 'same';
  const size = `${proposed.widthMm}-${proposed.aspectRatio}-${proposed.rimDiameterInches}`;
  const originalSize = `${original.widthMm}-${original.aspectRatio}-${original.rimDiameterInches}`;
  const sizeHref = `${localizedToolPath(locale, 'tire-size-calculator', 'tool')}?size=${encodeURIComponent(size)}`;
  const primaryId = diameterChanged ? 'speedometer-error-calculator' : widthChanged ? 'wheel-offset-calculator' : 'tire-load-speed-rating';
  return Object.freeze({
    observation: `${copy.diameter[direction(diameterDifferenceMm)]} ${copy.width[direction(widthDifferenceMm)]}`,
    reason: diameterChanged ? copy.speedReason : widthChanged ? copy.widthReason : copy.sameReason,
    primaryTitle: diameterChanged ? copy.speedTitle : widthChanged ? copy.offsetTitle : copy.specTitle,
    primaryHref: `${localizedToolPath(locale, primaryId, 'tool')}${diameterChanged ? `?current=${encodeURIComponent(originalSize)}&new=${encodeURIComponent(size)}` : ''}`,
    primaryDetail: diameterChanged ? copy.speedDetail : widthChanged ? copy.offsetDetail : copy.specDetail,
    secondaryTitle: copy.sizeTitle,
    secondaryHref: sizeHref,
    secondaryDetail: copy.sizeDetail,
    finalTitle: copy.finalTitle,
    finalHref: localizedToolPath(locale, 'measure-my-car', 'tool'),
    finalDetail: copy.finalDetail,
  });
}
