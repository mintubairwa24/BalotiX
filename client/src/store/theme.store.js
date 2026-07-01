/**
 * src/store/theme.store.js
 *
 * PURPOSE:
 *   Manages light/dark mode preference across the app.
 *   Persists to localStorage so the preference survives page refresh.
 *   Applies the "dark" class to <html> so Tailwind's dark: variants work.
 *
 * WHY NOT CSS-ONLY:
 *   The ThemeToggle component in the Header needs to read and flip the
 *   current theme. A Zustand store lets any component read/set it without
 *   prop drilling or a React context.
 *
 * TAILWIND DARK MODE:
 *   tailwind.config.js must have `darkMode: "class"` for dark: utilities
 *   to activate via the class on <html>.
 */

import { create } from "zustand";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("nexcart-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem("nexcart-theme", theme);
  } catch {
    // localStorage unavailable (private browsing) — silently ignore
  }
};

export const useThemeStore = create((set) => {
  const initial = getInitialTheme();
  applyTheme(initial);

  return {
    theme: initial,
    isDark: initial === "dark",

    toggleTheme: () =>
      set((state) => {
        const next = state.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        return { theme: next, isDark: next === "dark" };
      }),

    setTheme: (theme) =>
      set(() => {
        applyTheme(theme);
        return { theme, isDark: theme === "dark" };
      }),
  };
});