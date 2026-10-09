import { compareTireSizesTool, type TireToolInput } from '../features/tools/calculator-tools';
import { tireSizeAvailability, type TireAvailabilityStatus } from '../features/tools/tire-availability';
import { formatNumber } from './format-number';
import { getPageLocale, type UiLocale } from './page-locale';

/**
 * "Print for the tire shop": a one-page, ink-friendly summary of the current comparison that a
 * visitor can print or save as PDF (the browser's print dialog offers both) and hand to a dealer.
 *
 * The sheet is built on demand from the live form values, and the print-only CSS that hides the
 * rest of the page is scoped to `body.is-printing-sheet` — so an ordinary Ctrl+P anywhere on the
 * site still prints the page as before instead of a blank sheet.
 */

interface SheetText {
  readonly button: string;
  readonly title: string;
  readonly subtitle: string;
  readonly generated: (date: string) => string;
  readonly current: string; readonly proposed: string; readonly difference: string;
  readonly size: string; readonly diameter: string; readonly sidewall: string; readonly circumference: string; readonly revsPerKm: string;
  readonly speedHeading: string;
  readonly speedLine: (indicated: string, actual: string, unit: string) => string;
  readonly availabilityHeading: string;
  readonly availability: Readonly<Record<TireAvailabilityStatus, string>>;
  readonly checklistHeading: string;
  readonly checklist: readonly string[];
  readonly disclaimer: string;
  readonly reopen: string;
}

