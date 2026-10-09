import type { FuelEconomyUnit, PowerUnit, PressureUnit, TorqueUnit, UnitSystem, WeightUnit } from '../domain/utility-calculators';
import { calculateFuelCostTool, calculatePowerToWeightTool, calculateRoadTripCostTool, convertFuelEconomyTool, convertFuelInputSystemTool, convertPowerTool, convertPressureTool, convertTorqueTool } from '../features/tools/utility-tools';
import { toolIssueText, type PresentedMetric } from './tool-presentation';
import { fuelCostPresentation, fuelEconomyPresentation, powerPresentation, powerToWeightPresentation, pressurePresentation, roadTripPresentation, torquePresentation } from './utility-presentation';
import { formatNumber } from './format-number';
import { CURRENCY_STORAGE_KEY, parseCurrencyLabel, parseUnitSystem, UNIT_SYSTEM_STORAGE_KEY } from './utility-preference';
import { getPageLocale, type UiLocale } from './page-locale';

const value = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));
const textValue = (form: HTMLFormElement, name: string): string => String(new FormData(form).get(name) ?? '');

const UTILITY_TEXT = {
  en: {
    checkHighlighted: 'Check the highlighted inputs to update the estimate.',
    checkInputsTrip: 'Check the highlighted inputs to calculate this trip.',
    costPerDistanceAppears: 'Cost per distance appears here.',
    checkInputsTripReset: 'Check the inputs to calculate this trip.',
    fuelCostAppears: 'Fuel cost appears here.',
    distanceAppears: 'Distance appears here.',
    destination: 'DESTINATION',
    returnToStart: 'RETURN TO START',
    roundTrip: 'Round trip',
    oneWay: 'One way',
    sharedByPeople: (people: number) => `Shared by ${people} people`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Fuel ${fuel} and extras ${extras} of ${total}`,
    checkInputConversion: 'Check the input to update the conversion.',
    drivingCopy: (distance: string) => `${distance} of driving at the entered fuel economy and price.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} required`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} fuel + ${extras} extras across ${distance}.`,
    forFuel: (fuel: string) => `${fuel} for fuel`,
    otherGallonStandard: 'Other gallon standard',
    gallonsNotInterchangeable: 'US and Imperial gallons are not interchangeable.',
    enteredEconomy: 'Entered economy',
    convertedEconomy: 'Converted economy',
    kilopascals: 'Kilopascals',
    conversionOnlyPressure: 'Conversion only—use the vehicle specification.',
    enteredPressure: 'Entered pressure',
    convertedPressure: 'Converted pressure',
    underlyingPower: 'Underlying power',
    mechanicalNotMetric: 'Uses mechanical horsepower, not metric PS.',
    enteredPower: 'Entered power',
    convertedPower: 'Converted power',
    relationship: 'Relationship',
    sameTorque: 'Same torque',
    unitExpressionOnly: 'Only the unit expression changes.',
    enteredTorque: 'Entered torque',
    convertedTorque: 'Converted torque',
    metricEquivalent: 'Metric equivalent',
    ratioOnlyNote: 'Ratio only; traction, gearing, and drag are separate.',
    enteredVehicle: 'Entered vehicle',
    normalizedRatio: 'Normalized ratio',
  },
  de: {
    checkHighlighted: 'Überprüfen Sie die markierten Eingaben, um die Schätzung zu aktualisieren.',
    checkInputsTrip: 'Überprüfen Sie die markierten Eingaben, um diese Fahrt zu berechnen.',
    costPerDistanceAppears: 'Die Kosten pro Strecke erscheinen hier.',
    checkInputsTripReset: 'Überprüfen Sie die Eingaben, um diese Fahrt zu berechnen.',
    fuelCostAppears: 'Die Kraftstoffkosten erscheinen hier.',
    distanceAppears: 'Die Distanz erscheint hier.',
    destination: 'ZIEL',
    returnToStart: 'RÜCKKEHR ZUM START',
    roundTrip: 'Hin- und Rückfahrt',
    oneWay: 'Einfache Fahrt',
    sharedByPeople: (people: number) => `Geteilt durch ${people} Personen`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Kraftstoff ${fuel} und Extras ${extras} von ${total}`,
    checkInputConversion: 'Überprüfen Sie die Eingabe, um die Umrechnung zu aktualisieren.',
    drivingCopy: (distance: string) => `${distance} Fahrt beim eingegebenen Kraftstoffverbrauch und Preis.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} benötigt`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} Kraftstoff + ${extras} Extras über ${distance}.`,
    forFuel: (fuel: string) => `${fuel} für Kraftstoff`,
    otherGallonStandard: 'Anderer Gallonenstandard',
    gallonsNotInterchangeable: 'US- und Imperial-Gallonen sind nicht austauschbar.',
    enteredEconomy: 'Eingegebener Verbrauch',
    convertedEconomy: 'Umgerechneter Verbrauch',
    kilopascals: 'Kilopascal',
    conversionOnlyPressure: 'Nur Umrechnung—verwenden Sie die Fahrzeugangabe.',
    enteredPressure: 'Eingegebener Druck',
    convertedPressure: 'Umgerechneter Druck',
    underlyingPower: 'Zugrunde liegende Leistung',
    mechanicalNotMetric: 'Verwendet mechanische Pferdestärke, nicht metrische PS.',
    enteredPower: 'Eingegebene Leistung',
    convertedPower: 'Umgerechnete Leistung',
    relationship: 'Verhältnis',
    sameTorque: 'Gleiches Drehmoment',
    unitExpressionOnly: 'Nur die Einheit ändert sich.',
    enteredTorque: 'Eingegebenes Drehmoment',
    convertedTorque: 'Umgerechnetes Drehmoment',
    metricEquivalent: 'Metrische Entsprechung',
    ratioOnlyNote: 'Nur ein Verhältnis; Traktion, Übersetzung und Luftwiderstand sind separat zu betrachten.',
    enteredVehicle: 'Eingegebenes Fahrzeug',
    normalizedRatio: 'Normiertes Verhältnis',
  },
  es: {
    checkHighlighted: 'Revise los campos resaltados para actualizar la estimación.',
    checkInputsTrip: 'Revise los campos resaltados para calcular este viaje.',
    costPerDistanceAppears: 'El coste por distancia aparecerá aquí.',
    checkInputsTripReset: 'Revise los datos para calcular este viaje.',
    fuelCostAppears: 'El coste de combustible aparecerá aquí.',
    distanceAppears: 'La distancia aparecerá aquí.',
    destination: 'DESTINO',
    returnToStart: 'REGRESO AL INICIO',
    roundTrip: 'Ida y vuelta',
    oneWay: 'Solo ida',
    sharedByPeople: (people: number) => `Repartido entre ${people} personas`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Combustible ${fuel} y extras ${extras} de ${total}`,
    checkInputConversion: 'Revise el dato para actualizar la conversión.',
    drivingCopy: (distance: string) => `${distance} de conducción con el consumo y precio introducidos.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} necesarios`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} de combustible + ${extras} de extras en ${distance}.`,
    forFuel: (fuel: string) => `${fuel} en combustible`,
    otherGallonStandard: 'Otro estándar de galón',
    gallonsNotInterchangeable: 'Los galones estadounidense e imperial no son intercambiables.',
    enteredEconomy: 'Consumo introducido',
    convertedEconomy: 'Consumo convertido',
    kilopascals: 'Kilopascales',
    conversionOnlyPressure: 'Solo conversión: use la especificación del vehículo.',
    enteredPressure: 'Presión introducida',
    convertedPressure: 'Presión convertida',
    underlyingPower: 'Potencia subyacente',
    mechanicalNotMetric: 'Usa caballos de fuerza mecánicos, no CV métricos.',
    enteredPower: 'Potencia introducida',
    convertedPower: 'Potencia convertida',
    relationship: 'Relación',
    sameTorque: 'Mismo par motor',
    unitExpressionOnly: 'Solo cambia la expresión de la unidad.',
    enteredTorque: 'Par introducido',
    convertedTorque: 'Par convertido',
    metricEquivalent: 'Equivalente métrico',
    ratioOnlyNote: 'Solo es un ratio; la tracción, la relación de transmisión y la resistencia aerodinámica son aparte.',
    enteredVehicle: 'Vehículo introducido',
    normalizedRatio: 'Ratio normalizado',
  },
  fr: {
    checkHighlighted: 'Vérifiez les champs signalés pour mettre à jour l’estimation.',
    checkInputsTrip: 'Vérifiez les champs signalés pour calculer ce trajet.',
    costPerDistanceAppears: 'Le coût par distance s’affiche ici.',
    checkInputsTripReset: 'Vérifiez les valeurs pour calculer ce trajet.',
    fuelCostAppears: 'Le coût du carburant s’affiche ici.',
    distanceAppears: 'La distance s’affiche ici.',
    destination: 'DESTINATION',
    returnToStart: 'RETOUR AU DÉPART',
    roundTrip: 'Aller-retour',
    oneWay: 'Aller simple',
    sharedByPeople: (people: number) => `Partagé entre ${people} personnes`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Carburant ${fuel} et frais annexes ${extras} sur ${total}`,
    checkInputConversion: 'Vérifiez la valeur pour mettre à jour la conversion.',
    drivingCopy: (distance: string) => `${distance} de conduite avec la consommation et le prix saisis.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} nécessaires`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} de carburant + ${extras} de frais annexes sur ${distance}.`,
    forFuel: (fuel: string) => `${fuel} de carburant`,
    otherGallonStandard: 'Autre norme de gallon',
    gallonsNotInterchangeable: 'Les gallons américain et impérial ne sont pas interchangeables.',
    enteredEconomy: 'Consommation saisie',
    convertedEconomy: 'Consommation convertie',
    kilopascals: 'Kilopascals',
    conversionOnlyPressure: 'Simple conversion — suivez la préconisation du constructeur.',
    enteredPressure: 'Pression saisie',
    convertedPressure: 'Pression convertie',
    underlyingPower: 'Puissance de base',
    mechanicalNotMetric: 'Utilise le cheval-vapeur mécanique (hp), pas le cheval métrique (ch).',
    enteredPower: 'Puissance saisie',
    convertedPower: 'Puissance convertie',
    relationship: 'Rapport',
    sameTorque: 'Même couple',
    unitExpressionOnly: 'Seule l’unité d’expression change.',
    enteredTorque: 'Couple saisi',
    convertedTorque: 'Couple converti',
    metricEquivalent: 'Équivalent métrique',
    ratioOnlyNote: 'Simple rapport ; motricité, démultiplication et traînée aérodynamique sont à part.',
    enteredVehicle: 'Véhicule saisi',
    normalizedRatio: 'Rapport normalisé',
  },
  it: {
    checkHighlighted: 'Controlla i campi evidenziati per aggiornare la stima.',
    checkInputsTrip: 'Controlla i campi evidenziati per calcolare questo viaggio.',
    costPerDistanceAppears: 'Qui compare il costo per distanza.',
    checkInputsTripReset: 'Controlla i dati per calcolare questo viaggio.',
    fuelCostAppears: 'Qui compare il costo del carburante.',
    distanceAppears: 'Qui compare la distanza.',
    destination: 'DESTINAZIONE',
    returnToStart: 'RITORNO ALLA PARTENZA',
    roundTrip: 'Andata e ritorno',
    oneWay: 'Solo andata',
    sharedByPeople: (people: number) => `Diviso tra ${people} persone`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Carburante ${fuel} ed extra ${extras} su ${total}`,
    checkInputConversion: 'Controlla il valore per aggiornare la conversione.',
    drivingCopy: (distance: string) => `${distance} di guida con i consumi e il prezzo inseriti.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} necessari`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} di carburante + ${extras} di extra su ${distance}.`,
    forFuel: (fuel: string) => `${fuel} di carburante`,
    otherGallonStandard: 'Altro standard di gallone',
    gallonsNotInterchangeable: 'I galloni USA e imperiali non sono intercambiabili.',
    enteredEconomy: 'Consumo inserito',
    convertedEconomy: 'Consumo convertito',
    kilopascals: 'Kilopascal',
    conversionOnlyPressure: 'Solo conversione: usa il valore indicato dal costruttore.',
    enteredPressure: 'Pressione inserita',
    convertedPressure: 'Pressione convertita',
    underlyingPower: 'Potenza di base',
    mechanicalNotMetric: 'Usa il cavallo meccanico (hp), non il cavallo metrico (CV).',
    enteredPower: 'Potenza inserita',
    convertedPower: 'Potenza convertita',
    relationship: 'Rapporto',
    sameTorque: 'Stessa coppia',
    unitExpressionOnly: 'Cambia solo l’unità di misura.',
    enteredTorque: 'Coppia inserita',
    convertedTorque: 'Coppia convertita',
    metricEquivalent: 'Equivalente metrico',
    ratioOnlyNote: 'Solo un rapporto; trazione, rapporti del cambio e resistenza aerodinamica vanno considerati a parte.',
    enteredVehicle: 'Veicolo inserito',
    normalizedRatio: 'Rapporto normalizzato',
  },
  'pt-br': {
    checkHighlighted: 'Confira os campos destacados para atualizar a estimativa.',
    checkInputsTrip: 'Confira os campos destacados para calcular esta viagem.',
    costPerDistanceAppears: 'O custo por distância aparece aqui.',
    checkInputsTripReset: 'Confira os dados para calcular esta viagem.',
    fuelCostAppears: 'O custo de combustível aparece aqui.',
    distanceAppears: 'A distância aparece aqui.',
    destination: 'DESTINO',
    returnToStart: 'VOLTA AO INÍCIO',
    roundTrip: 'Ida e volta',
    oneWay: 'Só ida',
    sharedByPeople: (people: number) => `Dividido entre ${people} pessoas`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Combustível ${fuel} e extras ${extras} de ${total}`,
    checkInputConversion: 'Confira o valor para atualizar a conversão.',
    drivingCopy: (distance: string) => `${distance} de direção com o consumo e o preço informados.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} necessários`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} de combustível + ${extras} de extras em ${distance}.`,
    forFuel: (fuel: string) => `${fuel} de combustível`,
    otherGallonStandard: 'Outro padrão de galão',
    gallonsNotInterchangeable: 'Os galões americano e imperial não são intercambiáveis.',
    enteredEconomy: 'Consumo informado',
    convertedEconomy: 'Consumo convertido',
    kilopascals: 'Quilopascals',
    conversionOnlyPressure: 'Apenas conversão — use a especificação do veículo.',
    enteredPressure: 'Pressão informada',
    convertedPressure: 'Pressão convertida',
    underlyingPower: 'Potência de base',
    mechanicalNotMetric: 'Usa o cavalo-vapor mecânico (hp), não o cavalo métrico (cv).',
    enteredPower: 'Potência informada',
    convertedPower: 'Potência convertida',
    relationship: 'Relação',
    sameTorque: 'Mesmo torque',
    unitExpressionOnly: 'Só muda a unidade de medida.',
    enteredTorque: 'Torque informado',
    convertedTorque: 'Torque convertido',
    metricEquivalent: 'Equivalente métrico',
    ratioOnlyNote: 'É só uma relação; tração, relação de marchas e arrasto aerodinâmico ficam à parte.',
    enteredVehicle: 'Veículo informado',
    normalizedRatio: 'Relação normalizada',
  },
  pl: {
    checkHighlighted: 'Sprawdź zaznaczone pola, aby zaktualizować szacunek.',
    checkInputsTrip: 'Sprawdź zaznaczone pola, aby obliczyć tę podróż.',
    costPerDistanceAppears: 'Tutaj pojawi się koszt na dystans.',
    checkInputsTripReset: 'Sprawdź dane, aby obliczyć tę podróż.',
    fuelCostAppears: 'Tutaj pojawi się koszt paliwa.',
    distanceAppears: 'Tutaj pojawi się dystans.',
    destination: 'CEL',
    returnToStart: 'POWRÓT DO STARTU',
    roundTrip: 'W obie strony',
    oneWay: 'W jedną stronę',
    sharedByPeople: (people: number) => `Podzielone na ${people} os.`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Paliwo ${fuel} i dodatki ${extras} z ${total}`,
    checkInputConversion: 'Sprawdź wartość, aby zaktualizować przeliczenie.',
    drivingCopy: (distance: string) => `${distance} jazdy przy wpisanym spalaniu i cenie.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · potrzeba ${fuel}`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} za paliwo + ${extras} dodatków na ${distance}.`,
    forFuel: (fuel: string) => `${fuel} za paliwo`,
    otherGallonStandard: 'Inny standard galonu',
    gallonsNotInterchangeable: 'Galon amerykański i imperialny nie są zamienne.',
    enteredEconomy: 'Wpisane spalanie',
    convertedEconomy: 'Przeliczone spalanie',
    kilopascals: 'Kilopaskale',
    conversionOnlyPressure: 'Tylko przeliczenie — stosuj wartość podaną przez producenta pojazdu.',
    enteredPressure: 'Wpisane ciśnienie',
    convertedPressure: 'Przeliczone ciśnienie',
    underlyingPower: 'Moc bazowa',
    mechanicalNotMetric: 'Używa mechanicznego konia mechanicznego (hp), a nie metrycznego KM.',
    enteredPower: 'Wpisana moc',
    convertedPower: 'Przeliczona moc',
    relationship: 'Zależność',
    sameTorque: 'Ten sam moment obrotowy',
    unitExpressionOnly: 'Zmienia się tylko jednostka.',
    enteredTorque: 'Wpisany moment obrotowy',
    convertedTorque: 'Przeliczony moment obrotowy',
    metricEquivalent: 'Odpowiednik metryczny',
    ratioOnlyNote: 'To tylko stosunek; trakcja, przełożenia i opór powietrza to osobne kwestie.',
    enteredVehicle: 'Wpisany pojazd',
    normalizedRatio: 'Znormalizowany stosunek',
  },
  nl: {
    checkHighlighted: 'Controleer de gemarkeerde velden om de schatting bij te werken.',
    checkInputsTrip: 'Controleer de gemarkeerde velden om deze rit te berekenen.',
    costPerDistanceAppears: 'De kosten per afstand verschijnen hier.',
    checkInputsTripReset: 'Controleer de gegevens om deze rit te berekenen.',
    fuelCostAppears: 'De brandstofkosten verschijnen hier.',
    distanceAppears: 'De afstand verschijnt hier.',
    destination: 'BESTEMMING',
    returnToStart: 'TERUG NAAR START',
    roundTrip: 'Heen en terug',
    oneWay: 'Enkele reis',
    sharedByPeople: (people: number) => `Gedeeld door ${people} personen`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `Brandstof ${fuel} en extra’s ${extras} van ${total}`,
    checkInputConversion: 'Controleer de waarde om de omrekening bij te werken.',
    drivingCopy: (distance: string) => `${distance} rijden met het ingevulde verbruik en de ingevulde prijs.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} nodig`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${fuel} brandstof + ${extras} extra’s over ${distance}.`,
    forFuel: (fuel: string) => `${fuel} aan brandstof`,
    otherGallonStandard: 'Andere gallonstandaard',
    gallonsNotInterchangeable: 'Amerikaanse en imperiale gallons zijn niet uitwisselbaar.',
    enteredEconomy: 'Ingevuld verbruik',
    convertedEconomy: 'Omgerekend verbruik',
    kilopascals: 'Kilopascal',
    conversionOnlyPressure: 'Alleen omrekening — gebruik de voorgeschreven waarde van de fabrikant.',
    enteredPressure: 'Ingevulde druk',
    convertedPressure: 'Omgerekende druk',
    underlyingPower: 'Onderliggend vermogen',
    mechanicalNotMetric: 'Gebruikt mechanische pk (hp), geen metrische pk.',
    enteredPower: 'Ingevuld vermogen',
    convertedPower: 'Omgerekend vermogen',
    relationship: 'Verhouding',
    sameTorque: 'Zelfde koppel',
    unitExpressionOnly: 'Alleen de eenheid verandert.',
    enteredTorque: 'Ingevuld koppel',
    convertedTorque: 'Omgerekend koppel',
    metricEquivalent: 'Metrisch equivalent',
    ratioOnlyNote: 'Alleen een verhouding; tractie, overbrenging en luchtweerstand staan hier los van.',
    enteredVehicle: 'Ingevuld voertuig',
    normalizedRatio: 'Genormaliseerde verhouding',
  },
  tr: {
    checkHighlighted: 'Tahmini güncellemek için işaretli alanları kontrol edin.',
    checkInputsTrip: 'Bu yolculuğu hesaplamak için işaretli alanları kontrol edin.',
    costPerDistanceAppears: 'Mesafe başına maliyet burada görünür.',
    checkInputsTripReset: 'Bu yolculuğu hesaplamak için değerleri kontrol edin.',
    fuelCostAppears: 'Yakıt maliyeti burada görünür.',
    distanceAppears: 'Mesafe burada görünür.',
    destination: 'VARIŞ NOKTASI',
    returnToStart: 'BAŞLANGICA DÖNÜŞ',
    roundTrip: 'Gidiş-dönüş',
    oneWay: 'Tek yön',
    sharedByPeople: (people: number) => `${people} kişi arasında paylaşıldı`,
    fuelAndExtrasOf: (fuel: string, extras: string, total: string) => `${total} tutarın ${fuel} kadarı yakıt, ${extras} kadarı ek masraf`,
    checkInputConversion: 'Dönüşümü güncellemek için değeri kontrol edin.',
    drivingCopy: (distance: string) => `Girilen yakıt tüketimi ve fiyatla ${distance} sürüş.`,
    requiredSuffix: (distance: string, fuel: string) => `${distance} · ${fuel} gerekli`,
    fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => `${distance} boyunca ${fuel} yakıt + ${extras} ek masraf.`,
    forFuel: (fuel: string) => `${fuel} yakıt için`,
    otherGallonStandard: 'Diğer galon standardı',
    gallonsNotInterchangeable: 'ABD galonu ile İngiliz (imperial) galonu birbirinin yerine kullanılamaz.',
    enteredEconomy: 'Girilen tüketim',
    convertedEconomy: 'Dönüştürülen tüketim',
    kilopascals: 'Kilopaskal',
    conversionOnlyPressure: 'Yalnızca dönüşümdür — araç üreticisinin belirttiği değeri kullanın.',
    enteredPressure: 'Girilen basınç',
    convertedPressure: 'Dönüştürülen basınç',
    underlyingPower: 'Temel güç',
    mechanicalNotMetric: 'Metrik beygir gücü (PS) değil, mekanik beygir gücü (hp) kullanır.',
    enteredPower: 'Girilen güç',
    convertedPower: 'Dönüştürülen güç',
    relationship: 'İlişki',
    sameTorque: 'Aynı tork',
    unitExpressionOnly: 'Yalnızca birim değişir.',
    enteredTorque: 'Girilen tork',
    convertedTorque: 'Dönüştürülen tork',
    metricEquivalent: 'Metrik karşılığı',
    ratioOnlyNote: 'Yalnızca bir orandır; çekiş, vites oranları ve hava direnci ayrıca değerlendirilir.',
    enteredVehicle: 'Girilen araç',
    normalizedRatio: 'Normalleştirilmiş oran',
  },
} as const satisfies Record<UiLocale, {
  checkHighlighted: string; checkInputsTrip: string; costPerDistanceAppears: string; checkInputsTripReset: string;
  fuelCostAppears: string; distanceAppears: string; destination: string; returnToStart: string; roundTrip: string; oneWay: string;
  sharedByPeople: (people: number) => string; fuelAndExtrasOf: (fuel: string, extras: string, total: string) => string;
  checkInputConversion: string; drivingCopy: (distance: string) => string;
  requiredSuffix: (distance: string, fuel: string) => string; fuelPlusExtrasAcross: (fuel: string, extras: string, distance: string) => string; forFuel: (fuel: string) => string;
  otherGallonStandard: string; gallonsNotInterchangeable: string; enteredEconomy: string; convertedEconomy: string;
  kilopascals: string; conversionOnlyPressure: string; enteredPressure: string; convertedPressure: string;
  underlyingPower: string; mechanicalNotMetric: string; enteredPower: string; convertedPower: string;
  relationship: string; sameTorque: string; unitExpressionOnly: string; enteredTorque: string; convertedTorque: string;
  metricEquivalent: string; ratioOnlyNote: string; enteredVehicle: string; normalizedRatio: string;
}>;

function render(form: HTMLFormElement, result: { readonly ok: true; readonly summary: string; readonly metrics: readonly PresentedMetric[] } | { readonly ok: false; readonly issues: readonly Parameters<typeof toolIssueText>[0][] }): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const errors = form.querySelector<HTMLElement>('[data-errors]')!;
  const summary = form.querySelector<HTMLElement>('[data-result-summary]')!;
  const metrics = form.querySelector<HTMLDListElement>('[data-results]')!;
  if (!result.ok) {
    const list = document.createElement('ul');
    result.issues.forEach((issue) => { const item = document.createElement('li'); item.textContent = toolIssueText(issue); list.append(item); });
    errors.replaceChildren(list); errors.hidden = false; summary.textContent = t.checkHighlighted; summary.classList.add('is-pending'); metrics.replaceChildren(); return;
  }
  errors.hidden = true; errors.replaceChildren(); summary.textContent = result.summary; summary.classList.remove('is-pending');
  summary.classList.remove('is-refreshing'); requestAnimationFrame(() => summary.classList.add('is-refreshing'));
  metrics.replaceChildren(...result.metrics.map((metric) => { const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd'); term.textContent = metric.label; detail.textContent = metric.value; row.append(term, detail); return row; }));
}


function syncFuelPrimary(form: HTMLFormElement, result: { readonly system: UnitSystem; readonly distance: number; readonly fuelRequired: number; readonly fuelCost: number; readonly costPerDistance: number }, currency: string): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const panel = form.querySelector<HTMLElement>('[data-fuel-primary-result]');
  if (!panel) return;
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distanceUnit = result.system === 'metric' ? 'km' : 'mi';
  const cost = `${currency} ${formatNumber(result.fuelCost, 2)}`;
  const fuel = `${formatNumber(result.fuelRequired)} ${fuelUnit}`;
  const rate = `${currency} ${formatNumber(result.costPerDistance, 2)} / ${distanceUnit}`;
  const costNode = panel.querySelector<HTMLElement>('[data-fuel-primary-cost]');
  const fuelNode = panel.querySelector<HTMLElement>('[data-fuel-primary-fuel]');
  const copyNode = panel.querySelector<HTMLElement>('[data-fuel-primary-copy]');
  const rateNode = panel.querySelector<HTMLElement>('[data-fuel-primary-rate]');
  if (costNode) costNode.textContent = cost;
  if (fuelNode) fuelNode.textContent = fuel;
  if (copyNode) copyNode.textContent = t.drivingCopy(`${formatNumber(result.distance)} ${distanceUnit}`);
  if (rateNode) rateNode.textContent = rate;
  panel.classList.remove('is-pending');

  const visual = form.closest('.tool-machine')?.querySelector<HTMLElement>('[data-fuel-technical-visual]');
  if (!visual) return;
  const distanceNode = visual.querySelector<SVGTextElement>('[data-fuel-visual-distance]');
  const visualFuelNode = visual.querySelector<SVGTextElement>('[data-fuel-visual-fuel]');
  const visualCostNode = visual.querySelector<SVGTextElement>('[data-fuel-visual-cost]');
  const captionNode = visual.querySelector<HTMLElement>('[data-fuel-visual-caption]');
  const visualRateNode = visual.querySelector<HTMLElement>('[data-fuel-visual-rate]');
  if (distanceNode) distanceNode.textContent = `${formatNumber(result.distance)} ${distanceUnit}`;
  if (visualFuelNode) visualFuelNode.textContent = fuel;
  if (visualCostNode) visualCostNode.textContent = cost;
  if (captionNode) captionNode.textContent = t.requiredSuffix(`${formatNumber(result.distance)} ${distanceUnit}`, fuel);
  if (visualRateNode) visualRateNode.textContent = rate;
  const car = visual.querySelector<SVGGElement>('[data-fuel-car]');
  const travel = Math.min(1, Math.log10(Math.max(1, result.distance) + 1) / 4);
  if (car) car.setAttribute('transform', `translate(${(-10 + travel * 42).toFixed(1)} 0)`);
  const fill = visual.querySelector<SVGPathElement>('[data-fuel-fill]');
  if (fill) {
    const normalized = Math.min(1, result.fuelRequired / 100);
    const height = 43 * normalized;
    fill.setAttribute('d', `M513 ${134 - height}h43v${height}h-43z`);
  }
}


function resetFuelPrimary(form: HTMLFormElement): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const panel = form.querySelector<HTMLElement>('[data-fuel-primary-result]');
  if (panel) {
    panel.classList.add('is-pending');
    const cost = panel.querySelector<HTMLElement>('[data-fuel-primary-cost]');
    const fuel = panel.querySelector<HTMLElement>('[data-fuel-primary-fuel]');
    const copy = panel.querySelector<HTMLElement>('[data-fuel-primary-copy]');
    const rate = panel.querySelector<HTMLElement>('[data-fuel-primary-rate]');
    if (cost) cost.textContent = '—';
    if (fuel) fuel.textContent = '—';
    if (copy) copy.textContent = t.checkInputsTrip;
    if (rate) rate.textContent = t.costPerDistanceAppears;
  }
  const visual = form.closest('.tool-machine')?.querySelector<HTMLElement>('[data-fuel-technical-visual]');
  if (visual) {
    for (const selector of ['[data-fuel-visual-distance]', '[data-fuel-visual-fuel]', '[data-fuel-visual-cost]', '[data-fuel-visual-caption]', '[data-fuel-visual-rate]']) {
      const node = visual.querySelector<HTMLElement>(selector);
      if (node) node.textContent = '—';
    }
    visual.querySelector<SVGPathElement>('[data-fuel-fill]')?.setAttribute('d', 'M513 134h43v0h-43z');
  }
}

type RoadTripResult = Extract<ReturnType<typeof calculateRoadTripCostTool>, { readonly ok: true }>['value'];

function syncRoadTripPrimary(form: HTMLFormElement, result: RoadTripResult, currency: string): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const root = form.closest('.tool-machine') ?? form;
  const panel = form.querySelector<HTMLElement>('[data-trip-primary]');
  const visual = root.querySelector<HTMLElement>('[data-trip-visual]');
  if (!panel || !visual) return;
  const money = (amount: number): string => `${currency} ${formatNumber(amount, 2)}`;
  const unit = result.system === 'metric' ? 'km' : 'mi';
  const fuelUnit = result.system === 'metric' ? 'L' : 'US gal';
  const distance = `${formatNumber(result.distance)} ${unit}`;
  const fuel = `${formatNumber(result.fuelRequired)} ${fuelUnit}`;
  const direction = result.roundTrip ? t.roundTrip : t.oneWay;
  const set = (selector: string, content: string): void => {
    const node = root.querySelector<HTMLElement>(selector);
    if (node) node.textContent = content;
  };
  set('[data-trip-total]', money(result.totalTripCost));
  set('[data-trip-context]', t.fuelPlusExtrasAcross(money(result.fuelCost), money(result.extraCost), distance));
  set('[data-trip-fuel]', fuel);
  set('[data-trip-fuel-cost]', t.forFuel(money(result.fuelCost)));
  set('[data-trip-direction]', direction);
  set('[data-trip-distance]', distance);
  set('[data-trip-person]', money(result.costPerPerson));
  set('[data-trip-people]', t.sharedByPeople(result.people));
  const person = form.querySelector<HTMLElement>('[data-trip-person-wrap]');
  if (person) person.hidden = result.people <= 1;
  set('[data-trip-visual-distance]', distance);
  set('[data-trip-visual-fuel]', fuel);
  set('[data-trip-visual-total]', money(result.totalTripCost));
  set('[data-trip-visual-fuel-cost]', money(result.fuelCost));
  set('[data-trip-visual-extras]', money(result.extraCost));
  set('[data-trip-end]', result.roundTrip ? t.returnToStart : t.destination);
  const returnLeg = visual.querySelector<HTMLElement>('[data-trip-return]');
  if (returnLeg) returnLeg.hidden = !result.roundTrip;
  const fuelBar = visual.querySelector<HTMLElement>('[data-trip-fuel-bar]');
  const extraBar = visual.querySelector<HTMLElement>('[data-trip-extra-bar]');
  if (fuelBar) fuelBar.style.width = `${result.fuelCost / result.totalTripCost * 100}%`;
  if (extraBar) extraBar.style.width = `${result.extraCost / result.totalTripCost * 100}%`;
  const track = visual.querySelector<HTMLElement>('[data-trip-cost-track]');
  if (track) track.setAttribute('aria-label', t.fuelAndExtrasOf(money(result.fuelCost), money(result.extraCost), money(result.totalTripCost)));
  panel.classList.remove('is-pending');
  visual.classList.remove('is-pending');
}

function resetRoadTripPrimary(form: HTMLFormElement): void {
  const t = UTILITY_TEXT[getPageLocale()];
  const root = form.closest('.tool-machine') ?? form;
  form.querySelector('[data-trip-primary]')?.classList.add('is-pending');
  root.querySelector('[data-trip-visual]')?.classList.add('is-pending');
  for (const selector of ['[data-trip-total]', '[data-trip-fuel]', '[data-trip-direction]', '[data-trip-person]', '[data-trip-visual-distance]', '[data-trip-visual-fuel]', '[data-trip-visual-total]', '[data-trip-visual-fuel-cost]', '[data-trip-visual-extras]']) {
    const node = root.querySelector<HTMLElement>(selector);
    if (node) node.textContent = '—';
  }
  const context = form.querySelector<HTMLElement>('[data-trip-context]');
  if (context) context.textContent = t.checkInputsTripReset;
  for (const [selector, content] of [['[data-trip-fuel-cost]', t.fuelCostAppears], ['[data-trip-distance]', t.distanceAppears], ['[data-trip-end]', t.destination]] as const) {
    const node = root.querySelector<HTMLElement>(selector);
    if (node) node.textContent = content;
  }
  const returnLeg = root.querySelector<HTMLElement>('[data-trip-return]');
  if (returnLeg) returnLeg.hidden = true;
  const person = form.querySelector<HTMLElement>('[data-trip-person-wrap]');
  if (person) person.hidden = true;
  for (const selector of ['[data-trip-fuel-bar]', '[data-trip-extra-bar]']) {
    const bar = root.querySelector<HTMLElement>(selector);
    if (bar) bar.style.width = '0%';
  }
}

interface StandardAnswerContent { primary: string; secondaryLabel: string; secondary: string; secondaryNote: string; leftLabel: string; left: string; rightLabel: string; right: string; }

function syncStandardAnswer(form: HTMLFormElement, content: StandardAnswerContent): void {
  const answer = form.querySelector<HTMLElement>('[data-standard-answer]');
  const visual = form.querySelector<HTMLElement>('[data-standard-visual]');
  if (!answer || !visual) return;
  const values: readonly [string, string][] = [
    ['[data-standard-primary]', content.primary], ['[data-standard-secondary-label]', content.secondaryLabel],
    ['[data-standard-secondary]', content.secondary], ['[data-standard-secondary-note]', content.secondaryNote],
    ['[data-standard-visual-left-label]', content.leftLabel], ['[data-standard-visual-left]', content.left],
    ['[data-standard-visual-right-label]', content.rightLabel], ['[data-standard-visual-right]', content.right],
  ];
  values.forEach(([selector, value]) => { const node = form.querySelector<HTMLElement>(selector); if (node) node.textContent = value; });
  const summary = form.querySelector<HTMLElement>('[data-result-summary]');
  const context = form.querySelector<HTMLElement>('[data-standard-context]');
  if (summary && context) context.textContent = summary.textContent;
  answer.classList.remove('is-pending'); visual.classList.remove('is-pending');
}

function resetStandardAnswer(form: HTMLFormElement): void {
  const t = UTILITY_TEXT[getPageLocale()];
  form.querySelector('[data-standard-answer]')?.classList.add('is-pending');
  form.querySelector('[data-standard-visual]')?.classList.add('is-pending');
  form.querySelectorAll<HTMLElement>('[data-standard-primary], [data-standard-secondary], [data-standard-visual-left], [data-standard-visual-right]').forEach((node) => { node.textContent = '—'; });
  const context = form.querySelector<HTMLElement>('[data-standard-context]');
  if (context) context.textContent = t.checkInputConversion;
}

function bindInstant(form: HTMLFormElement, calculate: () => void): void { form.addEventListener('input', calculate); form.addEventListener('change', calculate); calculate(); }

function fuelInput(form: HTMLFormElement) { return { system: (textValue(form, 'system') === 'imperial' ? 'imperial' : 'metric') as UnitSystem, distance: value(form, 'distance'), economy: value(form, 'economy'), price: value(form, 'price') }; }

const FUEL_LABEL_TEXT: Readonly<Record<UiLocale, { distance: string; oneWay: string; economy: string; price: string; gallon: string; litre: string }>> = {
  en: { distance: 'Distance', oneWay: 'One-way distance', economy: 'Fuel economy', price: 'Fuel price', gallon: 'US gallon', litre: 'litre' },
  de: { distance: 'Distanz', oneWay: 'Distanz (einfach)', economy: 'Kraftstoffverbrauch', price: 'Kraftstoffpreis', gallon: 'US-Gallone', litre: 'Liter' },
  es: { distance: 'Distancia', oneWay: 'Distancia de ida', economy: 'Consumo', price: 'Precio del combustible', gallon: 'galón estadounidense', litre: 'litro' },
  fr: { distance: 'Distance', oneWay: 'Distance aller', economy: 'Consommation', price: 'Prix du carburant', gallon: 'gallon US', litre: 'litre' },
  it: { distance: 'Distanza', oneWay: 'Distanza di sola andata', economy: 'Consumo', price: 'Prezzo del carburante', gallon: 'gallone USA', litre: 'litro' },
  'pt-br': { distance: 'Distância', oneWay: 'Distância de ida', economy: 'Consumo', price: 'Preço do combustível', gallon: 'galão americano', litre: 'litro' },
  pl: { distance: 'Dystans', oneWay: 'Dystans w jedną stronę', economy: 'Spalanie', price: 'Cena paliwa', gallon: 'galon USA', litre: 'litr' },
  nl: { distance: 'Afstand', oneWay: 'Enkele afstand', economy: 'Brandstofverbruik', price: 'Brandstofprijs', gallon: 'US-gallon', litre: 'liter' },
  tr: { distance: 'Mesafe', oneWay: 'Tek yön mesafe', economy: 'Yakıt tüketimi', price: 'Yakıt fiyatı', gallon: 'ABD galonu', litre: 'litre' },
};

const PER_UNIT_WORD: Readonly<Record<UiLocale, string>> = { en: 'per', de: 'pro', es: 'por', fr: 'par', it: 'per', 'pt-br': 'por', pl: 'za', nl: 'per', tr: 'başına' };

function syncFuelLabels(form: HTMLFormElement): void {
  const us = textValue(form, 'system') === 'imperial';
  const trip = form.dataset.utilityCalculator === 'road-trip';
  const distance = form.querySelector<HTMLElement>('[data-distance-label]');
  const economy = form.querySelector<HTMLElement>('[data-economy-label]');
  const price = form.querySelector<HTMLElement>('[data-price-label]');
  const lang = getPageLocale();
  const t = FUEL_LABEL_TEXT[lang];
  if (distance) distance.textContent = `${trip ? t.oneWay : t.distance} · ${us ? 'miles' : 'km'}`;
  if (economy) economy.textContent = `${t.economy} · ${us ? 'US MPG' : 'L/100km'}`;
  if (price) price.textContent = lang === 'tr'
    ? `${t.price} · ${us ? t.gallon : t.litre} ${PER_UNIT_WORD[lang]}`
    : `${t.price} · ${PER_UNIT_WORD[lang]} ${us ? t.gallon : t.litre}`;
}

function initializeFuelPreferences(form: HTMLFormElement): void {
  const system = form.querySelector<HTMLSelectElement>('[name="system"]');
  const currency = form.querySelector<HTMLSelectElement>('[name="currency"]');
  const setConvertedValues = (from: UnitSystem, target: UnitSystem): void => {
    const result = convertFuelInputSystemTool({ ...fuelInput(form), system: from }, target);
    if (!result.ok) return;
    for (const [name, next] of [['distance', result.value.distance], ['economy', result.value.economy], ['price', result.value.price]] as const) {
      const field = form.elements.namedItem(name) as HTMLInputElement | null;
      if (field) field.value = String(Number(next.toFixed(name === 'distance' ? 1 : 2)));
    }
  };
  const initialSystem = parseUnitSystem(system?.value);
  try {
    if (system) {
      const savedSystem = parseUnitSystem(localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY));
      if (savedSystem !== initialSystem) setConvertedValues(initialSystem, savedSystem);
      system.value = savedSystem;
      system.dataset.previousSystem = savedSystem;
    }
    // Only a currency the visitor chose overrides the page's locale default (EUR, TRY, PLN, BRL, ...).
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (currency && savedCurrency && Array.from(currency.options).some((option) => option.value === savedCurrency)) currency.value = parseCurrencyLabel(savedCurrency);
  } catch { /* Storage can be unavailable; form defaults remain valid. */ }
  system?.addEventListener('change', () => {
    const target = parseUnitSystem(system.value);
    const previous = parseUnitSystem(system.dataset.previousSystem);
    if (previous !== target) setConvertedValues(previous, target);
    system.dataset.previousSystem = target;
    try { localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, target); } catch { /* no-op */ }
  });
  currency?.addEventListener('change', () => { try { localStorage.setItem(CURRENCY_STORAGE_KEY, parseCurrencyLabel(currency.value)); } catch { /* no-op */ } });
}

export function initializeUtilityCalculators(): void {
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="fuel-cost"]').forEach((form) => {
    initializeFuelPreferences(form);
    const calculate = (): void => {
      syncFuelLabels(form);
      const result = calculateFuelCostTool(fuelInput(form));
      const currency = textValue(form, 'currency') || 'USD';
      render(form, result.ok ? { ok: true, ...fuelCostPresentation(result.value, currency) } : result);
      if (result.ok) syncFuelPrimary(form, result.value, currency); else resetFuelPrimary(form);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="road-trip"]').forEach((form) => {
    initializeFuelPreferences(form);
    const calculate = (): void => {
      syncFuelLabels(form);
      const base = fuelInput(form);
      const result = calculateRoadTripCostTool({ ...base, roundTrip: textValue(form, 'tripType') === 'round', extraCost: value(form, 'extraCost'), people: value(form, 'people') });
      const currency = textValue(form, 'currency') || 'USD';
      render(form, result.ok ? { ok: true, ...roadTripPresentation(result.value, currency) } : result);
      if (result.ok) syncRoadTripPrimary(form, result.value, currency); else resetRoadTripPrimary(form);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="fuel-economy"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as FuelEconomyUnit; const result = convertFuelEconomyTool(entered, unit);
    render(form, result.ok ? { ok: true, ...fuelEconomyPresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const from = unit === 'l100km' ? `${formatNumber(entered)} L/100km` : `${formatNumber(entered)} ${unit === 'us-mpg' ? 'US MPG' : 'Imp MPG'}`;
    const primary = unit === 'l100km' ? `${formatNumber(result.value.usMpg)} US MPG` : `${formatNumber(result.value.litersPer100Km)} L/100km`;
    const secondary = unit === 'imperial-mpg' ? `${formatNumber(result.value.usMpg)} US MPG` : `${formatNumber(result.value.imperialMpg)} Imp MPG`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.otherGallonStandard, secondary, secondaryNote: t.gallonsNotInterchangeable, leftLabel: t.enteredEconomy, left: from, rightLabel: t.convertedEconomy, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="pressure"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as PressureUnit; const result = convertPressureTool(entered, unit);
    render(form, result.ok ? { ok: true, ...pressurePresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const primary = unit === 'psi' ? `${formatNumber(result.value.bar, 3)} bar` : `${formatNumber(result.value.psi)} PSI`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.kilopascals, secondary: `${formatNumber(result.value.kpa)} kPa`, secondaryNote: t.conversionOnlyPressure, leftLabel: t.enteredPressure, left: `${formatNumber(entered)} ${unit}`, rightLabel: t.convertedPressure, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as PowerUnit; const result = convertPowerTool(entered, unit);
    render(form, result.ok ? { ok: true, ...powerPresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const primary = unit === 'hp' ? `${formatNumber(result.value.kilowatts)} kW` : `${formatNumber(result.value.mechanicalHorsepower)} hp`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.underlyingPower, secondary: `${formatNumber(result.value.watts)} W`, secondaryNote: t.mechanicalNotMetric, leftLabel: t.enteredPower, left: `${formatNumber(entered)} ${unit}`, rightLabel: t.convertedPower, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="torque"]').forEach((form) => bindInstant(form, () => {
    const entered = value(form, 'value'); const unit = textValue(form, 'unit') as TorqueUnit; const result = convertTorqueTool(entered, unit);
    render(form, result.ok ? { ok: true, ...torquePresentation(result.value) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    const primary = unit === 'nm' ? `${formatNumber(result.value.poundFeet)} lb-ft` : `${formatNumber(result.value.newtonMeters)} Nm`;
    syncStandardAnswer(form, { primary, secondaryLabel: t.relationship, secondary: t.sameTorque, secondaryNote: t.unitExpressionOnly, leftLabel: t.enteredTorque, left: `${formatNumber(entered)} ${unit}`, rightLabel: t.convertedTorque, right: primary });
  }));
  document.querySelectorAll<HTMLFormElement>('[data-utility-calculator="power-weight"]').forEach((form) => bindInstant(form, () => {
    const power = value(form, 'power'); const weight = value(form, 'weight'); const powerUnit = textValue(form, 'powerUnit') as PowerUnit; const weightUnit = textValue(form, 'weightUnit') as WeightUnit; const result = calculatePowerToWeightTool({ power, powerUnit, weight, weightUnit });
    render(form, result.ok ? { ok: true, ...powerToWeightPresentation(result.value, power, powerUnit, weight, weightUnit) } : result);
    if (!result.ok) return resetStandardAnswer(form);
    const t = UTILITY_TEXT[getPageLocale()];
    syncStandardAnswer(form, { primary: `${formatNumber(result.value.mechanicalHorsepowerPerTonne)} hp/t`, secondaryLabel: t.metricEquivalent, secondary: `${formatNumber(result.value.kilowattsPerTonne)} kW/t`, secondaryNote: t.ratioOnlyNote, leftLabel: t.enteredVehicle, left: `${formatNumber(power)} ${powerUnit} · ${formatNumber(weight)} ${weightUnit}`, rightLabel: t.normalizedRatio, right: `${formatNumber(result.value.wattsPerKilogram)} W/kg` });
  }));
}
