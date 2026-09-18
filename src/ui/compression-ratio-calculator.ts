import { formatNumber } from './format-number';
import { getPageLocale } from './page-locale';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

const COMPRESSION_RATIO_LABELS = {
  en: {
    boreIssue: 'Enter a bore diameter greater than zero.',
    strokeIssue: 'Enter a stroke length greater than zero.',
    chamberIssue: 'Enter a combustion chamber volume greater than zero.',
    otherIssue: 'Enter the additional volume (0 if none).',
    clearanceIssue: 'Chamber volume plus additional volume must be greater than zero.',
    pendingSummary: 'Check the highlighted inputs to update the compression ratio.',
    pendingAnswer: 'Check the inputs to calculate the compression ratio.',
    summary: (ratio: string): string => `Static compression ratio is ${ratio}:1.`,
    secondaryLabel: 'Swept volume (per cylinder)',
    secondaryNote: 'From bore and stroke alone.',
    leftLabel: 'Clearance volume',
    rightLabel: 'Static compression ratio',
    metricBore: 'Bore',
    metricStroke: 'Stroke',
    metricSwept: 'Swept volume (per cylinder)',
    metricChamber: 'Chamber volume',
    metricOther: 'Additional volume (gasket + deck ± dish/dome)',
    metricClearance: 'Total clearance volume',
    metricRatio: 'Static compression ratio',
  },
  de: {
    boreIssue: 'Geben Sie einen Bohrungsdurchmesser größer als null ein.',
    strokeIssue: 'Geben Sie eine Hublänge größer als null ein.',
    chamberIssue: 'Geben Sie ein Brennraumvolumen größer als null ein.',
    otherIssue: 'Geben Sie das zusätzliche Volumen ein (0, falls keines vorhanden).',
    clearanceIssue: 'Brennraumvolumen plus zusätzliches Volumen muss größer als null sein.',
    pendingSummary: 'Prüfen Sie die markierten Felder, um das Verdichtungsverhältnis zu aktualisieren.',
    pendingAnswer: 'Geben Sie die Werte ein, um das Verdichtungsverhältnis zu berechnen.',
    summary: (ratio: string): string => `Das statische Verdichtungsverhältnis beträgt ${ratio}:1.`,
    secondaryLabel: 'Hubvolumen (pro Zylinder)',
    secondaryNote: 'Allein aus Bohrung und Hub.',
    leftLabel: 'Verdichtungsvolumen',
    rightLabel: 'Statisches Verdichtungsverhältnis',
    metricBore: 'Bohrung',
    metricStroke: 'Hub',
    metricSwept: 'Hubvolumen (pro Zylinder)',
    metricChamber: 'Brennraumvolumen',
    metricOther: 'Zusätzliches Volumen (Dichtung + Quetschkante ± Mulde/Dom)',
    metricClearance: 'Gesamtes Verdichtungsvolumen',
    metricRatio: 'Statisches Verdichtungsverhältnis',
  },
  es: {
    boreIssue: 'Introduzca un diámetro mayor que cero.',
    strokeIssue: 'Introduzca una carrera mayor que cero.',
    chamberIssue: 'Introduzca un volumen de cámara de combustión mayor que cero.',
    otherIssue: 'Introduzca el volumen adicional (0 si no hay ninguno).',
    clearanceIssue: 'El volumen de cámara más el volumen adicional debe ser mayor que cero.',
    pendingSummary: 'Revise los campos marcados para actualizar la relación de compresión.',
    pendingAnswer: 'Introduzca los valores para calcular la relación de compresión.',
    summary: (ratio: string): string => `La relación de compresión estática es ${ratio}:1.`,
    secondaryLabel: 'Volumen desplazado (por cilindro)',
    secondaryNote: 'Solo a partir del diámetro y la carrera.',
    leftLabel: 'Volumen de holgura',
    rightLabel: 'Relación de compresión estática',
    metricBore: 'Diámetro',
    metricStroke: 'Carrera',
    metricSwept: 'Volumen desplazado (por cilindro)',
    metricChamber: 'Volumen de cámara',
    metricOther: 'Volumen adicional (junta + holgura de plano ± hueco/domo)',
    metricClearance: 'Volumen de holgura total',
    metricRatio: 'Relación de compresión estática',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }

export function initializeCompressionRatioCalculator(): void {
  const t = COMPRESSION_RATIO_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="compression-ratio"]').forEach((form) => {
    const calculate = (): void => {
      const boreMm = numberValue(form, 'bore');
      const strokeMm = numberValue(form, 'stroke');
      const chamberCc = numberValue(form, 'chamber');
      const otherCc = numberValue(form, 'otherVolume');
      const issues: string[] = [];
      if (!Number.isFinite(boreMm) || boreMm <= 0) issues.push(t.boreIssue);
      if (!Number.isFinite(strokeMm) || strokeMm <= 0) issues.push(t.strokeIssue);
      if (!Number.isFinite(chamberCc) || chamberCc <= 0) issues.push(t.chamberIssue);
      if (!Number.isFinite(otherCc)) issues.push(t.otherIssue);
      const clearanceVolume = chamberCc + otherCc;
      if (!issues.length && clearanceVolume <= 0) issues.push(t.clearanceIssue);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.pendingSummary, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.pendingAnswer);
        return;
      }
      setErrors(form, []);
      const sweptVolumeMm3 = (Math.PI / 4) * boreMm * boreMm * strokeMm;
      const sweptVolumeCc = sweptVolumeMm3 / 1000;
      const totalVolume = sweptVolumeCc + clearanceVolume;
      const ratio = totalVolume / clearanceVolume;
      setSummary(form, t.summary(formatNumber(ratio, 2)), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(ratio, 2)}:1`,
        secondaryLabel: t.secondaryLabel,
        secondary: `${formatNumber(sweptVolumeCc, 1)} cc`,
        secondaryNote: t.secondaryNote,
        leftLabel: t.leftLabel,
        left: `${formatNumber(clearanceVolume, 1)} cc`,
        rightLabel: t.rightLabel,
        right: `${formatNumber(ratio, 2)}:1`,
      });
      renderMetrics(form, [
        [t.metricBore, `${formatNumber(boreMm, 2)} mm`],
        [t.metricStroke, `${formatNumber(strokeMm, 2)} mm`],
        [t.metricSwept, `${formatNumber(sweptVolumeCc, 2)} cc`],
        [t.metricChamber, `${formatNumber(chamberCc, 2)} cc`],
        [t.metricOther, `${formatNumber(otherCc, 2)} cc`],
        [t.metricClearance, `${formatNumber(clearanceVolume, 2)} cc`],
        [t.metricRatio, `${formatNumber(ratio, 2)}:1`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
