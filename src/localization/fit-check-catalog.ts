import type { FitCheckStatus, FitVerdict } from '../features/tools/fit-check';
import type { UiLocale } from '../ui/page-locale';

/** Speedometer meaning depends on direction and size of the change, not just on pass/review. */
export type SpeedoCase = 'same' | 'higher' | 'lower-small' | 'lower-large';

export interface FitCheckText {
  readonly verdictTitle: Readonly<Record<FitVerdict, string>>;
  readonly verdictSummary: (percent: string, larger: boolean) => string;
  readonly geometryOnly: string;
  readonly counts: (pass: number, review: number, conflict: number, unknown: number) => string;
  readonly statusLabel: Readonly<Record<FitCheckStatus, string>>;
  readonly checksHeading: string;
  readonly shapeHeading: string;
  readonly shapeCurrent: string;
  readonly shapeNew: string;
  readonly shapeNote: string;
  readonly nextHeading: string;
  readonly legendHeading: string;
  readonly nearest: string;
  readonly diameter: { readonly title: string; readonly value: (current: string, proposed: string, diffMm: string, diffPct: string) => string; readonly pass: string; readonly review: string; readonly conflict: string };
  readonly speedometer: { readonly title: string; readonly value: (actual: string) => string; readonly meaning: Readonly<Record<SpeedoCase, string>> };
  readonly rideHeight: { readonly title: string; readonly value: (mm: string) => string; readonly meaning: (higher: boolean | null) => string };
  readonly availabilityCurrent: (size: string) => string;
  readonly availabilityProposed: (size: string) => string;
  readonly availability: { readonly listed: string; readonly unlisted: string; readonly nonstandard: string };
  readonly wheels: { readonly title: string; readonly same: string; readonly changes: (rim: number) => string };
  readonly wheelPosition: { readonly title: string; readonly value: (inner: string, outer: string) => string; readonly meaning: string };
  readonly rimWidth: { readonly title: string; readonly meaning: string };
  readonly loadSpeed: { readonly title: string; readonly meaning: string };
  readonly clearance: { readonly title: string; readonly meaning: string };
  readonly approval: { readonly title: string; readonly meaning: string };
  readonly actions: { readonly compare: string; readonly speedometer: string; readonly measure: string; readonly wheelOffset: string; readonly loadIndex: string };
}

