import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

const MM_PER_INCH = 25.4;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeBoltPatternCalculator(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="bolt-pattern"]').forEach((form) => {
    const calculate = (): void => {
      const lugCount = Math.round(numberValue(form, 'lugCount'));
      const spacingEntered = numberValue(form, 'spacing');
      const unit = textValue(form, 'spacingUnit') === 'in' ? 'in' : 'mm';
      const issues: string[] = [];
      if (!Number.isFinite(lugCount) || lugCount < 3 || lugCount > 10) issues.push('Enter a lug count between 3 and 10.');
      if (!Number.isFinite(spacingEntered) || spacingEntered <= 0 || spacingEntered > 500) issues.push('Enter the hole-to-hole spacing as a positive number.');
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, 'Check the highlighted inputs to update the bolt circle.', true);
        renderMetrics(form, []);
        resetStandardAnswer(form, 'Check the inputs to calculate the bolt circle diameter.');
        return;
      }
      setErrors(form, []);
      const spacingMm = unit === 'in' ? spacingEntered * MM_PER_INCH : spacingEntered;
      const pcdMm = spacingMm / Math.sin(Math.PI / lugCount);
      const pcdIn = pcdMm / MM_PER_INCH;
      const label = `${lugCount}x${formatNumber(pcdMm, 1)}`;
      setSummary(form, `A ${lugCount}-lug wheel with ${formatNumber(spacingMm, 1)} mm between adjacent holes has a bolt circle of ${label} mm.`, false);
      syncStandardAnswer(form, {
        primary: `${label} mm`,
        secondaryLabel: 'In inches',
        secondary: `${formatNumber(pcdIn, 2)} in`,
        secondaryNote: 'Confirm against the wheel or vehicle spec before buying.',
        leftLabel: 'Entered spacing',
        left: `${formatNumber(spacingEntered, unit === 'in' ? 3 : 1)} ${unit} · ${lugCount} lugs`,
        rightLabel: 'Bolt circle diameter (PCD)',
        right: `${label} mm`,
      });
      renderMetrics(form, [
        ['Lug count', String(lugCount)],
        ['Hole-to-hole spacing', `${formatNumber(spacingMm, 1)} mm`],
        ['Bolt circle diameter (PCD)', `${formatNumber(pcdMm, 1)} mm / ${formatNumber(pcdIn, 2)} in`],
        ['Common notation', `${label} mm`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
