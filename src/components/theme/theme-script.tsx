import { themePalettes, themeStorageKey } from "./theme-state";

const bootstrapScript = `
(function () {
  var storageKey = ${JSON.stringify(themeStorageKey)};
  var mode = "system";
  try {
    var storedMode = window.localStorage.getItem(storageKey);
    if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
      mode = storedMode;
    }
  } catch (error) {}

  var prefersDark = false;
  try {
    prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (error) {}

  var effectiveTheme = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  var root = document.documentElement;
  var palettes = ${JSON.stringify(themePalettes)};
  var palette = palettes[effectiveTheme];
  root.dataset.themeMode = mode;
  root.dataset.theme = effectiveTheme;
  root.style.colorScheme = effectiveTheme;
  Object.keys(palette).forEach(function (property) {
    root.style.setProperty(property, palette[property]);
  });
}());
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: bootstrapScript
      }}
    />
  );
}
