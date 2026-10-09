import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const LB_PER_KG = 2.2046226218;
const KW_PER_HP = 0.7456998716;

const QUARTER_MILE_LABELS = {
  en: {
    weightRequired: 'Enter a vehicle weight greater than zero.',
    powerRequired: 'Enter a power figure greater than zero.',
    summaryError: 'Check the highlighted inputs to update the estimate.',
    reset: 'Check the inputs to estimate elapsed time and trap speed.',
    summary: (et: string, trapMph: string) => `Estimated quarter mile: ${et} s at ${trapMph} mph.`,
    trapSpeed: 'Trap speed',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · power-to-weight based estimate.`,
    powerToWeight: 'Power-to-weight',
    quarterMileEt: 'Quarter mile ET',
    metricWeight: 'Vehicle weight',
    metricPower: 'Power',
    metricEt: 'Estimated quarter mile ET',
    metricTrap: 'Estimated trap speed',
    metricZeroToSixty: 'Very rough 0-60 mph estimate',
  },
  de: {
    weightRequired: 'Geben Sie ein Fahrzeuggewicht größer als null ein.',
    powerRequired: 'Geben Sie einen Leistungswert größer als null ein.',
    summaryError: 'Überprüfen Sie die markierten Eingaben, um die Schätzung zu aktualisieren.',
    reset: 'Geben Sie die Werte ein, um Endzeit und Endgeschwindigkeit zu schätzen.',
    summary: (et: string, trapMph: string) => `Geschätzte Viertelmeile: ${et} s bei ${trapMph} mph.`,
    trapSpeed: 'Endgeschwindigkeit',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · Schätzung auf Basis des Leistungsgewichts.`,
    powerToWeight: 'Leistungsgewicht',
    quarterMileEt: 'Viertelmeilen-Endzeit',
    metricWeight: 'Fahrzeuggewicht',
    metricPower: 'Leistung',
    metricEt: 'Geschätzte Viertelmeilen-Endzeit',
    metricTrap: 'Geschätzte Endgeschwindigkeit',
    metricZeroToSixty: 'Sehr grobe 0–60-mph-Schätzung',
  },
  es: {
    weightRequired: 'Introduzca un peso del vehículo mayor que cero.',
    powerRequired: 'Introduzca una cifra de potencia mayor que cero.',
    summaryError: 'Revise los campos resaltados para actualizar la estimación.',
    reset: 'Introduzca los datos para estimar el tiempo transcurrido y la velocidad de paso.',
    summary: (et: string, trapMph: string) => `Cuarto de milla estimado: ${et} s a ${trapMph} mph.`,
    trapSpeed: 'Velocidad de paso',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · estimación basada en la relación peso-potencia.`,
    powerToWeight: 'Relación peso-potencia',
    quarterMileEt: 'Tiempo del cuarto de milla',
    metricWeight: 'Peso del vehículo',
    metricPower: 'Potencia',
    metricEt: 'Tiempo estimado del cuarto de milla',
    metricTrap: 'Velocidad de paso estimada',
    metricZeroToSixty: 'Estimación muy aproximada de 0–60 mph',
  },
  fr: {
    weightRequired: 'Saisissez un poids du véhicule supérieur à zéro.',
    powerRequired: 'Saisissez une puissance supérieure à zéro.',
    summaryError: 'Vérifiez les champs signalés pour mettre à jour l’estimation.',
    reset: 'Saisissez les valeurs pour estimer le temps et la vitesse de sortie.',
    summary: (et: string, trapMph: string) => `Quart de mile estimé : ${et} s à ${trapMph} mph.`,
    trapSpeed: 'Vitesse de sortie',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · estimation basée sur le rapport poids/puissance.`,
    powerToWeight: 'Rapport poids/puissance',
    quarterMileEt: 'Temps au quart de mile',
    metricWeight: 'Poids du véhicule',
    metricPower: 'Puissance',
    metricEt: 'Temps estimé au quart de mile',
    metricTrap: 'Vitesse de sortie estimée',
    metricZeroToSixty: 'Estimation très approximative du 0–60 mph',
  },
  it: {
    weightRequired: 'Inserisci un peso del veicolo maggiore di zero.',
    powerRequired: 'Inserisci un valore di potenza maggiore di zero.',
    summaryError: 'Controlla i campi evidenziati per aggiornare la stima.',
    reset: 'Inserisci i dati per stimare il tempo e la velocità d’uscita.',
    summary: (et: string, trapMph: string) => `Quarto di miglio stimato: ${et} s a ${trapMph} mph.`,
    trapSpeed: 'Velocità d’uscita',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · stima basata sul rapporto peso/potenza.`,
    powerToWeight: 'Rapporto peso/potenza',
    quarterMileEt: 'Tempo sul quarto di miglio',
    metricWeight: 'Peso del veicolo',
    metricPower: 'Potenza',
    metricEt: 'Tempo stimato sul quarto di miglio',
    metricTrap: 'Velocità d’uscita stimata',
    metricZeroToSixty: 'Stima molto approssimativa dello 0–60 mph',
  },
  'pt-br': {
    weightRequired: 'Digite um peso do veículo maior que zero.',
    powerRequired: 'Digite um valor de potência maior que zero.',
    summaryError: 'Confira os campos destacados para atualizar a estimativa.',
    reset: 'Digite os dados para estimar o tempo e a velocidade final.',
    summary: (et: string, trapMph: string) => `Quarto de milha estimado: ${et} s a ${trapMph} mph.`,
    trapSpeed: 'Velocidade final',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · estimativa baseada na relação peso/potência.`,
    powerToWeight: 'Relação peso/potência',
    quarterMileEt: 'Tempo no quarto de milha',
    metricWeight: 'Peso do veículo',
    metricPower: 'Potência',
    metricEt: 'Tempo estimado no quarto de milha',
    metricTrap: 'Velocidade final estimada',
    metricZeroToSixty: 'Estimativa bem aproximada de 0–60 mph',
  },
  pl: {
    weightRequired: 'Wpisz masę pojazdu większą od zera.',
    powerRequired: 'Wpisz moc większą od zera.',
    summaryError: 'Sprawdź zaznaczone pola, aby zaktualizować szacunek.',
    reset: 'Wpisz dane, aby oszacować czas przejazdu i prędkość na mecie.',
    summary: (et: string, trapMph: string) => `Szacowana ćwierć mili: ${et} s przy ${trapMph} mph.`,
    trapSpeed: 'Prędkość na mecie',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · szacunek na podstawie stosunku mocy do masy.`,
    powerToWeight: 'Stosunek mocy do masy',
    quarterMileEt: 'Czas na ćwierć mili',
    metricWeight: 'Masa pojazdu',
    metricPower: 'Moc',
    metricEt: 'Szacowany czas na ćwierć mili',
    metricTrap: 'Szacowana prędkość na mecie',
    metricZeroToSixty: 'Bardzo przybliżony szacunek 0–60 mph',
  },
  nl: {
    weightRequired: 'Vul een voertuiggewicht groter dan nul in.',
    powerRequired: 'Vul een vermogen groter dan nul in.',
    summaryError: 'Controleer de gemarkeerde velden om de schatting bij te werken.',
    reset: 'Vul de gegevens in om de tijd en eindsnelheid te schatten.',
    summary: (et: string, trapMph: string) => `Geschatte quarter mile: ${et} s bij ${trapMph} mph.`,
    trapSpeed: 'Eindsnelheid',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · schatting op basis van de vermogen-gewichtsverhouding.`,
    powerToWeight: 'Vermogen-gewichtsverhouding',
    quarterMileEt: 'Quarter-mile-tijd',
    metricWeight: 'Voertuiggewicht',
    metricPower: 'Vermogen',
    metricEt: 'Geschatte quarter-mile-tijd',
    metricTrap: 'Geschatte eindsnelheid',
    metricZeroToSixty: 'Zeer ruwe schatting 0–60 mph',
  },
  tr: {
    weightRequired: 'Sıfırdan büyük bir araç ağırlığı girin.',
    powerRequired: 'Sıfırdan büyük bir güç değeri girin.',
    summaryError: 'Tahmini güncellemek için işaretli alanları kontrol edin.',
    reset: 'Süreyi ve çıkış hızını tahmin etmek için değerleri girin.',
    summary: (et: string, trapMph: string) => `Tahmini çeyrek mil: ${trapMph} mph çıkış hızıyla ${et} s.`,
    trapSpeed: 'Çıkış hızı',
    secondaryNote: (trapKmh: string) => `${trapKmh} km/h · güç/ağırlık oranına dayalı tahmin.`,
    powerToWeight: 'Güç/ağırlık oranı',
    quarterMileEt: 'Çeyrek mil süresi',
    metricWeight: 'Araç ağırlığı',
    metricPower: 'Güç',
    metricEt: 'Tahmini çeyrek mil süresi',
    metricTrap: 'Tahmini çıkış hızı',
    metricZeroToSixty: 'Çok kaba 0–60 mph tahmini',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeQuarterMileCalculator(): void {
  const t = QUARTER_MILE_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="quarter-mile"]').forEach((form) => {
    const calculate = (): void => {
      const weightEntered = numberValue(form, 'weight');
      const weightUnit = textValue(form, 'weightUnit') === 'kg' ? 'kg' : 'lb';
      const powerEntered = numberValue(form, 'power');
      const powerUnit = textValue(form, 'powerUnit') === 'kw' ? 'kw' : 'hp';
      const issues: string[] = [];
      if (!Number.isFinite(weightEntered) || weightEntered <= 0) issues.push(t.weightRequired);
      if (!Number.isFinite(powerEntered) || powerEntered <= 0) issues.push(t.powerRequired);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
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
      setSummary(form, t.summary(formatNumber(et, 2), formatNumber(trapMph, 1)), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(et, 2)} s`,
        secondaryLabel: t.trapSpeed,
        secondary: `${formatNumber(trapMph, 1)} mph`,
        secondaryNote: t.secondaryNote(formatNumber(trapKmh, 1)),
        leftLabel: t.powerToWeight,
        left: `${formatNumber(hp, 0)} hp · ${formatNumber(weightLb, 0)} lb`,
        rightLabel: t.quarterMileEt,
        right: `${formatNumber(et, 2)} s`,
      });
      renderMetrics(form, [
        [t.metricWeight, `${formatNumber(weightLb, 0)} lb (${formatNumber(weightLb / LB_PER_KG, 0)} kg)`],
        [t.metricPower, `${formatNumber(hp, 0)} hp (${formatNumber(hp * KW_PER_HP, 0)} kW)`],
        [t.metricEt, `${formatNumber(et, 2)} s`],
        [t.metricTrap, `${formatNumber(trapMph, 1)} mph (${formatNumber(trapKmh, 1)} km/h)`],
        [t.metricZeroToSixty, `${formatNumber(roughZeroToSixty, 2)} s`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
