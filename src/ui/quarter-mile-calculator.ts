import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

const LB_PER_KG = 2.2046226218;
const KW_PER_HP = 0.7456998716;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeQuarterMileCalculator(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="quarter-mile"]').forEach((form) => {
    const calculate = (): void => {
      const weightEntered = numberValue(form, 'weight');
      const weightUnit = textValue(form, 'weightUnit') === 'kg' ? 'kg' : 'lb';
      const powerEntered = numberValue(form, 'power');
      const powerUnit = textValue(form, 'powerUnit') === 'kw' ? 'kw' : 'hp';
      const issues: string[] = [];
      if (!Number.isFinite(weightEntered) || weightEntered <= 0) issues.push('Enter a vehicle weight greater than zero.');
      if (!Number.isFinite(powerEntered) || powerEntered <= 0) issues.push('Enter a power figure greater than zero.');
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, 'Check the highlighted inputs to update the estimate.', true);
        renderMetrics(form, []);
        resetStandardAnswer(form, 'Check the inputs to estimate elapsed time and trap speed.');
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
      setSummary(form, `Estimated quarter mile: ${formatNumber(et, 2)} s at ${formatNumber(trapMph, 1)} mph.`, false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(et, 2)} s`,
        secondaryLabel: 'Trap speed',
        secondary: `${formatNumber(trapMph, 1)} mph`,
        secondaryNote: `${formatNumber(trapKmh, 1)} km/h · power-to-weight based estimate.`,
        leftLabel: 'Power-to-weight',
        left: `${formatNumber(hp, 0)} hp · ${formatNumber(weightLb, 0)} lb`,
        rightLabel: 'Quarter mile ET',
        right: `${formatNumber(et, 2)} s`,
      });
      renderMetrics(form, [
        ['Vehicle weight', `${formatNumber(weightLb, 0)} lb (${formatNumber(weightLb / LB_PER_KG, 0)} kg)`],
        ['Power', `${formatNumber(hp, 0)} hp (${formatNumber(hp * KW_PER_HP, 0)} kW)`],
        ['Estimated quarter mile ET', `${formatNumber(et, 2)} s`],
        ['Estimated trap speed', `${formatNumber(trapMph, 1)} mph (${formatNumber(trapKmh, 1)} km/h)`],
        ['Very rough 0-60 mph estimate', `${formatNumber(roughZeroToSixty, 2)} s`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
