import { localizedToolPath } from '../localization/locales';
import type { TireToolInput } from '../features/tools/calculator-tools';
import type { ToolEntityLocale } from '../seo/entity-routes';

type Difference = 'same' | 'larger' | 'smaller';

export interface GuidedTireDecision {
  readonly observation: string;
  readonly reason: string;
  readonly primaryTitle: string;
  readonly primaryHref: string;
  readonly primaryDetail: string;
  readonly secondaryTitle: string;
  readonly secondaryHref: string;
  readonly secondaryDetail: string;
  readonly finalTitle: string;
  readonly finalHref: string;
  readonly finalDetail: string;
  readonly setupTitle: string;
  readonly setupHref: string;
  readonly setupDetail: string;
}

const COPY = {
  en: {
    diameter: { same: 'Nominal diameter is unchanged.', larger: 'The proposed tire has a larger nominal diameter.', smaller: 'The proposed tire has a smaller nominal diameter.' },
    width: { same: 'Nominal section width is unchanged.', larger: 'The proposed tire is wider.', smaller: 'The proposed tire is narrower.' },
    speedReason: 'Diameter changes the theoretical speedometer relationship. This is geometry, not a vehicle-specific calibration.',
    widthReason: 'Section width changed. Wheel width, offset and real clearance need separate checks.',
    sameReason: 'Matching nominal dimensions do not prove vehicle compatibility. Check the complete tire specification.',
    speedTitle: 'Check speedometer effect', speedDetail: 'Review the change at your chosen indicated speed.',
    offsetTitle: 'Check wheel width and offset', offsetDetail: 'Compare inner position and outer stance with your actual wheel measurements.',
    specTitle: 'Check load and speed rating', specDetail: 'Compare the proposed tire specification with your vehicle requirements.',
    sizeTitle: 'Inspect the proposed size', sizeDetail: 'Open its nominal dimensions with this size already entered.',
    pcdTitle: 'Check the bolt pattern', pcdDetail: 'Measure lug geometry separately; tire size does not determine PCD.',
    finalTitle: 'Measure real clearance', finalDetail: 'Geometry alone cannot establish fitment or road-use approval.',
    setupTitle: 'Compare the complete setup', setupDetail: 'Carry both tire sizes into the wheel-and-tire workspace; add your actual wheel width and ET.',
  },
  de: {
    diameter: { same: 'Der Nenndurchmesser bleibt gleich.', larger: 'Der neue Reifen hat einen größeren Nenndurchmesser.', smaller: 'Der neue Reifen hat einen kleineren Nenndurchmesser.' },
    width: { same: 'Die Nennbreite bleibt gleich.', larger: 'Der neue Reifen ist breiter.', smaller: 'Der neue Reifen ist schmaler.' },
    speedReason: 'Der Durchmesser verändert die theoretische Tachoabweichung. Das ist Geometrie, keine fahrzeugspezifische Kalibrierung.',
    widthReason: 'Die Breite hat sich geändert. Felgenbreite, ET und realer Freigang müssen getrennt geprüft werden.',
    sameReason: 'Gleiche Nennmaße beweisen keine Fahrzeugfreigabe. Prüfen Sie die vollständige Reifenspezifikation.',
    speedTitle: 'Tachoabweichung prüfen', speedDetail: 'Die Änderung bei einer gewählten angezeigten Geschwindigkeit ansehen.',
    offsetTitle: 'Felgenbreite und ET prüfen', offsetDetail: 'Innere Position und äußeren Stand mit den echten Felgenmaßen vergleichen.',
    specTitle: 'Last- und Geschwindigkeitsindex prüfen', specDetail: 'Die neue Spezifikation mit den Fahrzeuganforderungen vergleichen.',
    sizeTitle: 'Neue Größe prüfen', sizeDetail: 'Nennmaße mit vorausgefüllter Reifengröße öffnen.',
    pcdTitle: 'Lochkreis prüfen', pcdDetail: 'Lochgeometrie separat messen; die Reifengröße bestimmt den PCD nicht.',
    finalTitle: 'Realen Freigang messen', finalDetail: 'Geometrie allein bestätigt weder Passform noch Zulassung.',
    setupTitle: 'Gesamtes Setup vergleichen', setupDetail: 'Beide Reifengrößen übernehmen; echte Felgenbreite und ET ergänzen. Der vollständige Arbeitsbereich ist derzeit auf Englisch.',
  },
  es: {
    diameter: { same: 'El diámetro nominal no cambia.', larger: 'El neumático propuesto tiene mayor diámetro nominal.', smaller: 'El neumático propuesto tiene menor diámetro nominal.' },
    width: { same: 'El ancho nominal de sección no cambia.', larger: 'El neumático propuesto es más ancho.', smaller: 'El neumático propuesto es más estrecho.' },
    speedReason: 'El diámetro cambia la relación teórica del velocímetro. Es geometría, no una calibración específica del vehículo.',
    widthReason: 'Cambió el ancho. El ancho de llanta, el offset y la holgura real requieren comprobaciones separadas.',
    sameReason: 'Las dimensiones nominales iguales no prueban compatibilidad. Compruebe la especificación completa del neumático.',
    speedTitle: 'Comprobar el velocímetro', speedDetail: 'Revisar el efecto a la velocidad indicada que elija.',
    offsetTitle: 'Comprobar ancho y offset', offsetDetail: 'Comparar posición interior y exterior con las medidas reales de llanta.',
    specTitle: 'Comprobar carga y velocidad', specDetail: 'Comparar la especificación con los requisitos del vehículo.',
    sizeTitle: 'Examinar la nueva medida', sizeDetail: 'Abrir sus dimensiones nominales con esta medida precargada.',
    pcdTitle: 'Comprobar el patrón de birlos', pcdDetail: 'Medir por separado; la medida del neumático no determina el PCD.',
    finalTitle: 'Medir la holgura real', finalDetail: 'La geometría sola no confirma ajuste ni homologación.',
    setupTitle: 'Comparar la configuración completa', setupDetail: 'Llevar ambas medidas; añadir ancho y offset reales de llanta. El espacio de trabajo completo está disponible por ahora en inglés.',
  },
  'pt-br': {
    diameter: { same: 'O diâmetro nominal não muda.', larger: 'O pneu proposto tem diâmetro nominal maior.', smaller: 'O pneu proposto tem diâmetro nominal menor.' },
    width: { same: 'A largura nominal da seção não muda.', larger: 'O pneu proposto é mais largo.', smaller: 'O pneu proposto é mais estreito.' },
    speedReason: 'O diâmetro muda a relação teórica do velocímetro. Isso é geometria, não uma calibração específica do veículo.',
    widthReason: 'A largura mudou. Largura da roda, offset (ET) e folga real precisam de verificações separadas.',
    sameReason: 'Dimensões nominais iguais não comprovam compatibilidade com o veículo. Confira a especificação completa do pneu.',
    speedTitle: 'Verificar o velocímetro', speedDetail: 'Veja o efeito na velocidade indicada que você escolher.',
    offsetTitle: 'Verificar largura e offset da roda', offsetDetail: 'Compare a posição interna e externa com as medidas reais da sua roda.',
    specTitle: 'Verificar índices de carga e velocidade', specDetail: 'Compare a especificação do pneu proposto com as exigências do veículo.',
    sizeTitle: 'Examinar a nova medida', sizeDetail: 'Abra as dimensões nominais com esta medida já preenchida.',
    pcdTitle: 'Verificar a furação (PCD)', pcdDetail: 'Meça a furação separadamente; a medida do pneu não determina o PCD.',
    finalTitle: 'Medir a folga real', finalDetail: 'A geometria sozinha não confirma o encaixe nem a homologação.',
    setupTitle: 'Comparar a configuração completa', setupDetail: 'Leve as duas medidas de pneu para o comparador de rodas e pneus e adicione a largura e o offset (ET) reais da sua roda.',
  },
  fr: {
    diameter: { same: 'Le diamètre nominal ne change pas.', larger: 'Le pneu proposé a un diamètre nominal plus grand.', smaller: 'Le pneu proposé a un diamètre nominal plus petit.' },
    width: { same: 'La largeur nominale de section ne change pas.', larger: 'Le pneu proposé est plus large.', smaller: 'Le pneu proposé est plus étroit.' },
    speedReason: 'Le diamètre modifie la relation théorique du compteur de vitesse. C’est de la géométrie, pas un étalonnage propre au véhicule.',
    widthReason: 'La largeur a changé. La largeur de jante, le déport (ET) et le dégagement réel doivent être vérifiés séparément.',
    sameReason: 'Des dimensions nominales identiques ne prouvent pas la compatibilité avec le véhicule. Vérifiez la spécification complète du pneu.',
    speedTitle: 'Vérifier le compteur de vitesse', speedDetail: 'Voyez l’effet à la vitesse affichée de votre choix.',
    offsetTitle: 'Vérifier largeur et déport de jante', offsetDetail: 'Comparez les positions intérieure et extérieure avec les mesures réelles de vos jantes.',
    specTitle: 'Vérifier indices de charge et de vitesse', specDetail: 'Comparez la spécification du pneu proposé aux exigences du véhicule.',
    sizeTitle: 'Examiner la nouvelle taille', sizeDetail: 'Ouvrez ses dimensions nominales avec cette taille déjà saisie.',
    pcdTitle: 'Vérifier l’entraxe (PCD)', pcdDetail: 'Mesurez l’entraxe séparément ; la taille du pneu ne détermine pas le PCD.',
    finalTitle: 'Mesurer le dégagement réel', finalDetail: 'La géométrie seule ne confirme ni le montage ni l’homologation.',
    setupTitle: 'Comparer la configuration complète', setupDetail: 'Reportez les deux tailles de pneus dans le comparateur jantes et pneus, puis ajoutez la largeur et le déport (ET) réels de vos jantes.',
  },
  it: {
    diameter: { same: 'Il diametro nominale non cambia.', larger: 'Il pneumatico proposto ha un diametro nominale maggiore.', smaller: 'Il pneumatico proposto ha un diametro nominale minore.' },
    width: { same: 'La larghezza nominale di sezione non cambia.', larger: 'Il pneumatico proposto è più largo.', smaller: 'Il pneumatico proposto è più stretto.' },
    speedReason: 'Il diametro cambia il rapporto teorico del tachimetro. È geometria, non una taratura specifica del veicolo.',
    widthReason: 'La larghezza è cambiata. Canale del cerchio, offset (ET) e spazio reale vanno verificati separatamente.',
    sameReason: 'Dimensioni nominali uguali non dimostrano la compatibilità con il veicolo. Controlla la specifica completa del pneumatico.',
    speedTitle: 'Verifica il tachimetro', speedDetail: 'Controlla l’effetto alla velocità indicata che scegli.',
    offsetTitle: 'Verifica canale e offset del cerchio', offsetDetail: 'Confronta posizione interna ed esterna con le misure reali del tuo cerchio.',
    specTitle: 'Verifica indici di carico e velocità', specDetail: 'Confronta la specifica del pneumatico proposto con i requisiti del veicolo.',
    sizeTitle: 'Esamina la nuova misura', sizeDetail: 'Apri le sue dimensioni nominali con questa misura già inserita.',
    pcdTitle: 'Verifica la foratura (PCD)', pcdDetail: 'Misura la foratura a parte; la misura del pneumatico non determina il PCD.',
    finalTitle: 'Misura lo spazio reale', finalDetail: 'La geometria da sola non conferma né il montaggio né l’omologazione.',
    setupTitle: 'Confronta l’assetto completo', setupDetail: 'Porta entrambe le misure nel confronto cerchi e pneumatici e aggiungi canale e offset (ET) reali del tuo cerchio.',
  },
  pl: {
    diameter: { same: 'Średnica nominalna się nie zmienia.', larger: 'Proponowana opona ma większą średnicę nominalną.', smaller: 'Proponowana opona ma mniejszą średnicę nominalną.' },
    width: { same: 'Nominalna szerokość opony się nie zmienia.', larger: 'Proponowana opona jest szersza.', smaller: 'Proponowana opona jest węższa.' },
    speedReason: 'Średnica zmienia teoretyczne wskazania prędkościomierza. To geometria, a nie kalibracja dla konkretnego pojazdu.',
    widthReason: 'Zmieniła się szerokość. Szerokość felgi, odsadzenie (ET) i rzeczywisty prześwit trzeba sprawdzić osobno.',
    sameReason: 'Takie same wymiary nominalne nie dowodzą zgodności z pojazdem. Sprawdź pełną specyfikację opony.',
    speedTitle: 'Sprawdź prędkościomierz', speedDetail: 'Zobacz efekt przy wybranej prędkości wskazywanej.',
    offsetTitle: 'Sprawdź szerokość i odsadzenie felgi', offsetDetail: 'Porównaj położenie wewnętrzne i zewnętrzne z rzeczywistymi wymiarami felgi.',
    specTitle: 'Sprawdź indeks nośności i prędkości', specDetail: 'Porównaj specyfikację proponowanej opony z wymaganiami pojazdu.',
    sizeTitle: 'Sprawdź nowy rozmiar', sizeDetail: 'Otwórz jego wymiary nominalne z już wpisanym rozmiarem.',
    pcdTitle: 'Sprawdź rozstaw śrub (PCD)', pcdDetail: 'Zmierz rozstaw śrub osobno; rozmiar opony nie określa PCD.',
    finalTitle: 'Zmierz rzeczywisty prześwit', finalDetail: 'Sama geometria nie potwierdza dopasowania ani homologacji.',
    setupTitle: 'Porównaj cały zestaw', setupDetail: 'Przenieś oba rozmiary opon do porównania felg i opon, a następnie dodaj rzeczywistą szerokość i odsadzenie (ET) felgi.',
  },
  nl: {
    diameter: { same: 'De nominale diameter verandert niet.', larger: 'De voorgestelde band heeft een grotere nominale diameter.', smaller: 'De voorgestelde band heeft een kleinere nominale diameter.' },
    width: { same: 'De nominale bandbreedte verandert niet.', larger: 'De voorgestelde band is breder.', smaller: 'De voorgestelde band is smaller.' },
    speedReason: 'De diameter verandert de theoretische verhouding van de snelheidsmeter. Dit is geometrie, geen voertuigspecifieke kalibratie.',
    widthReason: 'De breedte is veranderd. Velgbreedte, ET (inpersdiepte) en echte speling moeten apart worden gecontroleerd.',
    sameReason: 'Gelijke nominale maten bewijzen niet dat de band bij je voertuig past. Controleer de volledige bandspecificatie.',
    speedTitle: 'Snelheidsmeter controleren', speedDetail: 'Bekijk het effect bij de aangegeven snelheid die je kiest.',
    offsetTitle: 'Velgbreedte en ET controleren', offsetDetail: 'Vergelijk binnen- en buitenpositie met de echte maten van je velg.',
    specTitle: 'Draagvermogen- en snelheidsindex controleren', specDetail: 'Vergelijk de specificatie van de voorgestelde band met de eisen van je voertuig.',
    sizeTitle: 'Nieuwe maat bekijken', sizeDetail: 'Open de nominale maten met deze maat al ingevuld.',
    pcdTitle: 'Steekmaat (PCD) controleren', pcdDetail: 'Meet de steekmaat apart; de bandenmaat bepaalt de PCD niet.',
    finalTitle: 'Echte speling meten', finalDetail: 'Geometrie alleen bevestigt geen pasvorm of goedkeuring voor de weg.',
    setupTitle: 'Volledige set-up vergelijken', setupDetail: 'Neem beide bandenmaten mee naar Velgen en banden vergelijken en vul de echte velgbreedte en ET in.',
  },
  tr: {
    diameter: { same: 'Nominal çap değişmiyor.', larger: 'Önerilen lastiğin nominal çapı daha büyük.', smaller: 'Önerilen lastiğin nominal çapı daha küçük.' },
    width: { same: 'Nominal taban genişliği değişmiyor.', larger: 'Önerilen lastik daha geniş.', smaller: 'Önerilen lastik daha dar.' },
    speedReason: 'Çap, kilometre saatinin teorik oranını değiştirir. Bu geometridir, araca özel bir kalibrasyon değildir.',
    widthReason: 'Genişlik değişti. Jant genişliği, jant ofseti (ET) ve gerçek boşluk ayrı ayrı kontrol edilmelidir.',
    sameReason: 'Aynı nominal ölçüler araçla uyumluluğu kanıtlamaz. Lastiğin tüm özelliklerini kontrol edin.',
    speedTitle: 'Kilometre saatini kontrol edin', speedDetail: 'Seçtiğiniz gösterilen hızdaki etkiyi inceleyin.',
    offsetTitle: 'Jant genişliği ve ofsetini kontrol edin', offsetDetail: 'İç ve dış konumu jantınızın gerçek ölçüleriyle karşılaştırın.',
    specTitle: 'Yük ve hız endeksini kontrol edin', specDetail: 'Önerilen lastiğin özelliklerini aracınızın gereklilikleriyle karşılaştırın.',
    sizeTitle: 'Yeni ebadı inceleyin', sizeDetail: 'Bu ebat girilmiş hâlde nominal ölçülerini açın.',
    pcdTitle: 'Bijon aralığını (PCD) kontrol edin', pcdDetail: 'Bijon aralığını ayrıca ölçün; lastik ebadı PCD’yi belirlemez.',
    finalTitle: 'Gerçek boşluğu ölçün', finalDetail: 'Geometri tek başına uyumu veya homologasyonu doğrulamaz.',
    setupTitle: 'Tüm kurulumu karşılaştırın', setupDetail: 'İki lastik ebadını Jant ve Lastik Karşılaştırma aracına taşıyın; jantınızın gerçek genişliğini ve ET değerini ekleyin.',
  },
} as const satisfies Record<ToolEntityLocale, Record<string, unknown>>;

