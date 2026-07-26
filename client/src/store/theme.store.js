/**
 * src/store/theme.store.js
 *
 * Central theme state for the entire frontend.
 *
 * The store supports the same theme modes as the backend profile schema:
 * light, dark, and system. Components can read the current mode, the
 * resolved visual theme, and the helper actions from anywhere.
 */

import { create } from "zustand";

export const THEME_STORAGE_KEY = "nexcart-theme";
export const THEME_MODES = ["light", "dark", "system"];
const THEME_QUERY = "(prefers-color-scheme: dark)";

export const isThemeMode = (value) => THEME_MODES.includes(value);

export const getSystemTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(THEME_QUERY).matches ? "dark" : "light";
};

export const getResolvedTheme = (theme) =>
  theme === "system" ? getSystemTheme() : theme;

export const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") {
    return getResolvedTheme(theme);
  }

  const resolvedTheme = getResolvedTheme(theme);
  const root = document.documentElement;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.classList.toggle("light", resolvedTheme !== "dark");
  root.style.colorScheme = resolvedTheme === "dark" ? "dark" : "light";

  return resolvedTheme;
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(savedTheme)) {
      return savedTheme;
    }
  } catch {
    // Ignore storage access errors and fall back to system preference.
  }

  return "system";
};

const persistTheme = (theme) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage access errors so the UI still works in private mode.
  }
};

const syncTheme = (theme) => {
  const resolvedTheme = applyThemeToDocument(theme);
  persistTheme(theme);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
  };
};

export const useThemeStore = create((set, get) => {
  const initialTheme = getInitialTheme();
  const initialState = syncTheme(initialTheme);

  return {
    theme: initialState.theme,
    resolvedTheme: initialState.resolvedTheme,
    isDark: initialState.isDark,

    setTheme: (theme) => {
      if (!isThemeMode(theme)) {
        return;
      }

      set(() => syncTheme(theme));
    },

    toggleTheme: () => {
      const currentResolvedTheme = getResolvedTheme(get().theme);
      const nextTheme = currentResolvedTheme === "dark" ? "light" : "dark";
      set(() => syncTheme(nextTheme));
    },

    syncSystemTheme: () => {
      if (get().theme !== "system") {
        return;
      }

      set(() => {
        const resolvedTheme = applyThemeToDocument("system");
        return {
          resolvedTheme,
          isDark: resolvedTheme === "dark",
        };
      });
    },
  };
});
