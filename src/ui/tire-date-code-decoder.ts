import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? '').trim(); }

function dateFromWeek(week: number, year: number): Date {
  // ISO-ish approximation: first Monday-based week of the year, adequate for a display date.
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dayOffset = (week - 1) * 7;
  return new Date(jan1.getTime() + dayOffset * 86400000);
}

export function initializeTireDateCodeDecoder(): void {
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-date-code"]').forEach((form) => {
    const calculate = (): void => {
      const raw = textValue(form, 'code').replace(/\D/g, '');
      const issues: string[] = [];
      if (raw.length !== 4) issues.push('Enter the last 4 digits of the DOT code (week and year), for example 2219.');
      let week = 0, year = 0;
      if (!issues.length) {
        week = Number(raw.slice(0, 2));
        const yy = Number(raw.slice(2, 4));
        year = 2000 + yy;
        const now = new Date();
        if (week < 1 || week > 53) issues.push('The first two digits should be a week number between 01 and 53.');
        if (year > now.getFullYear()) issues.push('That year is in the future — double-check the 4-digit code.');
        if (year < 1990) issues.push('Codes before 2000 use a 3-digit format not covered by this decoder.');
      }
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, 'Check the code to decode the manufacture date.', true);
        renderMetrics(form, []);
        resetStandardAnswer(form, 'Enter a 4-digit DOT date code.');
        return;
      }
      setErrors(form, []);
      const manufactureDate = dateFromWeek(week, year);
      const now = new Date();
      const ageYears = (now.getTime() - manufactureDate.getTime()) / (365.25 * 86400000);
      const monthLabel = MONTH_NAMES[manufactureDate.getUTCMonth()];
      let guidance = 'Within a commonly cited service-life window; still confirm your tire manufacturer\'s specific guidance.';
      if (ageYears >= 10) guidance = 'Beyond the 10-year mark many manufacturers cite as a maximum, regardless of tread depth.';
      else if (ageYears >= 6) guidance = 'Past 6 years old, many manufacturers recommend a qualified inspection at least once a year.';
      setSummary(form, `Week ${week} of ${year} — about ${ageYears.toFixed(1)} years old.`, false);
      syncStandardAnswer(form, {
        primary: `Week ${week}, ${year}`,
        secondaryLabel: 'Approximate age',
        secondary: `${ageYears.toFixed(1)} years`,
        secondaryNote: guidance,
        leftLabel: 'DOT code',
        left: raw,
        rightLabel: 'Manufactured',
        right: `${monthLabel} ${year}`,
      });
      renderMetrics(form, [
        ['Manufacture week', String(week)],
        ['Manufacture year', String(year)],
        ['Approximate manufacture month', monthLabel],
        ['Approximate age today', `${ageYears.toFixed(1)} years`],
        ['General guidance', guidance],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
