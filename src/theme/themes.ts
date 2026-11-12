// Color modes for the site and the character. Order = order in the mode menu.
// accent: texts, hovers, button | deep: cap visor, logo brackets, glows
// dark: long sleeves, shoe soles | muted: RESUME before hover
export type ThemeId = "kernel" | "hacker" | "retro" | "cloud" | "galaxy" | "clean";

export interface Theme {
  id: ThemeId;
  name: string;
  accent: string;
  deep: string;
  dark: string;
  muted: string;
}

export const THEMES: Theme[] = [
  { id: "kernel", name: "Kernel Panic", accent: "#ff3b3b", deep: "#CC0000", dark: "#7a0202", muted: "#a83232" },
  { id: "hacker", name: "Hacker", accent: "#1efa96", deep: "#1cae62", dark: "#0f5132", muted: "#1d864f" },
  { id: "retro", name: "Retro Terminal", accent: "#ffb020", deep: "#d97706", dark: "#7c2d12", muted: "#a8792f" },
  { id: "cloud", name: "Cloud", accent: "#22d3ee", deep: "#0891b2", dark: "#164e63", muted: "#2f92a9" },
  { id: "galaxy", name: "Galaxy", accent: "#a78bfa", deep: "#7c3aed", dark: "#4c1d95", muted: "#7c6aa8" },
  { id: "clean", name: "Clean Code", accent: "#e5e5e5", deep: "#9ca3af", dark: "#374151", muted: "#8b8f97" },
];

export const DEFAULT_THEME_ID: ThemeId = "kernel";
