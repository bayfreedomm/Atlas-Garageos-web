import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
} as const;

const TIRE_DATE_CODE_LABELS = {
  en: {
    formatError: 'Enter the last 4 digits of the DOT code (week and year), for example 2219.',
    weekRangeError: 'The first two digits should be a week number between 01 and 53.',
    futureYearError: 'That year is in the future — double-check the 4-digit code.',
    tooOldError: 'Codes before 2000 use a 3-digit format not covered by this decoder.',
    summaryError: 'Check the code to decode the manufacture date.',
    reset: 'Enter a 4-digit DOT date code.',
    guidanceDefault: 'Within a commonly cited service-life window; still confirm your tire manufacturer\'s specific guidance.',
    guidanceOver10: 'Beyond the 10-year mark many manufacturers cite as a maximum, regardless of tread depth.',
    guidanceOver6: 'Past 6 years old, many manufacturers recommend a qualified inspection at least once a year.',
    summary: (week: number, year: number, ageYears: string) => `Week ${week} of ${year} — about ${ageYears} years old.`,
    primary: (week: number, year: number) => `Week ${week}, ${year}`,
    approxAge: 'Approximate age',
    yearsOld: (ageYears: string) => `${ageYears} years`,
    dotCode: 'DOT code',
    manufactured: 'Manufactured',
    metricWeek: 'Manufacture week',
    metricYear: 'Manufacture year',
    metricMonth: 'Approximate manufacture month',
    metricAge: 'Approximate age today',
    metricGuidance: 'General guidance',
  },
  de: {
    formatError: 'Geben Sie die letzten 4 Ziffern des DOT-Codes ein (Woche und Jahr), zum Beispiel 2219.',
    weekRangeError: 'Die ersten beiden Ziffern sollten eine Kalenderwoche zwischen 01 und 53 sein.',
    futureYearError: 'Dieses Jahr liegt in der Zukunft — überprüfen Sie den 4-stelligen Code.',
    tooOldError: 'Codes vor 2000 verwenden ein 3-stelliges Format, das dieser Decoder nicht unterstützt.',
    summaryError: 'Überprüfen Sie den Code, um das Herstellungsdatum zu entschlüsseln.',
    reset: 'Geben Sie einen 4-stelligen DOT-Datumscode ein.',
    guidanceDefault: 'Innerhalb eines häufig genannten Nutzungszeitraums — prüfen Sie dennoch die spezifischen Angaben Ihres Reifenherstellers.',
    guidanceOver10: 'Jenseits der 10-Jahres-Marke, die viele Hersteller als Höchstgrenze nennen, unabhängig von der Profiltiefe.',
    guidanceOver6: 'Über 6 Jahre alt — viele Hersteller empfehlen mindestens einmal jährlich eine fachkundige Prüfung.',
    summary: (week: number, year: number, ageYears: string) => `Woche ${week} des Jahres ${year} — etwa ${ageYears} Jahre alt.`,
    primary: (week: number, year: number) => `Woche ${week}, ${year}`,
    approxAge: 'Ungefähres Alter',
    yearsOld: (ageYears: string) => `${ageYears} Jahre`,
    dotCode: 'DOT-Code',
    manufactured: 'Hergestellt',
    metricWeek: 'Herstellungswoche',
    metricYear: 'Herstellungsjahr',
    metricMonth: 'Ungefährer Herstellungsmonat',
    metricAge: 'Ungefähres Alter heute',
    metricGuidance: 'Allgemeine Empfehlung',
  },
  es: {
    formatError: 'Introduzca los últimos 4 dígitos del código DOT (semana y año), por ejemplo 2219.',
    weekRangeError: 'Los dos primeros dígitos deben ser un número de semana entre 01 y 53.',
    futureYearError: 'Ese año está en el futuro — compruebe el código de 4 dígitos.',
    tooOldError: 'Los códigos anteriores a 2000 usan un formato de 3 dígitos que este decodificador no admite.',
    summaryError: 'Revise el código para decodificar la fecha de fabricación.',
    reset: 'Introduzca un código de fecha DOT de 4 dígitos.',
    guidanceDefault: 'Dentro de un periodo de vida útil comúnmente citado; aun así, confirme la guía específica de su fabricante de neumáticos.',
    guidanceOver10: 'Más allá de los 10 años que muchos fabricantes citan como máximo, independientemente de la profundidad del dibujo.',
    guidanceOver6: 'Con más de 6 años, muchos fabricantes recomiendan una inspección cualificada al menos una vez al año.',
    summary: (week: number, year: number, ageYears: string) => `Semana ${week} de ${year} — unos ${ageYears} años de antigüedad.`,
    primary: (week: number, year: number) => `Semana ${week}, ${year}`,
    approxAge: 'Antigüedad aproximada',
    yearsOld: (ageYears: string) => `${ageYears} años`,
    dotCode: 'Código DOT',
    manufactured: 'Fabricado',
    metricWeek: 'Semana de fabricación',
    metricYear: 'Año de fabricación',
    metricMonth: 'Mes aproximado de fabricación',
    metricAge: 'Antigüedad aproximada actual',
    metricGuidance: 'Recomendación general',
  },
} as const;

function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? '').trim(); }

function dateFromWeek(week: number, year: number): Date {
  // ISO-ish approximation: first Monday-based week of the year, adequate for a display date.
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dayOffset = (week - 1) * 7;
  return new Date(jan1.getTime() + dayOffset * 86400000);
}

export function initializeTireDateCodeDecoder(): void {
  const locale = getPageLocale();
  const t = TIRE_DATE_CODE_LABELS[locale];
  const monthNames = MONTH_NAMES[locale];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-date-code"]').forEach((form) => {
    const calculate = (): void => {
      const raw = textValue(form, 'code').replace(/\D/g, '');
      const issues: string[] = [];
      if (raw.length !== 4) issues.push(t.formatError);
      let week = 0, year = 0;
      if (!issues.length) {
        week = Number(raw.slice(0, 2));
        const yy = Number(raw.slice(2, 4));
        year = 2000 + yy;
        const now = new Date();
        if (week < 1 || week > 53) issues.push(t.weekRangeError);
        if (year > now.getFullYear()) issues.push(t.futureYearError);
        if (year < 1990) issues.push(t.tooOldError);
      }
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
        return;
      }
      setErrors(form, []);
      const manufactureDate = dateFromWeek(week, year);
      const now = new Date();
      const ageYears = (now.getTime() - manufactureDate.getTime()) / (365.25 * 86400000);
      const monthLabel = monthNames[manufactureDate.getUTCMonth()] ?? '';
      let guidance: string = t.guidanceDefault;
      if (ageYears >= 10) guidance = t.guidanceOver10;
      else if (ageYears >= 6) guidance = t.guidanceOver6;
      setSummary(form, t.summary(week, year, ageYears.toFixed(1)), false);
      syncStandardAnswer(form, {
        primary: t.primary(week, year),
        secondaryLabel: t.approxAge,
        secondary: t.yearsOld(ageYears.toFixed(1)),
        secondaryNote: guidance,
        leftLabel: t.dotCode,
        left: raw,
        rightLabel: t.manufactured,
        right: `${monthLabel} ${year}`,
      });
      renderMetrics(form, [
        [t.metricWeek, String(week)],
        [t.metricYear, String(year)],
        [t.metricMonth, monthLabel],
        [t.metricAge, t.yearsOld(ageYears.toFixed(1))],
        [t.metricGuidance, guidance],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
