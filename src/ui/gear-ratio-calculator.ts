import { calculateDirectDriveRpmTool, calculateGearRatioTool } from '../features/tools/gear-ratio-tool';
import { formatNumber } from './format-number';
import { toolIssueText } from './tool-presentation';

const numberValue = (form: HTMLFormElement, name: string): number => Number(new FormData(form).get(name));

export function initializeGearRatioCalculators(): void {
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
        summary.classList.add('is-pending'); metrics.replaceChildren(); matrix.replaceChildren(); return;
      }
      errors.hidden = true; errors.replaceChildren(); summary.classList.remove('is-pending');
      summary.textContent = `Your ${formatNumber(input.currentRatio, 2)} axle ratio feels like ${formatNumber(result.value.effectiveRatio, 2)} with the new tire.`;
      const rows = [
        ['Effective ratio', formatNumber(result.value.effectiveRatio, 2)],
        ['Ratio matching original feel', formatNumber(result.value.matchingAxleRatio, 2)],
        [`RPM at ${formatNumber(input.speedMph, 0)} mph · direct drive`, formatNumber(result.value.rpmAtSpeedDirectDrive, 0)],
        ['Diameter change', `${formatNumber((input.newDiameter / input.currentDiameter - 1) * 100, 2)} %`],
      ];
      metrics.replaceChildren(...rows.map(([label, value]) => { const item = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = label!; dd.textContent = value!; item.append(dt, dd); return item; }));
      speedLabel.forEach((label) => { label.textContent = formatNumber(input.speedMph, 0); });
      const cells: { rpm: number; diameter: number; ratio: number }[] = [];
      for (let diameter = 25; diameter <= 44; diameter += 1) for (const ratio of ratios) {
        const rpm = calculateDirectDriveRpmTool(diameter, ratio, input.speedMph); if (rpm.ok) cells.push({ rpm: rpm.value, diameter, ratio });
      }
      const values = cells.map(({ rpm }) => rpm); const min = Math.min(...values); const max = Math.max(...values);
      matrix.replaceChildren(...Array.from({ length: 20 }, (_, index) => index + 25).map((diameter) => {
        const row = document.createElement('tr'); const heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = `${diameter}\u2033`; row.append(heading);
        ratios.forEach((ratio) => { const value = cells.find((cell) => cell.diameter === diameter && cell.ratio === ratio)!.rpm; const cell = document.createElement('td'); const level = (value - min) / (max - min); cell.style.backgroundColor = `hsl(${205 + level * 65} 34% ${90 - level * 28}%)`; cell.textContent = formatNumber(value, 0); cell.title = `${diameter}-inch tire · ${ratio.toFixed(2)} ratio · ${formatNumber(value, 0)} RPM`; row.append(cell); }); return row;
      }));
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    calculate();
  });
}
