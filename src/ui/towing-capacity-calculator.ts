import { formatNumber } from './format-number';
import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const TOWING_CAPACITY_LABELS = {
  en: {
    gcwrRequired: 'Enter a GCWR greater than zero.',
    curbWeightRequired: 'Enter the tow vehicle curb weight.',
    loadWeightRequired: 'Enter passenger and cargo weight (0 if none).',
    overGcwr: 'Curb weight plus passengers and cargo already meets or exceeds the GCWR — no trailer capacity remains.',
    summaryError: 'Check the highlighted inputs to update the towing estimate.',
    reset: 'Check the inputs to estimate available towing capacity.',
    summary: (maxTrailer: string, unit: string) => `Up to ${maxTrailer} ${unit} of trailer weight remains within your GCWR.`,
    tongueWeight: 'Recommended tongue weight',
    secondaryNote: '10–15% of trailer weight for a conventional hitch.',
    leftLabel: 'GCWR minus loaded vehicle',
    rightLabel: 'Available trailer weight',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Tow vehicle curb weight',
    metricLoadWeight: 'Passengers + cargo in vehicle',
    metricMaxTrailer: 'Maximum trailer weight',
    metricTongue: 'Recommended tongue weight',
  },
  de: {
    gcwrRequired: 'Geben Sie ein GCWR größer als null ein.',
    curbWeightRequired: 'Geben Sie das Leergewicht des Zugfahrzeugs ein.',
    loadWeightRequired: 'Geben Sie das Gewicht von Passagieren und Ladung ein (0, falls keine).',
    overGcwr: 'Leergewicht plus Passagiere und Ladung erreichen oder überschreiten bereits das GCWR — es bleibt keine Anhängerlast übrig.',
    summaryError: 'Überprüfen Sie die markierten Eingaben, um die Schätzung zu aktualisieren.',
    reset: 'Überprüfen Sie die Eingaben, um die verfügbare Anhängerlast zu schätzen.',
    summary: (maxTrailer: string, unit: string) => `Bis zu ${maxTrailer} ${unit} Anhängerlast bleiben innerhalb Ihres GCWR verfügbar.`,
    tongueWeight: 'Empfohlene Stützlast',
    secondaryNote: '10–15 % der Anhängerlast bei einer normalen Anhängekupplung.',
    leftLabel: 'GCWR abzüglich beladenem Fahrzeug',
    rightLabel: 'Verfügbare Anhängerlast',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Leergewicht des Zugfahrzeugs',
    metricLoadWeight: 'Passagiere + Ladung im Fahrzeug',
    metricMaxTrailer: 'Maximale Anhängerlast',
    metricTongue: 'Empfohlene Stützlast',
  },
  es: {
    gcwrRequired: 'Introduzca un GCWR mayor que cero.',
    curbWeightRequired: 'Introduzca el peso en vacío del vehículo remolcador.',
    loadWeightRequired: 'Introduzca el peso de pasajeros y carga (0 si no hay).',
    overGcwr: 'El peso en vacío más los pasajeros y la carga ya alcanzan o superan el GCWR — no queda capacidad de remolque disponible.',
    summaryError: 'Revise los campos resaltados para actualizar la estimación de remolque.',
    reset: 'Revise los datos para estimar la capacidad de remolque disponible.',
    summary: (maxTrailer: string, unit: string) => `Dispone de hasta ${maxTrailer} ${unit} de peso de remolque dentro de su GCWR.`,
    tongueWeight: 'Peso de lengüeta recomendado',
    secondaryNote: 'Del 10 al 15 % del peso del remolque en un enganche convencional.',
    leftLabel: 'GCWR menos vehículo cargado',
    rightLabel: 'Peso de remolque disponible',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Peso en vacío del vehículo remolcador',
    metricLoadWeight: 'Pasajeros + carga en el vehículo',
    metricMaxTrailer: 'Peso máximo de remolque',
    metricTongue: 'Peso de lengüeta recomendado',
  },
  fr: {
    gcwrRequired: 'Saisissez un PTRA (GCWR) supérieur à zéro.',
    curbWeightRequired: 'Saisissez le poids à vide du véhicule tracteur.',
    loadWeightRequired: 'Saisissez le poids des passagers et du chargement (0 s’il n’y en a pas).',
    overGcwr: 'Le poids à vide plus les passagers et le chargement atteint ou dépasse déjà le PTRA (GCWR) — il ne reste aucune capacité de remorquage.',
    summaryError: 'Vérifiez les champs signalés pour mettre à jour l’estimation de remorquage.',
    reset: 'Vérifiez les valeurs pour estimer la capacité de remorquage disponible.',
    summary: (maxTrailer: string, unit: string) => `Jusqu’à ${maxTrailer} ${unit} de remorque restent disponibles dans la limite de votre PTRA (GCWR).`,
    tongueWeight: 'Charge sur la flèche recommandée',
    secondaryNote: '10–15 % du poids de la remorque avec un attelage classique.',
    leftLabel: 'PTRA (GCWR) moins véhicule chargé',
    rightLabel: 'Poids de remorque disponible',
    metricGcwr: 'PTRA (GCWR)',
    metricCurbWeight: 'Poids à vide du véhicule tracteur',
    metricLoadWeight: 'Passagers + chargement dans le véhicule',
    metricMaxTrailer: 'Poids de remorque maximal',
    metricTongue: 'Charge sur la flèche recommandée',
  },
  it: {
    gcwrRequired: 'Inserisci un GCWR (massa massima combinata) maggiore di zero.',
    curbWeightRequired: 'Inserisci la massa a vuoto del veicolo trainante.',
    loadWeightRequired: 'Inserisci il peso di passeggeri e carico (0 se assenti).',
    overGcwr: 'Massa a vuoto più passeggeri e carico raggiungono o superano già il GCWR: non resta capacità di traino.',
    summaryError: 'Controlla i campi evidenziati per aggiornare la stima di traino.',
    reset: 'Controlla i dati per stimare la capacità di traino disponibile.',
    summary: (maxTrailer: string, unit: string) => `Restano disponibili fino a ${maxTrailer} ${unit} di rimorchio entro il tuo GCWR.`,
    tongueWeight: 'Carico verticale sul gancio consigliato',
    secondaryNote: '10–15% del peso del rimorchio con un gancio tradizionale.',
    leftLabel: 'GCWR meno veicolo carico',
    rightLabel: 'Peso del rimorchio disponibile',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Massa a vuoto del veicolo trainante',
    metricLoadWeight: 'Passeggeri + carico nel veicolo',
    metricMaxTrailer: 'Peso massimo del rimorchio',
    metricTongue: 'Carico verticale sul gancio consigliato',
  },
  'pt-br': {
    gcwrRequired: 'Digite um PBTC (GCWR) maior que zero.',
    curbWeightRequired: 'Digite o peso em ordem de marcha do veículo rebocador.',
    loadWeightRequired: 'Digite o peso de passageiros e carga (0 se não houver).',
    overGcwr: 'O peso do veículo mais passageiros e carga já atinge ou ultrapassa o PBTC (GCWR) — não sobra capacidade de reboque.',
    summaryError: 'Confira os campos destacados para atualizar a estimativa de reboque.',
    reset: 'Confira os dados para estimar a capacidade de reboque disponível.',
    summary: (maxTrailer: string, unit: string) => `Restam até ${maxTrailer} ${unit} de peso de reboque dentro do seu PBTC (GCWR).`,
    tongueWeight: 'Carga vertical no engate recomendada',
    secondaryNote: '10–15% do peso do reboque em um engate convencional.',
    leftLabel: 'PBTC (GCWR) menos veículo carregado',
    rightLabel: 'Peso de reboque disponível',
    metricGcwr: 'PBTC (GCWR)',
    metricCurbWeight: 'Peso do veículo rebocador em ordem de marcha',
    metricLoadWeight: 'Passageiros + carga no veículo',
    metricMaxTrailer: 'Peso máximo do reboque',
    metricTongue: 'Carga vertical no engate recomendada',
  },
  pl: {
    gcwrRequired: 'Wpisz DMC zestawu (GCWR) większą od zera.',
    curbWeightRequired: 'Wpisz masę własną pojazdu holującego.',
    loadWeightRequired: 'Wpisz masę pasażerów i bagażu (0, jeśli brak).',
    overGcwr: 'Masa własna z pasażerami i bagażem już osiąga lub przekracza DMC zestawu (GCWR) — nie zostaje żadna ładowność na przyczepę.',
    summaryError: 'Sprawdź zaznaczone pola, aby zaktualizować szacunek holowania.',
    reset: 'Sprawdź dane, aby oszacować dostępną masę przyczepy.',
    summary: (maxTrailer: string, unit: string) => `W ramach DMC zestawu (GCWR) zostaje do ${maxTrailer} ${unit} na przyczepę.`,
    tongueWeight: 'Zalecany nacisk na hak',
    secondaryNote: '10–15% masy przyczepy przy standardowym haku.',
    leftLabel: 'DMC zestawu (GCWR) minus obciążony pojazd',
    rightLabel: 'Dostępna masa przyczepy',
    metricGcwr: 'DMC zestawu (GCWR)',
    metricCurbWeight: 'Masa własna pojazdu holującego',
    metricLoadWeight: 'Pasażerowie + bagaż w pojeździe',
    metricMaxTrailer: 'Maksymalna masa przyczepy',
    metricTongue: 'Zalecany nacisk na hak',
  },
  nl: {
    gcwrRequired: 'Vul een GCWR (maximale treingewicht) groter dan nul in.',
    curbWeightRequired: 'Vul het leeggewicht van het trekkende voertuig in.',
    loadWeightRequired: 'Vul het gewicht van passagiers en bagage in (0 als er niets is).',
    overGcwr: 'Leeggewicht plus passagiers en bagage bereikt of overschrijdt het GCWR al — er blijft geen aanhangwagengewicht over.',
    summaryError: 'Controleer de gemarkeerde velden om de trekgewichtschatting bij te werken.',
    reset: 'Controleer de gegevens om het beschikbare trekgewicht te schatten.',
    summary: (maxTrailer: string, unit: string) => `Binnen je GCWR blijft tot ${maxTrailer} ${unit} aanhangwagengewicht over.`,
    tongueWeight: 'Aanbevolen kogeldruk',
    secondaryNote: '10–15% van het aanhangwagengewicht bij een gewone trekhaak.',
    leftLabel: 'GCWR min beladen voertuig',
    rightLabel: 'Beschikbaar aanhangwagengewicht',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Leeggewicht trekkend voertuig',
    metricLoadWeight: 'Passagiers + bagage in het voertuig',
    metricMaxTrailer: 'Maximaal aanhangwagengewicht',
    metricTongue: 'Aanbevolen kogeldruk',
  },
  tr: {
    gcwrRequired: 'Sıfırdan büyük bir azami kombinasyon ağırlığı (GCWR) girin.',
    curbWeightRequired: 'Çeken aracın boş ağırlığını girin.',
    loadWeightRequired: 'Yolcu ve yük ağırlığını girin (yoksa 0).',
    overGcwr: 'Boş ağırlık ile yolcu ve yük toplamı GCWR değerine zaten ulaşıyor veya aşıyor — römork için kapasite kalmıyor.',
    summaryError: 'Çekme tahminini güncellemek için işaretli alanları kontrol edin.',
    reset: 'Kullanılabilir çekme kapasitesini tahmin etmek için değerleri kontrol edin.',
    summary: (maxTrailer: string, unit: string) => `GCWR sınırınız içinde ${maxTrailer} ${unit} römork ağırlığına kadar kapasite kalıyor.`,
    tongueWeight: 'Önerilen çeki demiri yükü',
    secondaryNote: 'Standart bir çeki demirinde römork ağırlığının %10–15’i.',
    leftLabel: 'GCWR eksi yüklü araç',
    rightLabel: 'Kullanılabilir römork ağırlığı',
    metricGcwr: 'GCWR',
    metricCurbWeight: 'Çeken aracın boş ağırlığı',
    metricLoadWeight: 'Araçtaki yolcu + yük',
    metricMaxTrailer: 'Azami römork ağırlığı',
    metricTongue: 'Önerilen çeki demiri yükü',
  },
} as const;

