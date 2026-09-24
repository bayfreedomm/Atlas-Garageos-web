import type { EvidenceLevel } from '../domain/evidence';
import type { UiLocale } from '../ui/page-locale';

export interface EvidenceText {
  /** Short uppercase badge label. */
  readonly label: string;
  /** One sentence explaining what the label guarantees — and what it does not. */
  readonly meaning: string;
}

export const evidenceText: Readonly<Record<UiLocale, Readonly<Record<EvidenceLevel, EvidenceText>>>> = {
  en: {
    'oem-verified': { label: 'VERIFIED OEM DATA', meaning: 'Taken from the vehicle manufacturer’s own specification for this exact vehicle.' },
    official: { label: 'OFFICIAL DATA', meaning: 'Published by a government authority, such as a recall register.' },
    manufacturer: { label: 'MANUFACTURER COMMUNICATION', meaning: 'From a manufacturer bulletin or notice — not necessarily a recall.' },
    reference: { label: 'REFERENCE DATA', meaning: 'From a curated or third-party reference list. Useful, but not an official or exhaustive record.' },
    community: { label: 'COMMUNITY DATA', meaning: 'Reported by owners. Shows patterns, not confirmed facts.' },
    measured: { label: 'YOUR MEASUREMENT', meaning: 'Based on a value you measured on your own vehicle.' },
    calculated: { label: 'CALCULATED', meaning: 'Computed from the numbers entered with standard formulas. Exact for nominal geometry, blind to anything not entered.' },
    estimated: { label: 'ESTIMATED', meaning: 'An approximation or rule of thumb. Treat it as a starting point.' },
    unknown: { label: 'NOT VERIFIED', meaning: 'Atlas cannot check this from the data available. You need to confirm it.' },
  },
  de: {
    'oem-verified': { label: 'HERSTELLERDATEN', meaning: 'Aus der Spezifikation des Fahrzeugherstellers für genau dieses Fahrzeug.' },
    official: { label: 'AMTLICHE DATEN', meaning: 'Von einer Behörde veröffentlicht, z. B. in einer Rückrufdatenbank.' },
    manufacturer: { label: 'HERSTELLERMITTEILUNG', meaning: 'Aus einem Serviceblatt oder Hinweis des Herstellers — nicht zwingend ein Rückruf.' },
    reference: { label: 'REFERENZDATEN', meaning: 'Aus einer kuratierten oder fremden Referenzliste. Hilfreich, aber weder amtlich noch vollständig.' },
    community: { label: 'NUTZERDATEN', meaning: 'Von Haltern gemeldet. Zeigt Muster, keine bestätigten Fakten.' },
    measured: { label: 'IHRE MESSUNG', meaning: 'Beruht auf einem Wert, den Sie an Ihrem Fahrzeug gemessen haben.' },
    calculated: { label: 'BERECHNET', meaning: 'Aus den eingegebenen Werten mit Standardformeln berechnet. Exakt für die Nenngeometrie, blind für alles Nicht-Eingegebene.' },
    estimated: { label: 'GESCHÄTZT', meaning: 'Näherung oder Faustregel. Nur als Ausgangspunkt verwenden.' },
    unknown: { label: 'NICHT GEPRÜFT', meaning: 'Atlas kann das mit den vorhandenen Daten nicht prüfen. Sie müssen es bestätigen.' },
  },
  es: {
    'oem-verified': { label: 'DATO OFICIAL DEL FABRICANTE', meaning: 'Tomado de la especificación del fabricante para este vehículo exacto.' },
    official: { label: 'DATO OFICIAL', meaning: 'Publicado por una autoridad, como un registro de llamadas a revisión.' },
    manufacturer: { label: 'COMUNICADO DEL FABRICANTE', meaning: 'De un boletín o aviso del fabricante — no necesariamente una llamada a revisión.' },
    reference: { label: 'DATO DE REFERENCIA', meaning: 'De una lista de referencia curada o de terceros. Útil, pero ni oficial ni exhaustiva.' },
    community: { label: 'DATO DE USUARIOS', meaning: 'Reportado por propietarios. Muestra patrones, no hechos confirmados.' },
    measured: { label: 'SU MEDICIÓN', meaning: 'Basado en un valor que usted midió en su vehículo.' },
    calculated: { label: 'CALCULADO', meaning: 'Calculado a partir de los valores introducidos con fórmulas estándar. Exacto para la geometría nominal, ciego a lo no introducido.' },
    estimated: { label: 'ESTIMADO', meaning: 'Aproximación o regla práctica. Úselo como punto de partida.' },
    unknown: { label: 'NO VERIFICADO', meaning: 'Atlas no puede comprobarlo con los datos disponibles. Debe confirmarlo usted.' },
  },
};
