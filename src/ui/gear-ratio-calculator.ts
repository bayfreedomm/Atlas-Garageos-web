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
  fr: {
    pendingSummary: 'Vérifiez les champs signalés pour mettre à jour la comparaison.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Avec le nouveau pneu, votre rapport de pont de ${currentRatio} se comporte comme un ${effectiveRatio}.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `Le pneu de ${newDiameter} pouces fait se comporter le rapport monté de ${currentRatio} comme un ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} tr/min à ${speed} mph en prise directe.`,
    matched: 'Les diamètres sont identiques : le rapport effectif ne change pas.',
    changed: (percent: string, taller: boolean): string =>
      `Le nouveau pneu est ${percent} % plus ${taller ? 'haut' : 'bas'}, ce qui rend le rapport effectif numériquement plus ${taller ? 'faible' : 'élevé'}.`,
    metricEffective: 'Rapport effectif',
    metricMatching: 'Rapport retrouvant le comportement d’origine',
    metricRpm: (speed: string): string => `tr/min à ${speed} mph · prise directe`,
    metricDiameterChange: 'Variation de diamètre',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `Pneu de ${diameter}" · rapport ${ratio} · ${rpm} tr/min`,
  },
  it: {
    pendingSummary: 'Controlla i campi evidenziati per aggiornare il confronto.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Con il nuovo pneumatico il tuo rapporto al ponte di ${currentRatio} si comporta come ${effectiveRatio}.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `Il pneumatico da ${newDiameter} pollici fa comportare il rapporto montato di ${currentRatio} come ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} giri/min a ${speed} mph in presa diretta.`,
    matched: 'I diametri coincidono, quindi il rapporto effettivo non cambia.',
    changed: (percent: string, taller: boolean): string =>
      `Il nuovo pneumatico è più ${taller ? 'alto' : 'basso'} del ${percent}%, quindi il rapporto effettivo diventa numericamente più ${taller ? 'basso' : 'alto'}.`,
    metricEffective: 'Rapporto effettivo',
    metricMatching: 'Rapporto per ritrovare la sensazione originale',
    metricRpm: (speed: string): string => `Giri/min a ${speed} mph · presa diretta`,
    metricDiameterChange: 'Variazione del diametro',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `Pneumatico da ${diameter}" · rapporto ${ratio} · ${rpm} giri/min`,
  },
  'pt-br': {
    pendingSummary: 'Confira os campos destacados para atualizar a comparação.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Com o pneu novo, sua relação de diferencial de ${currentRatio} se comporta como ${effectiveRatio}.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `O pneu de ${newDiameter} polegadas faz a relação instalada de ${currentRatio} se comportar como ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} RPM a ${speed} mph em marcha direta.`,
    matched: 'Os diâmetros são iguais, então a relação efetiva não muda.',
    changed: (percent: string, taller: boolean): string =>
      `O pneu novo é ${percent}% ${taller ? 'mais alto' : 'mais baixo'}, o que deixa a relação efetiva numericamente ${taller ? 'menor' : 'maior'}.`,
    metricEffective: 'Relação efetiva',
    metricMatching: 'Relação equivalente à sensação original',
    metricRpm: (speed: string): string => `RPM a ${speed} mph · marcha direta`,
    metricDiameterChange: 'Variação de diâmetro',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `Pneu de ${diameter}" · relação ${ratio} · ${rpm} RPM`,
  },
  pl: {
    pendingSummary: 'Sprawdź zaznaczone pola, aby zaktualizować porównanie.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Z nową oponą Twoje przełożenie mostu ${currentRatio} działa jak ${effectiveRatio}.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `Opona ${newDiameter}-calowa sprawia, że zamontowane przełożenie ${currentRatio} działa jak ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} obr./min przy ${speed} mph na biegu bezpośrednim.`,
    matched: 'Średnice są takie same, więc efektywne przełożenie się nie zmienia.',
    changed: (percent: string, taller: boolean): string =>
      `Nowa opona jest o ${percent}% ${taller ? 'wyższa' : 'niższa'}, przez co efektywne przełożenie staje się liczbowo ${taller ? 'niższe' : 'wyższe'}.`,
    metricEffective: 'Efektywne przełożenie',
    metricMatching: 'Przełożenie odpowiadające oryginalnemu odczuciu',
    metricRpm: (speed: string): string => `Obr./min przy ${speed} mph · bieg bezpośredni`,
    metricDiameterChange: 'Zmiana średnicy',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `Opona ${diameter}" · przełożenie ${ratio} · ${rpm} obr./min`,
  },
  nl: {
    pendingSummary: 'Controleer de gemarkeerde velden om de vergelijking bij te werken.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Met de nieuwe band gedraagt je asverhouding van ${currentRatio} zich als ${effectiveRatio}.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `Door de band van ${newDiameter} inch gedraagt de gemonteerde verhouding van ${currentRatio} zich als ${effectiveRatio}.`,
    rpm: (rpm: string, speed: string): string => `${rpm} tpm bij ${speed} mph in directe overbrenging.`,
    matched: 'De diameters zijn gelijk, dus de effectieve verhouding verandert niet.',
    changed: (percent: string, taller: boolean): string =>
      `De nieuwe band is ${percent}% ${taller ? 'hoger' : 'lager'}, waardoor de effectieve verhouding numeriek ${taller ? 'lager' : 'hoger'} wordt.`,
    metricEffective: 'Effectieve verhouding',
    metricMatching: 'Verhouding voor het oorspronkelijke rijgevoel',
    metricRpm: (speed: string): string => `Tpm bij ${speed} mph · directe overbrenging`,
    metricDiameterChange: 'Diameterverschil',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `Band van ${diameter}" · verhouding ${ratio} · ${rpm} tpm`,
  },
  tr: {
    pendingSummary: 'Karşılaştırmayı güncellemek için işaretli alanları kontrol edin.',
    summary: (currentRatio: string, effectiveRatio: string): string =>
      `Yeni lastikle ${currentRatio} diferansiyel oranınız ${effectiveRatio} gibi davranır.`,
    context: (newDiameter: string, currentRatio: string, effectiveRatio: string): string =>
      `${newDiameter} inçlik lastik, takılı ${currentRatio} oranının ${effectiveRatio} gibi davranmasına yol açar.`,
    rpm: (rpm: string, speed: string): string => `Direkt viteste ${speed} mph hızda ${rpm} dev/dk.`,
    matched: 'Çaplar aynı olduğundan efektif oran değişmez.',
    changed: (percent: string, taller: boolean): string =>
      `Yeni lastik %${percent} daha ${taller ? 'yüksek' : 'alçak'}; bu da efektif oranı sayısal olarak ${taller ? 'düşürür' : 'yükseltir'}.`,
    metricEffective: 'Efektif oran',
    metricMatching: 'Orijinal hissi veren oran',
    metricRpm: (speed: string): string => `${speed} mph hızda dev/dk · direkt vites`,
    metricDiameterChange: 'Çap değişimi',
    matrixCellTitle: (diameter: number, ratio: string, rpm: string): string => `${diameter}" lastik · ${ratio} oran · ${rpm} dev/dk`,
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
      text('[data-gear-current-ratio]', formatNumber(input.currentRatio, 2)); text('[data-gear-effective-visual]', formatNumber(result.value.effectiveRatio, 2));
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
