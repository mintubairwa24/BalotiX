import { readStoredThemeMode, isThemeMode } from "./theme.storage";

const THEME_QUERY = "(prefers-color-scheme: dark)";

export const getSystemTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(THEME_QUERY).matches ? "dark" : "light";
};

export const getResolvedTheme = (themeMode, systemTheme = getSystemTheme()) => {
  if (themeMode === "system") {
    return systemTheme;
  }

  return themeMode === "dark" ? "dark" : "light";
};

export const getInitialThemeMode = () => {
  const storedTheme = readStoredThemeMode();
  return isThemeMode(storedTheme) ? storedTheme : "system";
};

export const applyThemeToDocument = (themeMode, systemTheme = getSystemTheme()) => {
  if (typeof document === "undefined") {
    return getResolvedTheme(themeMode, systemTheme);
  }

  const resolvedTheme = getResolvedTheme(themeMode, systemTheme);
  const root = document.documentElement;

  // Update the root element once so Tailwind dark classes and CSS variables
  // both react to the same resolved theme.
  root.dataset.themeMode = themeMode;
  root.dataset.theme = resolvedTheme;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.classList.toggle("light", resolvedTheme !== "dark");
  root.style.colorScheme = resolvedTheme === "dark" ? "dark" : "light";

  return resolvedTheme;
};

export const getThemeBootstrapScript = () => {
  // Mirrors the provider's initial sync so the first paint uses the right
  // theme before React mounts.
  return `!function(){try{var k="nexcart-theme",m=localStorage.getItem(k),o=m==="light"||m==="dark"||m==="system"?m:"system",d=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",r=o==="system"?d:o,e=document.documentElement;e.dataset.themeMode=o,e.dataset.theme=r,e.classList.toggle("dark",r==="dark"),e.classList.toggle("light",r!=="dark"),e.style.colorScheme=r==="dark"?"dark":"light"}catch(e){}}();`;
};