function numberValue(form: HTMLFormElement, name: string): number { return Number(new FormData(form).get(name)); }
function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? ''); }

export function initializeTowingCapacityCalculator(): void {
  const t = TOWING_CAPACITY_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="towing-capacity"]').forEach((form) => {
    const calculate = (): void => {
      const unit = textValue(form, 'unit') === 'kg' ? 'kg' : 'lb';
      const gcwr = numberValue(form, 'gcwr');
      const curbWeight = numberValue(form, 'curbWeight');
      const loadWeight = numberValue(form, 'loadWeight');
      const issues: string[] = [];
      if (!Number.isFinite(gcwr) || gcwr <= 0) issues.push(t.gcwrRequired);
      if (!Number.isFinite(curbWeight) || curbWeight <= 0) issues.push(t.curbWeightRequired);
      if (!Number.isFinite(loadWeight) || loadWeight < 0) issues.push(t.loadWeightRequired);
      if (!issues.length && curbWeight + loadWeight >= gcwr) issues.push(t.overGcwr);
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
        return;
      }
      setErrors(form, []);
      const maxTrailer = gcwr - curbWeight - loadWeight;
      const tongueMin = maxTrailer * 0.10;
      const tongueMax = maxTrailer * 0.15;
      setSummary(form, t.summary(formatNumber(maxTrailer, 0), unit), false);
      syncStandardAnswer(form, {
        primary: `${formatNumber(maxTrailer, 0)} ${unit}`,
        secondaryLabel: t.tongueWeight,
        secondary: `${formatNumber(tongueMin, 0)}–${formatNumber(tongueMax, 0)} ${unit}`,
        secondaryNote: t.secondaryNote,
        leftLabel: t.leftLabel,
        left: `${formatNumber(gcwr, 0)} − ${formatNumber(curbWeight + loadWeight, 0)} ${unit}`,
        rightLabel: t.rightLabel,
        right: `${formatNumber(maxTrailer, 0)} ${unit}`,
      });
      renderMetrics(form, [
        [t.metricGcwr, `${formatNumber(gcwr, 0)} ${unit}`],
        [t.metricCurbWeight, `${formatNumber(curbWeight, 0)} ${unit}`],
        [t.metricLoadWeight, `${formatNumber(loadWeight, 0)} ${unit}`],
        [t.metricMaxTrailer, `${formatNumber(maxTrailer, 0)} ${unit}`],
        [t.metricTongue, `${formatNumber(tongueMin, 0)}–${formatNumber(tongueMax, 0)} ${unit}`],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
