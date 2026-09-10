const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));

function numeric(form: HTMLFormElement, name: string): number {
  const field = form.elements.namedItem(name) as HTMLInputElement | null;
  const value = Number(field?.value);
  return Number.isFinite(value) ? value : 0;
}

function rotate(element: SVGGraphicsElement | null, degrees: number, x: number, y: number): void {
  element?.setAttribute('transform', `rotate(${degrees} ${x} ${y})`);
}

function sync(machine: HTMLElement): void {
  const visual = machine.querySelector<HTMLElement>('[data-tool-visual]');
  const form = machine.querySelector<HTMLFormElement>('form');
  if (!visual || !form) return;
  const id = machine.dataset.toolId;
  if (id === 'fuel-cost-calculator' || id === 'road-trip-cost-calculator') {
    const progress = clamp(Math.log10(numeric(form, 'distance') + 1) / 4, 0, 1);
    visual.querySelectorAll<SVGGraphicsElement>('[data-car-part]').forEach((part) => part.setAttribute('transform', `translate(${(-18 + progress * 36).toFixed(1)} 0)`));
  }
  if (id === 'mpg-l100km-converter' || id === 'psi-bar-converter') {
    const raw = numeric(form, 'value');
    const max = id === 'psi-bar-converter' ? 60 : 70;
    const degrees = -65 + clamp(raw / max, 0, 1) * 130;
    const needle = visual.querySelector<SVGGraphicsElement>('[data-gauge-needle]');
    rotate(needle, degrees, id === 'psi-bar-converter' ? 261 : 302, id === 'psi-bar-converter' ? 112 : 91);
    const reading = visual.querySelector<SVGTextElement>('[data-gauge-value]');
    if (reading) reading.textContent = String(Math.round(raw));
    const unit = visual.querySelector<SVGTextElement>('[data-gauge-unit]');
    const select = form.elements.namedItem('unit') as HTMLSelectElement | null;
    if (unit && select) unit.textContent = select.value.toUpperCase();
    if (id === 'psi-bar-converter') {
      const pressure = select?.value === 'bar' ? raw * 14.5038 : select?.value === 'kpa' ? raw * 0.145038 : raw;
      const scale = 0.96 + clamp(pressure / 60, 0, 1) * 0.06;
      visual.querySelector<SVGCircleElement>('[data-tire-ring]')?.setAttribute('transform', `translate(${178 * (1 - scale)} ${98 * (1 - scale)}) scale(${scale})`);
    }
  }
  if (id === 'speedometer-error-calculator') {
    const readingValue = numeric(form, 'indicatedSpeed');
    rotate(visual.querySelector<SVGGraphicsElement>('[data-gauge-needle]'), -70 + clamp(readingValue / 200, 0, 1) * 140, 180, 137);
    const reading = visual.querySelector<SVGTextElement>('[data-gauge-value]');
    if (reading) reading.textContent = String(Math.round(readingValue));
  }
  if (id === 'hp-kw-converter') {
    const pulse = 0.88 + clamp(numeric(form, 'value') / 500, 0, 1) * 0.22;
    visual.querySelector<SVGGraphicsElement>('[data-power-pulse]')?.setAttribute('transform', `translate(${190 * (1 - pulse)} ${95 * (1 - pulse)}) scale(${pulse})`);
  }
  if (id === 'nm-lb-ft-converter') rotate(visual.querySelector<SVGGraphicsElement>('[data-torque-ring]'), clamp(numeric(form, 'value') / 1000, 0, 1) * 210, 180, 99);
  if (id === 'power-to-weight-calculator') {
    const ratio = numeric(form, 'power') / Math.max(1, numeric(form, 'weight'));
    rotate(visual.querySelector<SVGGraphicsElement>('[data-power-scale]'), clamp((ratio - .12) * 70, -8, 8), 180, 65);
  }
}

export function initializeToolVisualMotion(): void {
  document.querySelectorAll<HTMLElement>('.tool-machine').forEach((machine) => {
    if (machine.dataset.visualMotionReady === 'true') return;
    machine.dataset.visualMotionReady = 'true';
    const form = machine.querySelector<HTMLFormElement>('form');
    if (!form) return;
    const update = (): void => sync(machine);
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', () => requestAnimationFrame(update));
    update();
  });
}
