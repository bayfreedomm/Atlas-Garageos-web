import { formatNumber } from './format-number';
import { getPageLocale } from './page-locale';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

const MM_PER_INCH = 25.4;

const BOLT_PATTERN_LABELS = {
  en: {
    lugCountIssue: 'Enter a lug count between 3 and 10.',
    spacingIssue: 'Enter the hole-to-hole spacing as a positive number.',
    pendingSummary: 'Check the highlighted inputs to update the bolt circle.',
    pendingAnswer: 'Check the inputs to calculate the bolt circle diameter.',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `A ${lugCount}-lug wheel with ${spacingMm} mm between adjacent holes has a bolt circle of ${label} mm.`,
    secondaryLabel: 'In inches',
    secondaryNote: 'Confirm against the wheel or vehicle spec before buying.',
    leftLabel: 'Entered spacing',
    rightLabel: 'Bolt circle diameter (PCD)',
    metricLugCount: 'Lug count',
    metricSpacing: 'Hole-to-hole spacing',
    metricPcd: 'Bolt circle diameter (PCD)',
    metricNotation: 'Common notation',
    lugsWord: 'lugs',
  },
  de: {
    lugCountIssue: 'Geben Sie eine Lochzahl zwischen 3 und 10 ein.',
    spacingIssue: 'Geben Sie den Lochabstand als positive Zahl ein.',
    pendingSummary: 'Prüfen Sie die markierten Felder, um den Lochkreis zu aktualisieren.',
    pendingAnswer: 'Geben Sie die Werte ein, um den Lochkreisdurchmesser zu berechnen.',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Ein ${lugCount}-Loch-Rad mit ${spacingMm} mm Abstand zwischen benachbarten Löchern hat einen Lochkreis von ${label} mm.`,
    secondaryLabel: 'In Zoll',
    secondaryNote: 'Vor dem Kauf mit der Rad- oder Fahrzeugspezifikation abgleichen.',
    leftLabel: 'Eingegebener Abstand',
    rightLabel: 'Lochkreisdurchmesser (PCD)',
    metricLugCount: 'Lochzahl',
    metricSpacing: 'Lochabstand',
    metricPcd: 'Lochkreisdurchmesser (PCD)',
    metricNotation: 'Übliche Schreibweise',
    lugsWord: 'Löcher',
  },
  es: {
    lugCountIssue: 'Introduzca un número de birlos entre 3 y 10.',
    spacingIssue: 'Introduzca la distancia entre orificios como un número positivo.',
    pendingSummary: 'Revise los campos marcados para actualizar el círculo de birlos.',
    pendingAnswer: 'Introduzca los valores para calcular el diámetro del círculo de birlos.',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Una llanta de ${lugCount} birlos con ${spacingMm} mm entre orificios adyacentes tiene un círculo de birlos de ${label} mm.`,
    secondaryLabel: 'En pulgadas',
    secondaryNote: 'Confirme con la especificación de la llanta o del vehículo antes de comprar.',
    leftLabel: 'Distancia introducida',
    rightLabel: 'Diámetro del círculo de birlos (PCD)',
    metricLugCount: 'Número de birlos',
    metricSpacing: 'Distancia entre orificios',
    metricPcd: 'Diámetro del círculo de birlos (PCD)',
    metricNotation: 'Notación habitual',
    lugsWord: 'birlos',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeBoltPatternCalculator(): void {
  const t = BOLT_PATTERN_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="bolt-pattern"]').forEach((form) => {
    const calculate = (): void => {
      const lugCount = numberValue(form, 'lugCount');
      const spacingEntered = numberValue(form, 'spacing');
      const unit = textValue(form, 'spacingUnit') === 'in' ? 'in' : 'mm';
      const issues: string[] = [];
      if (!Number.isInteger(lugCount) || lugCount < 3 || lugCount > 10) issues.push(t.lugCountIssue);
      if (!Number.isFinite(spacingEntered) || spacingEntered <= 0 || spacingEntered > 500) issues.push(t.spacingIssue);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.pendingSummary, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.pendingAnswer);
        return;
      }
      setErrors(form, []);
      const spacingMm = unit === 'in' ? spacingEntered * MM_PER_INCH : spacingEntered;
      const pcdMm = spacingMm / Math.sin(Math.PI / lugCount);
      const pcdIn = pcdMm / MM_PER_INCH;
      const label = `${lugCount}x${formatNumber(pcdMm, 1)}`;
      setSummary(form, t.summary(lugCount, formatNumber(spacingMm, 1), label), false);
      syncStandardAnswer(form, {
        primary: `${label} mm`,
        secondaryLabel: t.secondaryLabel,
        secondary: `${formatNumber(pcdIn, 2)} in`,
        secondaryNote: t.secondaryNote,
        leftLabel: t.leftLabel,
        left: `${formatNumber(spacingEntered, unit === 'in' ? 3 : 1)} ${unit} · ${lugCount} ${t.lugsWord}`,
        rightLabel: t.rightLabel,
        right: `${label} mm`,
      });
      renderMetrics(form, [
        [t.metricLugCount, String(lugCount)],
        [t.metricSpacing, `${formatNumber(spacingMm, 1)} mm`],
        [t.metricPcd, `${formatNumber(pcdMm, 1)} mm / ${formatNumber(pcdIn, 2)} in`],
        [t.metricNotation, `${label} mm`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