const TEXT: Readonly<Record<UiLocale, SheetText>> = {
  en: {
    button: 'Print for the tire shop',
    title: 'Tire size comparison',
    subtitle: 'Summary to discuss with your tire dealer',
    generated: (date) => `Created ${date} with Atlas GarageOS`,
    current: 'Current', proposed: 'Proposed', difference: 'Difference',
    size: 'Size', diameter: 'Overall diameter', sidewall: 'Sidewall height', circumference: 'Circumference', revsPerKm: 'Revolutions per km',
    speedHeading: 'Speedometer effect (theoretical)',
    speedLine: (indicated, actual, unit) => `Indicated ${indicated} ${unit} → actual ≈ ${actual} ${unit}`,
    availabilityHeading: 'Is the size manufactured?',
    availability: { listed: 'In our reference list of production sizes.', unlisted: 'Not in our reference list — may be rare; confirm availability.', nonstandard: 'Unusual notation — double-check the size.' },
    checklistHeading: 'Please confirm with the dealer',
    checklist: [
      'Load index is at least what the vehicle requires',
      'Speed rating is at least what the vehicle requires',
      'Rim width is inside the approved range for this tire width',
      'Clearance at full steering lock and full suspension compression',
      'Vehicle approval / registration requirements for a size change',
      'Speedometer and TPMS behaviour after the change',
    ],
    disclaimer: 'Nominal geometry only. This sheet is not a fitment approval, stock check or safety confirmation.',
    reopen: 'Reopen this comparison:',
  },
  de: {
    button: 'Für den Reifenhändler drucken',
    title: 'Reifengrößen-Vergleich',
    subtitle: 'Zusammenfassung für das Gespräch mit dem Reifenhändler',
    generated: (date) => `Erstellt am ${date} mit Atlas GarageOS`,
    current: 'Aktuell', proposed: 'Geplant', difference: 'Differenz',
    size: 'Größe', diameter: 'Gesamtdurchmesser', sidewall: 'Flankenhöhe', circumference: 'Abrollumfang', revsPerKm: 'Umdrehungen pro km',
    speedHeading: 'Tachoabweichung (theoretisch)',
    speedLine: (indicated, actual, unit) => `Angezeigt ${indicated} ${unit} → tatsächlich ≈ ${actual} ${unit}`,
    availabilityHeading: 'Wird die Größe hergestellt?',
    availability: { listed: 'In unserer Referenzliste der Serienreifengrößen.', unlisted: 'Nicht in unserer Referenzliste — evtl. selten; Verfügbarkeit klären.', nonstandard: 'Ungewöhnliche Angabe — Größe bitte prüfen.' },
    checklistHeading: 'Bitte mit dem Händler klären',
    checklist: [
      'Tragfähigkeitsindex mindestens wie vom Fahrzeug gefordert',
      'Geschwindigkeitsindex mindestens wie vom Fahrzeug gefordert',
      'Felgenbreite im zulässigen Bereich für diese Reifenbreite',
      'Freigang bei vollem Lenkeinschlag und eingefedertem Fahrwerk',
      'Zulassung: Freigabe/ABE, ggf. Eintragung (TÜV/DEKRA)',
      'Tacho und Reifendruckkontrolle (RDKS) nach dem Wechsel',
    ],
    disclaimer: 'Nur nominale Geometrie. Dieses Blatt ist keine Passformfreigabe, Verfügbarkeitsprüfung oder Sicherheitsbestätigung.',
    reopen: 'Vergleich erneut öffnen:',
  },
  es: {
    button: 'Imprimir para el taller',
    title: 'Comparación de medidas de neumático',
    subtitle: 'Resumen para hablar con su distribuidor de neumáticos',
    generated: (date) => `Creado el ${date} con Atlas GarageOS`,
    current: 'Actual', proposed: 'Propuesto', difference: 'Diferencia',
    size: 'Medida', diameter: 'Diámetro total', sidewall: 'Altura del flanco', circumference: 'Circunferencia', revsPerKm: 'Revoluciones por km',
    speedHeading: 'Efecto en el velocímetro (teórico)',
    speedLine: (indicated, actual, unit) => `Indicado ${indicated} ${unit} → real ≈ ${actual} ${unit}`,
    availabilityHeading: '¿Se fabrica la medida?',
    availability: { listed: 'En nuestra lista de referencia de medidas de serie.', unlisted: 'No está en nuestra lista — puede ser poco común; confirme disponibilidad.', nonstandard: 'Notación inusual — revise la medida.' },
    checklistHeading: 'Confirme con el distribuidor',
    checklist: [
      'Índice de carga al menos el que exige el vehículo',
      'Código de velocidad al menos el que exige el vehículo',
      'Ancho de llanta dentro del rango aprobado para este ancho de neumático',
      'Holgura con el volante a tope y la suspensión comprimida',
      'Homologación / requisitos de ITV para el cambio de medida',
      'Velocímetro y sensores de presión (TPMS) tras el cambio',
    ],
    disclaimer: 'Solo geometría nominal. Esta hoja no es una aprobación de montaje, consulta de stock ni confirmación de seguridad.',
    reopen: 'Volver a abrir esta comparación:',
  },
  'pt-br': {
    button: 'Imprimir para a borracharia',
    title: 'Comparação de medidas de pneu',
    subtitle: 'Resumo para conversar com a sua loja de pneus',
    generated: (date) => `Criado em ${date} com Atlas GarageOS`,
    current: 'Atual', proposed: 'Proposto', difference: 'Diferença',
    size: 'Medida', diameter: 'Diâmetro total', sidewall: 'Altura do flanco', circumference: 'Circunferência', revsPerKm: 'Rotações por km',
    speedHeading: 'Efeito no velocímetro (teórico)',
    speedLine: (indicated, actual, unit) => `Indicado ${indicated} ${unit} → real ≈ ${actual} ${unit}`,
    availabilityHeading: 'Essa medida é fabricada?',
    availability: { listed: 'Consta na nossa lista de referência de medidas de série.', unlisted: 'Não consta na nossa lista — pode ser rara; confirme a disponibilidade.', nonstandard: 'Notação incomum — confira a medida.' },
    checklistHeading: 'Confirme com a loja',
    checklist: [
      'Índice de carga pelo menos igual ao exigido pelo veículo',
      'Índice de velocidade pelo menos igual ao exigido pelo veículo',
      'Largura da roda dentro da faixa aprovada para esta largura de pneu',
      'Folga com o volante todo esterçado e a suspensão totalmente comprimida',
      'Homologação / exigências legais para a mudança de medida',
      'Velocímetro e sensores de pressão (TPMS) após a troca',
    ],
    disclaimer: 'Apenas geometria nominal. Esta folha não é uma aprovação de montagem, consulta de estoque nem confirmação de segurança.',
    reopen: 'Reabrir esta comparação:',
  },
  fr: {
    button: 'Imprimer pour le garagiste',
    title: 'Comparaison de tailles de pneus',
    subtitle: 'Résumé à présenter à votre vendeur de pneus',
    generated: (date) => `Créé le ${date} avec Atlas GarageOS`,
    current: 'Actuel', proposed: 'Proposé', difference: 'Écart',
    size: 'Taille', diameter: 'Diamètre total', sidewall: 'Hauteur du flanc', circumference: 'Circonférence', revsPerKm: 'Tours par km',
    speedHeading: 'Effet sur le compteur de vitesse (théorique)',
    speedLine: (indicated, actual, unit) => `Affiché ${indicated} ${unit} → réel ≈ ${actual} ${unit}`,
    availabilityHeading: 'Cette taille est-elle fabriquée ?',
    availability: { listed: 'Présente dans notre liste de référence des tailles de série.', unlisted: 'Absente de notre liste de référence — peut-être rare ; vérifiez la disponibilité.', nonstandard: 'Notation inhabituelle — revérifiez la taille.' },
    checklistHeading: 'À confirmer avec le professionnel',
    checklist: [
      'Indice de charge au moins égal à celui exigé pour le véhicule',
      'Indice de vitesse au moins égal à celui exigé pour le véhicule',
      'Largeur de jante dans la plage homologuée pour cette largeur de pneu',
      'Dégagement en braquage maximal et suspension totalement comprimée',
      'Homologation / mentions de la carte grise pour un changement de taille',
      'Compteur de vitesse et capteurs de pression (TPMS) après le changement',
    ],
    disclaimer: 'Géométrie nominale uniquement. Cette fiche n’est ni une validation de montage, ni une vérification de stock, ni une confirmation de sécurité.',
    reopen: 'Rouvrir cette comparaison :',
  },
  it: {
    button: 'Stampa per il gommista',
    title: 'Confronto misure pneumatici',
    subtitle: 'Riepilogo da discutere con il tuo gommista',
    generated: (date) => `Creato il ${date} con Atlas GarageOS`,
    current: 'Attuale', proposed: 'Proposto', difference: 'Differenza',
    size: 'Misura', diameter: 'Diametro totale', sidewall: 'Altezza della spalla', circumference: 'Circonferenza', revsPerKm: 'Giri per km',
    speedHeading: 'Effetto sul tachimetro (teorico)',
    speedLine: (indicated, actual, unit) => `Indicata ${indicated} ${unit} → reale ≈ ${actual} ${unit}`,
    availabilityHeading: 'Questa misura viene prodotta?',
    availability: { listed: 'Presente nella nostra lista di riferimento delle misure di serie.', unlisted: 'Non presente nella nostra lista — potrebbe essere rara; verifica la disponibilità.', nonstandard: 'Notazione insolita — ricontrolla la misura.' },
    checklistHeading: 'Da confermare con il gommista',
    checklist: [
      'Indice di carico almeno pari a quello richiesto dal veicolo',
      'Codice di velocità almeno pari a quello richiesto dal veicolo',
      'Canale del cerchio nell’intervallo approvato per questa larghezza di pneumatico',
      'Spazio a sterzo tutto girato e sospensione completamente compressa',
      'Omologazione / aggiornamento della carta di circolazione per il cambio misura',
      'Tachimetro e sensori di pressione (TPMS) dopo il cambio',
    ],
    disclaimer: 'Solo geometria nominale. Questo foglio non è un’approvazione al montaggio, una verifica di disponibilità né una conferma di sicurezza.',
    reopen: 'Riapri questo confronto:',
  },
  pl: {
    button: 'Drukuj dla wulkanizacji',
    title: 'Porównanie rozmiarów opon',
    subtitle: 'Podsumowanie do rozmowy ze sprzedawcą opon',
    generated: (date) => `Utworzono ${date} w Atlas GarageOS`,
    current: 'Obecny', proposed: 'Proponowany', difference: 'Różnica',
    size: 'Rozmiar', diameter: 'Średnica całkowita', sidewall: 'Wysokość ścianki bocznej', circumference: 'Obwód', revsPerKm: 'Obroty na km',
    speedHeading: 'Wpływ na prędkościomierz (teoretyczny)',
    speedLine: (indicated, actual, unit) => `Wskazanie ${indicated} ${unit} → rzeczywista ≈ ${actual} ${unit}`,
    availabilityHeading: 'Czy ten rozmiar jest produkowany?',
    availability: { listed: 'Znajduje się na naszej liście referencyjnej rozmiarów seryjnych.', unlisted: 'Brak na naszej liście referencyjnej — może być rzadki; potwierdź dostępność.', nonstandard: 'Nietypowy zapis — sprawdź rozmiar jeszcze raz.' },
    checklistHeading: 'Potwierdź ze sprzedawcą',
    checklist: [
      'Indeks nośności co najmniej taki, jakiego wymaga pojazd',
      'Indeks prędkości co najmniej taki, jakiego wymaga pojazd',
      'Szerokość felgi w zatwierdzonym zakresie dla tej szerokości opony',
      'Prześwit przy pełnym skręcie kół i pełnym ugięciu zawieszenia',
      'Homologacja / wymogi rejestracyjne przy zmianie rozmiaru',
      'Działanie prędkościomierza i czujników ciśnienia (TPMS) po zmianie',
    ],
    disclaimer: 'Wyłącznie geometria nominalna. Ten arkusz nie jest zatwierdzeniem montażu, sprawdzeniem dostępności ani potwierdzeniem bezpieczeństwa.',
    reopen: 'Otwórz ponownie to porównanie:',
  },
  nl: {
    button: 'Afdrukken voor de bandenzaak',
    title: 'Bandenmaten vergelijken',
    subtitle: 'Samenvatting om te bespreken met je bandenspecialist',
    generated: (date) => `Gemaakt op ${date} met Atlas GarageOS`,
    current: 'Huidig', proposed: 'Voorgesteld', difference: 'Verschil',
    size: 'Maat', diameter: 'Totale diameter', sidewall: 'Wanghoogte', circumference: 'Omtrek', revsPerKm: 'Omwentelingen per km',
    speedHeading: 'Effect op de snelheidsmeter (theoretisch)',
    speedLine: (indicated, actual, unit) => `Aangegeven ${indicated} ${unit} → werkelijk ≈ ${actual} ${unit}`,
    availabilityHeading: 'Wordt deze maat geproduceerd?',
    availability: { listed: 'Staat in onze referentielijst van seriematen.', unlisted: 'Staat niet in onze referentielijst — mogelijk zeldzaam; controleer de beschikbaarheid.', nonstandard: 'Ongebruikelijke notatie — controleer de maat nog eens.' },
    checklistHeading: 'Controleer samen met de bandenspecialist',
    checklist: [
      'Loadindex minstens wat het voertuig vereist',
      'Snelheidsindex minstens wat het voertuig vereist',
      'Velgbreedte binnen het goedgekeurde bereik voor deze bandbreedte',
      'Speling bij volledig ingesturde wielen en volledig ingeveerde vering',
      'Goedkeuring / kentekenvereisten bij een andere bandenmaat',
      'Snelheidsmeter en bandenspanningssensoren (TPMS) na de wissel',
    ],
    disclaimer: 'Alleen nominale geometrie. Dit blad is geen goedkeuring van de pasvorm, voorraadcontrole of veiligheidsbevestiging.',
    reopen: 'Open deze vergelijking opnieuw:',
  },
  tr: {
    button: 'Lastikçi için yazdır',
    title: 'Lastik ebadı karşılaştırması',
    subtitle: 'Lastik bayinizle konuşmak için özet',
    generated: (date) => `${date} tarihinde Atlas GarageOS ile oluşturuldu`,
    current: 'Mevcut', proposed: 'Önerilen', difference: 'Fark',
    size: 'Ebat', diameter: 'Toplam çap', sidewall: 'Yanak yüksekliği', circumference: 'Çevre', revsPerKm: 'Km başına devir',
    speedHeading: 'Kilometre saatine etkisi (teorik)',
    speedLine: (indicated, actual, unit) => `Gösterilen ${indicated} ${unit} → gerçek ≈ ${actual} ${unit}`,
    availabilityHeading: 'Bu ebat üretiliyor mu?',
    availability: { listed: 'Seri üretim ebatları referans listemizde yer alıyor.', unlisted: 'Referans listemizde yok — nadir olabilir; bulunabilirliği teyit edin.', nonstandard: 'Alışılmadık gösterim — ebadı tekrar kontrol edin.' },
    checklistHeading: 'Lütfen bayiyle teyit edin',
    checklist: [
      'Yük endeksi en az aracın gerektirdiği değerde',
      'Hız endeksi en az aracın gerektirdiği değerde',
      'Jant genişliği bu lastik genişliği için onaylı aralıkta',
      'Direksiyon tam kırıkken ve süspansiyon tam sıkışmışken boşluk',
      'Ebat değişikliği için homologasyon / ruhsat gereklilikleri',
      'Değişiklikten sonra kilometre saati ve lastik basınç sensörleri (TPMS)',
    ],
    disclaimer: 'Yalnızca nominal geometri. Bu sayfa bir montaj onayı, stok kontrolü veya güvenlik teyidi değildir.',
    reopen: 'Bu karşılaştırmayı yeniden açın:',
  },
};

