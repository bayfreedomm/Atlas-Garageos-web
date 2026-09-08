import { parseThemePreference, resolveTheme, THEME_STORAGE_KEY } from './theme-preference';

export function initializeThemeControls(): void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const controls = [...document.querySelectorAll<HTMLSelectElement>('[data-theme-control]')];
  if (controls.length === 0) return;

  let preference = parseThemePreference(document.documentElement.dataset.themePreference ?? localStorage.getItem(THEME_STORAGE_KEY));
  const apply = (): void => {
    const resolved = resolveTheme(preference, media.matches);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = resolved;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => { meta.content = resolved === 'dark' ? '#101513' : '#123d36'; });
    controls.forEach((control) => { control.value = preference; });
  };

  controls.forEach((control) => control.addEventListener('change', () => {
    preference = parseThemePreference(control.value);
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    apply();
  }));
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  apply();
}
