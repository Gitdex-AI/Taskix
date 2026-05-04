export const themeStorageKey = "gitdex.theme.mode";

export type ThemeMode = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

export const themeModes: ThemeMode[] = ["system", "light", "dark"];
export const themePalettes: Record<EffectiveTheme, Record<string, string>> = {
  light: {
    "--app-bg": "#f4f7fb",
    "--app-shell": "#ffffff",
    "--app-border": "#dde5ee",
    "--app-ink": "#172033"
  },
  dark: {
    "--app-bg": "#0f172a",
    "--app-shell": "#172033",
    "--app-border": "#334155",
    "--app-ink": "#e5edf8"
  }
};

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function normalizeThemeMode(value: string | null): ThemeMode {
  return isThemeMode(value) ? value : "system";
}

export function resolveEffectiveTheme(
  mode: ThemeMode,
  prefersDark: boolean
): EffectiveTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
}
