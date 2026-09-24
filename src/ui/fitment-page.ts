import type { GarageState, SavedSetup } from '../domain/garage';
import type { ValidationIssue } from '../domain/validation';
import { GarageService } from '../features/garage/garage-service';
import { compareSetupInputs, type SetupInput } from '../features/compare/compare-setups';
import { createSetupFromInput } from '../features/compare/compare-setups';
import { createVehicleClearanceProfile, type VehicleClearanceProfile } from '../domain/clearance';
import { createFitmentMap, findNearestGreenAlternatives, type FitmentMapCell, type FitmentMapResult } from '../core/fitment/map';
import type { CombinedFitmentCandidate, RankedCriterion } from '../core/fitment/combined-candidate';
import { preflightFitmentExplorer, searchFitmentExplorer, type FitmentExplorerInput } from '../features/fitment-explorer/fitment-explorer';
import { createSetupShareHash, decodeSetupShareHash, type SetupShareV1 } from '../features/share/setup-share';
import { fitmentStudioText } from '../localization/fitment-studio-catalog';
import { getPageLocale } from './page-locale';
import { createBrowserGarageRepository } from '../storage/local-storage-garage-repository';
import { formatNumber } from './format-number';
import { tireScaleMapping, wheelOffsetVisualMapping } from './fitment-visualizer-model';
import { activeGaragePresentation, fitmentComparisonSummary, mapCellPresentation, measurementErrorGuidance, PRODUCT_NAVIGATION, resultCardModel, validationIssueText, wizardProgress, type ProductSection } from './presentation-model';
import { parseJourneyPrefill } from './journey-prefill';

