import type { VehicleFitment, WheelTorqueTrust } from '../data/vehicle-fitment';

export type TorqueLocale = 'en' | 'de' | 'es';

const QUALIFIERS: Readonly<Record<TorqueLocale, Readonly<Record<WheelTorqueTrust['evidence'] | 'medium' | 'low', string>>>> = {
  en: {
    documented: 'Documented reference — confirm for the exact vehicle before use.',
    medium: 'Medium-confidence reference — confirm in the vehicle manual before use.',
    low: 'Low-confidence reference — do not use without checking the vehicle manual.',
    unconfirmed: 'Unconfirmed reference — do not use without checking the vehicle manual.',
    extrapolated: 'Extrapolated reference — not confirmed for this exact generation.',
  },
  de: {
    documented: 'Dokumentierter Referenzwert — vor Nutzung für das genaue Fahrzeug bestätigen.',
    medium: 'Referenzwert mit mittlerer Verlässlichkeit — vor Nutzung im Fahrzeughandbuch bestätigen.',
    low: 'Referenzwert mit geringer Verlässlichkeit — nicht ohne Prüfung im Fahrzeughandbuch verwenden.',
    unconfirmed: 'Unbestätigter Referenzwert — nicht ohne Prüfung im Fahrzeughandbuch verwenden.',
    extrapolated: 'Übertragener Referenzwert — für diese genaue Generation nicht bestätigt.',
  },
  es: {
    documented: 'Valor de referencia documentado — confírmelo para el vehículo exacto antes de usarlo.',
    medium: 'Referencia de confianza media — confírmela en el manual antes de usarla.',
    low: 'Referencia de confianza baja — no la use sin comprobar el manual del vehículo.',
    unconfirmed: 'Referencia sin confirmar — no la use sin comprobar el manual del vehículo.',
    extrapolated: 'Referencia extrapolada — no confirmada para esta generación exacta.',
  },
};

export interface TorquePresentation {
  readonly value: string;
  readonly qualifier: string | null;
  readonly qualified: boolean;
  readonly note: string | undefined;
}

/** Only a high-confidence, directly documented value is safe to publish without qualification. */
export function torqueIsTrusted(vehicle: VehicleFitment): boolean {
  return vehicle.torqueNm !== undefined
    && vehicle.torqueTrust?.confidence === 'high'
    && vehicle.torqueTrust.evidence === 'documented';
}

export function torqueIsUnconfirmed(vehicle: VehicleFitment): boolean {
  return vehicle.torqueNm !== undefined && !torqueIsTrusted(vehicle);
}

export function torquePresentation(vehicle: VehicleFitment, locale: TorqueLocale): TorquePresentation {
  if (vehicle.torqueNm === undefined) return Object.freeze({ value: '—', qualifier: null, qualified: false, note: undefined });
  const lbFt = vehicle.torqueLbFt === undefined ? '' : ` (${vehicle.torqueLbFt} lb-ft)`;
  const trust = vehicle.torqueTrust;
  if (!trust) {
    return Object.freeze({
      value: `${vehicle.torqueNm} Nm${lbFt}`,
      qualifier: QUALIFIERS[locale].unconfirmed,
      qualified: true,
      note: undefined,
    });
  }
  if (torqueIsTrusted(vehicle)) {
    return Object.freeze({ value: `${vehicle.torqueNm} Nm${lbFt}`, qualifier: null, qualified: false, note: trust.note });
  }
  const qualifierKey = trust.evidence === 'documented'
    ? (trust.confidence === 'medium' ? 'medium' : 'low')
    : trust.evidence;
  return Object.freeze({
    value: `${vehicle.torqueNm} Nm${lbFt}`,
    qualifier: QUALIFIERS[locale][qualifierKey],
    qualified: true,
    note: trust.note,
  });
}

/** Structured data omits any torque that needs a reader-facing qualification. */
export function torqueJsonLdProperty(vehicle: VehicleFitment, name: string): readonly Record<string, string>[] {
  if (!torqueIsTrusted(vehicle) || vehicle.torqueNm === undefined) return [];
  return Object.freeze([{ '@type': 'PropertyValue', name, value: String(vehicle.torqueNm) }]);
}
