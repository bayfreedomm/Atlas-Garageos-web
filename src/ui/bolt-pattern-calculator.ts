import { pcdFromAdjacentHoleSpacingMm } from '../data/bolt-pattern-geometry';
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
  fr: {
    lugCountIssue: 'Saisissez un nombre de goujons compris entre 3 et 10.',
    spacingIssue: 'Saisissez l’écart entre deux trous voisins sous forme de nombre positif.',
    pendingSummary: 'Vérifiez les champs signalés pour mettre à jour l’entraxe.',
    pendingAnswer: 'Saisissez les valeurs pour calculer l’entraxe (PCD).',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Une jante à ${lugCount} goujons avec ${spacingMm} mm entre deux trous voisins a un entraxe de ${label} mm.`,
    secondaryLabel: 'En pouces',
    secondaryNote: 'Vérifiez avec les caractéristiques de la jante ou du véhicule avant l’achat.',
    leftLabel: 'Écart saisi',
    rightLabel: 'Entraxe (PCD)',
    metricLugCount: 'Nombre de goujons',
    metricSpacing: 'Écart entre trous voisins',
    metricPcd: 'Entraxe (PCD)',
    metricNotation: 'Notation courante',
    lugsWord: 'goujons',
  },
  it: {
    lugCountIssue: 'Inserisci un numero di fori compreso tra 3 e 10.',
    spacingIssue: 'Inserisci la distanza tra fori adiacenti come numero positivo.',
    pendingSummary: 'Controlla i campi evidenziati per aggiornare la foratura.',
    pendingAnswer: 'Inserisci i valori per calcolare il diametro di foratura (PCD).',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Un cerchio a ${lugCount} fori con ${spacingMm} mm tra fori adiacenti ha una foratura di ${label} mm.`,
    secondaryLabel: 'In pollici',
    secondaryNote: 'Verifica con i dati del cerchio o del veicolo prima dell’acquisto.',
    leftLabel: 'Distanza inserita',
    rightLabel: 'Diametro di foratura (PCD)',
    metricLugCount: 'Numero di fori',
    metricSpacing: 'Distanza tra fori adiacenti',
    metricPcd: 'Diametro di foratura (PCD)',
    metricNotation: 'Notazione comune',
    lugsWord: 'fori',
  },
  'pt-br': {
    lugCountIssue: 'Digite um número de furos entre 3 e 10.',
    spacingIssue: 'Digite a distância entre furos vizinhos como um número positivo.',
    pendingSummary: 'Confira os campos destacados para atualizar a furação.',
    pendingAnswer: 'Digite os valores para calcular o diâmetro da furação (PCD).',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Uma roda de ${lugCount} furos com ${spacingMm} mm entre furos vizinhos tem furação de ${label} mm.`,
    secondaryLabel: 'Em polegadas',
    secondaryNote: 'Confirme com a especificação da roda ou do veículo antes de comprar.',
    leftLabel: 'Distância informada',
    rightLabel: 'Diâmetro da furação (PCD)',
    metricLugCount: 'Número de furos',
    metricSpacing: 'Distância entre furos',
    metricPcd: 'Diâmetro da furação (PCD)',
    metricNotation: 'Notação usual',
    lugsWord: 'furos',
  },
  pl: {
    lugCountIssue: 'Wpisz liczbę śrub od 3 do 10.',
    spacingIssue: 'Wpisz odległość między sąsiednimi otworami jako liczbę dodatnią.',
    pendingSummary: 'Sprawdź zaznaczone pola, aby zaktualizować rozstaw śrub.',
    pendingAnswer: 'Wpisz wartości, aby obliczyć rozstaw śrub (PCD).',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Felga z ${lugCount} otworami i odległością ${spacingMm} mm między sąsiednimi otworami ma rozstaw śrub ${label} mm.`,
    secondaryLabel: 'W calach',
    secondaryNote: 'Przed zakupem sprawdź to w danych felgi lub pojazdu.',
    leftLabel: 'Wpisana odległość',
    rightLabel: 'Rozstaw śrub (PCD)',
    metricLugCount: 'Liczba śrub',
    metricSpacing: 'Odległość między otworami',
    metricPcd: 'Rozstaw śrub (PCD)',
    metricNotation: 'Typowy zapis',
    lugsWord: 'śrub',
  },
  nl: {
    lugCountIssue: 'Vul een aantal boutgaten tussen 3 en 10 in.',
    spacingIssue: 'Vul de afstand tussen naburige gaten in als positief getal.',
    pendingSummary: 'Controleer de gemarkeerde velden om de steekmaat bij te werken.',
    pendingAnswer: 'Vul de waarden in om de steekmaat (PCD) te berekenen.',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Een velg met ${lugCount} boutgaten en ${spacingMm} mm tussen naburige gaten heeft een steekmaat van ${label} mm.`,
    secondaryLabel: 'In inches',
    secondaryNote: 'Controleer dit vóór aankoop met de specificaties van de velg of de auto.',
    leftLabel: 'Ingevulde afstand',
    rightLabel: 'Steekmaat (PCD)',
    metricLugCount: 'Aantal boutgaten',
    metricSpacing: 'Afstand tussen gaten',
    metricPcd: 'Steekmaat (PCD)',
    metricNotation: 'Gangbare notatie',
    lugsWord: 'gaten',
  },
  tr: {
    lugCountIssue: '3 ile 10 arasında bir bijon sayısı girin.',
    spacingIssue: 'Komşu delikler arası mesafeyi pozitif bir sayı olarak girin.',
    pendingSummary: 'Bijon aralığını güncellemek için işaretli alanları kontrol edin.',
    pendingAnswer: 'Bijon aralığını (PCD) hesaplamak için değerleri girin.',
    summary: (lugCount: number, spacingMm: string, label: string): string =>
      `Komşu delikleri arasında ${spacingMm} mm bulunan ${lugCount} bijonlu bir jantın bijon aralığı ${label} mm’dir.`,
    secondaryLabel: 'İnç olarak',
    secondaryNote: 'Satın almadan önce jant veya araç teknik verileriyle doğrulayın.',
    leftLabel: 'Girilen mesafe',
    rightLabel: 'Bijon aralığı (PCD)',
    metricLugCount: 'Bijon sayısı',
    metricSpacing: 'Delikler arası mesafe',
    metricPcd: 'Bijon aralığı (PCD)',
    metricNotation: 'Yaygın gösterim',
    lugsWord: 'bijon',
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
      const pcdMm = pcdFromAdjacentHoleSpacingMm(spacingMm, lugCount);
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
