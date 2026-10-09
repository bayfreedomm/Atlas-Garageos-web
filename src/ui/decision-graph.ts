import type { VehicleFitment } from '../data/vehicle-fitment';
import { parseTireNotation, tireSizeSlug, type TireSizeEntry } from '../data/tire-size-catalog';
import { boltPatternCatalog, boltPatternSlug, type BoltPatternEntry } from '../data/bolt-pattern-catalog';
import { localizedToolPath } from '../localization/locales';
import { entityDetailPath, toolLocaleFor, type EntityLocale } from '../seo/entity-routes';
import { boltPatternCalculatorHref, tireCalculatorHref, tireComparisonHref, toolLocale, vehicleHubPath } from './entity-page-model';
import { vehicleComparisonHref, vehicleTripHref } from './vehicle-comparison';

export interface DecisionAction { readonly id: string; readonly href: string; readonly title: string; readonly detail: string; }
export interface DecisionGraphModel {
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly actions: readonly DecisionAction[];
  readonly supportingActions?: readonly DecisionAction[];
  readonly caution?: string;
}

type Pair = readonly [string, string];
interface DecisionCopy {
  readonly eyebrow: string; readonly heading: string; readonly support: string;
  readonly intros: { readonly vehicle: string; readonly tire: string; readonly bolt: string; readonly fuel: string };
  readonly vehicle: { readonly tire: Pair; readonly bolt: Pair; readonly compare: Pair; readonly setup: Pair; readonly trip: Pair; readonly tireCalc: Pair; readonly tireCompare: Pair; readonly boltCalc: Pair; readonly fuel: Pair };
  readonly tire: { readonly compare: Pair; readonly calculate: Pair; readonly vehicles: Pair; readonly pcd: Pair; readonly caution: string };
  readonly bolt: { readonly vehicles: Pair; readonly measure: Pair; readonly offset: Pair; readonly setup: Pair; readonly tires: Pair; readonly directory: Pair; readonly caution: string };
  readonly fuel: { readonly cost: Pair; readonly trip: Pair; readonly vehicles: Pair };
}

