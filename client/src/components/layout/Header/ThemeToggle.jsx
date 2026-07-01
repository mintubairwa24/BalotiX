/**
 * src/components/layout/Header/ThemeToggle.jsx
 *
 * PURPOSE:
 *   Icon button that toggles between light and dark mode.
 *   Reads and writes to theme.store.js.
 *   Used in both the Header (desktop) and MobileMenu (mobile).
 */

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../../store/theme.store";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}