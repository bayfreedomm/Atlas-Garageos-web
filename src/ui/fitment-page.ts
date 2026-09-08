import type { GarageState, SavedSetup } from '../domain/garage';
import type { ValidationIssue } from '../domain/validation';
import { GarageService } from '../features/garage/garage-service';
import { compareSetupInputs, type SetupInput } from '../features/compare/compare-setups';
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
  const repository = createBrowserGarageRepository();
  const service = new GarageService(repository, {
    createId: () => crypto.randomUUID(),
    nowIso: () => new Date().toISOString(),
  });
  let shared: SetupShareV1 | undefined;

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
    garageList.replaceChildren();
    if (state.savedSetups.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = translate('en', 'garageEmpty');
      garageList.append(empty);
      return;
    }
    for (const saved of state.savedSetups) {
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

  form.addEventListener('submit', (event) => { event.preventDefault(); renderComparison(); });
  required('#save-current').addEventListener('click', () => void save('current'));
  required('#save-proposed').addEventListener('click', () => void save('proposed'));
  required('#copy-share').addEventListener('click', async () => {
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
  });
  required('#save-shared').addEventListener('click', async () => {
    if (!shared) return;
    const result = await service.saveSharedSetup(shared, input('shared-setup-name').value, input('vehicle-nickname').value);
    if (!result.ok) { showIssues(errors, result.issues); return; }
    status.textContent = 'Shared new setup saved to this browser.';
    renderGarage(result.value);
  });

  const loaded = await service.load();
  renderGarage(loaded.state);
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
}
