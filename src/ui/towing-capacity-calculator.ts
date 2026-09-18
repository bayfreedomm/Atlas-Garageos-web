import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeTowingCapacityCalculator(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="towing-capacity"]').forEach((form) => {
    const calculate = (): void => {
      const unit = textValue(form, 'unit') === 'kg' ? 'kg' : 'lb';
      const gcwr = numberValue(form, 'gcwr');
      const curbWeight = numberValue(form, 'curbWeight');
      const loadWeight = numberValue(form, 'loadWeight');
      const issues: string[] = [];
      if (!Number.isFinite(gcwr) || gcwr <= 0) issues.push('Enter a GCWR greater than zero.');
      if (!Number.isFinite(curbWeight) || curbWeight <= 0) issues.push('Enter the tow vehicle curb weight.');
      if (!Number.isFinite(loadWeight) || loadWeight < 0) issues.push('Enter passenger and cargo weight (0 if none).');
      if (!issues.length && curbWeight + loadWeight >= gcwr) issues.push('Curb weight plus passengers and cargo already meets or exceeds the GCWR — no trailer capacity remains.');
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, 'Check the highlighted inputs to update the towing estimate.', true);
        renderMetrics(form, []);
        resetStandardAnswer(form, 'Check the inputs to estimate available towing capacity.');
        return;
      }
      setErrors(form, []);
      const maxTrailer = gcwr - curbWeight - loadWeight;
      const tongueMin = maxTrailer * 0.10;
      const tongueMax = maxTrailer * 0.15;
      setSummary(form, `Up to ${formatNumber(maxTrailer, 0)} ${unit} of trailer weight remains within your GCWR.`, false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(maxTrailer, 0)} ${unit}`,
        secondaryLabel: 'Recommended tongue weight',
        secondary: `${formatNumber(tongueMin, 0)}–${formatNumber(tongueMax, 0)} ${unit}`,
        secondaryNote: '10–15% of trailer weight for a conventional hitch.',
        leftLabel: 'GCWR minus loaded vehicle',
        left: `${formatNumber(gcwr, 0)} − ${formatNumber(curbWeight + loadWeight, 0)} ${unit}`,
        rightLabel: 'Available trailer weight',
        right: `${formatNumber(maxTrailer, 0)} ${unit}`,
      });
      renderMetrics(form, [
        ['GCWR', `${formatNumber(gcwr, 0)} ${unit}`],
        ['Tow vehicle curb weight', `${formatNumber(curbWeight, 0)} ${unit}`],
        ['Passengers + cargo in vehicle', `${formatNumber(loadWeight, 0)} ${unit}`],
        ['Maximum trailer weight', `${formatNumber(maxTrailer, 0)} ${unit}`],
        ['Recommended tongue weight', `${formatNumber(tongueMin, 0)}–${formatNumber(tongueMax, 0)} ${unit}`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