function direction(value: number): Difference { return value > 0 ? 'larger' : value < 0 ? 'smaller' : 'same'; }

export function guidedTireDecision(
  locale: ToolEntityLocale,
  original: TireToolInput,
  proposed: TireToolInput,
  diameterDifferenceMm: number,
): GuidedTireDecision {
  const copy = COPY[locale];
  const diameterChanged = direction(diameterDifferenceMm) !== 'same';
  const widthDifferenceMm = proposed.widthMm - original.widthMm;
  const widthChanged = direction(widthDifferenceMm) !== 'same';
  const size = `${proposed.widthMm}-${proposed.aspectRatio}-${proposed.rimDiameterInches}`;
  const originalSize = `${original.widthMm}-${original.aspectRatio}-${original.rimDiameterInches}`;
  const sizeHref = `${localizedToolPath(locale, 'tire-size-calculator', 'tool')}?size=${encodeURIComponent(size)}`;
  const primaryId = diameterChanged ? 'speedometer-error-calculator' : widthChanged ? 'wheel-offset-calculator' : 'tire-load-speed-rating';
  return Object.freeze({
    observation: `${copy.diameter[direction(diameterDifferenceMm)]} ${copy.width[direction(widthDifferenceMm)]}`,
    reason: diameterChanged ? copy.speedReason : widthChanged ? copy.widthReason : copy.sameReason,
    primaryTitle: diameterChanged ? copy.speedTitle : widthChanged ? copy.offsetTitle : copy.specTitle,
    primaryHref: `${localizedToolPath(locale, primaryId, 'tool')}${diameterChanged ? `?current=${encodeURIComponent(originalSize)}&new=${encodeURIComponent(size)}` : ''}`,
    primaryDetail: diameterChanged ? copy.speedDetail : widthChanged ? copy.offsetDetail : copy.specDetail,
    secondaryTitle: copy.sizeTitle,
    secondaryHref: sizeHref,
    secondaryDetail: copy.sizeDetail,
    finalTitle: copy.finalTitle,
    finalHref: localizedToolPath(locale, 'measure-my-car', 'tool'),
    finalDetail: copy.finalDetail,
    setupTitle: copy.setupTitle,
    setupHref: `${locale === 'en' ? '/fitment-studio/' : `/${locale}/fitment-studio/`}?current=${encodeURIComponent(originalSize)}&new=${encodeURIComponent(size)}#compare`,
    setupDetail: copy.setupDetail,
  });
}
