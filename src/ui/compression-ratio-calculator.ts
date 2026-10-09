import { formatNumber } from './format-number';
import { getPageLocale } from './page-locale';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';

const COMPRESSION_RATIO_LABELS = {
  en: {
    boreIssue: 'Enter a bore diameter greater than zero.',
    strokeIssue: 'Enter a stroke length greater than zero.',
    chamberIssue: 'Enter a combustion chamber volume greater than zero.',
    otherIssue: 'Enter the additional volume (0 if none).',
    clearanceIssue: 'Chamber volume plus additional volume must be greater than zero.',
    pendingSummary: 'Check the highlighted inputs to update the compression ratio.',
    pendingAnswer: 'Check the inputs to calculate the compression ratio.',
    summary: (ratio: string): string => `Static compression ratio is ${ratio}:1.`,
    secondaryLabel: 'Swept volume (per cylinder)',
    secondaryNote: 'From bore and stroke alone.',
    leftLabel: 'Clearance volume',
    rightLabel: 'Static compression ratio',
    metricBore: 'Bore',
    metricStroke: 'Stroke',
    metricSwept: 'Swept volume (per cylinder)',
    metricChamber: 'Chamber volume',
    metricOther: 'Additional volume (gasket + deck ± dish/dome)',
    metricClearance: 'Total clearance volume',
    metricRatio: 'Static compression ratio',
  },
  de: {
    boreIssue: 'Geben Sie einen Bohrungsdurchmesser größer als null ein.',
    strokeIssue: 'Geben Sie eine Hublänge größer als null ein.',
    chamberIssue: 'Geben Sie ein Brennraumvolumen größer als null ein.',
    otherIssue: 'Geben Sie das zusätzliche Volumen ein (0, falls keines vorhanden).',
    clearanceIssue: 'Brennraumvolumen plus zusätzliches Volumen muss größer als null sein.',
    pendingSummary: 'Prüfen Sie die markierten Felder, um das Verdichtungsverhältnis zu aktualisieren.',
    pendingAnswer: 'Geben Sie die Werte ein, um das Verdichtungsverhältnis zu berechnen.',
    summary: (ratio: string): string => `Das statische Verdichtungsverhältnis beträgt ${ratio}:1.`,
    secondaryLabel: 'Hubvolumen (pro Zylinder)',
    secondaryNote: 'Allein aus Bohrung und Hub.',
    leftLabel: 'Verdichtungsvolumen',
    rightLabel: 'Statisches Verdichtungsverhältnis',
    metricBore: 'Bohrung',
    metricStroke: 'Hub',
    metricSwept: 'Hubvolumen (pro Zylinder)',
    metricChamber: 'Brennraumvolumen',
    metricOther: 'Zusätzliches Volumen (Dichtung + Quetschkante ± Mulde/Dom)',
    metricClearance: 'Gesamtes Verdichtungsvolumen',
    metricRatio: 'Statisches Verdichtungsverhältnis',
  },
  es: {
    boreIssue: 'Introduzca un diámetro mayor que cero.',
    strokeIssue: 'Introduzca una carrera mayor que cero.',
    chamberIssue: 'Introduzca un volumen de cámara de combustión mayor que cero.',
    otherIssue: 'Introduzca el volumen adicional (0 si no hay ninguno).',
    clearanceIssue: 'El volumen de cámara más el volumen adicional debe ser mayor que cero.',
    pendingSummary: 'Revise los campos marcados para actualizar la relación de compresión.',
    pendingAnswer: 'Introduzca los valores para calcular la relación de compresión.',
    summary: (ratio: string): string => `La relación de compresión estática es ${ratio}:1.`,
    secondaryLabel: 'Volumen desplazado (por cilindro)',
    secondaryNote: 'Solo a partir del diámetro y la carrera.',
    leftLabel: 'Volumen de holgura',
    rightLabel: 'Relación de compresión estática',
    metricBore: 'Diámetro',
    metricStroke: 'Carrera',
    metricSwept: 'Volumen desplazado (por cilindro)',
    metricChamber: 'Volumen de cámara',
    metricOther: 'Volumen adicional (junta + holgura de plano ± hueco/domo)',
    metricClearance: 'Volumen de holgura total',
    metricRatio: 'Relación de compresión estática',
  },
  fr: {
    boreIssue: 'Saisissez un alésage supérieur à zéro.',
    strokeIssue: 'Saisissez une course supérieure à zéro.',
    chamberIssue: 'Saisissez un volume de chambre de combustion supérieur à zéro.',
    otherIssue: 'Saisissez le volume additionnel (0 s’il n’y en a pas).',
    clearanceIssue: 'Le volume de chambre plus le volume additionnel doit être supérieur à zéro.',
    pendingSummary: 'Vérifiez les champs signalés pour mettre à jour le taux de compression.',
    pendingAnswer: 'Saisissez les valeurs pour calculer le taux de compression.',
    summary: (ratio: string): string => `Le taux de compression statique est de ${ratio}:1.`,
    secondaryLabel: 'Cylindrée unitaire (par cylindre)',
    secondaryNote: 'Calculée uniquement à partir de l’alésage et de la course.',
    leftLabel: 'Volume mort',
    rightLabel: 'Taux de compression statique',
    metricBore: 'Alésage',
    metricStroke: 'Course',
    metricSwept: 'Cylindrée unitaire (par cylindre)',
    metricChamber: 'Volume de chambre',
    metricOther: 'Volume additionnel (joint + retrait du piston ± bol/dôme)',
    metricClearance: 'Volume mort total',
    metricRatio: 'Taux de compression statique',
  },
  it: {
    boreIssue: 'Inserisci un alesaggio maggiore di zero.',
    strokeIssue: 'Inserisci una corsa maggiore di zero.',
    chamberIssue: 'Inserisci un volume della camera di combustione maggiore di zero.',
    otherIssue: 'Inserisci il volume aggiuntivo (0 se non c’è).',
    clearanceIssue: 'Il volume della camera più il volume aggiuntivo deve essere maggiore di zero.',
    pendingSummary: 'Controlla i campi evidenziati per aggiornare il rapporto di compressione.',
    pendingAnswer: 'Inserisci i valori per calcolare il rapporto di compressione.',
    summary: (ratio: string): string => `Il rapporto di compressione statico è ${ratio}:1.`,
    secondaryLabel: 'Cilindrata unitaria (per cilindro)',
    secondaryNote: 'Calcolata solo da alesaggio e corsa.',
    leftLabel: 'Volume di compressione',
    rightLabel: 'Rapporto di compressione statico',
    metricBore: 'Alesaggio',
    metricStroke: 'Corsa',
    metricSwept: 'Cilindrata unitaria (per cilindro)',
    metricChamber: 'Volume della camera',
    metricOther: 'Volume aggiuntivo (guarnizione + gioco pistone ± scodellino/cupola)',
    metricClearance: 'Volume di compressione totale',
    metricRatio: 'Rapporto di compressione statico',
  },
  'pt-br': {
    boreIssue: 'Digite um diâmetro do cilindro maior que zero.',
    strokeIssue: 'Digite um curso maior que zero.',
    chamberIssue: 'Digite um volume da câmara de combustão maior que zero.',
    otherIssue: 'Digite o volume adicional (0 se não houver).',
    clearanceIssue: 'O volume da câmara mais o volume adicional deve ser maior que zero.',
    pendingSummary: 'Confira os campos destacados para atualizar a taxa de compressão.',
    pendingAnswer: 'Digite os valores para calcular a taxa de compressão.',
    summary: (ratio: string): string => `A taxa de compressão estática é de ${ratio}:1.`,
    secondaryLabel: 'Volume deslocado (por cilindro)',
    secondaryNote: 'Calculado apenas a partir do diâmetro e do curso.',
    leftLabel: 'Volume morto',
    rightLabel: 'Taxa de compressão estática',
    metricBore: 'Diâmetro do cilindro',
    metricStroke: 'Curso',
    metricSwept: 'Volume deslocado (por cilindro)',
    metricChamber: 'Volume da câmara',
    metricOther: 'Volume adicional (junta + folga do pistão ± rebaixo/domo)',
    metricClearance: 'Volume morto total',
    metricRatio: 'Taxa de compressão estática',
  },
  pl: {
    boreIssue: 'Wpisz średnicę cylindra większą od zera.',
    strokeIssue: 'Wpisz skok tłoka większy od zera.',
    chamberIssue: 'Wpisz objętość komory spalania większą od zera.',
    otherIssue: 'Wpisz dodatkową objętość (0, jeśli jej nie ma).',
    clearanceIssue: 'Objętość komory plus dodatkowa objętość musi być większa od zera.',
    pendingSummary: 'Sprawdź zaznaczone pola, aby zaktualizować stopień sprężania.',
    pendingAnswer: 'Wpisz wartości, aby obliczyć stopień sprężania.',
    summary: (ratio: string): string => `Statyczny stopień sprężania wynosi ${ratio}:1.`,
    secondaryLabel: 'Objętość skokowa (na cylinder)',
    secondaryNote: 'Wyłącznie na podstawie średnicy i skoku.',
    leftLabel: 'Objętość komory sprężania',
    rightLabel: 'Statyczny stopień sprężania',
    metricBore: 'Średnica cylindra',
    metricStroke: 'Skok tłoka',
    metricSwept: 'Objętość skokowa (na cylinder)',
    metricChamber: 'Objętość komory',
    metricOther: 'Dodatkowa objętość (uszczelka + luz tłoka ± wgłębienie/kopułka)',
    metricClearance: 'Całkowita objętość komory sprężania',
    metricRatio: 'Statyczny stopień sprężania',
  },
  nl: {
    boreIssue: 'Vul een boring groter dan nul in.',
    strokeIssue: 'Vul een slag groter dan nul in.',
    chamberIssue: 'Vul een verbrandingskamervolume groter dan nul in.',
    otherIssue: 'Vul het extra volume in (0 als er geen is).',
    clearanceIssue: 'Kamervolume plus extra volume moet groter zijn dan nul.',
    pendingSummary: 'Controleer de gemarkeerde velden om de compressieverhouding bij te werken.',
    pendingAnswer: 'Vul de waarden in om de compressieverhouding te berekenen.',
    summary: (ratio: string): string => `De statische compressieverhouding is ${ratio}:1.`,
    secondaryLabel: 'Slagvolume (per cilinder)',
    secondaryNote: 'Alleen op basis van boring en slag.',
    leftLabel: 'Compressievolume',
    rightLabel: 'Statische compressieverhouding',
    metricBore: 'Boring',
    metricStroke: 'Slag',
    metricSwept: 'Slagvolume (per cilinder)',
    metricChamber: 'Kamervolume',
    metricOther: 'Extra volume (pakking + zuigerspeling ± kom/koepel)',
    metricClearance: 'Totaal compressievolume',
    metricRatio: 'Statische compressieverhouding',
  },
  tr: {
    boreIssue: 'Sıfırdan büyük bir silindir çapı girin.',
    strokeIssue: 'Sıfırdan büyük bir strok değeri girin.',
    chamberIssue: 'Sıfırdan büyük bir yanma odası hacmi girin.',
    otherIssue: 'Ek hacmi girin (yoksa 0).',
    clearanceIssue: 'Yanma odası hacmi ile ek hacmin toplamı sıfırdan büyük olmalıdır.',
    pendingSummary: 'Sıkıştırma oranını güncellemek için işaretli alanları kontrol edin.',
    pendingAnswer: 'Sıkıştırma oranını hesaplamak için değerleri girin.',
    summary: (ratio: string): string => `Statik sıkıştırma oranı ${ratio}:1.`,
    secondaryLabel: 'Kurs hacmi (silindir başına)',
    secondaryNote: 'Yalnızca silindir çapı ve stroktan hesaplanır.',
    leftLabel: 'Ölü hacim',
    rightLabel: 'Statik sıkıştırma oranı',
    metricBore: 'Silindir çapı',
    metricStroke: 'Strok',
    metricSwept: 'Kurs hacmi (silindir başına)',
    metricChamber: 'Yanma odası hacmi',
    metricOther: 'Ek hacim (conta + piston boşluğu ± çanak/kubbe)',
    metricClearance: 'Toplam ölü hacim',
    metricRatio: 'Statik sıkıştırma oranı',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }

export function initializeCompressionRatioCalculator(): void {
  const t = COMPRESSION_RATIO_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="compression-ratio"]').forEach((form) => {
    const calculate = (): void => {
      const boreMm = numberValue(form, 'bore');
      const strokeMm = numberValue(form, 'stroke');
      const chamberCc = numberValue(form, 'chamber');
      const otherCc = numberValue(form, 'otherVolume');
      const issues: string[] = [];
      if (!Number.isFinite(boreMm) || boreMm <= 0) issues.push(t.boreIssue);
      if (!Number.isFinite(strokeMm) || strokeMm <= 0) issues.push(t.strokeIssue);
      if (!Number.isFinite(chamberCc) || chamberCc <= 0) issues.push(t.chamberIssue);
      if (!Number.isFinite(otherCc)) issues.push(t.otherIssue);
      const clearanceVolume = chamberCc + otherCc;
      if (!issues.length && clearanceVolume <= 0) issues.push(t.clearanceIssue);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.pendingSummary, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.pendingAnswer);
        return;
      }
      setErrors(form, []);
      const sweptVolumeMm3 = (Math.PI / 4) * boreMm * boreMm * strokeMm;
      const sweptVolumeCc = sweptVolumeMm3 / 1000;
      const totalVolume = sweptVolumeCc + clearanceVolume;
      const ratio = totalVolume / clearanceVolume;
      setSummary(form, t.summary(formatNumber(ratio, 2)), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(ratio, 2)}:1`,
        secondaryLabel: t.secondaryLabel,
        secondary: `${formatNumber(sweptVolumeCc, 1)} cc`,
        secondaryNote: t.secondaryNote,
        leftLabel: t.leftLabel,
        left: `${formatNumber(clearanceVolume, 1)} cc`,
        rightLabel: t.rightLabel,
        right: `${formatNumber(ratio, 2)}:1`,
      });
      renderMetrics(form, [
        [t.metricBore, `${formatNumber(boreMm, 2)} mm`],
        [t.metricStroke, `${formatNumber(strokeMm, 2)} mm`],
        [t.metricSwept, `${formatNumber(sweptVolumeCc, 2)} cc`],
        [t.metricChamber, `${formatNumber(chamberCc, 2)} cc`],
        [t.metricOther, `${formatNumber(otherCc, 2)} cc`],
        [t.metricClearance, `${formatNumber(clearanceVolume, 2)} cc`],
        [t.metricRatio, `${formatNumber(ratio, 2)}:1`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
