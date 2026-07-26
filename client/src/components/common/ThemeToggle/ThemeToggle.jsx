import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";

export function ThemeToggle({ className = "" }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const label =
    theme === "system"
      ? `Switch from system theme to ${isDark ? "light" : "dark"} mode`
      : `Switch to ${isDark ? "light" : "dark"} mode`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        "w-9 h-9 rounded-xl flex items-center justify-center hover:border-2",
        "theme-text hover:text-[var(--app-fg)]",
        " transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        className,
      ].join(" ")}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