const required = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required UI element: ${selector}`);
  return element;
};

const input = (name: string): HTMLInputElement => required<HTMLInputElement>(`[name="${name}"]`);

function readSetup(prefix: string): SetupInput {
  return {
    tireWidthMm: Number(input(`${prefix}-tireWidthMm`).value),
    tireAspectRatio: Number(input(`${prefix}-tireAspectRatio`).value),
    rimDiameterInches: Number(input(`${prefix}-rimDiameterInches`).value),
    wheelWidthInches: Number(input(`${prefix}-wheelWidthInches`).value),
    wheelOffsetMm: Number(input(`${prefix}-wheelOffsetMm`).value),
  };
}

function writeSetup(prefix: string, setup: SetupInput): void {
  input(`${prefix}-tireWidthMm`).value = String(setup.tireWidthMm);
  input(`${prefix}-tireAspectRatio`).value = String(setup.tireAspectRatio);
  input(`${prefix}-rimDiameterInches`).value = String(setup.rimDiameterInches);
  input(`${prefix}-wheelWidthInches`).value = String(setup.wheelWidthInches);
  input(`${prefix}-wheelOffsetMm`).value = String(setup.wheelOffsetMm);
  const wheelDiameter = document.querySelector<HTMLInputElement>(`[data-wheel-diameter="${prefix}"]`);
  if (wheelDiameter) wheelDiameter.value = String(setup.rimDiameterInches);
}

const setupToInput = (saved: SavedSetup): SetupInput => ({
  tireWidthMm: saved.setup.tire.widthMm,
  tireAspectRatio: saved.setup.tire.aspectRatio,
  rimDiameterInches: saved.setup.tire.rimDiameterInches,
  wheelWidthInches: saved.setup.wheel.widthInches,
  wheelOffsetMm: saved.setup.wheel.offsetMm,
});

const describeSetup = (saved: SavedSetup): string =>
  `${saved.setup.tire.widthMm}/${saved.setup.tire.aspectRatio} R${saved.setup.tire.rimDiameterInches} · ${saved.setup.wheel.diameterInches}x${saved.setup.wheel.widthInches} ET${saved.setup.wheel.offsetMm}`;

function appendButton(parent: Element, label: string, action: () => void | Promise<void>, className?: string): void {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  if (className) button.className = className;
  button.addEventListener('click', () => void action());
  parent.append(button);
}

function showIssues(container: HTMLElement, issues: readonly ValidationIssue[]): void {
  container.replaceChildren();
  const list = document.createElement('ul');
  for (const issue of issues) {
    const item = document.createElement('li');
    item.textContent = validationIssueText(issue);
    list.append(item);
  }
  container.append(list);
  const guidance = measurementErrorGuidance(issues);
  if (guidance) {
    const message = document.createElement('p');
    message.textContent = guidance.message;
    const link = document.createElement('a');
    link.className = 'button secondary error-cta';
    link.href = guidance.href;
    link.textContent = guidance.ctaLabel;
    container.append(message, link);
  }
  container.hidden = false;
}

export async function initializeFitmentPage(): Promise<void> {
  const locale = getPageLocale();
  const t = fitmentStudioText[locale];
  const form = required<HTMLFormElement>('#fitment-form');
  const results = required<HTMLDListElement>('#results');
  const errors = required<HTMLDivElement>('#errors');
  const status = required<HTMLParagraphElement>('#garage-status');
  const garageList = required<HTMLDivElement>('#saved-setups');
  const sharedPanel = required<HTMLElement>('#shared-setup');
  const mapContainer = required<HTMLDivElement>('#fitment-map');
  const mapDetail = required<HTMLElement>('#map-detail');
  const mapErrors = required<HTMLDivElement>('#map-errors');
  const whatFitsSummary = required<HTMLParagraphElement>('#what-fits-summary');
  const whatFitsErrors = required<HTMLDivElement>('#what-fits-errors');
  const whatFitsResults = required<HTMLDivElement>('#what-fits-results');
  const searchPreflight = required<HTMLParagraphElement>('#search-preflight');
  const explorerDetail = required<HTMLElement>('#explorer-detail');
  const activeVehicle = required<HTMLSelectElement>('#active-vehicle');
  const measurementReview = required<HTMLDivElement>('#measurement-review');
  const measurementErrors = required<HTMLDivElement>('#measurement-errors');
  const repository = createBrowserGarageRepository();
  const service = new GarageService(repository, {
    createId: () => crypto.randomUUID(),
    nowIso: () => new Date().toISOString(),
  });
  let shared: SetupShareV1 | undefined;
  let activeMap: FitmentMapResult | undefined;
  let activeMapProfile: VehicleClearanceProfile | undefined;
  let garageState: GarageState | undefined;
  let measurementStep = 1;

  const optionalNumber = (name: string): number | null => input(name).value.trim() === '' ? null : Number(input(name).value);
  const requiredNumber = (name: string): number | null => input(name).value.trim() === '' ? null : Number(input(name).value);

  function readClearanceProfile(vehicleId = 'map-preview'): ReturnType<typeof createVehicleClearanceProfile> {
    const baseline = createSetupFromInput(readSetup('current'), 'baseline');
    if (!baseline.ok) return baseline;
    return createVehicleClearanceProfile({
      vehicleId,
      baselineSetupId: null,
      baselineSetup: baseline.value,
      measuredInnerClearanceMm: requiredNumber('measured-inner') ?? Number.NaN,
      measuredOuterClearanceMm: requiredNumber('measured-outer') ?? Number.NaN,
      minimumDesiredInnerClearanceMm: optionalNumber('desired-inner'),
      minimumDesiredOuterClearanceMm: optionalNumber('desired-outer'),
      updatedAt: new Date().toISOString(),
    });
  }

  function reasonText(cell: FitmentMapCell, profile: VehicleClearanceProfile): string {
    const messages: string[] = [];
    if (cell.reasons.includes('inner-overlap')) messages.push(t.calculatedInnerOverlap(formatNumber(Math.abs(cell.projectedInnerClearanceMm))));
    if (cell.reasons.includes('outer-overlap')) messages.push(t.calculatedOuterOverlap(formatNumber(Math.abs(cell.projectedOuterClearanceMm))));
    if (cell.reasons.includes('inner-below-target') && profile.minimumDesiredInnerClearanceMm !== null) messages.push(t.innerBelowTarget(formatNumber(profile.minimumDesiredInnerClearanceMm - cell.projectedInnerClearanceMm)));
    if (cell.reasons.includes('outer-below-target') && profile.minimumDesiredOuterClearanceMm !== null) messages.push(t.outerBelowTarget(formatNumber(profile.minimumDesiredOuterClearanceMm - cell.projectedOuterClearanceMm)));
    if (cell.reasons.includes('meets-targets')) messages.push(t.meetsTargetsReason);
    if (cell.reasons.includes('no-targets')) messages.push(t.noTargetsReason);
    return messages.join(' ');
  }

  function showMapDetail(cell: FitmentMapCell, rimDiameter: number, profile: VehicleClearanceProfile): void {
    mapDetail.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = `${rimDiameter}x${cell.wheelWidthInches} ET${cell.offsetMm} — ${mapCellPresentation(cell, true).stateLabel}`;
    const metrics = document.createElement('p');
    metrics.textContent = t.mapCellMetrics(formatNumber(cell.innerPositionChangeMm), formatNumber(cell.outerPokeChangeMm), formatNumber(cell.projectedInnerClearanceMm), formatNumber(cell.projectedOuterClearanceMm));
    const reason = document.createElement('p');
    reason.textContent = reasonText(cell, profile);
    mapDetail.append(heading, metrics, reason);
    if (cell.state !== 'green' && activeMap && activeMapProfile === profile) {
      const nearest = findNearestGreenAlternatives({ widthInches: cell.wheelWidthInches, offsetMm: cell.offsetMm }, activeMap, 3);
      const nearestHeading = document.createElement('h4');
      nearestHeading.textContent = t.closestGeometricMatches;
      const list = document.createElement('ol');
      list.className = 'nearest-list';
      for (const alternative of nearest) {
        const item = document.createElement('li');
        const widthSteps = Math.abs(alternative.cell.wheelWidthInches - cell.wheelWidthInches) / activeMap.widthStepInches;
        const offsetSteps = Math.abs(alternative.cell.offsetMm - cell.offsetMm) / activeMap.offsetStepMm;
        const label = document.createElement('span');
        label.textContent = t.nearestAlternativeSummary(
          `${alternative.cell.wheelWidthInches}J ET${alternative.cell.offsetMm}`,
          t.legendGreen,
          formatNumber(alternative.cell.projectedInnerClearanceMm),
          formatNumber(alternative.cell.projectedOuterClearanceMm),
          formatNumber(alternative.distanceInGridSteps),
          formatNumber(widthSteps),
          formatNumber(offsetSteps),
        );
        item.append(label);
        appendButton(item, t.loadIntoComparison, () => loadWheelCandidate(alternative.cell, rimDiameter), 'secondary');
        list.append(item);
      }
      if (nearest.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = t.noGreenAlternatives;
        mapDetail.append(nearestHeading, empty);
      } else {
        mapDetail.append(nearestHeading, list);
      }
    }
    mapDetail.hidden = false;
  }

  function candidateSetup(cell: FitmentMapCell, rimDiameter: number): SetupInput {
    const baseline = readSetup('current');
    return { ...baseline, rimDiameterInches: rimDiameter, wheelWidthInches: cell.wheelWidthInches, wheelOffsetMm: cell.offsetMm };
  }

  function loadWheelCandidate(cell: FitmentMapCell, rimDiameter: number): void {
    writeSetup('proposed', candidateSetup(cell, rimDiameter));
    input('proposed-setup-name').value = `${cell.wheelWidthInches}J ET${cell.offsetMm}`;
    renderComparison();
    status.textContent = t.candidateLoaded;
  }

  function generateMap(): void {
    const profile = readClearanceProfile();
    if (!profile.ok) { showIssues(mapErrors, profile.issues); mapContainer.replaceChildren(); return; }
    const result = createFitmentMap({
      clearanceProfile: profile.value,
      widthRangeInches: { min: Number(input('map-width-min').value), max: Number(input('map-width-max').value), step: Number(input('map-width-step').value) },
      offsetRangeMm: { min: Number(input('map-offset-min').value), max: Number(input('map-offset-max').value), step: Number(input('map-offset-step').value) },
    });
    if (!result.ok) { showIssues(mapErrors, result.issues); mapContainer.replaceChildren(); return; }
    mapErrors.hidden = true;
    activeMap = result.value;
    activeMapProfile = profile.value;
    const table = document.createElement('table');
    table.className = 'fitment-table';
    const head = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.textContent = t.mapWidthOffsetHeader;
    headerRow.append(corner);
    for (const offset of result.value.offsetValuesMm) {
      const header = document.createElement('th');
      header.scope = 'col';
      header.textContent = `ET${offset}`;
      headerRow.append(header);
    }
    head.append(headerRow);
    const body = document.createElement('tbody');
    let cellIndex = 0;
    for (const width of result.value.widthValuesInches) {
      const row = document.createElement('tr');
      const header = document.createElement('th');
      header.scope = 'row';
      header.textContent = `${width}J`;
      row.append(header);
      for (let offsetIndex = 0; offsetIndex < result.value.offsetValuesMm.length; offsetIndex += 1) {
        const cell = result.value.cells[cellIndex++]!;
        const data = document.createElement('td');
        const presentation = mapCellPresentation(cell, false);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `map-cell ${cell.reasons.includes('no-targets') ? 'state-neutral' : `state-${cell.state}`}`;
        button.textContent = presentation.symbol;
        button.setAttribute('aria-label', presentation.ariaLabel);
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          mapContainer.querySelectorAll<HTMLButtonElement>('.map-cell').forEach((item) => { item.classList.remove('is-selected'); item.setAttribute('aria-pressed', 'false'); });
          button.classList.add('is-selected');
          button.setAttribute('aria-pressed', 'true');
          showMapDetail(cell, result.value.rimDiameterInches, profile.value);
        });
        data.append(button);
        row.append(data);
      }
      body.append(row);
    }
    table.append(head, body);
    mapContainer.replaceChildren(table);
    mapDetail.hidden = true;
  }

  function explorerInput(): FitmentExplorerInput {
    return {
      vehicleId: garageState?.activeVehicleId ?? 'explorer-preview',
      baselineSetupId: null,
      baselineSetup: readSetup('current'),
      measuredInnerClearanceMm: requiredNumber('measured-inner'),
      measuredOuterClearanceMm: requiredNumber('measured-outer'),
      desiredInnerClearanceMm: optionalNumber('desired-inner'),
      desiredOuterClearanceMm: optionalNumber('desired-outer'),
      goal: required<HTMLSelectElement>('[name="explorer-goal"]').value,
      wheelWidthRangeInches: { min: Number(input('wf-width-min').value), max: Number(input('wf-width-max').value), step: Number(input('wf-width-step').value) },
      wheelOffsetRangeMm: { min: Number(input('wf-offset-min').value), max: Number(input('wf-offset-max').value), step: Number(input('wf-offset-step').value) },
      targetRimDiameterInches: Number(input('explorer-rim').value),
      tireWidthRangeMm: { min: Number(input('tire-width-min').value), max: Number(input('tire-width-max').value), step: Number(input('tire-width-step').value) },
      tireAspectRatioRange: { min: Number(input('aspect-min').value), max: Number(input('aspect-max').value), step: Number(input('aspect-step').value) },
      maximumAbsoluteDiameterDifferencePercent: optionalNumber('max-diameter-difference'),
      maxResults: Number(input('wf-max-results').value),
      nowIso: new Date().toISOString(),
    };
  }

  const criterionText = (criterion: RankedCriterion): string => {
    const labels: Record<RankedCriterion['key'], string> = { outerPresence: t.criterionOuterPresence, innerClearance: t.criterionInnerClearance, minimumClearance: t.criterionMinimumClearance, outerTargetDistance: t.criterionOuterTargetDistance, geometryChange: t.criterionGeometryChange, tireDiameterDifference: t.criterionTireDiameterDifference };
    return t.criterionRanksFirst(labels[criterion.key], formatNumber(criterion.value), criterion.unit === 'percent' ? '%' : 'mm', criterion.preferred);
  };

  function candidateToInput(candidate: CombinedFitmentCandidate): SetupInput {
    return { tireWidthMm: candidate.setup.tire.widthMm, tireAspectRatio: candidate.setup.tire.aspectRatio, rimDiameterInches: candidate.setup.tire.rimDiameterInches, wheelWidthInches: candidate.setup.wheel.widthInches, wheelOffsetMm: candidate.setup.wheel.offsetMm };
  }

  function loadCombinedCandidate(candidate: CombinedFitmentCandidate): void {
    writeSetup('proposed', candidateToInput(candidate));
    input('proposed-setup-name').value = `${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm}`;
    renderComparison();
    status.textContent = t.combinedCandidateLoaded;
  }

  function showCombinedDetail(candidate: CombinedFitmentCandidate): void {
    explorerDetail.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = `${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm} — ${candidate.wheelGeometry.state.toUpperCase()}`;
    const wheel = document.createElement('p');
    wheel.textContent = t.combinedWheelSummary(formatNumber(candidate.wheelGeometry.innerPositionChangeMm), formatNumber(candidate.wheelGeometry.outerPokeChangeMm));
    const tire = document.createElement('p');
    tire.textContent = t.combinedTireSummary(formatNumber(candidate.tireGeometry.overallDiameterMm), formatNumber(candidate.tireGeometry.diameterDifferenceMm), formatNumber(candidate.tireGeometry.diameterDifferencePercent), formatNumber(candidate.tireGeometry.sidewallDifferenceMm), formatNumber(candidate.tireGeometry.circumferenceDifferenceMm), formatNumber(candidate.tireGeometry.speedometerDifferencePercent));
    const clearance = document.createElement('p');
    clearance.textContent = t.combinedClearanceSummary(formatNumber(candidate.wheelGeometry.projectedInnerClearanceMm), formatNumber(candidate.wheelGeometry.projectedOuterClearanceMm));
    const criteria = document.createElement('p');
    criteria.textContent = t.rankedLexicographically(candidate.explanation.orderedCriteria.map(criterionText).join(' → '));
    const constraints = document.createElement('p');
    constraints.textContent = candidate.explanation.constraints.length === 0 ? t.noOptionalTargets : t.userTargetChecks(candidate.explanation.constraints.map((item) => `${item.key} ${item.satisfied ? t.targetMet : t.targetMissed} by ${formatNumber(Math.abs(item.difference))}`).join(' · '));
    const disclaimer = document.createElement('p');
    disclaimer.textContent = t.geometryOnlyDisclaimer;
    explorerDetail.append(heading, wheel, tire, clearance, criteria, constraints, disclaimer);
    explorerDetail.hidden = false;
  }

  async function saveCombinedCandidate(candidate: CombinedFitmentCandidate): Promise<void> {
    const result = await service.saveSetup({ name: `${t.explorerCandidateNamePrefix} ${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm}`, vehicleNickname: input('vehicle-nickname').value, setup: candidateToInput(candidate) });
    if (!result.ok) { showIssues(whatFitsErrors, result.issues); return; }
    renderGarage(result.value);
    status.textContent = t.combinedCandidateSaved;
  }

  function updatePreflight(): void {
    const result = preflightFitmentExplorer(explorerInput());
    searchPreflight.textContent = result.ok
      ? t.preflightSummary(result.value.wheelCandidateCount, result.value.tireCandidateCount, result.value.combinationCount, result.value.maximumCombinationCount)
      : t.preflightIncomplete;
  }

  function searchWhatFitsFromInputs(): void {
    const result = searchFitmentExplorer(explorerInput());
    if (!result.ok) { showIssues(whatFitsErrors, result.issues); whatFitsResults.replaceChildren(); whatFitsSummary.textContent = t.searchDidNotStart; return; }
    whatFitsErrors.hidden = true;
    searchPreflight.textContent = t.preflightSummary(result.value.preflight.wheelCandidateCount, result.value.preflight.tireCandidateCount, result.value.preflight.combinationCount, result.value.preflight.maximumCombinationCount);
    whatFitsSummary.textContent = t.whatFitsSummary(result.value.preflight.combinationCount, result.value.eligibleWheelCandidateCount, result.value.eligibleTireCandidateCount, result.value.rejectedOverlapWheelCount, result.value.candidates.length);
    if (result.value.candidates.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const title = document.createElement('strong');
      const copy = document.createElement('span');
      title.textContent = t.noMatchesTitle;
      copy.textContent = t.noMatchesCopy;
      empty.append(title, copy);
      whatFitsResults.replaceChildren(empty);
      return;
    }
    whatFitsResults.replaceChildren(...result.value.candidates.map((candidate) => {
      const model = resultCardModel(candidate);
      const card = document.createElement('article');
      card.className = 'result-card';
      const top = document.createElement('div');
      top.className = 'result-card__top';
      const heading = document.createElement('h3');
      heading.className = 'result-card__spec';
      heading.textContent = `#${model.rank} · ${model.wheelPrimary}`;
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge status-${model.state}`;
      statusBadge.textContent = `${model.state === 'green' ? '✓' : '!'} ${model.stateLabel}`;
      top.append(heading, statusBadge);
      const offset = document.createElement('div');
      offset.className = 'result-card__offset';
      offset.textContent = model.wheelOffset;
      const tireSize = document.createElement('p');
      tireSize.className = 'result-card__tire';
      tireSize.textContent = model.tireSize;
      const summary = document.createElement('p');
      summary.className = 'result-card__summary';
      summary.textContent = model.stateSummary;
      const metrics = document.createElement('div');
      metrics.className = 'result-metrics';
      const metricValues = [
        [t.resultMetricInnerClearance, candidate.wheelGeometry.projectedInnerClearanceMm, 'mm'],
        [t.resultMetricOuterClearance, candidate.wheelGeometry.projectedOuterClearanceMm, 'mm'],
        [t.resultMetricDiameterChange, candidate.tireGeometry.diameterDifferencePercent, '%'],
        [t.resultMetricSpeedometer, candidate.tireGeometry.speedometerDifferencePercent, '%'],
      ] as const;
      for (const [label, value, unit] of metricValues) {
        const item = document.createElement('div');
        item.className = 'result-metric';
        const name = document.createElement('span');
        const amount = document.createElement('strong');
        name.textContent = label;
        amount.textContent = `${formatNumber(value)} ${unit}`;
        item.append(name, amount);
        metrics.append(item);
      }
      const provenance = document.createElement('div');
      provenance.className = 'provenance-row';
      for (const label of [t.provenanceCalculated, t.provenanceUserMeasured]) {
        const badge = document.createElement('span');
        badge.className = 'source-badge';
        badge.textContent = label;
        provenance.append(badge);
      }
      const actions = document.createElement('div');
      actions.className = 'actions';
      appendButton(actions, t.compareResultButton, () => loadCombinedCandidate(candidate));
      appendButton(actions, t.saveToGarageButton, () => saveCombinedCandidate(candidate));
      appendButton(actions, t.seeGeometryDetailsButton, () => showCombinedDetail(candidate), 'secondary');
      appendButton(actions, t.shareResultButton, async () => { loadCombinedCandidate(candidate); await copyShare(); }, 'tertiary');
      card.append(top, offset, tireSize, summary, metrics, provenance, actions);
      return card;
    }));
  }

  function populateClearance(profile: VehicleClearanceProfile): void {
    writeSetup('current', {
      tireWidthMm: profile.baselineSetup.tire.widthMm,
      tireAspectRatio: profile.baselineSetup.tire.aspectRatio,
      rimDiameterInches: profile.baselineSetup.tire.rimDiameterInches,
      wheelWidthInches: profile.baselineSetup.wheel.widthInches,
      wheelOffsetMm: profile.baselineSetup.wheel.offsetMm,
    });
    input('measured-inner').value = String(profile.measuredInnerClearance.valueMm);
    input('measured-outer').value = String(profile.measuredOuterClearance.valueMm);
    input('desired-inner').value = profile.minimumDesiredInnerClearanceMm === null ? '' : String(profile.minimumDesiredInnerClearanceMm);
    input('desired-outer').value = profile.minimumDesiredOuterClearanceMm === null ? '' : String(profile.minimumDesiredOuterClearanceMm);
  }

  function updateMeasurementDecision(): void {
    const measuredInner = input('measured-inner').value.trim();
    const measuredOuter = input('measured-outer').value.trim();
    required<HTMLElement>('#decision-measure').textContent = measuredInner !== '' && measuredOuter !== '' && Number.isFinite(Number(measuredInner)) && Number.isFinite(Number(measuredOuter)) && Number(measuredInner) >= 0 && Number(measuredOuter) >= 0
      ? t.measurementEnteredSummary(measuredInner, measuredOuter)
      : t.measurementNotEntered;
  }

  function renderComparison(): void {
    const comparison = compareSetupInputs(readSetup('current'), readSetup('proposed'));
    if (!comparison.ok) {
      showIssues(errors, comparison.issues);
      results.replaceChildren();
      required<HTMLElement>('#decision-tire').textContent = t.decisionTireInvalid;
      required<HTMLElement>('#decision-wheel').textContent = t.decisionWheelInvalid;
      updateMeasurementDecision();
      return;
    }
    errors.hidden = true;
    const value = comparison.value;
    const currentSetup = readSetup('current');
    const proposedSetup = readSetup('proposed');
    required<HTMLElement>('#decision-tire').textContent = t.decisionTireValue(formatNumber(value.current.overallDiameterMm, 1), formatNumber(value.proposed.overallDiameterMm, 1));
    required<HTMLElement>('#decision-wheel').textContent = t.decisionWheelValue(formatNumber(value.wheelInnerPositionChangeMm, 1), formatNumber(value.wheelOuterPokeChangeMm, 1));
    updateMeasurementDecision();
    const visual = required<HTMLElement>('[data-fitment-visualizer]');
    const tireScale = tireScaleMapping({
      currentDiameterMm: value.current.overallDiameterMm,
      currentRimDiameterInches: currentSetup.rimDiameterInches,
      proposedDiameterMm: value.proposed.overallDiameterMm,
      proposedRimDiameterInches: proposedSetup.rimDiameterInches,
    });
    const wheelScale = wheelOffsetVisualMapping(value.wheelInnerPositionChangeMm, value.wheelOuterPokeChangeMm);
    visual.querySelector<SVGCircleElement>('[data-current-tire]')?.setAttribute('r', String(tireScale.currentTireRadius));
    visual.querySelector<SVGCircleElement>('[data-new-tire]')?.setAttribute('r', String(tireScale.proposedTireRadius));
    visual.querySelector<SVGCircleElement>('[data-current-rim]')?.setAttribute('r', String(tireScale.currentRimRadius));
    visual.querySelector<SVGCircleElement>('[data-new-rim]')?.setAttribute('r', String(tireScale.proposedRimRadius));
    const proposedWheel = visual.querySelector<SVGRectElement>('[data-new-wheel]');
    proposedWheel?.setAttribute('x', String(wheelScale.proposedX));
    proposedWheel?.setAttribute('width', String(wheelScale.proposedWidth));
    const summary = fitmentComparisonSummary(value);
    required<HTMLElement>('#comparison-summary').textContent = summary;
    visual.querySelector<HTMLElement>('[data-visual-summary]')!.textContent = summary;
    visual.querySelector<HTMLElement>('[data-current-tire-label]')!.textContent = t.visualCurrentLabel(formatNumber(value.current.overallDiameterMm));
    visual.querySelector<HTMLElement>('[data-new-tire-label]')!.textContent = t.visualNewLabel(formatNumber(value.proposed.overallDiameterMm));
    visual.querySelector<HTMLElement>('[data-inner-label]')!.textContent = t.visualInnerLabel(formatNumber(value.wheelInnerPositionChangeMm));
    visual.querySelector<HTMLElement>('[data-outer-label]')!.textContent = t.visualOuterLabel(formatNumber(value.wheelOuterPokeChangeMm));
    const rows: readonly [string, number, string][] = [
        [t.rowCurrentSidewall, value.current.sidewallHeightMm, 'mm'],
        [t.rowNewSidewall, value.proposed.sidewallHeightMm, 'mm'],
        [t.rowCurrentDiameter, value.current.overallDiameterMm, 'mm'],
        [t.rowNewDiameter, value.proposed.overallDiameterMm, 'mm'],
        [t.rowDiameterDifference, value.diameterDifferenceMm, 'mm'],
        [t.rowDiameterDifference, value.diameterDifferencePercent, '%'],
        [t.rowRideHeightDifference, value.rideHeightDifferenceMm, 'mm'],
        [t.rowSpeedSameRpm, value.speedometerDifferencePercent, '%'],
        [t.rowInnerPositionChange, value.wheelInnerPositionChangeMm, 'mm'],
        [t.rowOuterPokeChange, value.wheelOuterPokeChangeMm, 'mm'],
        [t.rowCurrentCircumference, value.current.circumferenceMm, 'mm'],
        [t.rowNewCircumference, value.proposed.circumferenceMm, 'mm'],
        [t.rowCurrentRevolutions, value.current.revolutionsPerKilometer, '/km'],
        [t.rowNewRevolutions, value.proposed.revolutionsPerKilometer, '/km'],
        [t.rowCurrentRevolutions, value.current.revolutionsPerMile, '/mile'],
        [t.rowNewRevolutions, value.proposed.revolutionsPerMile, '/mile'],
    ];
    results.replaceChildren(...rows.map(([label, amount, unit]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = `${formatNumber(amount, 3)} ${unit}`;
      row.append(term, detail);
      return row;
    }));
    form.dispatchEvent(new Event('fitment:updated'));
  }

  function renderGarage(state: GarageState): void {
    garageState = state;
    const presentation = activeGaragePresentation(state);
    const shellVehicle = document.querySelector<HTMLElement>('#shell-vehicle');
    const vehicleSummary = required<HTMLElement>('#vehicle-summary');
    if (shellVehicle) shellVehicle.textContent = presentation.vehicle?.displayName ?? t.noVehicleSelected;
    vehicleSummary.replaceChildren();
    const vehicleTitle = document.createElement('h3');
    const vehicleCopy = document.createElement('p');
    const vehicleStatus = document.createElement('div');
    vehicleStatus.className = 'vehicle-card__status';
    vehicleTitle.textContent = presentation.vehicle?.displayName ?? t.garageReady;
    const currentSetup = presentation.currentSetup;
    vehicleCopy.textContent = currentSetup
      ? t.currentSetupSummary(`${currentSetup.tire.widthMm}/${currentSetup.tire.aspectRatio} R${currentSetup.tire.rimDiameterInches} · ${currentSetup.wheel.widthInches}J ET${currentSetup.wheel.offsetMm}`)
      : t.saveOrMeasurePrompt;
    const measurementBadge = document.createElement('span');
    measurementBadge.className = 'source-badge';
    measurementBadge.textContent = presentation.isMeasured ? t.measuredBadge : t.notMeasuredBadge;
    const setupBadge = document.createElement('span');
    setupBadge.className = 'source-badge';
    setupBadge.textContent = t.savedSetupCount(presentation.setups.length);
    vehicleStatus.append(measurementBadge, setupBadge);
    vehicleSummary.append(vehicleTitle, vehicleCopy, vehicleStatus);
    if (currentSetup) {
      const miniVisual = document.createElement('div');
      miniVisual.className = 'garage-mini-visual';
      miniVisual.setAttribute('aria-hidden', 'true');
      miniVisual.innerHTML = '<span class="garage-mini-visual__tire"><span></span></span><i></i>';
      const metrics = document.createElement('dl');
      metrics.className = 'garage-metrics';
      const entries: readonly (readonly [string, string])[] = [
        [t.metricTire, `${currentSetup.tire.widthMm}/${currentSetup.tire.aspectRatio} R${currentSetup.tire.rimDiameterInches}`],
        [t.metricWheel, `${currentSetup.wheel.widthInches}J · ET${currentSetup.wheel.offsetMm}`],
        [t.metricMeasurements, presentation.isMeasured ? t.recorded : t.notRecorded],
        [t.metricSavedSetups, String(presentation.setups.length)],
      ];
      for (const [label, detail] of entries) {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const value = document.createElement('dd');
        term.textContent = label;
        value.textContent = detail;
        row.append(term, value);
        metrics.append(row);
      }
      vehicleSummary.append(miniVisual, metrics);
    }
    activeVehicle.replaceChildren();
    const noVehicle = document.createElement('option');
    noVehicle.value = '';
    noVehicle.textContent = t.noSavedVehicleOption;
    activeVehicle.append(noVehicle, ...state.vehicles.map((vehicle) => {
      const option = document.createElement('option');
      option.value = vehicle.id;
      option.textContent = vehicle.displayName;
      option.selected = vehicle.id === state.activeVehicleId;
      return option;
    }));
    garageList.replaceChildren();
    const visibleSetups = presentation.setups;
    if (visibleSetups.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const title = document.createElement('strong');
      const copy = document.createElement('span');
      title.textContent = t.garageEmpty;
      copy.textContent = t.garageEmptyCopy;
      empty.append(title, copy);
      garageList.append(empty);
      return;
    }
    for (const saved of visibleSetups) {
      const card = document.createElement('article');
      const title = document.createElement('h3');
      const detail = document.createElement('p');
      const actions = document.createElement('div');
      card.className = 'saved-setup-card';
      title.textContent = saved.name;
      detail.textContent = describeSetup(saved);
      actions.className = 'actions';
      appendButton(actions, t.loadAsCurrentButton, () => { writeSetup('current', setupToInput(saved)); renderComparison(); });
      appendButton(actions, t.loadAsNewButton, () => { writeSetup('proposed', setupToInput(saved)); renderComparison(); });
      appendButton(actions, t.shareButton, async () => { writeSetup('proposed', setupToInput(saved)); renderComparison(); await copyShare(); }, 'secondary');
      appendButton(actions, t.deleteButton, async () => {
        if (!window.confirm(t.deleteConfirm(saved.name))) return;
        const deleted = await service.deleteSetup(saved.id);
        if (!deleted.ok) { showIssues(errors, deleted.issues); return; }
        renderGarage(deleted.value);
      }, 'danger');
      card.append(title, detail, actions);
      garageList.append(card);
    }
  }

  async function save(prefix: 'current' | 'proposed'): Promise<void> {
    const result = await service.saveSetup({
      name: input(`${prefix}-setup-name`).value,
      vehicleNickname: input('vehicle-nickname').value,
      setup: readSetup(prefix),
    });
    if (!result.ok) {
      showIssues(errors, result.issues);
      return;
    }
    status.textContent = t.setupSavedToBrowser;
    renderGarage(result.value);
  }

  async function copyShare(): Promise<void> {
    const feedback = document.querySelector<HTMLElement>('#share-feedback');
    const announce = (message: string): void => {
      status.textContent = message;
      if (feedback) { feedback.textContent = message; feedback.classList.remove('share-toolbar__feedback--visible'); void feedback.offsetWidth; feedback.classList.add('share-toolbar__feedback--visible'); }
    };
    // Reuse the existing comparison validator — do not build a second, parallel
    // validation path just for sharing. An invalid current/proposed setup must
    // never produce a share link.
    const validation = compareSetupInputs(readSetup('current'), readSetup('proposed'));
    if (!validation.ok) {
      showIssues(errors, validation.issues);
      announce(t.fixSetupBeforeSharing);
      return;
    }
    const payload: SetupShareV1 = { v: 1, current: readSetup('current'), proposed: readSetup('proposed') };
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = createSetupShareHash(payload).slice(1);
    const shareUrl = url.toString();
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: t.shareDialogTitle, text: t.shareDialogText, url: shareUrl });
        announce(t.setupSharedNativeMessage);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return; // user dismissed the native share sheet
        // Native share failed for another reason (unsupported context, etc.) — fall through to copy-link.
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      announce(t.linkCopiedMessage);
    } catch {
      announce(t.copyUnavailableMessage(shareUrl));
    }
  }

  function updateMeasurementReview(): void {
    const profile = readClearanceProfile(garageState?.activeVehicleId ?? 'measurement-preview');
    if (!profile.ok) {
      showIssues(measurementErrors, profile.issues);
      measurementReview.textContent = t.measurementReviewIncomplete;
      return;
    }
    measurementErrors.hidden = true;
    const desiredInner = profile.value.minimumDesiredInnerClearanceMm === null ? t.desiredNotSupplied : `${formatNumber(profile.value.minimumDesiredInnerClearanceMm)} mm`;
    const desiredOuter = profile.value.minimumDesiredOuterClearanceMm === null ? t.desiredNotSupplied : `${formatNumber(profile.value.minimumDesiredOuterClearanceMm)} mm`;
    measurementReview.textContent = t.measurementReviewSummary(formatNumber(profile.value.measuredInnerClearance.valueMm), formatNumber(profile.value.measuredOuterClearance.valueMm), desiredInner, desiredOuter);
  }

  function showMeasurementStep(step: number): void {
    const progress = wizardProgress(step);
    measurementStep = progress.current;
    document.querySelectorAll<HTMLElement>('[data-measure-step]').forEach((panel) => { panel.hidden = Number(panel.dataset.measureStep) !== measurementStep; });
    document.querySelectorAll<HTMLButtonElement>('[data-measure-go]').forEach((button) => { button.classList.toggle('secondary', Number(button.dataset.measureGo) !== measurementStep); });
    required<HTMLElement>('#measure-progress').style.width = `${progress.percent}%`;
    required<HTMLElement>('#measure-step-label').textContent = t.stepOf(progress.current, progress.total);
    required<HTMLButtonElement>('#measure-back').disabled = !progress.canGoBack;
    const next = required<HTMLButtonElement>('#measure-next');
    next.disabled = !progress.canContinue;
    if (measurementStep === 5) updateMeasurementReview();
  }

  form.addEventListener('submit', (event) => { event.preventDefault(); renderComparison(); });
  required('#save-current').addEventListener('click', () => void save('current'));
  required('#save-proposed').addEventListener('click', () => void save('proposed'));
  required('#copy-share').addEventListener('click', () => void copyShare());
  required('#save-shared').addEventListener('click', async () => {
    if (!shared) return;
    const result = await service.saveSharedSetup(shared, input('shared-setup-name').value, input('vehicle-nickname').value);
    if (!result.ok) { showIssues(errors, result.issues); return; }
    status.textContent = t.sharedSetupSaved;
    renderGarage(result.value);
  });
  required('#generate-map').addEventListener('click', generateMap);
  required('#save-clearance').addEventListener('click', async () => {
    const result = await service.saveClearanceProfile({
      vehicleNickname: input('vehicle-nickname').value,
      baselineSetup: readSetup('current'),
      measuredInnerClearanceMm: requiredNumber('measured-inner') ?? Number.NaN,
      measuredOuterClearanceMm: requiredNumber('measured-outer') ?? Number.NaN,
      minimumDesiredInnerClearanceMm: optionalNumber('desired-inner'),
      minimumDesiredOuterClearanceMm: optionalNumber('desired-outer'),
    });
    if (!result.ok) { showIssues(measurementErrors, result.issues); return; }
    status.textContent = t.clearanceProfileSaved;
    renderGarage(result.value);
    generateMap();
  });
  required('#search-what-fits').addEventListener('click', searchWhatFitsFromInputs);
  required('#measure-back').addEventListener('click', () => showMeasurementStep(measurementStep - 1));
  required('#measure-next').addEventListener('click', () => showMeasurementStep(measurementStep + 1));
  document.querySelectorAll<HTMLButtonElement>('[data-measure-go]').forEach((button) => button.addEventListener('click', () => showMeasurementStep(Number(button.dataset.measureGo))));
  required('#what-fits-section').addEventListener('input', updatePreflight);
  required('#measure-flow').addEventListener('input', updatePreflight);
  for (const prefix of ['current', 'proposed'] as const) {
    input(`${prefix}-rimDiameterInches`).addEventListener('input', () => {
      const wheelDiameter = required<HTMLInputElement>(`[data-wheel-diameter="${prefix}"]`);
      wheelDiameter.value = input(`${prefix}-rimDiameterInches`).value;
    });
  }
  const setProductSection = (section: ProductSection): void => {
    document.querySelectorAll<HTMLElement>('[data-product-nav]').forEach((item) => {
      if (item.dataset.productNav === section) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  };
  for (const item of PRODUCT_NAVIGATION) {
    document.querySelectorAll<HTMLAnchorElement>(`[data-product-nav="${item.id}"]`).forEach((link) => link.addEventListener('click', () => setProductSection(item.id)));
  }
  activeVehicle.addEventListener('change', async () => {
    if (activeVehicle.value === '') return;
    const selected = await service.selectVehicle(activeVehicle.value);
    if (!selected.ok) { showIssues(errors, selected.issues); return; }
    renderGarage(selected.value);
    const clearance = selected.value.clearanceProfiles.find((profile) => profile.vehicleId === selected.value.activeVehicleId);
    if (clearance) populateClearance(clearance);
    else {
      const latestSetup = [...selected.value.savedSetups].reverse().find((setup) => setup.vehicleId === selected.value.activeVehicleId);
      if (latestSetup) writeSetup('current', setupToInput(latestSetup));
      input('measured-inner').value = ''; input('measured-outer').value = ''; input('desired-inner').value = ''; input('desired-outer').value = '';
    }
    renderComparison();
    whatFitsResults.replaceChildren();
    explorerDetail.hidden = true;
    updatePreflight();
  });

  const loaded = await service.load();
  input('measured-inner').addEventListener('input', updateMeasurementDecision);
  input('measured-outer').addEventListener('input', updateMeasurementDecision);
  renderGarage(loaded.state);
  const storedClearance = loaded.state.clearanceProfiles.find((profile) => profile.vehicleId === loaded.state.activeVehicleId);
  if (storedClearance) populateClearance(storedClearance);
  if (loaded.status.startsWith('recovered-')) status.textContent = t.recoveredEmptyGarage;

  const decoded = decodeSetupShareHash(window.location.hash);
  const journey = decoded ? null : parseJourneyPrefill(window.location.search, readSetup('current'), readSetup('proposed'));
  if (journey) {
    writeSetup('current', journey.current);
    writeSetup('proposed', journey.proposed);
    input('measured-inner').value = '';
    input('measured-outer').value = '';
    input('desired-inner').value = '';
    input('desired-outer').value = '';
    required<HTMLElement>('#journey-import').hidden = false;
    required<HTMLElement>('#journey-import-copy').textContent = journey.source === 'tire'
      ? t.journeyImportTireCopy
      : t.journeyImportWheelCopy;
    // Links from other tools land on #compare or #measure-flow. The browser scrolls there before
    // this script runs, and the banner just un-hidden above pushes the target down — re-align.
    const target = window.location.hash.length > 1 ? document.getElementById(window.location.hash.slice(1)) : null;
    target?.scrollIntoView({ block: 'start' });
  }
  if (decoded) {
    sharedPanel.hidden = false;
    if (decoded.ok) {
      shared = decoded.value;
      writeSetup('current', decoded.value.current);
      writeSetup('proposed', decoded.value.proposed);
      renderComparison();
    } else {
      required<HTMLElement>('#shared-message').textContent = t.sharedInvalidMessage;
      required<HTMLButtonElement>('#save-shared').disabled = true;
    }
  }
  renderComparison();
  showMeasurementStep(1);
  updatePreflight();
  if (storedClearance && !journey) generateMap();
}
