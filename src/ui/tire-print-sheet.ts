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
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date());
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
