import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const LB_PER_KG = 2.2046226218;
const KM_PER_MI = 1.609344;

// Standard ETRTO / Tire and Rim Association load index table (single-tire load capacity, kg), common passenger/light-truck range.
const LOAD_INDEX_KG: Readonly<Record<number, number>> = {
  75: 387, 76: 400, 77: 412, 78: 425, 79: 437, 80: 450, 81: 462, 82: 475, 83: 487, 84: 500,
  85: 515, 86: 530, 87: 545, 88: 560, 89: 580, 90: 600, 91: 615, 92: 630, 93: 650, 94: 670,
  95: 690, 96: 710, 97: 730, 98: 750, 99: 775, 100: 800, 101: 825, 102: 850, 103: 875, 104: 900,
  105: 925, 106: 950, 107: 975, 108: 1000, 109: 1030, 110: 1060, 111: 1090, 112: 1120, 113: 1150, 114: 1180,
  115: 1215, 116: 1250, 117: 1285, 118: 1320, 119: 1360, 120: 1400, 121: 1450, 122: 1500, 123: 1550, 124: 1600,
  125: 1650, 126: 1700,
};

// Standard speed symbol table (sustained maximum speed).
const SPEED_RATING_KMH: Readonly<Record<string, number>> = {
  L: 120, M: 130, N: 140, P: 150, Q: 160, R: 170, S: 180, T: 190, U: 200, H: 210, V: 240, W: 270, Y: 300,
};

const TIRE_LOAD_SPEED_LABELS = {
  en: {
    loadIndexRequired: 'Choose a load index from the list.',
    speedRatingRequired: 'Choose a speed rating letter from the list.',
    summaryError: 'Choose a load index and speed rating to look up their ratings.',
    reset: 'Choose a load index and speed rating.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `Load index ${loadIndex} carries ${kg} kg per tire; a ${speedRating}-rated tire sustains up to ${kmh} km/h.`,
    speedRating: 'Speed rating',
    secondaryNote: (mph: string) => `${mph} mph maximum sustained speed.`,
    loadIndexLabel: (loadIndex: number) => `Load index ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Speed rating ${speedRating}`,
    metricLoadIndex: 'Load index',
    metricCapacity: 'Load capacity per tire',
    metricSpeedLetter: 'Speed rating letter',
    metricMaxSpeed: 'Maximum sustained speed',
  },
  de: {
    loadIndexRequired: 'Wählen Sie einen Tragfähigkeitsindex aus der Liste.',
    speedRatingRequired: 'Wählen Sie einen Geschwindigkeitsindex-Buchstaben aus der Liste.',
    summaryError: 'Wählen Sie einen Tragfähigkeitsindex und einen Geschwindigkeitsindex aus, um die Werte nachzuschlagen.',
    reset: 'Wählen Sie einen Tragfähigkeitsindex und einen Geschwindigkeitsindex.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `Tragfähigkeitsindex ${loadIndex} trägt ${kg} kg pro Reifen; ein Reifen mit Geschwindigkeitsindex ${speedRating} hält bis zu ${kmh} km/h aus.`,
    speedRating: 'Geschwindigkeitsindex',
    secondaryNote: (mph: string) => `${mph} mph Höchstdauergeschwindigkeit.`,
    loadIndexLabel: (loadIndex: number) => `Tragfähigkeitsindex ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Geschwindigkeitsindex ${speedRating}`,
    metricLoadIndex: 'Tragfähigkeitsindex',
    metricCapacity: 'Tragfähigkeit pro Reifen',
    metricSpeedLetter: 'Geschwindigkeitsindex-Buchstabe',
    metricMaxSpeed: 'Maximale Dauergeschwindigkeit',
  },
  es: {
    loadIndexRequired: 'Elija un índice de carga de la lista.',
    speedRatingRequired: 'Elija una letra de índice de velocidad de la lista.',
    summaryError: 'Elija un índice de carga y un índice de velocidad para consultar sus valores.',
    reset: 'Elija un índice de carga y un índice de velocidad.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `El índice de carga ${loadIndex} soporta ${kg} kg por neumático; un neumático con índice de velocidad ${speedRating} resiste hasta ${kmh} km/h.`,
    speedRating: 'Índice de velocidad',
    secondaryNote: (mph: string) => `${mph} mph de velocidad máxima sostenida.`,
    loadIndexLabel: (loadIndex: number) => `Índice de carga ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Índice de velocidad ${speedRating}`,
    metricLoadIndex: 'Índice de carga',
    metricCapacity: 'Capacidad de carga por neumático',
    metricSpeedLetter: 'Letra de índice de velocidad',
    metricMaxSpeed: 'Velocidad máxima sostenida',
  },
} as const;

function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeTireLoadSpeedReference(): void {
  const t = TIRE_LOAD_SPEED_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-load-speed"]').forEach((form) => {
    const calculate = (): void => {
      const loadIndex = Number(textValue(form, 'loadIndex'));
      const speedRating = textValue(form, 'speedRating').toUpperCase();
      const kg = LOAD_INDEX_KG[loadIndex];
      const kmh = SPEED_RATING_KMH[speedRating];
      const issues: string[] = [];
      if (kg === undefined) issues.push(t.loadIndexRequired);
      if (kmh === undefined) issues.push(t.speedRatingRequired);
      if (issues.length || kg === undefined || kmh === undefined) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
        return;
      }
      setErrors(form, []);
      const lb = kg * LB_PER_KG;
      const mph = kmh / KM_PER_MI;
      setSummary(form, t.summary(loadIndex, formatNumber(kg, 0), speedRating, formatNumber(kmh, 0)), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(kg, 0)} kg`,
        secondaryLabel: t.speedRating,
        secondary: `${formatNumber(kmh, 0)} km/h`,
        secondaryNote: t.secondaryNote(formatNumber(mph, 0)),
        leftLabel: t.loadIndexLabel(loadIndex),
        left: `${formatNumber(kg, 0)} kg / ${formatNumber(lb, 0)} lb`,
        rightLabel: t.speedRatingLabel(speedRating),
        right: `${formatNumber(kmh, 0)} km/h / ${formatNumber(mph, 0)} mph`,
      });
      renderMetrics(form, [
        [t.metricLoadIndex, String(loadIndex)],
        [t.metricCapacity, `${formatNumber(kg, 0)} kg (${formatNumber(lb, 0)} lb)`],
        [t.metricSpeedLetter, speedRating],
        [t.metricMaxSpeed, `${formatNumber(kmh, 0)} km/h (${formatNumber(mph, 0)} mph)`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
