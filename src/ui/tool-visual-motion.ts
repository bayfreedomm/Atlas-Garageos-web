const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

function numberField(root: ParentNode, name: string, fallback = 0): number {
  const value = Number(root.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value);
  return Number.isFinite(value) ? value : fallback;
}

function tireDiameter(root: ParentNode, prefix: string): number {
  return numberField(root, `${prefix}rimDiameterInches`, 18) * 25.4
    + 2 * numberField(root, `${prefix}widthMm`, 225) * (numberField(root, `${prefix}aspectRatio`, 45) / 100);
}

function setText(visual: HTMLElement, selector: string, text: string): void {
  const node = visual.querySelector<SVGTextElement>(selector);
  if (node) node.textContent = text;
}

function paint(container: HTMLElement): void {
  const id = container.dataset.toolId;
  if (!id) return;
  const visual = container.querySelector<HTMLElement>(`[data-live-tool="${id}"]`);
  const form = container.querySelector<HTMLFormElement>('form');
  if (!visual || !form) return;
  const motion = visual.querySelector<SVGElement>('[data-live-motion]');
  const needle = visual.querySelector<SVGElement>('[data-live-needle]');

  if (id === 'fuel-cost-calculator' || id === 'road-trip-cost-calculator') {
    const distance = numberField(form, 'distance', 500);
    motion?.setAttribute('transform', `translate(${clamp(distance / 20, 4, 46) - 24} 0)`);
    setText(visual, '[data-live-value]', `${Math.round(distance)} ${form.querySelector<HTMLSelectElement>('[name="system"]')?.value === 'imperial' ? 'mi' : 'km'}`);
  }
  if (id === 'mpg-l100km-converter') {
    setText(visual, '[data-live-value]', String(numberField(form, 'value', 30)));
    const unit = form.querySelector<HTMLSelectElement>('[name="unit"]')?.selectedOptions[0]?.textContent ?? 'MPG';
    setText(visual, '[data-live-unit]', unit.replace('Imperial ', '').replace('US ', '').toUpperCase());
  }
  if (id === 'psi-bar-converter') {
    const pressure = numberField(form, 'value', 32);
    const unit = form.querySelector<HTMLSelectElement>('[name="unit"]')?.value ?? 'psi';
    const psi = unit === 'bar' ? pressure * 14.5038 : unit === 'kpa' ? pressure * .145038 : pressure;
    needle?.setAttribute('transform', `rotate(${clamp((psi - 32) * 1.2, -35, 35)} 261 112)`);
    setText(visual, '[data-live-value]', String(Number(pressure.toFixed(1))));
    setText(visual, '[data-live-unit]', unit.toUpperCase());
  }
  if (id === 'speedometer-error-calculator') {
    const indicated = numberField(form, 'indicatedSpeed', 100);
    const original = tireDiameter(form, 'original-');
    const proposed = tireDiameter(form, 'new-');
    const actual = original > 0 ? indicated * proposed / original : indicated;
    needle?.setAttribute('transform', `rotate(${clamp((actual - 100) * .8, -38, 38)} 180 137)`);
    setText(visual, '[data-live-value]', String(Number(actual.toFixed(1))));
  }
  if (id === 'hp-kw-converter') {
    const power = numberField(form, 'value', 180);
    motion?.setAttribute('transform', `translate(0 ${clamp(12 - power / 40, -8, 8)}) scale(${clamp(.8 + power / 1000, .85, 1.15)})`);
  }
  if (id === 'nm-lb-ft-converter') {
    needle?.setAttribute('transform', `rotate(${clamp(numberField(form, 'value', 300) / 12, 0, 120)} 180 99)`);
  }
  if (id === 'power-to-weight-calculator') {
    const ratio = numberField(form, 'power', 180) / Math.max(numberField(form, 'weight', 1350), 1);
    visual.querySelector<SVGElement>('[data-live-scale]')?.setAttribute('transform', `rotate(${clamp((ratio - .13) * 80, -8, 8)} 180 100)`);
  }
  if (id === 'gear-ratio-calculator') {
    const current = numberField(form, 'currentDiameter', 31);
    const next = numberField(form, 'newDiameter', 35);
    visual.querySelector<SVGElement>('[data-live-primary]')?.setAttribute('transform', `rotate(${current * 4} 145 103)`);
    visual.querySelector<SVGElement>('[data-live-secondary]')?.setAttribute('transform', `rotate(${-next * 5} 224 103)`);
  }
}

export function initializeToolVisualMotion(): void {
  document.querySelectorAll<HTMLElement>('[data-tool-id]').forEach((container) => {
    const form = container.querySelector<HTMLFormElement>('form');
    if (!form || container.dataset.visualReady === 'true') return;
    container.dataset.visualReady = 'true';
    const update = (): void => paint(container);
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', () => requestAnimationFrame(update));
    update();
  });
}
