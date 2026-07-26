/**
 * src/components/layout/Navbar/Navbar.jsx
 *
 * PURPOSE:
 *   Desktop horizontal navigation links (Home, Products, Categories).
 *   Shown inside the Header on lg+ screens only.
 *   Highlights the currently active route with indigo underline.
 *
 * WHY SEPARATE FROM HEADER:
 *   Isolating nav links makes it trivial to add dropdown mega-menus
 *   in future phases (e.g. Categories with sub-categories) without
 *   touching Header or MobileMenu.
 *
 * FUTURE:
 *   Replace static NAV_LINKS with a React Query fetch of GET /categories
 *   to build a dynamic category mega-menu beneath "Categories".
 */

import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "../../../constants/app.constants";

export function Navbar() {
  return (
    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
      {NAV_LINKS.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/"}
          className={({ isActive }) =>
            [
              "relative px-3 py-2 text-sm font-medium rounded-lg hover:border-2   ",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ",
              isActive
                ? "text-indigo-600 dark:text-indigo-400  "
                : "theme-text ",
            ].join(" ")
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
