/**
 * Copy for the Vehicle → Tire size → Compare → Calculator flow on vehicle and car-model pages.
 * The flow only links existing pages and pre-fills existing calculators; it never states that a
 * size fits a vehicle beyond what the sourced row records.
 */
import type { EntityLocale } from '../seo/entity-routes';

export interface VehicleFlowText {
  readonly heading: (vehicle: string) => string;
  readonly intro: string;
  readonly cols: { readonly size: string; readonly fitment: string; readonly diameter: string; readonly vsStandard: string; readonly next: string };
  readonly standard: string;
  readonly option: string;
  /** A size listed in open wheel records without a standard/option label. */
  readonly recorded: string;
  readonly baseline: string;
  readonly compare: string;
  readonly speedometer: string;
  readonly calculator: string;
  readonly fitCheck: string;
  readonly note: string;
  /** Car-model pages: tire sizes recorded in the wheel data. */
  readonly modelHeading: (name: string) => string;
  readonly modelIntro: string;
}

export const vehicleFlowText: Readonly<Record<EntityLocale, VehicleFlowText>> = Object.freeze({
  en: {
    heading: (v) => `${v} tire sizes`,
    intro: 'Every size recorded for this vehicle row. Open a size for its dimensions, compare it with the standard size, or take both into a calculator.',
    cols: { size: 'Size', fitment: 'Fitment', diameter: 'Diameter', vsStandard: 'vs standard', next: 'Next' },
    standard: 'Standard', option: 'Factory option', recorded: 'Recorded', baseline: 'baseline',
    compare: 'Compare', speedometer: 'Speedometer', calculator: 'Calculator', fitCheck: 'Fit check',
    note: 'Sizes come from the sources named on this page. A comparison is geometry, not a fitment approval: wheel width, load and speed rating and clearance still apply.',
    modelHeading: (n) => `${n} tire sizes`,
    modelIntro: 'Tire sizes listed in this model’s wheel records and in the Atlas vehicle reference.',
  },
  de: {
    heading: (v) => `${v} Reifengrößen`,
    intro: 'Alle für diesen Fahrzeugeintrag erfassten Größen. Größe öffnen, mit der Standardgröße vergleichen oder beide in einen Rechner übernehmen.',
    cols: { size: 'Größe', fitment: 'Bereifung', diameter: 'Durchmesser', vsStandard: 'zur Standardgröße', next: 'Weiter' },
    standard: 'Standard', option: 'Werksoption', recorded: 'Erfasst', baseline: 'Basis',
    compare: 'Vergleich', speedometer: 'Tacho', calculator: 'Rechner', fitCheck: 'Passt es?',
    note: 'Die Größen stammen aus den auf dieser Seite genannten Quellen. Ein Vergleich ist Geometrie, keine Freigabe: Felgenbreite, Trag- und Geschwindigkeitsindex und Freigang gelten weiterhin.',
    modelHeading: (n) => `${n} Reifengrößen`,
    modelIntro: 'Reifengrößen aus den Felgendaten dieses Modells und aus der Atlas-Fahrzeugreferenz.',
  },
  es: {
    heading: (v) => `Medidas de neumático del ${v}`,
    intro: 'Todas las medidas registradas para este vehículo. Abra una medida, compárela con la de serie o lleve ambas a una calculadora.',
    cols: { size: 'Medida', fitment: 'Montaje', diameter: 'Diámetro', vsStandard: 'frente a la de serie', next: 'Siguiente' },
    standard: 'De serie', option: 'Opción de fábrica', recorded: 'Registrada', baseline: 'base',
    compare: 'Comparar', speedometer: 'Velocímetro', calculator: 'Calculadora', fitCheck: '¿Cabe?',
    note: 'Las medidas proceden de las fuentes citadas en esta página. Una comparación es geometría, no una homologación: el ancho de llanta, los índices de carga y velocidad y la holgura siguen contando.',
    modelHeading: (n) => `Medidas de neumático del ${n}`,
    modelIntro: 'Medidas de neumático de los registros de llanta de este modelo y de la referencia de vehículos Atlas.',
  },
  fr: {
    heading: (v) => `Tailles de pneus ${v}`,
    intro: 'Toutes les tailles relevées pour ce véhicule. Ouvrez une taille, comparez-la à la taille d’origine ou passez les deux dans un calculateur.',
    cols: { size: 'Taille', fitment: 'Monte', diameter: 'Diamètre', vsStandard: 'vs taille d’origine', next: 'Suite' },
    standard: 'D’origine', option: 'Option usine', recorded: 'Relevée', baseline: 'référence',
    compare: 'Comparer', speedometer: 'Compteur', calculator: 'Calculateur', fitCheck: 'Ça passe ?',
    note: 'Les tailles proviennent des sources citées sur cette page. Une comparaison reste géométrique, pas une homologation : largeur de jante, indices de charge et de vitesse et dégagement s’appliquent.',
    modelHeading: (n) => `Tailles de pneus ${n}`,
    modelIntro: 'Tailles de pneus des fiches de jantes de ce modèle et de la référence véhicules Atlas.',
  },
  it: {
    heading: (v) => `Misure pneumatici ${v}`,
    intro: 'Tutte le misure registrate per questo veicolo. Apri una misura, confrontala con quella di serie o porta entrambe in un calcolatore.',
    cols: { size: 'Misura', fitment: 'Montaggio', diameter: 'Diametro', vsStandard: 'rispetto alla serie', next: 'Avanti' },
    standard: 'Di serie', option: 'Opzione di fabbrica', recorded: 'Rilevata', baseline: 'base',
    compare: 'Confronta', speedometer: 'Tachimetro', calculator: 'Calcolatore', fitCheck: 'Ci sta?',
    note: 'Le misure provengono dalle fonti citate in questa pagina. Un confronto è geometria, non un’omologazione: larghezza del cerchio, indici di carico e velocità e spazi liberi restano validi.',
    modelHeading: (n) => `Misure pneumatici ${n}`,
    modelIntro: 'Misure dai dati cerchi di questo modello e dal riferimento veicoli Atlas.',
  },
  'pt-br': {
    heading: (v) => `Medidas de pneu do ${v}`,
    intro: 'Todas as medidas registradas para este veículo. Abra uma medida, compare com a original ou leve as duas para uma calculadora.',
    cols: { size: 'Medida', fitment: 'Montagem', diameter: 'Diâmetro', vsStandard: 'vs original', next: 'Próximo' },
    standard: 'Original', option: 'Opção de fábrica', recorded: 'Registrada', baseline: 'base',
    compare: 'Comparar', speedometer: 'Velocímetro', calculator: 'Calculadora', fitCheck: 'Cabe?',
    note: 'As medidas vêm das fontes citadas nesta página. Uma comparação é geometria, não homologação: largura da roda, índices de carga e velocidade e folga continuam valendo.',
    modelHeading: (n) => `Medidas de pneu do ${n}`,
    modelIntro: 'Medidas de pneu dos registros de roda deste modelo e da referência de veículos Atlas.',
  },
  pl: {
    heading: (v) => `Rozmiary opon ${v}`,
    intro: 'Wszystkie rozmiary zapisane dla tego pojazdu. Otwórz rozmiar, porównaj go z fabrycznym standardem lub przenieś oba do kalkulatora.',
    cols: { size: 'Rozmiar', fitment: 'Montaż', diameter: 'Średnica', vsStandard: 'względem standardu', next: 'Dalej' },
    standard: 'Standard', option: 'Opcja fabryczna', recorded: 'Zanotowany', baseline: 'baza',
    compare: 'Porównaj', speedometer: 'Prędkościomierz', calculator: 'Kalkulator', fitCheck: 'Czy pasuje?',
    note: 'Rozmiary pochodzą ze źródeł podanych na tej stronie. Porównanie to geometria, nie homologacja: szerokość felgi, indeksy nośności i prędkości oraz prześwity nadal obowiązują.',
    modelHeading: (n) => `Rozmiary opon ${n}`,
    modelIntro: 'Rozmiary opon z danych felg tego modelu i z bazy pojazdów Atlas.',
  },
  nl: {
    heading: (v) => `Bandenmaten ${v}`,
    intro: 'Alle maten die voor dit voertuig zijn vastgelegd. Open een maat, vergelijk met de standaardmaat of neem beide mee naar een calculator.',
    cols: { size: 'Maat', fitment: 'Montage', diameter: 'Diameter', vsStandard: 't.o.v. standaard', next: 'Verder' },
    standard: 'Standaard', option: 'Fabrieksoptie', recorded: 'Vastgelegd', baseline: 'basis',
    compare: 'Vergelijk', speedometer: 'Snelheidsmeter', calculator: 'Calculator', fitCheck: 'Past het?',
    note: 'De maten komen uit de bronnen die op deze pagina staan. Een vergelijking is geometrie, geen goedkeuring: velgbreedte, belastings- en snelheidsindex en vrije ruimte blijven gelden.',
    modelHeading: (n) => `Bandenmaten ${n}`,
    modelIntro: 'Bandenmaten uit de velggegevens van dit model en uit de Atlas-voertuigreferentie.',
  },
  tr: {
    heading: (v) => `${v} lastik ebatları`,
    intro: 'Bu araç kaydında geçen tüm ebatlar. Bir ebadı açın, standart ebatla karşılaştırın ya da ikisini birden bir hesaplayıcıya taşıyın.',
    cols: { size: 'Ebat', fitment: 'Durum', diameter: 'Çap', vsStandard: 'standarda göre', next: 'Sonraki adım' },
    standard: 'Standart', option: 'Fabrika opsiyonu', recorded: 'Kayıtlı', baseline: 'referans',
    compare: 'Karşılaştır', speedometer: 'Hız sapması', calculator: 'Hesaplayıcı', fitCheck: 'Uyar mı?',
    note: 'Ebatlar bu sayfada belirtilen kaynaklardan gelir. Karşılaştırma geometridir, montaj onayı değildir: jant genişliği, yük ve hız endeksi ve boşluk yine geçerlidir.',
    modelHeading: (n) => `${n} lastik ebatları`,
    modelIntro: 'Bu modelin jant kayıtlarında ve Atlas araç referansında geçen lastik ebatları.',
  },
});
