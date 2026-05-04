"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { type ThemeMode, themeModes } from "./theme-state";
import { useTheme } from "./ThemeProvider";
import styles from "./theme-selector.module.css";

const themeLabels: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark"
};

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon
};

export function ThemeSelector() {
  const { mode, setMode } = useTheme();

  return (
    <div
      aria-label="Theme mode"
      className={styles.selector}
      role="radiogroup"
    >
      {themeModes.map((themeMode) => {
        const Icon = themeIcons[themeMode];
        const selected = mode === themeMode;

        return (
          <button
            aria-checked={selected}
            aria-label={`${themeLabels[themeMode]} theme`}
            className={styles.option}
            data-selected={selected ? "true" : undefined}
            key={themeMode}
            onClick={() => setMode(themeMode)}
            role="radio"
            title={`${themeLabels[themeMode]} theme`}
            type="button"
          >
            <Icon aria-hidden="true" size={15} strokeWidth={2.2} />
            <span>{themeLabels[themeMode]}</span>
          </button>
        );
      })}
    </div>
  );
}