export const fitCheckText: Readonly<Record<UiLocale, FitCheckText>> = {
  en: {
    verdictTitle: {
      close: 'Geometrically a close match',
      'within-rule': 'Geometrically within the common ±3% rule',
      review: 'Needs review before you buy',
      large: 'Large change — get an expert check',
    },
    verdictSummary: (percent, larger) => `The new size is ${percent}% ${larger ? 'larger' : 'smaller'} in overall diameter.`,
    geometryOnly: 'This is a geometry decision, not a fitment approval. The checks marked NOT VERIFIED still need your confirmation.',
    counts: (pass, review, conflict, unknown) => `${pass} OK · ${review} to review · ${conflict} problem${conflict === 1 ? '' : 's'} · ${unknown} to confirm`,
    statusLabel: { pass: 'OK', review: 'Review', conflict: 'Problem', info: 'Info', unknown: 'Confirm' },
    checksHeading: 'What Atlas checked',
    shapeHeading: 'Side by side, to scale',
    shapeCurrent: 'Current',
    shapeNew: 'New',
    shapeNote: 'Both tires drawn at true relative scale, standing on the same ground line.',
    nextHeading: 'Next steps with these sizes',
    legendHeading: 'What the labels mean',
    nearest: 'Closest listed sizes:',
    diameter: {
      title: 'Overall diameter',
      value: (current, proposed, diffMm, diffPct) => `${current} mm → ${proposed} mm (${diffMm} mm, ${diffPct}%)`,
      pass: 'Within the common ±3% rule of thumb for size changes. That is an industry guideline, not a legal limit.',
      review: 'Outside the common ±3% rule of thumb. Speedometer, ABS/ESC and gearing are affected more — have the change confirmed.',
      conflict: 'More than 5% away from the original. That is a big change for speedometer, gearing and clearance.',
    },
    speedometer: {
      title: 'Speedometer',
      value: (actual) => `Shows 100 km/h → you drive ≈ ${actual} km/h`,
      meaning: {
        same: 'Practically unchanged.',
        higher: 'The speedometer will read a little higher than before — the direction the rules allow. The odometer will count slightly more distance.',
        'lower-small': 'The speedometer will read a little lower than before. Speedometers are built to read slightly high, so a small change usually stays inside that margin — not guaranteed.',
        'lower-large': 'The speedometer will read noticeably lower. UN Regulation 39 requires a speedometer never to show less than true speed; a change this large can use up the built-in margin.',
      },
    },
    rideHeight: {
      title: 'Ride height',
      value: (mm) => `${mm} mm`,
      meaning: (higher) => higher === null ? 'Unchanged.' : `The car sits ${higher ? 'higher' : 'lower'} by half the diameter change.`,
    },
    availabilityCurrent: (size) => `Current size ${size}`,
    availabilityProposed: (size) => `New size ${size}`,
    availability: {
      listed: 'Manufactured — it appears in our reference list of production tire sizes.',
      unlisted: 'Not in our reference list. It may be rare or specialist — check availability before planning around it.',
      nonstandard: 'Unusual notation — modern metric widths end in 5 and profiles go in steps of 5. Check the sidewall again.',
    },
    wheels: {
      title: 'Wheels',
      same: 'Same rim diameter: your current wheels can be reused if their width suits the new tire.',
      changes: (rim) => `Different rim diameter: this change needs new ${rim}-inch wheels.`,
    },
    wheelPosition: {
      title: 'Wheel position',
      value: (inner, outer) => `Inner edge ${inner} mm · outer edge ${outer} mm`,
      meaning: 'How far the wheel edges move compared with your current wheels (positive = further in / further out). Whether that space exists on your car is not known.',
    },
    rimWidth: { title: 'Rim width approval', meaning: 'Every tire size has an approved range of rim widths. Check the tire maker’s data sheet for the wheel width you will use.' },
    loadSpeed: { title: 'Load index & speed rating', meaning: 'The new tire’s load index and speed rating must be at least what your vehicle requires (door-jamb label or vehicle documents).' },
    clearance: { title: 'Real clearance', meaning: 'Brake, suspension and body clearance depend on your car. Measure the current gaps to project the change.' },
    approval: { title: 'Approval & registration', meaning: 'Some countries require an approval or a registration entry for sizes not listed for the vehicle. Check the rules where the car is registered.' },
    actions: { compare: 'Compare every dimension', speedometer: 'Speedometer at every speed', measure: 'Measure real clearance', wheelOffset: 'Wheel position in detail', loadIndex: 'Look up load index & speed rating' },
  },
  de: {
    verdictTitle: {
      close: 'Geometrisch nahezu gleich',
      'within-rule': 'Geometrisch innerhalb der üblichen ±3-%-Regel',
      review: 'Vor dem Kauf prüfen lassen',
      large: 'Große Änderung — Fachprüfung empfohlen',
    },
    verdictSummary: (percent, larger) => `Die neue Größe ist im Gesamtdurchmesser ${percent} % ${larger ? 'größer' : 'kleiner'}.`,
    geometryOnly: 'Das ist eine Geometrie-Entscheidung, keine Passform-Freigabe. Die mit NICHT GEPRÜFT markierten Punkte müssen Sie noch bestätigen.',
    counts: (pass, review, conflict, unknown) => `${pass} OK · ${review} prüfen · ${conflict} Problem${conflict === 1 ? '' : 'e'} · ${unknown} zu bestätigen`,
    statusLabel: { pass: 'OK', review: 'Prüfen', conflict: 'Problem', info: 'Info', unknown: 'Bestätigen' },
    checksHeading: 'Was Atlas geprüft hat',
    shapeHeading: 'Nebeneinander, maßstäblich',
    shapeCurrent: 'Aktuell',
    shapeNew: 'Neu',
    shapeNote: 'Beide Reifen im echten Größenverhältnis, auf derselben Standlinie.',
    nextHeading: 'Nächste Schritte mit diesen Größen',
    legendHeading: 'Was die Kennzeichnungen bedeuten',
    nearest: 'Nächste gelistete Größen:',
    diameter: {
      title: 'Gesamtdurchmesser',
      value: (current, proposed, diffMm, diffPct) => `${current} mm → ${proposed} mm (${diffMm} mm, ${diffPct} %)`,
      pass: 'Innerhalb der üblichen ±3-%-Faustregel für Größenwechsel. Das ist eine Branchenrichtlinie, keine gesetzliche Grenze.',
      review: 'Außerhalb der üblichen ±3-%-Faustregel. Tacho, ABS/ESP und Übersetzung werden stärker beeinflusst — lassen Sie den Wechsel bestätigen.',
      conflict: 'Mehr als 5 % Abweichung vom Original. Eine große Änderung für Tacho, Übersetzung und Freigang.',
    },
    speedometer: {
      title: 'Tacho',
      value: (actual) => `Anzeige 100 km/h → tatsächlich ≈ ${actual} km/h`,
      meaning: {
        same: 'Praktisch unverändert.',
        higher: 'Der Tacho zeigt etwas mehr an als bisher — die zulässige Richtung. Der Kilometerzähler zählt etwas mehr Strecke.',
        'lower-small': 'Der Tacho zeigt etwas weniger an als bisher. Tachos gehen ab Werk leicht vor, eine kleine Änderung bleibt meist innerhalb dieser Reserve — ohne Garantie.',
        'lower-large': 'Der Tacho zeigt deutlich weniger an. Nach UN-Regelung 39 darf ein Tacho nie weniger als die tatsächliche Geschwindigkeit anzeigen; eine so große Änderung kann die Reserve aufbrauchen.',
      },
    },
    rideHeight: {
      title: 'Bodenfreiheit',
      value: (mm) => `${mm} mm`,
      meaning: (higher) => higher === null ? 'Unverändert.' : `Das Auto steht um die Hälfte der Durchmesseränderung ${higher ? 'höher' : 'tiefer'}.`,
    },
    availabilityCurrent: (size) => `Aktuelle Größe ${size}`,
    availabilityProposed: (size) => `Neue Größe ${size}`,
    availability: {
      listed: 'Wird hergestellt — steht in unserer Referenzliste der Serienreifengrößen.',
      unlisted: 'Nicht in unserer Referenzliste. Möglicherweise eine seltene Sondergröße — klären Sie die Verfügbarkeit, bevor Sie damit planen.',
      nonstandard: 'Ungewöhnliche Angabe — metrische Breiten enden auf 5 und Querschnitte gehen in 5er-Schritten. Prüfen Sie die Reifenflanke erneut.',
    },
    wheels: {
      title: 'Felgen',
      same: 'Gleicher Felgendurchmesser: Ihre Felgen können weiter genutzt werden, wenn ihre Breite zum neuen Reifen passt.',
      changes: (rim) => `Anderer Felgendurchmesser: Für diesen Wechsel brauchen Sie neue ${rim}-Zoll-Felgen.`,
    },
    wheelPosition: {
      title: 'Radposition',
      value: (inner, outer) => `Innenkante ${inner} mm · Außenkante ${outer} mm`,
      meaning: 'Wie weit sich die Felgenkanten gegenüber Ihren aktuellen Felgen verschieben (positiv = weiter innen / weiter außen). Ob an Ihrem Auto so viel Platz ist, ist nicht bekannt.',
    },
    rimWidth: { title: 'Zulässige Felgenbreite', meaning: 'Jede Reifengröße hat einen zulässigen Felgenbreitenbereich. Prüfen Sie das Datenblatt des Reifenherstellers für Ihre Felgenbreite.' },
    loadSpeed: { title: 'Tragfähigkeit & Geschwindigkeitsindex', meaning: 'Tragfähigkeits- und Geschwindigkeitsindex des neuen Reifens müssen mindestens den Fahrzeugvorgaben entsprechen (Fahrzeugschein bzw. Aufkleber an der Tür).' },
    clearance: { title: 'Tatsächlicher Freigang', meaning: 'Freigang zu Bremse, Fahrwerk und Karosserie hängt von Ihrem Auto ab. Messen Sie die aktuellen Abstände, um die Änderung zu projizieren.' },
    approval: { title: 'Freigabe & Eintragung', meaning: 'Größen, die nicht in den Fahrzeugpapieren stehen, brauchen in Deutschland in der Regel eine Freigabe (z. B. ABE oder Teilegutachten) und gegebenenfalls eine Eintragung durch TÜV oder DEKRA.' },
    actions: { compare: 'Alle Maße vergleichen', speedometer: 'Tacho bei jeder Geschwindigkeit', measure: 'Echten Freigang messen', wheelOffset: 'Radposition im Detail', loadIndex: 'Trag- und Geschwindigkeitsindex nachschlagen' },
  },
  es: {
    verdictTitle: {
      close: 'Geométricamente casi igual',
      'within-rule': 'Geométricamente dentro de la regla habitual del ±3 %',
      review: 'Revíselo antes de comprar',
      large: 'Cambio grande — consulte a un profesional',
    },
    verdictSummary: (percent, larger) => `La nueva medida es un ${percent} % ${larger ? 'mayor' : 'menor'} en diámetro total.`,
    geometryOnly: 'Es una decisión geométrica, no una aprobación de montaje. Los puntos marcados como NO VERIFICADO aún requieren su confirmación.',
    counts: (pass, review, conflict, unknown) => `${pass} OK · ${review} a revisar · ${conflict} problema${conflict === 1 ? '' : 's'} · ${unknown} a confirmar`,
    statusLabel: { pass: 'OK', review: 'Revisar', conflict: 'Problema', info: 'Info', unknown: 'Confirmar' },
    checksHeading: 'Lo que Atlas ha comprobado',
    shapeHeading: 'Lado a lado, a escala',
    shapeCurrent: 'Actual',
    shapeNew: 'Nuevo',
    shapeNote: 'Ambos neumáticos a escala real, sobre la misma línea de suelo.',
    nextHeading: 'Siguientes pasos con estas medidas',
    legendHeading: 'Qué significan las etiquetas',
    nearest: 'Medidas listadas más cercanas:',
    diameter: {
      title: 'Diámetro total',
      value: (current, proposed, diffMm, diffPct) => `${current} mm → ${proposed} mm (${diffMm} mm, ${diffPct} %)`,
      pass: 'Dentro de la regla práctica habitual del ±3 % para cambios de medida. Es una pauta del sector, no un límite legal.',
      review: 'Fuera de la regla práctica habitual del ±3 %. Velocímetro, ABS/ESP y desarrollo se ven más afectados — haga confirmar el cambio.',
      conflict: 'Más de un 5 % de diferencia con el original. Es un cambio grande para el velocímetro, el desarrollo y la holgura.',
    },
    speedometer: {
      title: 'Velocímetro',
      value: (actual) => `Marca 100 km/h → circula a ≈ ${actual} km/h`,
      meaning: {
        same: 'Prácticamente sin cambios.',
        higher: 'El velocímetro marcará un poco más que antes — la dirección que permiten las normas. El cuentakilómetros sumará algo más de distancia.',
        'lower-small': 'El velocímetro marcará un poco menos que antes. Los velocímetros marcan algo de más de fábrica, así que un cambio pequeño suele quedar dentro de ese margen — sin garantía.',
        'lower-large': 'El velocímetro marcará claramente menos. El Reglamento n.º 39 de la ONU exige que nunca marque menos que la velocidad real; un cambio así puede agotar ese margen.',
      },
    },
    rideHeight: {
      title: 'Altura libre',
      value: (mm) => `${mm} mm`,
      meaning: (higher) => higher === null ? 'Sin cambios.' : `El coche queda ${higher ? 'más alto' : 'más bajo'} en la mitad del cambio de diámetro.`,
    },
    availabilityCurrent: (size) => `Medida actual ${size}`,
    availabilityProposed: (size) => `Medida nueva ${size}`,
    availability: {
      listed: 'Se fabrica — aparece en nuestra lista de referencia de medidas de serie.',
      unlisted: 'No está en nuestra lista de referencia. Puede ser poco común o especial — compruebe la disponibilidad antes de contar con ella.',
      nonstandard: 'Notación inusual — los anchos métricos terminan en 5 y los perfiles van de 5 en 5. Revise de nuevo el flanco.',
    },
    wheels: {
      title: 'Llantas',
      same: 'Mismo diámetro de llanta: puede seguir usando sus llantas si su ancho es adecuado para el nuevo neumático.',
      changes: (rim) => `Diámetro de llanta distinto: este cambio necesita llantas nuevas de ${rim} pulgadas.`,
    },
    wheelPosition: {
      title: 'Posición de la rueda',
      value: (inner, outer) => `Borde interior ${inner} mm · borde exterior ${outer} mm`,
      meaning: 'Cuánto se desplazan los bordes de la llanta respecto a las actuales (positivo = más hacia dentro / más hacia fuera). No se sabe si su coche tiene ese espacio.',
    },
    rimWidth: { title: 'Ancho de llanta homologado', meaning: 'Cada medida de neumático tiene un rango de anchos de llanta aprobado. Consulte la ficha del fabricante del neumático para el ancho que vaya a usar.' },
    loadSpeed: { title: 'Índice de carga y código de velocidad', meaning: 'El índice de carga y el código de velocidad del nuevo neumático deben ser al menos los que exige el vehículo (ficha técnica o etiqueta de la puerta).' },
    clearance: { title: 'Holgura real', meaning: 'La holgura con frenos, suspensión y carrocería depende de su coche. Mida las distancias actuales para proyectar el cambio.' },
    approval: { title: 'Homologación e ITV', meaning: 'En España, una medida que no figura en la ficha técnica suele requerir homologación como reforma y pasar por la ITV.' },
    actions: { compare: 'Comparar todas las medidas', speedometer: 'Velocímetro a cada velocidad', measure: 'Medir la holgura real', wheelOffset: 'Posición de la rueda en detalle', loadIndex: 'Consultar índice de carga y velocidad' },
  },
};