const COPY: Readonly<Record<EntityLocale, DecisionCopy>> = {
  en: {
    eyebrow: 'Next decisions', heading: 'What to check next', support: 'More direct checks',
    intros: {
      vehicle: 'Move from reference data to the calculation that answers your next question.',
      tire: 'Use the known geometry as a starting point, then compare before making a fitment decision.',
      bolt: 'Use the pattern as one input in a wider wheel-fitment check.',
      fuel: 'Turn the published market price into a cost for your journey.',
    },
    vehicle: {
      tire: ['Open the referenced tire size', 'See diameter, sidewall, circumference and vehicles using it.'],
      bolt: ['Open the bolt pattern / PCD', 'Check lug geometry, center-bore values and vehicles using it.'],
      compare: ['Compare with another vehicle', 'Highlight documented wheel, tire and fitment differences without ranking either vehicle.'],
      setup: ['Compare wheel and tire setup', 'Work through tire, wheel and clearance geometry without a compatibility claim.'],
      trip: ['Estimate a road trip cost', 'Add distance, fuel use, extras and passenger split.'],
      tireCalc: ['Calculate this tire size', 'Open the tire calculator with the reference size prefilled.'],
      tireCompare: ['Compare this tire size', 'Prefill the current size and test another size.'],
      boltCalc: ['Measure this bolt pattern', 'Prefill lug count and adjacent-hole spacing.'],
      fuel: ['Calculate fuel cost', 'Enter real consumption; Atlas does not invent it for this vehicle.'],
    },
    tire: {
      compare: ['Compare this size', 'Compare diameter and speedometer effect with this size prefilled.'],
      calculate: ['Open the size calculator', 'Review the same nominal geometry interactively.'],
      vehicles: ['See vehicles using this size', 'Jump to documented Atlas vehicle entries below.'],
      pcd: ['Move to related PCD context', 'Follow listed vehicles to bolt-pattern and center-bore data.'],
      caution: 'A geometrically similar size is not an approved fitment. Load index, speed rating, rim width, clearance, OEM approval and local regulations still matter.',
    },
    bolt: {
      vehicles: ['See vehicles using this PCD', 'Review documented vehicles and discrete center-bore values.'],
      measure: ['Open the bolt-pattern calculator', 'Use the prefilled lug count and adjacent-hole measurement.'],
      offset: ['Compare wheel width and offset', 'Check inner position and outer poke as separate geometry.'],
      setup: ['Continue to wheel and tire comparison', 'Check the wider setup; matching PCD alone is not enough.'],
      tires: ['See tire sizes in this context', 'Follow documented vehicles to their referenced tire sizes.'],
      directory: ['Open the vehicle reference', 'Start from a documented make and model.'],
      caution: 'PCD match alone does not prove compatibility. Center bore, offset, wheel width, brake clearance, hardware and vehicle-specific requirements may also matter.',
    },
    fuel: {
      cost: ['Calculate fuel cost', 'Use consumption and distance to turn price into journey cost.'],
      trip: ['Calculate a road trip', 'Include route distance, extras and cost per person.'],
      vehicles: ['Start from a documented vehicle', 'Choose a reference, then enter its real-world consumption.'],
    },
  },
  de: {
    eyebrow: 'Nächste Entscheidungen', heading: 'Was Sie als Nächstes prüfen sollten', support: 'Weitere direkte Prüfungen',
    intros: {
      vehicle: 'Nutzen Sie die Referenzdaten als Ausgangspunkt für die nächste konkrete Berechnung.',
      tire: 'Nutzen Sie die bekannte Geometrie als Ausgangspunkt und vergleichen Sie vor einer Fitment-Entscheidung.',
      bolt: 'Behandeln Sie den Lochkreis als einen Baustein einer umfassenderen Radprüfung.',
      fuel: 'Machen Sie aus dem veröffentlichten Marktpreis konkrete Fahrtkosten.',
    },
    vehicle: {
      tire: ['Referenz-Reifengröße öffnen', 'Durchmesser, Flankenhöhe, Umfang und Fahrzeuge mit dieser Größe ansehen.'],
      bolt: ['Lochkreis / PCD öffnen', 'Lochgeometrie, Nabenbohrungen und weitere Fahrzeuge prüfen.'],
      compare: ['Mit einem anderen Fahrzeug vergleichen', 'Belegte Rad-, Reifen- und Fitment-Unterschiede ohne Rangliste hervorheben.'],
      setup: ['Rad- und Reifensetup vergleichen', 'Reifen-, Felgen- und Freiganggeometrie ohne Kompatibilitätsversprechen prüfen.'],
      trip: ['Fahrtkosten berechnen', 'Strecke, Verbrauch, Extras und Kosten pro Person eingeben.'],
      tireCalc: ['Diese Reifengröße berechnen', 'Reifenrechner mit der Referenzgröße vorausgefüllt öffnen.'],
      tireCompare: ['Diese Reifengröße vergleichen', 'Aktuelle Größe vorausfüllen und eine Alternative testen.'],
      boltCalc: ['Diesen Lochkreis messen', 'Lochzahl und benachbarten Lochabstand vorausfüllen.'],
      fuel: ['Kraftstoffkosten berechnen', 'Realen Verbrauch eingeben; Atlas erfindet keinen Fahrzeugverbrauch.'],
    },
    tire: {
      compare: ['Diese Größe vergleichen', 'Durchmesser und Tachoabweichung mit vorausgefüllter Größe vergleichen.'],
      calculate: ['Reifengrößen-Rechner öffnen', 'Dieselbe Nenngeometrie interaktiv prüfen.'],
      vehicles: ['Fahrzeuge mit dieser Größe ansehen', 'Zu den dokumentierten Atlas-Fahrzeugeinträgen springen.'],
      pcd: ['Zum zugehörigen Lochkreis-Kontext', 'Über die Fahrzeuge zu Lochkreis- und Nabenbohrungsdaten wechseln.'],
      caution: 'Eine geometrisch ähnliche Größe ist keine Freigabe. Tragfähigkeitsindex, Geschwindigkeitsindex, Felgenbreite, Freigang, Herstellerfreigabe und lokale Vorschriften bleiben entscheidend.',
    },
    bolt: {
      vehicles: ['Fahrzeuge mit diesem Lochkreis', 'Dokumentierte Fahrzeuge und diskrete Nabenbohrungen prüfen.'],
      measure: ['Lochkreis-Rechner öffnen', 'Lochzahl und benachbarten Lochabstand vorausgefüllt verwenden.'],
      offset: ['Felgenbreite und ET vergleichen', 'Innere Position und äußeren Überstand getrennt berechnen.'],
      setup: ['Zum Rad- und Reifenvergleich', 'Das gesamte Setup prüfen; gleicher Lochkreis allein reicht nicht.'],
      tires: ['Reifengrößen im Fahrzeugkontext', 'Über dokumentierte Fahrzeuge zu ihren Referenzgrößen wechseln.'],
      directory: ['Fahrzeug-Referenz öffnen', 'Mit einer dokumentierten Marke und einem Modell beginnen.'],
      caution: 'Ein passender Lochkreis beweist keine Kompatibilität. Nabenbohrung, ET, Felgenbreite, Bremsfreigang, Befestigung und fahrzeugspezifische Anforderungen können ebenfalls entscheidend sein.',
    },
    fuel: {
      cost: ['Kraftstoffkosten berechnen', 'Preis mit Verbrauch und Strecke in Fahrtkosten umrechnen.'],
      trip: ['Reisekosten berechnen', 'Strecke, Extras und Kosten pro Person einbeziehen.'],
      vehicles: ['Mit einem dokumentierten Fahrzeug starten', 'Fahrzeugreferenz wählen und realen Verbrauch eingeben.'],
    },
  },
  es: {
    eyebrow: 'Siguientes decisiones', heading: 'Qué comprobar a continuación', support: 'Otras comprobaciones directas',
    intros: {
      vehicle: 'Pase de los datos de referencia al cálculo que responde a su siguiente pregunta.',
      tire: 'Use la geometría conocida como punto de partida y compare antes de decidir un ajuste.',
      bolt: 'Trate el patrón como un dato dentro de una comprobación de llanta más amplia.',
      fuel: 'Convierta el precio publicado del mercado en el coste de su trayecto.',
    },
    vehicle: {
      tire: ['Abrir la medida de referencia', 'Ver diámetro, flanco, circunferencia y vehículos que la usan.'],
      bolt: ['Abrir el patrón / PCD', 'Comprobar geometría, bujes y otros vehículos que lo usan.'],
      compare: ['Comparar con otro vehículo', 'Destacar diferencias documentadas de ruedas, neumáticos y ajuste sin clasificarlos.'],
      setup: ['Comparar llanta y neumático', 'Revisar geometría de neumático, llanta y holgura sin prometer compatibilidad.'],
      trip: ['Estimar el coste de un viaje', 'Añadir distancia, consumo, extras y reparto entre pasajeros.'],
      tireCalc: ['Calcular esta medida', 'Abrir la calculadora con la medida de referencia precargada.'],
      tireCompare: ['Comparar esta medida', 'Precargar la medida actual y probar otra.'],
      boltCalc: ['Medir este patrón', 'Precargar número de birlos y distancia entre orificios adyacentes.'],
      fuel: ['Calcular coste de combustible', 'Introducir consumo real; Atlas no lo inventa para este vehículo.'],
    },
    tire: {
      compare: ['Comparar esta medida', 'Comparar diámetro y efecto en el velocímetro con la medida precargada.'],
      calculate: ['Abrir la calculadora de medida', 'Revisar la misma geometría nominal de forma interactiva.'],
      vehicles: ['Ver vehículos que usan esta medida', 'Saltar a las entradas documentadas de Atlas.'],
      pcd: ['Ir al contexto de PCD relacionado', 'Seguir los vehículos hasta datos de patrón y diámetro de buje.'],
      caution: 'Una medida geométricamente similar no es un ajuste aprobado. Índice de carga, código de velocidad, ancho de llanta, holgura, aprobación OEM y normativa local siguen siendo decisivos.',
    },
    bolt: {
      vehicles: ['Ver vehículos que usan este PCD', 'Revisar vehículos documentados y diámetros de buje discretos.'],
      measure: ['Abrir la calculadora de patrón', 'Usar número de birlos y distancia adyacente precargados.'],
      offset: ['Comparar ancho y offset de llanta', 'Calcular por separado posición interior y salida exterior.'],
      setup: ['Continuar a comparación de llanta y neumático', 'Comprobar el conjunto; coincidir en PCD no basta.'],
      tires: ['Ver medidas en este contexto', 'Seguir vehículos documentados hasta sus medidas de referencia.'],
      directory: ['Abrir la referencia de vehículos', 'Partir de una marca y un modelo documentados.'],
      caution: 'Coincidir en PCD no demuestra compatibilidad. Diámetro de buje, offset, ancho, holgura de frenos, fijaciones y requisitos del vehículo también pueden importar.',
    },
    fuel: {
      cost: ['Calcular coste de combustible', 'Convertir precio, consumo y distancia en coste del trayecto.'],
      trip: ['Calcular un viaje', 'Incluir distancia, extras y coste por persona.'],
      vehicles: ['Partir de un vehículo documentado', 'Elegir una referencia e introducir su consumo real.'],
    },
  },
  fr: {
    eyebrow: 'Étapes suivantes', heading: 'Que vérifier ensuite', support: 'Autres vérifications',
    intros: {
      vehicle: 'Passez des données de référence au calcul qui répond à votre prochaine question.',
      tire: 'Partez de la géométrie connue, puis comparez avant toute décision de montage.',
      bolt: 'Traitez l’entraxe comme un élément d’une vérification de jante plus large.',
      fuel: 'Transformez le prix publié en coût pour votre trajet.',
    },
    vehicle: {
      tire: ['Ouvrir la taille de référence', 'Diamètre, flanc, circonférence et véhicules qui l’utilisent.'],
      bolt: ['Ouvrir l’entraxe / PCD', 'Géométrie des trous, alésages et autres véhicules.'],
      compare: ['Comparer avec un autre véhicule (en anglais)', 'Différences documentées de roues et de pneus, sans classement.'],
      setup: ['Comparer jante et pneu (en anglais)', 'Géométrie pneu, jante et dégagement, sans promesse de compatibilité.'],
      trip: ['Estimer le coût d’un trajet (en anglais)', 'Distance, consommation, extras et partage entre passagers.'],
      tireCalc: ['Calculer cette taille (en anglais)', 'Ouvrir le calculateur prérempli avec la taille de référence.'],
      tireCompare: ['Comparer cette taille (en anglais)', 'Préremplir la taille actuelle et en tester une autre.'],
      boltCalc: ['Mesurer cet entraxe (en anglais)', 'Préremplir le nombre de trous et l’écart entre deux trous.'],
      fuel: ['Calculer le coût en carburant (en anglais)', 'Saisissez votre consommation réelle ; Atlas ne l’invente pas.'],
    },
    tire: {
      compare: ['Comparer cette taille (en anglais)', 'Diamètre et effet sur le compteur, taille préremplie.'],
      calculate: ['Ouvrir le calculateur de taille (en anglais)', 'La même géométrie nominale, en interactif.'],
      vehicles: ['Voir les véhicules avec cette taille', 'Aller aux véhicules documentés par Atlas ci-dessous.'],
      pcd: ['Voir les entraxes associés', 'Suivre les véhicules vers leurs entraxes et alésages.'],
      caution: 'Une taille géométriquement proche n’est pas une monte homologuée. Indice de charge, indice de vitesse, largeur de jante, dégagement, homologation constructeur et réglementation locale restent décisifs.',
    },
    bolt: {
      vehicles: ['Voir les véhicules avec cet entraxe', 'Véhicules documentés et alésages centraux.'],
      measure: ['Ouvrir le calculateur d’entraxe (en anglais)', 'Nombre de trous et écart entre trous préremplis.'],
      offset: ['Comparer largeur de jante et déport (en anglais)', 'Position intérieure et débord extérieur calculés séparément.'],
      setup: ['Comparer jante et pneu (en anglais)', 'Vérifier l’ensemble ; un même entraxe ne suffit pas.'],
      tires: ['Voir les tailles de pneus associées', 'Suivre les véhicules documentés vers leurs tailles d’origine.'],
      directory: ['Ouvrir la référence véhicules', 'Partir d’une marque et d’un modèle documentés.'],
      caution: 'Un entraxe identique ne prouve pas la compatibilité. Alésage, déport, largeur de jante, dégagement des freins, visserie et exigences du véhicule comptent aussi.',
    },
    fuel: {
      cost: ['Calculer le coût en carburant', 'Prix, consommation et distance en coût de trajet.'],
      trip: ['Calculer un trajet', 'Distance, extras et coût par personne.'],
      vehicles: ['Partir d’un véhicule documenté', 'Choisir une référence puis saisir sa consommation réelle.'],
    },
  },
  'it': {
    eyebrow: 'Passi successivi', heading: 'Cosa verificare dopo', support: 'Altre verifiche',
    intros: {
      vehicle: 'Passare dai dati di riferimento al calcolo che risponde alla prossima domanda.',
      tire: 'Partire dalla geometria nota, poi confrontare prima di qualsiasi decisione di montaggio.',
      bolt: 'Considerare la foratura come un elemento di una verifica più ampia del cerchio.',
      fuel: 'Trasformare il prezzo pubblicato in un costo per il proprio viaggio.',
    },
    vehicle: {
      tire: ['Apri la misura di riferimento', 'Diametro, spalla, circonferenza e veicoli che la usano.'],
      bolt: ['Apri la foratura / PCD', 'Geometria dei fori, fori centrali e altri veicoli.'],
      compare: ['Confronta con un altro veicolo (in inglese)', 'Differenze documentate di cerchi e pneumatici, senza classifiche.'],
      setup: ['Confronta cerchio e pneumatico (in inglese)', 'Geometria di pneumatico, cerchio e spazio libero, senza promesse di compatibilità.'],
      trip: ['Stima il costo di un viaggio (in inglese)', 'Distanza, consumi, extra e ripartizione tra passeggeri.'],
      tireCalc: ['Calcola questa misura (in inglese)', 'Apre il calcolatore precompilato con la misura di riferimento.'],
      tireCompare: ['Confronta questa misura (in inglese)', 'Precompila la misura attuale e ne prova un’altra.'],
      boltCalc: ['Misura questa foratura (in inglese)', 'Precompila il numero di fori e la distanza tra due fori.'],
      fuel: ['Calcola il costo del carburante (in inglese)', 'Inserire il consumo reale; Atlas non lo inventa.'],
    },
    tire: {
      compare: ['Confronta questa misura (in inglese)', 'Diametro ed effetto sul tachimetro, misura precompilata.'],
      calculate: ['Apri il calcolatore di misure (in inglese)', 'La stessa geometria nominale, in modo interattivo.'],
      vehicles: ['Vedi i veicoli con questa misura', 'Vai ai veicoli documentati da Atlas qui sotto.'],
      pcd: ['Vedi le forature correlate', 'Seguire i veicoli fino alle loro forature e ai fori centrali.'],
      caution: 'Una misura geometricamente simile non è un montaggio omologato. Indice di carico, codice di velocità, larghezza del cerchio, spazio libero, omologazione del costruttore e normativa locale restano decisivi.',
    },
    bolt: {
      vehicles: ['Vedi i veicoli con questa foratura', 'Veicoli documentati e fori centrali.'],
      measure: ['Apri il calcolatore di foratura (in inglese)', 'Numero di fori e distanza tra i fori precompilati.'],
      offset: ['Confronta larghezza del cerchio e offset (in inglese)', 'Posizione interna e sporgenza esterna calcolate separatamente.'],
      setup: ['Confronta cerchio e pneumatico (in inglese)', 'Verificare l’insieme; la stessa foratura non basta.'],
      tires: ['Vedi le misure di pneumatici correlate', 'Seguire i veicoli documentati fino alle loro misure di serie.'],
      directory: ['Apri il riferimento veicoli', 'Partire da una marca e un modello documentati.'],
      caution: 'Una foratura identica non dimostra la compatibilità. Contano anche foro centrale, offset, larghezza del cerchio, spazio per i freni, bulloneria e requisiti del veicolo.',
    },
    fuel: {
      cost: ['Calcola il costo del carburante', 'Prezzo, consumo e distanza trasformati in costo del viaggio.'],
      trip: ['Calcola un viaggio', 'Distanza, extra e costo a persona.'],
      vehicles: ['Parti da un veicolo documentato', 'Scegliere un riferimento, poi inserire il suo consumo reale.'],
    },
  },
  'pt-br': {
    eyebrow: 'Próximos passos', heading: 'O que verificar em seguida', support: 'Outras verificações',
    intros: {
      vehicle: 'Passe dos dados de referência ao cálculo que responde à sua próxima pergunta.',
      tire: 'Parta da geometria conhecida e compare antes de qualquer decisão de montagem.',
      bolt: 'Trate a furação como um item de uma verificação de roda mais ampla.',
      fuel: 'Transforme o preço publicado em custo para a sua viagem.',
    },
    vehicle: {
      tire: ['Abrir a medida de referência', 'Diâmetro, flanco, circunferência e veículos que a usam.'],
      bolt: ['Abrir a furação / PCD', 'Geometria dos furos, furos centrais e outros veículos.'],
      compare: ['Comparar com outro veículo (em inglês)', 'Diferenças documentadas de rodas e pneus, sem ranking.'],
      setup: ['Comparar roda e pneu (em inglês)', 'Geometria de pneu, roda e folga, sem promessa de compatibilidade.'],
      trip: ['Estimar o custo de uma viagem (em inglês)', 'Distância, consumo, extras e divisão entre passageiros.'],
      tireCalc: ['Calcular esta medida (em inglês)', 'Abrir a calculadora já preenchida com a medida de referência.'],
      tireCompare: ['Comparar esta medida (em inglês)', 'Preencher a medida atual e testar outra.'],
      boltCalc: ['Medir esta furação (em inglês)', 'Preencher o número de furos e a distância entre dois furos.'],
      fuel: ['Calcular o custo de combustível (em inglês)', 'Informe seu consumo real; a Atlas não o inventa.'],
    },
    tire: {
      compare: ['Comparar esta medida (em inglês)', 'Diâmetro e efeito no velocímetro, com a medida já preenchida.'],
      calculate: ['Abrir a calculadora de medida (em inglês)', 'A mesma geometria nominal, de forma interativa.'],
      vehicles: ['Ver os veículos com esta medida', 'Ir aos veículos documentados pela Atlas abaixo.'],
      pcd: ['Ver as furações relacionadas', 'Seguir os veículos até suas furações e furos centrais.'],
      caution: 'Uma medida geometricamente próxima não é uma montagem homologada. Índice de carga, índice de velocidade, largura da roda, folga, homologação do fabricante e legislação local continuam decisivos.',
    },
    bolt: {
      vehicles: ['Ver os veículos com esta furação', 'Veículos documentados e furos centrais.'],
      measure: ['Abrir a calculadora de furação (em inglês)', 'Número de furos e distância entre furos já preenchidos.'],
      offset: ['Comparar largura da roda e offset (em inglês)', 'Posição interna e projeção externa calculadas separadamente.'],
      setup: ['Comparar roda e pneu (em inglês)', 'Verificar o conjunto; a mesma furação não basta.'],
      tires: ['Ver as medidas de pneus relacionadas', 'Seguir os veículos documentados até suas medidas originais.'],
      directory: ['Abrir a referência de veículos', 'Partir de uma marca e um modelo documentados.'],
      caution: 'Uma furação idêntica não prova compatibilidade. Furo central, offset, largura da roda, folga dos freios, fixadores e exigências do veículo também importam.',
    },
    fuel: {
      cost: ['Calcular o custo de combustível', 'Preço, consumo e distância convertidos em custo da viagem.'],
      trip: ['Calcular uma viagem', 'Distância, extras e custo por pessoa.'],
      vehicles: ['Partir de um veículo documentado', 'Escolher uma referência e informar seu consumo real.'],
    },
  },
  'pl': {
    eyebrow: 'Kolejne kroki', heading: 'Co sprawdzić dalej', support: 'Inne sprawdzenia',
    intros: {
      vehicle: 'Przejdź od danych referencyjnych do obliczenia, które odpowie na kolejne pytanie.',
      tire: 'Zacznij od znanej geometrii, a przed decyzją o montażu porównaj rozmiary.',
      bolt: 'Rozstaw śrub to tylko jeden element szerszej weryfikacji felgi.',
      fuel: 'Przelicz opublikowaną cenę na koszt przejazdu.',
    },
    vehicle: {
      tire: ['Otwórz rozmiar referencyjny', 'Średnica, bok, obwód i pojazdy z tym rozmiarem.'],
      bolt: ['Otwórz rozstaw śrub / PCD', 'Geometria otworów, otwory centralne i inne pojazdy.'],
      compare: ['Porównaj z innym pojazdem (po angielsku)', 'Udokumentowane różnice kół i opon, bez rankingu.'],
      setup: ['Porównaj felgę i oponę (po angielsku)', 'Geometria opony, felgi i luzów, bez obietnicy zgodności.'],
      trip: ['Oszacuj koszt przejazdu (po angielsku)', 'Dystans, zużycie, dodatki i podział między pasażerów.'],
      tireCalc: ['Oblicz ten rozmiar (po angielsku)', 'Kalkulator z wpisanym rozmiarem referencyjnym.'],
      tireCompare: ['Porównaj ten rozmiar (po angielsku)', 'Obecny rozmiar już wpisany — przetestuj inny.'],
      boltCalc: ['Zmierz ten rozstaw (po angielsku)', 'Liczba otworów i odstęp między dwoma otworami już wpisane.'],
      fuel: ['Oblicz koszt paliwa (po angielsku)', 'Wpisz rzeczywiste zużycie; Atlas go nie wymyśla.'],
    },
    tire: {
      compare: ['Porównaj ten rozmiar (po angielsku)', 'Średnica i wpływ na prędkościomierz, rozmiar już wpisany.'],
      calculate: ['Otwórz kalkulator rozmiaru (po angielsku)', 'Ta sama geometria nominalna, interaktywnie.'],
      vehicles: ['Zobacz pojazdy z tym rozmiarem', 'Przejdź do pojazdów udokumentowanych przez Atlas poniżej.'],
      pcd: ['Zobacz powiązane rozstawy śrub', 'Od pojazdów do ich rozstawów i otworów centralnych.'],
      caution: 'Rozmiar geometrycznie zbliżony nie jest homologowanym zamiennikiem. Indeks nośności, indeks prędkości, szerokość felgi, luzy, homologacja producenta i lokalne przepisy pozostają decydujące.',
    },
    bolt: {
      vehicles: ['Zobacz pojazdy z tym rozstawem', 'Udokumentowane pojazdy i otwory centralne.'],
      measure: ['Otwórz kalkulator rozstawu śrub (po angielsku)', 'Liczba otworów i odstęp między nimi już wpisane.'],
      offset: ['Porównaj szerokość felgi i odsadzenie (po angielsku)', 'Położenie wewnętrzne i wysunięcie na zewnątrz liczone osobno.'],
      setup: ['Porównaj felgę i oponę (po angielsku)', 'Sprawdź całość; ten sam rozstaw nie wystarczy.'],
      tires: ['Zobacz powiązane rozmiary opon', 'Od udokumentowanych pojazdów do ich fabrycznych rozmiarów.'],
      directory: ['Otwórz bazę pojazdów', 'Zacznij od udokumentowanej marki i modelu.'],
      caution: 'Identyczny rozstaw śrub nie dowodzi zgodności. Liczą się też otwór centralny, odsadzenie, szerokość felgi, luz dla hamulców, elementy mocujące i wymagania pojazdu.',
    },
    fuel: {
      cost: ['Oblicz koszt paliwa', 'Cena, zużycie i dystans przeliczone na koszt przejazdu.'],
      trip: ['Oblicz przejazd', 'Dystans, dodatki i koszt na osobę.'],
      vehicles: ['Zacznij od udokumentowanego pojazdu', 'Wybierz pojazd referencyjny, a potem wpisz jego rzeczywiste zużycie.'],
    },
  },
  'nl': {
    eyebrow: 'Volgende stappen', heading: 'Wat u hierna controleert', support: 'Meer controles',
    intros: {
      vehicle: 'Ga van referentiegegevens naar de berekening die uw volgende vraag beantwoordt.',
      tire: 'Begin bij de bekende geometrie en vergelijk vóór elke montagebeslissing.',
      bolt: 'Zie de steekmaat als één onderdeel van een bredere velgcontrole.',
      fuel: 'Zet de gepubliceerde prijs om in kosten voor uw rit.',
    },
    vehicle: {
      tire: ['Referentiemaat openen', 'Diameter, wang, omtrek en voertuigen die deze maat gebruiken.'],
      bolt: ['Steekmaat / PCD openen', 'Gatengeometrie, naafgaten en andere voertuigen.'],
      compare: ['Vergelijken met een ander voertuig (in het Engels)', 'Gedocumenteerde verschillen in velgen en banden, zonder rangorde.'],
      setup: ['Velg en band vergelijken (in het Engels)', 'Geometrie van band, velg en vrije ruimte, zonder belofte van compatibiliteit.'],
      trip: ['Kosten van een rit schatten (in het Engels)', 'Afstand, verbruik, extra kosten en verdeling over passagiers.'],
      tireCalc: ['Deze maat berekenen (in het Engels)', 'De calculator openen met de referentiemaat ingevuld.'],
      tireCompare: ['Deze maat vergelijken (in het Engels)', 'De huidige maat invullen en een andere testen.'],
      boltCalc: ['Deze steekmaat meten (in het Engels)', 'Aantal gaten en afstand tussen twee gaten vooraf ingevuld.'],
      fuel: ['Brandstofkosten berekenen (in het Engels)', 'Voer uw werkelijke verbruik in; Atlas verzint het niet.'],
    },
    tire: {
      compare: ['Deze maat vergelijken (in het Engels)', 'Diameter en effect op de snelheidsmeter, maat vooraf ingevuld.'],
      calculate: ['Bandenmaatcalculator openen (in het Engels)', 'Dezelfde nominale geometrie, interactief.'],
      vehicles: ['Voertuigen met deze maat bekijken', 'Naar de door Atlas gedocumenteerde voertuigen hieronder.'],
      pcd: ['Bijbehorende steekmaten bekijken', 'Volg de voertuigen naar hun steekmaten en naafgaten.'],
      caution: 'Een geometrisch vergelijkbare maat is geen goedgekeurde montage. Belastingsindex, snelheidsindex, velgbreedte, vrije ruimte, goedkeuring door de fabrikant en lokale regelgeving blijven doorslaggevend.',
    },
    bolt: {
      vehicles: ['Voertuigen met deze steekmaat bekijken', 'Gedocumenteerde voertuigen en naafgaten.'],
      measure: ['Steekmaatcalculator openen (in het Engels)', 'Aantal gaten en gatafstand vooraf ingevuld.'],
      offset: ['Velgbreedte en ET vergelijken (in het Engels)', 'Positie aan de binnenkant en uitsteek aan de buitenkant apart berekend.'],
      setup: ['Velg en band vergelijken (in het Engels)', 'Controleer het geheel; dezelfde steekmaat is niet genoeg.'],
      tires: ['Bijbehorende bandenmaten bekijken', 'Volg de gedocumenteerde voertuigen naar hun originele maten.'],
      directory: ['Voertuigreferentie openen', 'Begin bij een gedocumenteerd merk en model.'],
      caution: 'Een identieke steekmaat bewijst geen compatibiliteit. Naafgat, inpersdiepte, velgbreedte, vrije ruimte voor de remmen, bevestigingsmateriaal en voertuigspecifieke eisen tellen ook mee.',
    },
    fuel: {
      cost: ['Brandstofkosten berekenen', 'Prijs, verbruik en afstand omgezet in ritkosten.'],
      trip: ['Een rit berekenen', 'Afstand, extra kosten en kosten per persoon.'],
      vehicles: ['Beginnen bij een gedocumenteerd voertuig', 'Kies een referentie en voer het werkelijke verbruik in.'],
    },
  },
  'tr': {
    eyebrow: 'Sonraki adımlar', heading: 'Sırada ne kontrol edilmeli?', support: 'Diğer kontroller',
    intros: {
      vehicle: 'Referans verilerden, bir sonraki sorunuzu yanıtlayan hesaplamaya geçin.',
      tire: 'Bilinen geometriden yola çıkın, ardından montaj kararı vermeden önce karşılaştırın.',
      bolt: 'Bijon aralığını, daha kapsamlı bir jant uyum kontrolünün bir parçası olarak ele alın.',
      fuel: 'Yayımlanan fiyatı yolculuğunuzun maliyetine dönüştürün.',
    },
    vehicle: {
      tire: ['Referans ebadı açın', 'Çap, yanak, çevre ve bu ebadı kullanan araçlar.'],
      bolt: ['Bijon aralığını / PCD’yi açın', 'Delik geometrisi, göbek çapları ve diğer araçlar.'],
      compare: ['Başka bir araçla karşılaştırın (İngilizce)', 'Jant ve lastiklerdeki belgelenmiş farklar, sıralama yapmadan.'],
      setup: ['Jant ve lastiği karşılaştırın (İngilizce)', 'Lastik, jant ve boşluk geometrisi; uyumluluk vaadi olmadan.'],
      trip: ['Yolculuk maliyetini tahmin edin (İngilizce)', 'Mesafe, tüketim, ek giderler ve yolcular arasında paylaşım.'],
      tireCalc: ['Bu ebadı hesaplayın (İngilizce)', 'Hesaplayıcıyı referans ebat önceden girilmiş olarak açın.'],
      tireCompare: ['Bu ebadı karşılaştırın (İngilizce)', 'Mevcut ebadı önceden girin ve başka bir ebadı deneyin.'],
      boltCalc: ['Bu bijon aralığını ölçün (İngilizce)', 'Bijon sayısı ve iki delik arası mesafe önceden girilir.'],
      fuel: ['Yakıt maliyetini hesaplayın (İngilizce)', 'Gerçek tüketiminizi girin; Atlas bunu uydurmaz.'],
    },
    tire: {
      compare: ['Bu ebadı karşılaştırın (İngilizce)', 'Çap ve kilometre saatine etkisi, ebat önceden girilmiş.'],
      calculate: ['Ebat hesaplayıcısını açın (İngilizce)', 'Aynı nominal geometri, etkileşimli olarak.'],
      vehicles: ['Bu ebadı kullanan araçları görün', 'Aşağıdaki Atlas tarafından belgelenmiş araçlara gidin.'],
      pcd: ['İlgili bijon aralıklarını görün', 'Araçlardan bijon aralıklarına ve göbek çaplarına geçin.'],
      caution: 'Geometrik olarak yakın bir ebat, onaylı bir montaj değildir. Yük endeksi, hız endeksi, jant genişliği, boşluk, üretici onayı ve yerel mevzuat belirleyici olmaya devam eder.',
    },
    bolt: {
      vehicles: ['Bu bijon aralığına sahip araçları görün', 'Belgelenmiş araçlar ve göbek çapları.'],
      measure: ['Bijon aralığı hesaplayıcısını açın (İngilizce)', 'Bijon sayısı ve iki delik arası mesafe önceden girilir.'],
      offset: ['Jant genişliği ve ofseti karşılaştırın (İngilizce)', 'İç konum ve dış taşma ayrı ayrı hesaplanır.'],
      setup: ['Jant ve lastiği karşılaştırın (İngilizce)', 'Bütünü kontrol edin; aynı bijon aralığı tek başına yetmez.'],
      tires: ['İlgili lastik ebatlarını görün', 'Belgelenmiş araçlardan orijinal lastik ebatlarına geçin.'],
      directory: ['Araç referansını açın', 'Belgelenmiş bir marka ve modelden başlayın.'],
      caution: 'Aynı bijon aralığı uyumluluğu kanıtlamaz. Göbek çapı, ofset, jant genişliği, fren boşluğu, bağlantı elemanları ve araca özgü gereksinimler de önemlidir.',
    },
    fuel: {
      cost: ['Yakıt maliyetini hesaplayın', 'Fiyat, tüketim ve mesafeden yolculuk maliyeti.'],
      trip: ['Bir yolculuğu hesaplayın', 'Mesafe, ek giderler ve kişi başı maliyet.'],
      vehicles: ['Belgelenmiş bir araçtan başlayın', 'Bir referans seçin, ardından gerçek tüketimini girin.'],
    },
  },
};

