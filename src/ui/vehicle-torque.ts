import type { VehicleFitment, WheelTorqueTrust } from '../data/vehicle-fitment';

import type { EntityLocale } from '../seo/entity-routes';

export type TorqueLocale = EntityLocale;

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
  fr: {
    documented: 'Valeur de référence documentée — à confirmer pour le véhicule exact avant usage.',
    medium: 'Référence de fiabilité moyenne — à confirmer dans le manuel avant usage.',
    low: 'Référence peu fiable — ne pas utiliser sans vérifier le manuel du véhicule.',
    unconfirmed: 'Référence non confirmée — ne pas utiliser sans vérifier le manuel du véhicule.',
    extrapolated: 'Référence extrapolée — non confirmée pour cette génération précise.',
  },
  'it': {
    documented: 'Valore di riferimento documentato — da confermare per il veicolo esatto prima dell’uso.',
    medium: 'Riferimento di affidabilità media — da confermare nel manuale prima dell’uso.',
    low: 'Riferimento poco affidabile — non usare senza verificare il manuale del veicolo.',
    unconfirmed: 'Riferimento non confermato — non usare senza verificare il manuale del veicolo.',
    extrapolated: 'Riferimento estrapolato — non confermato per questa generazione specifica.',
  },
  'pt-br': {
    documented: 'Valor de referência documentado — confirme para o veículo exato antes de usar.',
    medium: 'Referência de confiabilidade média — confirme no manual antes de usar.',
    low: 'Referência pouco confiável — não use sem verificar o manual do veículo.',
    unconfirmed: 'Referência não confirmada — não use sem verificar o manual do veículo.',
    extrapolated: 'Referência extrapolada — não confirmada para esta geração específica.',
  },
  'pl': {
    documented: 'Udokumentowana wartość referencyjna — przed użyciem potwierdzić dla konkretnego pojazdu.',
    medium: 'Wartość o średniej wiarygodności — przed użyciem potwierdzić w instrukcji.',
    low: 'Wartość o niskiej wiarygodności — nie używać bez sprawdzenia instrukcji pojazdu.',
    unconfirmed: 'Wartość niepotwierdzona — nie używać bez sprawdzenia instrukcji pojazdu.',
    extrapolated: 'Wartość ekstrapolowana — niepotwierdzona dla tej konkretnej generacji.',
  },
  'nl': {
    documented: 'Gedocumenteerde referentiewaarde — bevestig voor het exacte voertuig vóór gebruik.',
    medium: 'Referentie met gemiddelde betrouwbaarheid — bevestig in het instructieboekje vóór gebruik.',
    low: 'Weinig betrouwbare referentie — niet gebruiken zonder het instructieboekje te controleren.',
    unconfirmed: 'Niet-bevestigde referentie — niet gebruiken zonder het instructieboekje te controleren.',
    extrapolated: 'Geëxtrapoleerde referentie — niet bevestigd voor deze specifieke generatie.',
  },
  'tr': {
    documented: 'Belgelenmiş referans değer — kullanmadan önce tam araç için doğrulayın.',
    medium: 'Orta güvenilirlikte referans — kullanmadan önce kullanım kılavuzunda doğrulayın.',
    low: 'Düşük güvenilirlikte referans — aracın kullanım kılavuzunu kontrol etmeden kullanmayın.',
    unconfirmed: 'Doğrulanmamış referans — aracın kullanım kılavuzunu kontrol etmeden kullanmayın.',
    extrapolated: 'Tahmini referans — bu nesil için ayrıca doğrulanmamıştır.',
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
