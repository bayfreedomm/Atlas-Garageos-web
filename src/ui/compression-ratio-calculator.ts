import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }

export function initializeCompressionRatioCalculator(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="compression-ratio"]').forEach((form) => {
    const calculate = (): void => {
      const boreMm = numberValue(form, 'bore');
      const strokeMm = numberValue(form, 'stroke');
      const chamberCc = numberValue(form, 'chamber');
      const otherCc = numberValue(form, 'otherVolume');
      const issues: string[] = [];
      if (!Number.isFinite(boreMm) || boreMm <= 0) issues.push('Enter a bore diameter greater than zero.');
      if (!Number.isFinite(strokeMm) || strokeMm <= 0) issues.push('Enter a stroke length greater than zero.');
      if (!Number.isFinite(chamberCc) || chamberCc <= 0) issues.push('Enter a combustion chamber volume greater than zero.');
      if (!Number.isFinite(otherCc)) issues.push('Enter the additional volume (0 if none).');
      const clearanceVolume = chamberCc + otherCc;
      if (!issues.length && clearanceVolume <= 0) issues.push('Chamber volume plus additional volume must be greater than zero.');
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, 'Check the highlighted inputs to update the compression ratio.', true);
        renderMetrics(form, []);
        resetStandardAnswer(form, 'Check the inputs to calculate the compression ratio.');
        return;
      }
      setErrors(form, []);
      const sweptVolumeMm3 = (Math.PI / 4) * boreMm * boreMm * strokeMm;
      const sweptVolumeCc = sweptVolumeMm3 / 1000;
      const totalVolume = sweptVolumeCc + clearanceVolume;
      const ratio = totalVolume / clearanceVolume;
      setSummary(form, `Static compression ratio is ${formatNumber(ratio, 2)}:1.`, false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(ratio, 2)}:1`,
        secondaryLabel: 'Swept volume (per cylinder)',
        secondary: `${formatNumber(sweptVolumeCc, 1)} cc`,
        secondaryNote: 'From bore and stroke alone.',
        leftLabel: 'Clearance volume',
        left: `${formatNumber(clearanceVolume, 1)} cc`,
        rightLabel: 'Static compression ratio',
        right: `${formatNumber(ratio, 2)}:1`,
      });
      renderMetrics(form, [
        ['Bore', `${formatNumber(boreMm, 2)} mm`],
        ['Stroke', `${formatNumber(strokeMm, 2)} mm`],
        ['Swept volume (per cylinder)', `${formatNumber(sweptVolumeCc, 2)} cc`],
        ['Chamber volume', `${formatNumber(chamberCc, 2)} cc`],
        ['Additional volume (gasket + deck ± dish/dome)', `${formatNumber(otherCc, 2)} cc`],
        ['Total clearance volume', `${formatNumber(clearanceVolume, 2)} cc`],
        ['Static compression ratio', `${formatNumber(ratio, 2)}:1`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