const makeAction = (id: string, href: string, text: Pair): DecisionAction => Object.freeze({ id, href, title: text[0], detail: text[1] });

// The Fitment Studio flagship app keeps the same unprefixed slug in every locale (unlike
// calculators, which get a fully localized slug from localizedToolPath), so it needs its own
// locale-prefix-only path here rather than a bare '/fitment-studio/'.
const fitmentStudioHref = (locale: EntityLocale): string => (toolLocaleFor(locale) === 'en' ? '/fitment-studio/' : `/${locale}/fitment-studio/`);

function tireEntryForVehicle(vehicle: VehicleFitment): TireSizeEntry {
  const parsed = parseTireNotation(vehicle.tireSize);
  if (!parsed) throw new Error(`No tire-size entity for vehicle ${vehicle.id}: ${vehicle.tireSize}`);
  return Object.freeze({ notation: vehicle.tireSize, slug: tireSizeSlug(vehicle.tireSize), ...parsed });
}

export function vehicleDecisionGraph(vehicle: VehicleFitment, locale: EntityLocale): DecisionGraphModel {
  const copy = COPY[locale];
  const tire = tireEntryForVehicle(vehicle);
  const bolt = boltPatternCatalog.find((entry) => entry.notation === vehicle.boltPattern);
  if (!bolt) throw new Error(`No bolt-pattern entity for vehicle ${vehicle.id}: ${vehicle.boltPattern}`);
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: copy.intros.vehicle,
    actions: Object.freeze([
      makeAction('vehicle-tire', entityDetailPath('tire-size', locale, tire.slug), copy.vehicle.tire),
      makeAction('vehicle-bolt', entityDetailPath('bolt-pattern', locale, boltPatternSlug(vehicle.boltPattern)), copy.vehicle.bolt),
      makeAction('vehicle-compare', vehicleComparisonHref(locale, vehicle.id), copy.vehicle.compare),
      makeAction('vehicle-setup', fitmentStudioHref(locale), copy.vehicle.setup),
      makeAction('vehicle-trip', vehicleTripHref(locale, vehicle.id), copy.vehicle.trip),
    ]),
    supportingActions: Object.freeze([
      makeAction('vehicle-tire-calculator', tireCalculatorHref(locale, tire), copy.vehicle.tireCalc),
      makeAction('vehicle-tire-compare', tireComparisonHref(locale, tire), copy.vehicle.tireCompare),
      makeAction('vehicle-bolt-calculator', boltPatternCalculatorHref(locale, bolt), copy.vehicle.boltCalc),
      makeAction('vehicle-fuel-cost', localizedToolPath(toolLocale(locale), 'fuel-cost-calculator', 'tool'), copy.vehicle.fuel),
    ]),
  });
}