const tireValue = (form: HTMLFormElement, prefix: string): TireToolInput => {
  const n = (name: string): number => Number((form.elements.namedItem(`${prefix}${name}`) as HTMLInputElement | null)?.value ?? NaN);
  return { widthMm: n('widthMm'), aspectRatio: n('aspectRatio'), rimDiameterInches: n('rimDiameterInches') };
};

const sizeText = (t: TireToolInput): string => `${t.widthMm}/${t.aspectRatio} R${t.rimDiameterInches}`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function signed(value: number, digits: number): string {
  const formatted = formatNumber(Math.abs(value), digits);
  return Math.abs(value) < 0.5 * 10 ** -digits ? formatNumber(0, digits) : `${value > 0 ? '+' : '−'}${formatted}`;
}

/** Returns null (and builds nothing) when the current inputs are not a valid comparison. */
export function buildTirePrintSheet(form: HTMLFormElement, locale: UiLocale = getPageLocale()): HTMLElement | null {
  const original = tireValue(form, 'original-');
  const proposed = tireValue(form, 'new-');
  const result = compareTireSizesTool(original, proposed);
  if (!result.ok) return null;
  const r = result.value;
  const t = TEXT[locale];

  const sheet = el('section', undefined, 'print-sheet');
  sheet.dataset.printSheet = '';
  sheet.setAttribute('aria-hidden', 'true');

  const header = el('header');
  header.append(el('p', 'Atlas GarageOS', 'print-sheet__brand'), el('h1', `${t.title}: ${sizeText(original)} → ${sizeText(proposed)}`), el('p', t.subtitle));
  const date = new Intl.DateTimeFormat(locale === 'pt-br' ? 'pt-BR' : locale, { dateStyle: 'long' }).format(new Date());
  header.append(el('p', t.generated(date), 'print-sheet__meta'));
  sheet.append(header);

  const table = el('table');
  const head = el('tr');
  head.append(el('th', ''), el('th', t.current), el('th', t.proposed), el('th', t.difference));
  const thead = el('thead');
  thead.append(head);
  table.append(thead);
  const body = el('tbody');
  const row = (label: string, a: string, b: string, diff: string): void => {
    const tr = el('tr');
    tr.append(el('th', label), el('td', a), el('td', b), el('td', diff));
    body.append(tr);
  };
  row(t.size, sizeText(original), sizeText(proposed), '');
  row(t.diameter, `${formatNumber(r.current.overallDiameterMm, 1)} mm`, `${formatNumber(r.proposed.overallDiameterMm, 1)} mm`, `${signed(r.diameterDifferenceMm, 1)} mm (${signed(r.diameterDifferencePercent, 2)} %)`);
  row(t.sidewall, `${formatNumber(r.current.sidewallHeightMm, 1)} mm`, `${formatNumber(r.proposed.sidewallHeightMm, 1)} mm`, `${signed(r.sidewallDifferenceMm, 1)} mm`);
  row(t.circumference, `${formatNumber(r.current.circumferenceMm, 0)} mm`, `${formatNumber(r.proposed.circumferenceMm, 0)} mm`, `${signed(r.circumferenceDifferenceMm, 0)} mm`);
  row(t.revsPerKm, formatNumber(r.current.revolutionsPerKilometer, 1), formatNumber(r.proposed.revolutionsPerKilometer, 1), signed(r.proposed.revolutionsPerKilometer - r.current.revolutionsPerKilometer, 1));
  table.append(body);
  sheet.append(table);

  const factor = 1 + r.speedometerDifferencePercent / 100;
  const speed = el('section');
  speed.append(el('h2', t.speedHeading));
  const speeds = el('ul');
  for (const [indicated, unit] of [[50, 'km/h'], [100, 'km/h'], [130, 'km/h'], [60, 'mph']] as const) {
    speeds.append(el('li', t.speedLine(formatNumber(indicated, 0), formatNumber(indicated * factor, 1), unit)));
  }
  speed.append(speeds);

  const availability = el('section');
  availability.append(el('h2', t.availabilityHeading));
  const availabilityList = el('ul');
  for (const [label, tire] of [[t.current, original], [t.proposed, proposed]] as const) {
    availabilityList.append(el('li', `${label} ${sizeText(tire)}: ${t.availability[tireSizeAvailability(tire).status]}`));
  }
  availability.append(availabilityList);

  const columns = el('div', undefined, 'print-sheet__columns');
  columns.append(speed, availability);
  sheet.append(columns);

  const checklist = el('section');
  checklist.append(el('h2', t.checklistHeading));
  const items = el('ul', undefined, 'print-sheet__checklist');
  for (const item of t.checklist) items.append(el('li', item));
  checklist.append(items);
  sheet.append(checklist);

  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ current: `${original.widthMm}-${original.aspectRatio}-${original.rimDiameterInches}`, new: `${proposed.widthMm}-${proposed.aspectRatio}-${proposed.rimDiameterInches}` }).toString();
  url.hash = '';
  const footer = el('footer');
  footer.append(el('p', t.disclaimer), el('p', `${t.reopen} ${url.toString()}`, 'print-sheet__url'));
  sheet.append(footer);
  return sheet;
}

export function initializeTirePrintSheet(form: HTMLFormElement): void {
  if (form.querySelector('[data-print-sheet-button]')) return;
  const locale = getPageLocale();
  const button = el('button', TEXT[locale].button, 'secondary print-sheet-button');
  button.type = 'button';
  button.dataset.printSheetButton = '';
  const anchor = form.querySelector('[data-share-result]') ?? form.querySelector('button[type="submit"]');
  if (anchor) anchor.after(button); else form.append(button);

  button.addEventListener('click', () => {
    const sheet = buildTirePrintSheet(form, locale);
    if (!sheet) { form.requestSubmit(); return; } // surfaces the form's own validation errors
    document.querySelector('[data-print-sheet]')?.remove();
    document.body.append(sheet);
    document.body.classList.add('is-printing-sheet');
    const cleanup = (): void => { document.body.classList.remove('is-printing-sheet'); sheet.remove(); };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  });
}
