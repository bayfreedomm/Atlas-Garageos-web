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
  fr: {
    loadIndexRequired: 'Choisissez un indice de charge dans la liste.',
    speedRatingRequired: 'Choisissez une lettre d’indice de vitesse dans la liste.',
    summaryError: 'Choisissez un indice de charge et un indice de vitesse pour afficher leurs valeurs.',
    reset: 'Choisissez un indice de charge et un indice de vitesse.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `L’indice de charge ${loadIndex} supporte ${kg} kg par pneu ; un pneu d’indice de vitesse ${speedRating} tient jusqu’à ${kmh} km/h.`,
    speedRating: 'Indice de vitesse',
    secondaryNote: (mph: string) => `${mph} mph de vitesse maximale soutenue.`,
    loadIndexLabel: (loadIndex: number) => `Indice de charge ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Indice de vitesse ${speedRating}`,
    metricLoadIndex: 'Indice de charge',
    metricCapacity: 'Capacité de charge par pneu',
    metricSpeedLetter: 'Lettre d’indice de vitesse',
    metricMaxSpeed: 'Vitesse maximale soutenue',
  },
  it: {
    loadIndexRequired: 'Scegli un indice di carico dall’elenco.',
    speedRatingRequired: 'Scegli una lettera del codice di velocità dall’elenco.',
    summaryError: 'Scegli un indice di carico e un codice di velocità per vedere i relativi valori.',
    reset: 'Scegli un indice di carico e un codice di velocità.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `L’indice di carico ${loadIndex} sopporta ${kg} kg per pneumatico; un pneumatico con codice di velocità ${speedRating} regge fino a ${kmh} km/h.`,
    speedRating: 'Codice di velocità',
    secondaryNote: (mph: string) => `${mph} mph di velocità massima sostenuta.`,
    loadIndexLabel: (loadIndex: number) => `Indice di carico ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Codice di velocità ${speedRating}`,
    metricLoadIndex: 'Indice di carico',
    metricCapacity: 'Capacità di carico per pneumatico',
    metricSpeedLetter: 'Lettera del codice di velocità',
    metricMaxSpeed: 'Velocità massima sostenuta',
  },
  'pt-br': {
    loadIndexRequired: 'Escolha um índice de carga na lista.',
    speedRatingRequired: 'Escolha uma letra de índice de velocidade na lista.',
    summaryError: 'Escolha um índice de carga e um índice de velocidade para consultar os valores.',
    reset: 'Escolha um índice de carga e um índice de velocidade.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `O índice de carga ${loadIndex} suporta ${kg} kg por pneu; um pneu com índice de velocidade ${speedRating} aguenta até ${kmh} km/h.`,
    speedRating: 'Índice de velocidade',
    secondaryNote: (mph: string) => `${mph} mph de velocidade máxima contínua.`,
    loadIndexLabel: (loadIndex: number) => `Índice de carga ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Índice de velocidade ${speedRating}`,
    metricLoadIndex: 'Índice de carga',
    metricCapacity: 'Capacidade de carga por pneu',
    metricSpeedLetter: 'Letra do índice de velocidade',
    metricMaxSpeed: 'Velocidade máxima contínua',
  },
  pl: {
    loadIndexRequired: 'Wybierz indeks nośności z listy.',
    speedRatingRequired: 'Wybierz literę indeksu prędkości z listy.',
    summaryError: 'Wybierz indeks nośności i indeks prędkości, aby sprawdzić ich wartości.',
    reset: 'Wybierz indeks nośności i indeks prędkości.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `Indeks nośności ${loadIndex} oznacza ${kg} kg na oponę; opona z indeksem prędkości ${speedRating} wytrzymuje do ${kmh} km/h.`,
    speedRating: 'Indeks prędkości',
    secondaryNote: (mph: string) => `${mph} mph maksymalnej prędkości ciągłej.`,
    loadIndexLabel: (loadIndex: number) => `Indeks nośności ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Indeks prędkości ${speedRating}`,
    metricLoadIndex: 'Indeks nośności',
    metricCapacity: 'Nośność na oponę',
    metricSpeedLetter: 'Litera indeksu prędkości',
    metricMaxSpeed: 'Maksymalna prędkość ciągła',
  },
  nl: {
    loadIndexRequired: 'Kies een loadindex uit de lijst.',
    speedRatingRequired: 'Kies een snelheidsindexletter uit de lijst.',
    summaryError: 'Kies een loadindex en een snelheidsindex om de waarden op te zoeken.',
    reset: 'Kies een loadindex en een snelheidsindex.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `Loadindex ${loadIndex} draagt ${kg} kg per band; een band met snelheidsindex ${speedRating} kan tot ${kmh} km/h aan.`,
    speedRating: 'Snelheidsindex',
    secondaryNote: (mph: string) => `${mph} mph maximale continue snelheid.`,
    loadIndexLabel: (loadIndex: number) => `Loadindex ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Snelheidsindex ${speedRating}`,
    metricLoadIndex: 'Loadindex',
    metricCapacity: 'Draagvermogen per band',
    metricSpeedLetter: 'Snelheidsindexletter',
    metricMaxSpeed: 'Maximale continue snelheid',
  },
  tr: {
    loadIndexRequired: 'Listeden bir yük endeksi seçin.',
    speedRatingRequired: 'Listeden bir hız endeksi harfi seçin.',
    summaryError: 'Değerlerini görmek için bir yük endeksi ve bir hız endeksi seçin.',
    reset: 'Bir yük endeksi ve bir hız endeksi seçin.',
    summary: (loadIndex: number, kg: string, speedRating: string, kmh: string) =>
      `${loadIndex} yük endeksi lastik başına ${kg} kg taşır; ${speedRating} hız endeksli bir lastik ${kmh} km/h hıza kadar dayanır.`,
    speedRating: 'Hız endeksi',
    secondaryNote: (mph: string) => `Azami sürekli hız ${mph} mph.`,
    loadIndexLabel: (loadIndex: number) => `Yük endeksi ${loadIndex}`,
    speedRatingLabel: (speedRating: string) => `Hız endeksi ${speedRating}`,
    metricLoadIndex: 'Yük endeksi',
    metricCapacity: 'Lastik başına yük kapasitesi',
    metricSpeedLetter: 'Hız endeksi harfi',
    metricMaxSpeed: 'Azami sürekli hız',
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
