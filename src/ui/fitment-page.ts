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
import { translate } from '../localization/catalog';
import { createBrowserGarageRepository } from '../storage/local-storage-garage-repository';
import { formatNumber } from './format-number';

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
    item.textContent = `${issue.field}: ${issue.message}`;
    list.append(item);
  }
  container.append(list);
  container.hidden = false;
}

export async function initializeFitmentPage(): Promise<void> {
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
    if (cell.reasons.includes('inner-overlap')) messages.push(`Calculated inner overlap: ${formatNumber(Math.abs(cell.projectedInnerClearanceMm))} mm.`);
    if (cell.reasons.includes('outer-overlap')) messages.push(`Calculated outer overlap: ${formatNumber(Math.abs(cell.projectedOuterClearanceMm))} mm.`);
    if (cell.reasons.includes('inner-below-target') && profile.minimumDesiredInnerClearanceMm !== null) messages.push(`Inner clearance is ${formatNumber(profile.minimumDesiredInnerClearanceMm - cell.projectedInnerClearanceMm)} mm below your target.`);
    if (cell.reasons.includes('outer-below-target') && profile.minimumDesiredOuterClearanceMm !== null) messages.push(`Outer clearance is ${formatNumber(profile.minimumDesiredOuterClearanceMm - cell.projectedOuterClearanceMm)} mm below your target.`);
    if (cell.reasons.includes('meets-targets')) messages.push('Both projected clearances meet your supplied targets. This is not a road-safety verdict.');
    if (cell.reasons.includes('no-targets')) messages.push('No desired margins were supplied; only non-negative geometric clearance was checked.');
    return messages.join(' ');
  }

  function showMapDetail(cell: FitmentMapCell, rimDiameter: number, profile: VehicleClearanceProfile): void {
    mapDetail.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = `${rimDiameter}x${cell.wheelWidthInches} ET${cell.offsetMm} — ${cell.state.toUpperCase()}`;
    const metrics = document.createElement('p');
    metrics.textContent = `Inner change: ${formatNumber(cell.innerPositionChangeMm)} mm · Outer poke change: ${formatNumber(cell.outerPokeChangeMm)} mm · Projected inner: ${formatNumber(cell.projectedInnerClearanceMm)} mm · Projected outer: ${formatNumber(cell.projectedOuterClearanceMm)} mm`;
    const reason = document.createElement('p');
    reason.textContent = reasonText(cell, profile);
    mapDetail.append(heading, metrics, reason);
    if (cell.state !== 'green' && activeMap && activeMapProfile === profile) {
      const nearest = findNearestGreenAlternatives({ widthInches: cell.wheelWidthInches, offsetMm: cell.offsetMm }, activeMap, 3);
      const nearestHeading = document.createElement('h4');
      nearestHeading.textContent = 'Closest geometric matches';
      const list = document.createElement('ol');
      list.className = 'nearest-list';
      for (const alternative of nearest) {
        const item = document.createElement('li');
        const widthSteps = Math.abs(alternative.cell.wheelWidthInches - cell.wheelWidthInches) / activeMap.widthStepInches;
        const offsetSteps = Math.abs(alternative.cell.offsetMm - cell.offsetMm) / activeMap.offsetStepMm;
        const label = document.createElement('span');
        label.textContent = `${alternative.cell.wheelWidthInches}J ET${alternative.cell.offsetMm} — GREEN · inner ${formatNumber(alternative.cell.projectedInnerClearanceMm)} mm · outer ${formatNumber(alternative.cell.projectedOuterClearanceMm)} mm · ${formatNumber(alternative.distanceInGridSteps)} grid steps (${formatNumber(widthSteps)} width + ${formatNumber(offsetSteps)} offset)`;
        item.append(label);
        appendButton(item, 'Load into comparison', () => loadWheelCandidate(alternative.cell, rimDiameter), 'secondary');
        list.append(item);
      }
      if (nearest.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No green alternatives exist in the current map range.';
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
    status.textContent = 'Candidate loaded into comparison. It has not been saved.';
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
    corner.textContent = 'Width / Offset';
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
      for (const offset of result.value.offsetValuesMm) {
        const cell = result.value.cells[cellIndex++]!;
        const data = document.createElement('td');
        appendButton(data, cell.state === 'green' ? '●' : cell.state === 'yellow' ? '▲' : '×', () => showMapDetail(cell, result.value.rimDiameterInches, profile.value), `map-cell state-${cell.state}`);
        const button = data.querySelector('button')!;
        button.setAttribute('aria-label', `${width}J ET${offset}: ${cell.state}`);
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
    const labels: Record<RankedCriterion['key'], string> = { outerPresence: 'outer presence', innerClearance: 'projected inner clearance', minimumClearance: 'minimum projected clearance', outerTargetDistance: 'distance from outer target', geometryChange: 'absolute wheel-position change', tireDiameterDifference: 'absolute tire diameter difference' };
    return `${labels[criterion.key]} ${formatNumber(criterion.value)} ${criterion.unit === 'percent' ? '%' : 'mm'} (${criterion.preferred} ranks first)`;
  };

  function candidateToInput(candidate: CombinedFitmentCandidate): SetupInput {
    return { tireWidthMm: candidate.setup.tire.widthMm, tireAspectRatio: candidate.setup.tire.aspectRatio, rimDiameterInches: candidate.setup.tire.rimDiameterInches, wheelWidthInches: candidate.setup.wheel.widthInches, wheelOffsetMm: candidate.setup.wheel.offsetMm };
  }

  function loadCombinedCandidate(candidate: CombinedFitmentCandidate): void {
    writeSetup('proposed', candidateToInput(candidate));
    input('proposed-setup-name').value = `${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm}`;
    renderComparison();
    status.textContent = 'Combined candidate loaded into comparison. It has not been saved.';
  }

  function showCombinedDetail(candidate: CombinedFitmentCandidate): void {
    explorerDetail.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = `${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm} — ${candidate.wheelGeometry.state.toUpperCase()}`;
    const wheel = document.createElement('p');
    wheel.textContent = `CALCULATED wheel · inner change ${formatNumber(candidate.wheelGeometry.innerPositionChangeMm)} mm · outer poke ${formatNumber(candidate.wheelGeometry.outerPokeChangeMm)} mm`;
    const tire = document.createElement('p');
    tire.textContent = `CALCULATED tire · diameter ${formatNumber(candidate.tireGeometry.overallDiameterMm)} mm · difference ${formatNumber(candidate.tireGeometry.diameterDifferenceMm)} mm / ${formatNumber(candidate.tireGeometry.diameterDifferencePercent)}% · sidewall ${formatNumber(candidate.tireGeometry.sidewallDifferenceMm)} mm · circumference ${formatNumber(candidate.tireGeometry.circumferenceDifferenceMm)} mm · speed ${formatNumber(candidate.tireGeometry.speedometerDifferencePercent)}%`;
    const clearance = document.createElement('p');
    clearance.textContent = `USER MEASURED → CALCULATED clearance · inner ${formatNumber(candidate.wheelGeometry.projectedInnerClearanceMm)} mm · outer ${formatNumber(candidate.wheelGeometry.projectedOuterClearanceMm)} mm`;
    const criteria = document.createElement('p');
    criteria.textContent = `Ranked lexicographically: ${candidate.explanation.orderedCriteria.map(criterionText).join(' → ')}.`;
    const constraints = document.createElement('p');
    constraints.textContent = candidate.explanation.constraints.length === 0 ? 'No optional USER TARGET constraints were supplied.' : `USER TARGET checks: ${candidate.explanation.constraints.map((item) => `${item.key} ${item.satisfied ? 'met' : 'missed'} by ${formatNumber(Math.abs(item.difference))}`).join(' · ')}`;
    const disclaimer = document.createElement('p');
    disclaimer.textContent = 'Geometry-only result. GREEN does not mean road-safe or verified compatible.';
    explorerDetail.append(heading, wheel, tire, clearance, criteria, constraints, disclaimer);
    explorerDetail.hidden = false;
  }

  async function saveCombinedCandidate(candidate: CombinedFitmentCandidate): Promise<void> {
    const result = await service.saveSetup({ name: `Explorer ${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm}`, vehicleNickname: input('vehicle-nickname').value, setup: candidateToInput(candidate) });
    if (!result.ok) { showIssues(whatFitsErrors, result.issues); return; }
    renderGarage(result.value);
    status.textContent = 'Selected combined candidate saved explicitly to the selected vehicle.';
  }

  function updatePreflight(): void {
    const result = preflightFitmentExplorer(explorerInput());
    searchPreflight.textContent = result.ok
      ? `Preflight: ${result.value.wheelCandidateCount} wheel × ${result.value.tireCandidateCount} tire = ${result.value.combinationCount} combinations (technical ceiling ${result.value.maximumCombinationCount}).`
      : 'Complete valid measurements and ranges to calculate the search size.';
  }

  function searchWhatFitsFromInputs(): void {
    const result = searchFitmentExplorer(explorerInput());
    if (!result.ok) { showIssues(whatFitsErrors, result.issues); whatFitsResults.replaceChildren(); whatFitsSummary.textContent = 'Search did not start.'; return; }
    whatFitsErrors.hidden = true;
    searchPreflight.textContent = `Preflight: ${result.value.preflight.wheelCandidateCount} wheel × ${result.value.preflight.tireCandidateCount} tire = ${result.value.preflight.combinationCount} combinations (technical ceiling ${result.value.preflight.maximumCombinationCount}).`;
    whatFitsSummary.textContent = `Preflight ${result.value.preflight.combinationCount} · eligible wheel ${result.value.eligibleWheelCandidateCount} · eligible tire ${result.value.eligibleTireCandidateCount} · overlap wheels rejected ${result.value.rejectedOverlapWheelCount} · showing ${result.value.candidates.length}`;
    whatFitsResults.replaceChildren(...result.value.candidates.map((candidate) => {
      const card = document.createElement('article');
      const heading = document.createElement('h3');
      const geometry = document.createElement('p');
      const explanation = document.createElement('p');
      const actions = document.createElement('div');
      heading.textContent = `#${candidate.rank} · ${candidate.setup.tire.widthMm}/${candidate.setup.tire.aspectRatio}R${candidate.setup.tire.rimDiameterInches} · ${candidate.setup.wheel.widthInches}J ET${candidate.setup.wheel.offsetMm} — ${candidate.wheelGeometry.state.toUpperCase()}`;
      geometry.textContent = `Inner ${formatNumber(candidate.wheelGeometry.projectedInnerClearanceMm)} mm · outer ${formatNumber(candidate.wheelGeometry.projectedOuterClearanceMm)} mm · tire diameter ${formatNumber(candidate.tireGeometry.diameterDifferencePercent)}%`;
      explanation.textContent = candidate.explanation.orderedCriteria.map(criterionText).join(' → ');
      actions.className = 'actions';
      appendButton(actions, 'Inspect result', () => showCombinedDetail(candidate), 'secondary');
      appendButton(actions, 'Compare with current', () => loadCombinedCandidate(candidate));
      appendButton(actions, 'Save to My Garage', () => saveCombinedCandidate(candidate), 'secondary');
      appendButton(actions, 'Load and share', async () => { loadCombinedCandidate(candidate); await copyShare(); }, 'secondary');
      card.append(heading, geometry, explanation, actions);
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

  function renderComparison(): void {
    const comparison = compareSetupInputs(readSetup('current'), readSetup('proposed'));
    if (!comparison.ok) {
      showIssues(errors, comparison.issues);
      results.replaceChildren();
      return;
    }
    errors.hidden = true;
    const value = comparison.value;
    const rows: readonly [string, number, string][] = [
        ['Current sidewall', value.current.sidewallHeightMm, 'mm'],
        ['New sidewall', value.proposed.sidewallHeightMm, 'mm'],
        ['Current diameter', value.current.overallDiameterMm, 'mm'],
        ['New diameter', value.proposed.overallDiameterMm, 'mm'],
        ['Diameter difference', value.diameterDifferenceMm, 'mm'],
        ['Diameter difference', value.diameterDifferencePercent, '%'],
        ['Ride-height difference', value.rideHeightDifferenceMm, 'mm'],
        ['Speed at same wheel RPM', value.speedometerDifferencePercent, '%'],
        ['Inner-position change', value.wheelInnerPositionChangeMm, 'mm'],
        ['Outer-poke change', value.wheelOuterPokeChangeMm, 'mm'],
        ['Current circumference', value.current.circumferenceMm, 'mm'],
        ['New circumference', value.proposed.circumferenceMm, 'mm'],
        ['Current revolutions', value.current.revolutionsPerKilometer, '/km'],
        ['New revolutions', value.proposed.revolutionsPerKilometer, '/km'],
        ['Current revolutions', value.current.revolutionsPerMile, '/mile'],
        ['New revolutions', value.proposed.revolutionsPerMile, '/mile'],
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
  }

  function renderGarage(state: GarageState): void {
    garageState = state;
    activeVehicle.replaceChildren();
    const noVehicle = document.createElement('option');
    noVehicle.value = '';
    noVehicle.textContent = 'No saved vehicle';
    activeVehicle.append(noVehicle, ...state.vehicles.map((vehicle) => {
      const option = document.createElement('option');
      option.value = vehicle.id;
      option.textContent = vehicle.displayName;
      option.selected = vehicle.id === state.activeVehicleId;
      return option;
    }));
    garageList.replaceChildren();
    const visibleSetups = state.savedSetups.filter((setup) => setup.vehicleId === state.activeVehicleId);
    if (visibleSetups.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = translate('en', 'garageEmpty');
      garageList.append(empty);
      return;
    }
    for (const saved of visibleSetups) {
      const card = document.createElement('article');
      const title = document.createElement('h3');
      const detail = document.createElement('p');
      const actions = document.createElement('div');
      title.textContent = saved.name;
      detail.textContent = describeSetup(saved);
      actions.className = 'actions';
      appendButton(actions, 'Load as current', () => { writeSetup('current', setupToInput(saved)); renderComparison(); });
      appendButton(actions, 'Load as new', () => { writeSetup('proposed', setupToInput(saved)); renderComparison(); });
      appendButton(actions, 'Delete', async () => renderGarage(await service.deleteSetup(saved.id)), 'secondary');
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
    status.textContent = 'Setup saved to this browser.';
    renderGarage(result.value);
  }

  async function copyShare(): Promise<void> {
    const payload: SetupShareV1 = { v: 1, current: readSetup('current'), proposed: readSetup('proposed') };
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = createSetupShareHash(payload).slice(1);
    try {
      await navigator.clipboard.writeText(url.toString());
      status.textContent = 'Share link copied. Opening it will not save anything automatically.';
    } catch {
      status.textContent = `Copy was unavailable. Share this link: ${url.toString()}`;
    }
  }

  function updateMeasurementReview(): void {
    const profile = readClearanceProfile(garageState?.activeVehicleId ?? 'measurement-preview');
    if (!profile.ok) {
      showIssues(measurementErrors, profile.issues);
      measurementReview.textContent = 'Both inner and outer measurements are required. Without them, projected clearance and combined search cannot run.';
      return;
    }
    measurementErrors.hidden = true;
    const desiredInner = profile.value.minimumDesiredInnerClearanceMm === null ? 'not supplied' : `${formatNumber(profile.value.minimumDesiredInnerClearanceMm)} mm`;
    const desiredOuter = profile.value.minimumDesiredOuterClearanceMm === null ? 'not supplied' : `${formatNumber(profile.value.minimumDesiredOuterClearanceMm)} mm`;
    measurementReview.textContent = `USER MEASURED · inner ${formatNumber(profile.value.measuredInnerClearance.valueMm)} mm · outer ${formatNumber(profile.value.measuredOuterClearance.valueMm)} mm. USER TARGET · inner ${desiredInner} · outer ${desiredOuter}. No target means no invented margin.`;
  }

  function showMeasurementStep(step: number): void {
    measurementStep = Math.min(5, Math.max(1, step));
    document.querySelectorAll<HTMLElement>('[data-measure-step]').forEach((panel) => { panel.hidden = Number(panel.dataset.measureStep) !== measurementStep; });
    document.querySelectorAll<HTMLButtonElement>('[data-measure-go]').forEach((button) => { button.classList.toggle('secondary', Number(button.dataset.measureGo) !== measurementStep); });
    required<HTMLButtonElement>('#measure-back').disabled = measurementStep === 1;
    const next = required<HTMLButtonElement>('#measure-next');
    next.disabled = measurementStep === 5;
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
    status.textContent = 'Shared new setup saved to this browser.';
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
    status.textContent = 'User-measured clearance profile saved to this vehicle.';
    renderGarage(result.value);
    generateMap();
  });
  required('#search-what-fits').addEventListener('click', searchWhatFitsFromInputs);
  required('#measure-back').addEventListener('click', () => showMeasurementStep(measurementStep - 1));
  required('#measure-next').addEventListener('click', () => showMeasurementStep(measurementStep + 1));
  document.querySelectorAll<HTMLButtonElement>('[data-measure-go]').forEach((button) => button.addEventListener('click', () => showMeasurementStep(Number(button.dataset.measureGo))));
  required('#what-fits-section').addEventListener('input', updatePreflight);
  required('#measure-flow').addEventListener('input', updatePreflight);
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
  renderGarage(loaded.state);
  const storedClearance = loaded.state.clearanceProfiles.find((profile) => profile.vehicleId === loaded.state.activeVehicleId);
  if (storedClearance) populateClearance(storedClearance);
  if (loaded.status.startsWith('recovered-')) status.textContent = 'Invalid garage data was ignored and a safe empty garage was opened.';

  const decoded = decodeSetupShareHash(window.location.hash);
  if (decoded) {
    sharedPanel.hidden = false;
    if (decoded.ok) {
      shared = decoded.value;
      writeSetup('current', decoded.value.current);
      writeSetup('proposed', decoded.value.proposed);
      renderComparison();
    } else {
      required<HTMLElement>('#shared-message').textContent = 'The shared setup is invalid and was not loaded or saved.';
      required<HTMLButtonElement>('#save-shared').disabled = true;
    }
  }
  renderComparison();
  showMeasurementStep(1);
  updatePreflight();
  if (storedClearance) generateMap();
}
