import { useEffect, useMemo, useState } from "react";

import { ThemeContext } from "./theme.context";
import {
  applyThemeToDocument,
  getInitialThemeMode,
  getResolvedTheme,
  getSystemTheme,
} from "./theme.utils";
import {
  isThemeMode,
  writeStoredThemeMode,
} from "./theme.storage";

export function ThemeProvider({ children }) {
  // `theme` is the persisted user choice, while `systemTheme` tracks the
  // live OS preference so System mode updates immediately.
  const [theme, setThemeState] = useState(getInitialThemeMode);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    applyThemeToDocument(theme, systemTheme);
    writeStoredThemeMode(theme);

    if (theme !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    const nextSystemTheme = mediaQuery.matches ? "dark" : "light";
    setSystemTheme(nextSystemTheme);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme, systemTheme]);

  const resolvedTheme = useMemo(
    () => getResolvedTheme(theme, systemTheme),
    [theme, systemTheme],
  );

  const api = useMemo(() => {
    const nextTheme = (value) => {
      if (!isThemeMode(value)) {
        return;
      }

      setThemeState(value);
    };

    return {
      theme,
      resolvedTheme,
      systemTheme,
      isDark: resolvedTheme === "dark",
      setTheme: nextTheme,
      setThemeMode: nextTheme,
      toggleTheme: () => {
        setThemeState((currentTheme) => {
          const currentResolved = getResolvedTheme(currentTheme, systemTheme);
          return currentResolved === "dark" ? "light" : "dark";
        });
      },
    };
  }, [resolvedTheme, systemTheme, theme]);

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}
