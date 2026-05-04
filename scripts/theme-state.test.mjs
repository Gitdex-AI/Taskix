import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeThemeMode,
  resolveEffectiveTheme,
  themeStorageKey
} from "../src/components/theme/theme-state.ts";

describe("theme state helpers", () => {
  it("accepts only supported stored theme modes", () => {
    assert.equal(normalizeThemeMode("system"), "system");
    assert.equal(normalizeThemeMode("light"), "light");
    assert.equal(normalizeThemeMode("dark"), "dark");
    assert.equal(normalizeThemeMode("unexpected"), "system");
    assert.equal(normalizeThemeMode(null), "system");
  });

  it("resolves system mode from the operating system preference", () => {
    assert.equal(resolveEffectiveTheme("system", false), "light");
    assert.equal(resolveEffectiveTheme("system", true), "dark");
  });

  it("keeps explicit light and dark modes independent of system preference", () => {
    assert.equal(resolveEffectiveTheme("light", false), "light");
    assert.equal(resolveEffectiveTheme("light", true), "light");
    assert.equal(resolveEffectiveTheme("dark", false), "dark");
    assert.equal(resolveEffectiveTheme("dark", true), "dark");
  });

  it("uses a namespaced storage key", () => {
    assert.equal(themeStorageKey, "gitdex.theme.mode");
  });
});
