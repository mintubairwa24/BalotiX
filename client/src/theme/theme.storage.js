import { THEME_MODES, THEME_STORAGE_KEY } from "./theme.constants";

export const isThemeMode = (value) => THEME_MODES.includes(value);

export const readStoredThemeMode = () => {
  if (typeof window === "undefined") {
    return "system";
  }

  // Storage is optional, so any access failure falls back to System mode.
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

export const writeStoredThemeMode = (themeMode) => {
  if (typeof window === "undefined" || !isThemeMode(themeMode)) {
    return;
  }

  // Persist only the user's explicit mode choice, not the resolved OS theme.
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  } catch {
    // Ignore private-mode and storage access failures.
  }
};
