import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const TOWING_CAPACITY_LABELS = {
  en: {
    gcwrRequired: 'Enter a GCWR greater than zero.',
    curbWeightRequired: 'Enter the tow vehicle curb weight.',
    loadWeightRequired: 'Enter passenger and cargo weight (0 if none).',
    overGcwr: 'Curb weight plus passengers and cargo already meets or exceeds the GCWR — no trailer capacity remains.',
    summaryError: 'Check the highlighted inputs to update the towing estimate.',
    reset: 'Check the inputs to estimate available towing capacity.',
    summary: (maxTrailer: string, unit: string) => `Up to ${maxTrailer} ${unit} of trailer weight remains within your GCWR.`,
    tongueWeight: 'Recommended tongue weight',
    secondaryNote: '10–15% of trailer weight for a conventional hitch.',
    leftLabel: 'GCWR minus loaded vehicle',
    rightLabel: 'Available trailer weight',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Tow vehicle curb weight',
    metricLoadWeight: 'Passengers + cargo in vehicle',
    metricMaxTrailer: 'Maximum trailer weight',
    metricTongue: 'Recommended tongue weight',
  },
  de: {
    gcwrRequired: 'Geben Sie ein GCWR größer als null ein.',
    curbWeightRequired: 'Geben Sie das Leergewicht des Zugfahrzeugs ein.',
    loadWeightRequired: 'Geben Sie das Gewicht von Passagieren und Ladung ein (0, falls keine).',
    overGcwr: 'Leergewicht plus Passagiere und Ladung erreichen oder überschreiten bereits das GCWR — es bleibt keine Anhängerlast übrig.',
    summaryError: 'Überprüfen Sie die markierten Eingaben, um die Schätzung zu aktualisieren.',
    reset: 'Überprüfen Sie die Eingaben, um die verfügbare Anhängerlast zu schätzen.',
    summary: (maxTrailer: string, unit: string) => `Bis zu ${maxTrailer} ${unit} Anhängerlast bleiben innerhalb Ihres GCWR verfügbar.`,
    tongueWeight: 'Empfohlene Stützlast',
    secondaryNote: '10–15 % der Anhängerlast bei einer normalen Anhängekupplung.',
    leftLabel: 'GCWR abzüglich beladenem Fahrzeug',
    rightLabel: 'Verfügbare Anhängerlast',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Leergewicht des Zugfahrzeugs',
    metricLoadWeight: 'Passagiere + Ladung im Fahrzeug',
    metricMaxTrailer: 'Maximale Anhängerlast',
    metricTongue: 'Empfohlene Stützlast',
  },
  es: {
    gcwrRequired: 'Introduzca un GCWR mayor que cero.',
    curbWeightRequired: 'Introduzca el peso en vacío del vehículo remolcador.',
    loadWeightRequired: 'Introduzca el peso de pasajeros y carga (0 si no hay).',
    overGcwr: 'El peso en vacío más los pasajeros y la carga ya alcanzan o superan el GCWR — no queda capacidad de remolque disponible.',
    summaryError: 'Revise los campos resaltados para actualizar la estimación de remolque.',
    reset: 'Revise los datos para estimar la capacidad de remolque disponible.',
    summary: (maxTrailer: string, unit: string) => `Dispone de hasta ${maxTrailer} ${unit} de peso de remolque dentro de su GCWR.`,
    tongueWeight: 'Peso de lengüeta recomendado',
    secondaryNote: 'Del 10 al 15 % del peso del remolque en un enganche convencional.',
    leftLabel: 'GCWR menos vehículo cargado',
    rightLabel: 'Peso de remolque disponible',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Peso en vacío del vehículo remolcador',
    metricLoadWeight: 'Pasajeros + carga en el vehículo',
    metricMaxTrailer: 'Peso máximo de remolque',
    metricTongue: 'Peso de lengüeta recomendado',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeTowingCapacityCalculator(): void {
  const t = TOWING_CAPACITY_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="towing-capacity"]').forEach((form) => {
    const calculate = (): void => {
      const unit = textValue(form, 'unit') === 'kg' ? 'kg' : 'lb';
      const gcwr = numberValue(form, 'gcwr');
      const curbWeight = numberValue(form, 'curbWeight');
      const loadWeight = numberValue(form, 'loadWeight');
      const issues: string[] = [];
      if (!Number.isFinite(gcwr) || gcwr <= 0) issues.push(t.gcwrRequired);
      if (!Number.isFinite(curbWeight) || curbWeight <= 0) issues.push(t.curbWeightRequired);
      if (!Number.isFinite(loadWeight) || loadWeight < 0) issues.push(t.loadWeightRequired);
      if (!issues.length && curbWeight + loadWeight >= gcwr) issues.push(t.overGcwr);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
        return;
      }
      setErrors(form, []);
      const maxTrailer = gcwr - curbWeight - loadWeight;
      const tongueMin = maxTrailer * 0.10;
      const tongueMax = maxTrailer * 0.15;
      setSummary(form, t.summary(formatNumber(maxTrailer, 0), unit), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(maxTrailer, 0)} ${unit}`,
        secondaryLabel: t.tongueWeight,
        secondary: `${formatNumber(tongueMin, 0)}–${formatNumber(tongueMax, 0)} ${unit}`,
        secondaryNote: t.secondaryNote,
        leftLabel: t.leftLabel,
        left: `${formatNumber(gcwr, 0)} − ${formatNumber(curbWeight + loadWeight, 0)} ${unit}`,
        rightLabel: t.rightLabel,
        right: `${formatNumber(maxTrailer, 0)} ${unit}`,
      });
      renderMetrics(form, [
        [t.metricGcwr, `${formatNumber(gcwr, 0)} ${unit}`],
        [t.metricCurbWeight, `${formatNumber(curbWeight, 0)} ${unit}`],
        [t.metricLoadWeight, `${formatNumber(loadWeight, 0)} ${unit}`],
        [t.metricMaxTrailer, `${formatNumber(maxTrailer, 0)} ${unit}`],
        [t.metricTongue, `${formatNumber(tongueMin, 0)}–${formatNumber(tongueMax, 0)} ${unit}`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
