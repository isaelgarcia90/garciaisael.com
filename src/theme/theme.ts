import { DEFAULT_THEME_ID, THEMES, Theme, ThemeId } from "./themes";

const STORAGE_KEY = "portfolio-theme";
const THEME_EVENT = "themechange";

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};

// Mix two hex colors: t = 0 gives a, t = 1 gives b
export const mixColors = (a: string, b: string, t: number) => {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return (
    "#" +
    ca
      .map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, "0"))
      .join("")
  );
};

// Very light tint of the accent (monitor screen glow, soft highlights)
export const lightTint = (theme: Theme) => mixColors(theme.accent, "#ffffff", 0.65);

const findTheme = (id: string | null) => THEMES.find((t) => t.id === id);

let current: Theme = findTheme(DEFAULT_THEME_ID)!;

export const getTheme = () => current;

export const getSavedThemeId = (): ThemeId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (findTheme(saved)) return saved as ThemeId;
  } catch {
    // storage not available: use the default
  }
  return DEFAULT_THEME_ID;
};

// Sets the CSS variables used across the site and notifies the 3D scene
export const applyTheme = (id: ThemeId, persist = true) => {
  current = findTheme(id) || findTheme(DEFAULT_THEME_ID)!;
  const t = current;
  const vars: Record<string, string> = {
    "--accentColor": t.accent,
    "--accentSoft": mixColors(t.accent, "#ffffff", 0.3),
    "--accentLight": lightTint(t),
    "--accentMid": mixColors(t.accent, t.deep, 0.5),
    "--accentDeep": t.deep,
    "--accentDark": t.dark,
    "--accentMuted": t.muted,
    "--accentRgb": hexToRgb(t.accent).join(", "),
    "--accentDeepRgb": hexToRgb(t.deep).join(", "),
  };
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, t.id);
    } catch {
      // ignore
    }
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: t }));
};

// Subscribe to mode changes. Returns a function to unsubscribe.
export const onThemeChange = (callback: (theme: Theme) => void) => {
  const handler = (e: Event) => callback((e as CustomEvent<Theme>).detail);
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
};
