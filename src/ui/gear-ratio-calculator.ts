import { calculateDirectDriveRpmTool, calculateGearRatioTool } from '../features/tools/gear-ratio-tool';
import { formatNumber } from './format-number';
import { getPageLocale } from './page-locale';
import { toolIssueText } from './tool-presentation';

const GEAR_RATIO_LABELS = {
  en: {
    pendingSummary: 'Check the highlighted inputs to update the comparison.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Your ${currentRatio} axle ratio feels like ${effectiveRatio} with the new tire.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `The ${newDiameter}-inch tire makes the installed ${currentRatio} ratio behave like ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} RPM at ${speed} mph in direct drive.`,
    matched: 'The diameters match, so effective ratio is unchanged.',
    changed: (percent: string, taller: boolean): string =>
      `The new tire is ${percent}% ${taller ? 'taller' : 'shorter'}, making the effective ratio numerically ${taller ? 'lower' : 'higher'}.`,
    metricEffective: 'Effective ratio',
    metricMatching: 'Ratio matching original feel',
    metricRpm: (speed: string): string => `RPM at ${speed} mph · direct drive`,
    metricDiameterChange: 'Diameter change',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `${diameter}-inch tire · ${ratio} ratio · ${rpm} RPM`,
  },
  de: {
    pendingSummary: 'Prüfen Sie die markierten Felder, um den Vergleich zu aktualisieren.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Ihre Achsübersetzung von ${currentRatio} verhält sich mit dem neuen Reifen wie ${effectiveRatio}.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `Der ${newDiameter}-Zoll-Reifen lässt die verbaute Übersetzung von ${currentRatio} wie ${effectiveRatio} wirken.`,
    rpm: (rpm: string, speed: string): string => `${rpm} RPM bei ${speed} mph im direkten Antrieb.`,
    matched: 'Die Durchmesser stimmen überein, daher bleibt die effektive Übersetzung unverändert.',
    changed: (percent: string, taller: boolean): string =>
      `Der neue Reifen ist um ${percent} % ${taller ? 'höher' : 'niedriger'}, wodurch die effektive Übersetzung zahlenmäßig ${taller ? 'niedriger' : 'höher'} wird.`,
    metricEffective: 'Effektive Übersetzung',
    metricMatching: 'Übersetzung für ursprüngliches Fahrgefühl',
    metricRpm: (speed: string): string => `RPM bei ${speed} mph · direkter Antrieb`,
    metricDiameterChange: 'Durchmesseränderung',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `${diameter}-Zoll-Reifen · Übersetzung ${ratio} · ${rpm} RPM`,
  },
  es: {
    pendingSummary: 'Revise los campos marcados para actualizar la comparación.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Su relación de eje de ${currentRatio} se comporta como ${effectiveRatio} con el neumático nuevo.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `El neumático de ${newDiameter} pulgadas hace que la relación instalada de ${currentRatio} se comporte como ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} RPM a ${speed} mph en transmisión directa.`,
    matched: 'Los diámetros coinciden, por lo que la relación efectiva no cambia.',
    changed: (percent: string, taller: boolean): string =>
      `El neumático nuevo es un ${percent}% ${taller ? 'más alto' : 'más bajo'}, lo que hace que la relación efectiva sea numéricamente ${taller ? 'menor' : 'mayor'}.`,
    metricEffective: 'Relación efectiva',
    metricMatching: 'Relación equivalente a la sensación original',
    metricRpm: (speed: string): string => `RPM a ${speed} mph · transmisión directa`,
    metricDiameterChange: 'Cambio de diámetro',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `Neumático de ${diameter}" · relación ${ratio} · ${rpm} RPM`,
  },
} as const;

const numberValue = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));

