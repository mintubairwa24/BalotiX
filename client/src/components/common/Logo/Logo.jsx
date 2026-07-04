/**
 * src/components/common/Logo/Logo.jsx
 *
 * PURPOSE:
 *   The NexCart brand mark used in Header, Footer, AuthLayout, and
 *   error pages. One component, consistent across the entire app.
 *
 * PROPS:
 *   size   → "sm" | "md" | "lg"   controls icon + text size
 *   white  → boolean              white variant for dark backgrounds (Footer)
 *   noText → boolean              icon-only for compact spaces
 *
 * FUTURE:
 *   Replace the letter mark with an actual SVG logo by swapping the
 *   inner content of the icon div — zero impact on consuming components.
 */

import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const SIZE_MAP = {
  sm: { icon: 16, text: "text-base", box: "w-7 h-7 rounded-lg" },
  md: { icon: 20, text: "text-xl", box: "w-9 h-9 rounded-xl" },
  lg: { icon: 24, text: "text-2xl", box: "w-11 h-11 rounded-xl" },
};

export function Logo({ size = "md", white = false, noText = false, to = "/" }) {
  const s = SIZE_MAP[size];

  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
      aria-label="NexCart — Go to homepage"
    >
      <div
        className={`${s.box} flex items-center justify-center flex-shrink-0 ${
          white ? "bg-white" : "bg-indigo-600"
        }`}
      >
        <ShoppingBag
          size={s.icon}
          className={white ? "text-indigo-600" : "text-white"}
          aria-hidden="true"
        />
      </div>

      {!noText && (
        <span
          className={`${s.text} font-bold tracking-tight ${
            white ? "text-white" : "theme-text"
          }`}
        >
          NexCart
        </span>
      )}
    </Link>
  );
}
