import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const LB_PER_KG = 2.2046226218;
const KW_PER_HP = 0.7456998716;

const QUARTER_MILE_LABELS = {
  en: {
    weightRequired: 'Enter a vehicle weight greater than zero.',
    powerRequired: 'Enter a power figure greater than zero.',
    summaryError: 'Check the highlighted inputs to update the estimate.',
    reset: 'Check the inputs to estimate elapsed time and trap speed.',
    summary: (et: string, trapMph: string) => `Estimated quarter mile: ${et} s at ${trapMph} mph.`,
    trapSpeed: 'Trap speed',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · power-to-weight based estimate.`,
    powerToWeight: 'Power-to-weight',
    quarterMileEt: 'Quarter mile ET',
    metricWeight: 'Vehicle weight',
    metricPower: 'Power',
    metricEt: 'Estimated quarter mile ET',
    metricTrap: 'Estimated trap speed',
    metricZeroToSixty: 'Very rough 0-60 mph estimate',
  },
  de: {
    weightRequired: 'Geben Sie ein Fahrzeuggewicht größer als null ein.',
    powerRequired: 'Geben Sie einen Leistungswert größer als null ein.',
    summaryError: 'Überprüfen Sie die markierten Eingaben, um die Schätzung zu aktualisieren.',
    reset: 'Geben Sie die Werte ein, um Endzeit und Endgeschwindigkeit zu schätzen.',
    summary: (et: string, trapMph: string) => `Geschätzte Viertelmeile: ${et} s bei ${trapMph} mph.`,
    trapSpeed: 'Endgeschwindigkeit',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · Schätzung auf Basis des Leistungsgewichts.`,
    powerToWeight: 'Leistungsgewicht',
    quarterMileEt: 'Viertelmeilen-Endzeit',
    metricWeight: 'Fahrzeuggewicht',
    metricPower: 'Leistung',
    metricEt: 'Geschätzte Viertelmeilen-Endzeit',
    metricTrap: 'Geschätzte Endgeschwindigkeit',
    metricZeroToSixty: 'Sehr grobe 0–60-mph-Schätzung',
  },
  es: {
    weightRequired: 'Introduzca un peso del vehículo mayor que cero.',
    powerRequired: 'Introduzca una cifra de potencia mayor que cero.',
    summaryError: 'Revise los campos resaltados para actualizar la estimación.',
    reset: 'Introduzca los datos para estimar el tiempo transcurrido y la velocidad de paso.',
    summary: (et: string, trapMph: string) => `Cuarto de milla estimado: ${et} s a ${trapMph} mph.`,
    trapSpeed: 'Velocidad de paso',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · estimación basada en la relación peso-potencia.`,
    powerToWeight: 'Relación peso-potencia',
    quarterMileEt: 'Tiempo del cuarto de milla',
    metricWeight: 'Peso del vehículo',
    metricPower: 'Potencia',
    metricEt: 'Tiempo estimado del cuarto de milla',
    metricTrap: 'Velocidad de paso estimada',
    metricZeroToSixty: 'Estimación muy aproximada de 0–60 mph',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeQuarterMileCalculator(): void {
  const t = QUARTER_MILE_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="quarter-mile"]').forEach((form) => {
    const calculate = (): void => {
      const weightEntered = numberValue(form, 'weight');
      const weightUnit = textValue(form, 'weightUnit') === 'kg' ? 'kg' : 'lb';
      const powerEntered = numberValue(form, 'power');
      const powerUnit = textValue(form, 'powerUnit') === 'kw' ? 'kw' : 'hp';
      const issues: string[] = [];
      if (!Number.isFinite(weightEntered) || weightEntered <= 0) issues.push(t.weightRequired);
      if (!Number.isFinite(powerEntered) || powerEntered <= 0) issues.push(t.powerRequired);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
        return;
      }
      setErrors(form, []);
      const weightLb = weightUnit === 'kg' ? weightEntered * LB_PER_KG : weightEntered;
      const hp = powerUnit === 'kw' ? powerEntered / KW_PER_HP : powerEntered;
      const ratio = weightLb / hp;
      const et = 5.825 * Math.cbrt(ratio);
      const trapMph = 234 * Math.cbrt(1 / ratio);
      const trapKmh = trapMph * 1.609344;
      const roughZeroToSixty = et * 0.42;
      setSummary(form, t.summary(formatNumber(et, 2), formatNumber(trapMph, 1)), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(et, 2)} s`,
        secondaryLabel: t.trapSpeed,
        secondary: `${formatNumber(trapMph, 1)} mph`,
        secondaryNote: t.secondaryNote(formatNumber(trapKmh, 1)),
        leftLabel: t.powerToWeight,
        left: `${formatNumber(hp, 0)} hp · ${formatNumber(weightLb, 0)} lb`,
        rightLabel: t.quarterMileEt,
        right: `${formatNumber(et, 2)} s`,
      });
      renderMetrics(form, [
        [t.metricWeight, `${formatNumber(weightLb, 0)} lb (${formatNumber(weightLb / LB_PER_KG, 0)} kg)`],
        [t.metricPower, `${formatNumber(hp, 0)} hp (${formatNumber(hp * KW_PER_HP, 0)} kW)`],
        [t.metricEt, `${formatNumber(et, 2)} s`],
        [t.metricTrap, `${formatNumber(trapMph, 1)} mph (${formatNumber(trapKmh, 1)} km/h)`],
        [t.metricZeroToSixty, `${formatNumber(roughZeroToSixty, 2)} s`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