export function initializeGearRatioCalculators(): void {
  const t = GEAR_RATIO_LABELS[getPageLocale()];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="gear-ratio"]').forEach((form) => {
    const errors = form.querySelector<HTMLElement>('[data-errors]')!;
    const summary = form.querySelector<HTMLElement>('[data-result-summary]')!;
    const metrics = form.querySelector<HTMLDListElement>('[data-results]')!;
    const matrix = form.querySelector<HTMLTableSectionElement>('[data-rpm-matrix]')!;
    const speedLabel = form.querySelectorAll<HTMLElement>('[data-matrix-speed]');
    const ratios = [3.08, 3.31, 3.55, 3.73, 4.1, 4.56];

    const calculate = (): void => {
      const input = { currentDiameter: numberValue(form, 'currentDiameter'), newDiameter: numberValue(form, 'newDiameter'), currentRatio: numberValue(form, 'currentRatio'), speedMph: numberValue(form, 'speedMph') };
      const result = calculateGearRatioTool(input);
      if (!result.ok) {
        errors.textContent = result.issues.map(toolIssueText).join(' '); errors.hidden = false;
        summary.textContent = t.pendingSummary; summary.classList.add('is-pending'); metrics.replaceChildren(); matrix.replaceChildren();
        form.querySelector('[data-gear-answer]')?.classList.add('is-pending'); form.querySelector('[data-gear-visual]')?.classList.add('is-pending'); return;
      }
      errors.hidden = true; errors.replaceChildren(); summary.classList.remove('is-pending');
      summary.textContent = t.summary(formatNumber(input.currentRatio, 2), formatNumber(result.value.effectiveRatio, 2));
      const text = (selector: string, value: string): void => { const node = form.querySelector<HTMLElement>(selector); if (node) node.textContent = value; };
      text('[data-gear-effective]', formatNumber(result.value.effectiveRatio, 2)); text('[data-gear-matching]', formatNumber(result.value.matchingAxleRatio, 2));
      text('[data-gear-context]', t.context(formatNumber(input.newDiameter, 1), formatNumber(input.currentRatio, 2), formatNumber(result.value.effectiveRatio, 2)));
      text('[data-gear-rpm]', t.rpm(formatNumber(result.value.rpmAtSpeedDirectDrive, 0), formatNumber(input.speedMph, 0)));
      text('[data-gear-current-diameter]', `${formatNumber(input.currentDiameter, 1)} in`); text('[data-gear-new-diameter]', `${formatNumber(input.newDiameter, 1)} in`);
      const change = (input.newDiameter / input.currentDiameter - 1) * 100;
      text('[data-gear-visual-meaning]', `${Math.abs(change) < .005 ? t.matched : t.changed(formatNumber(Math.abs(change), 1), change > 0)}`);
      const currentWheel = form.querySelector<HTMLElement>('[data-gear-current-wheel]'); const newWheel = form.querySelector<HTMLElement>('[data-gear-new-wheel]');
      const maxDiameter = Math.max(input.currentDiameter, input.newDiameter); if (currentWheel) currentWheel.style.setProperty('--gear-wheel-size', `${input.currentDiameter / maxDiameter * 7.5}rem`); if (newWheel) newWheel.style.setProperty('--gear-wheel-size', `${input.newDiameter / maxDiameter * 7.5}rem`);
      form.querySelector('[data-gear-answer]')?.classList.remove('is-pending'); form.querySelector('[data-gear-visual]')?.classList.remove('is-pending');
      const rows = [
        [t.metricEffective, formatNumber(result.value.effectiveRatio, 2)],
        [t.metricMatching, formatNumber(result.value.matchingAxleRatio, 2)],
        [t.metricRpm(formatNumber(input.speedMph, 0)), formatNumber(result.value.rpmAtSpeedDirectDrive, 0)],
        [t.metricDiameterChange, `${formatNumber((input.newDiameter / input.currentDiameter - 1) * 100, 2)} %`],
      ];
      metrics.replaceChildren(...rows.map(([label, value]) => { const item = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = label!; dd.textContent = value!; item.append(dt, dd); return item; }));
      speedLabel.forEach((label) => { label.textContent = formatNumber(input.speedMph, 0); });
      const cells: { rpm: number; diameter: number; ratio: number }[] = [];
      for (let diameter = 25; diameter <= 44; diameter += 1) for (const ratio of ratios) {
        const rpm = calculateDirectDriveRpmTool(diameter, ratio, input.speedMph); if (rpm.ok) cells.push({ rpm: rpm.value, diameter, ratio });
      }
      const values = cells.map(({ rpm }) => rpm); const min = Math.min(...values); const max = Math.max(...values);
      matrix.replaceChildren(...Array.from({ length: 20 }, (_, index) => index + 25).map((diameter) => {
        const row = document.createElement('tr'); const heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = `${diameter}″`; row.append(heading);
        ratios.forEach((ratio) => { const value = cells.find((cell) => cell.diameter === diameter && cell.ratio === ratio)!.rpm; const cell = document.createElement('td'); const level = (value - min) / (max - min); cell.style.backgroundColor = `hsl(${205 + level * 65} 34% ${90 - level * 28}%)`; cell.textContent = formatNumber(value, 0); cell.title = t.matrixCellTitle(diameter, ratio.toFixed(2), formatNumber(value, 0)); row.append(cell); }); return row;
      }));
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
