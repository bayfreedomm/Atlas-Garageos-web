import { parseThemePreference, resolveTheme, THEME_STORAGE_KEY } from './theme-preference';

export function initializeThemeControls(): void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const controls = [...document.querySelectorAll<HTMLSelectElement>('[data-theme-control]')];
  const quickToggles = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-quick-toggle]')];
  if (controls.length === 0 && quickToggles.length === 0) return;

  let preference = parseThemePreference(document.documentElement.dataset.themePreference ?? localStorage.getItem(THEME_STORAGE_KEY));
  const apply = (): void => {
    const resolved = resolveTheme(preference, media.matches);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = resolved;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => { meta.content = resolved === 'dark' ? '#08131c' : '#f7f8f5'; });
    controls.forEach((control) => { control.value = preference; });
    quickToggles.forEach((button) => {
      const next = resolved === 'dark' ? 'light' : 'dark';
      const label = next === 'dark' ? 'Switch to night mode' : 'Switch to day mode';
      button.dataset.resolvedTheme = resolved;
      button.setAttribute('aria-label', label);
      button.title = label;
      const sr = button.querySelector<HTMLElement>('[data-theme-quick-label]');
      if (sr) sr.textContent = label;
    });
  };

  controls.forEach((control) => control.addEventListener('change', () => {
    preference = parseThemePreference(control.value);
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    apply();
  }));
  quickToggles.forEach((button) => button.addEventListener('click', () => {
    const resolved = resolveTheme(preference, media.matches);
    preference = resolved === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    apply();
  }));
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  apply();
}