export function tireDecisionGraph(entry: TireSizeEntry, locale: EntityLocale): DecisionGraphModel {
  const copy = COPY[locale];
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: copy.intros.tire,
    actions: Object.freeze([
      makeAction('tire-compare', tireComparisonHref(locale, entry), copy.tire.compare),
      makeAction('tire-calculate', tireCalculatorHref(locale, entry), copy.tire.calculate),
      makeAction('tire-vehicles', '#entity-vehicles', copy.tire.vehicles),
      makeAction('tire-pcd', '#entity-related', copy.tire.pcd),
    ]),
    caution: copy.tire.caution,
  });
}

export function boltDecisionGraph(entry: BoltPatternEntry, locale: EntityLocale): DecisionGraphModel {
  const copy = COPY[locale];
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: copy.intros.bolt,
    actions: Object.freeze([
      makeAction('bolt-vehicles', '#entity-vehicles', copy.bolt.vehicles),
      makeAction('bolt-measure', boltPatternCalculatorHref(locale, entry), copy.bolt.measure),
      makeAction('bolt-offset', localizedToolPath(toolLocale(locale), 'wheel-offset-calculator', 'tool'), copy.bolt.offset),
      makeAction('bolt-setup', fitmentStudioHref(locale), copy.bolt.setup),
    ]),
    supportingActions: Object.freeze([
      makeAction('bolt-tires', '#entity-related', copy.bolt.tires),
      makeAction('bolt-vehicle-directory', vehicleHubPath(locale), copy.bolt.directory),
    ]),
    caution: copy.bolt.caution,
  });
}

export function fuelDecisionGraph(locale: EntityLocale, note: string): DecisionGraphModel {
  const copy = COPY[locale];
  return Object.freeze({
    eyebrow: copy.eyebrow, heading: copy.heading, intro: `${copy.intros.fuel} ${note}`,
    actions: Object.freeze([
      makeAction('fuel-cost', localizedToolPath(toolLocale(locale), 'fuel-cost-calculator', 'tool'), copy.fuel.cost),
      makeAction('fuel-trip', localizedToolPath(toolLocale(locale), 'road-trip-cost-calculator', 'tool'), copy.fuel.trip),
      makeAction('fuel-vehicle', vehicleHubPath(locale), copy.fuel.vehicles),
    ]),
  });
}

export const decisionSupportingLabel = (locale: EntityLocale): string => COPY[locale].support;
