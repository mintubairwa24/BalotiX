/**
 * src/components/account/AccountSidebar/AccountSidebar.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Navigation sidebar linking between the four account pages this phase
 * builds (Dashboard, Profile, Edit Profile, Security), plus the two
 * already-existing related pages from earlier phases (Orders, Address
 * Book) so the account area feels like one cohesive hub rather than
 * scattered pages.
 * 
 * Uses react-router-dom's NavLink (not Link) specifically because it
 * provides automatic active-route styling via its `className` render
 * function — no manual `useLocation()` comparison needed, keeping this
 * component simple and framework-idiomatic.
 * 
 * REUSE (links to existing pages, no new components needed):
 * - /orders (Phase 14)
 * - /address (Phase 11)
 */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  Lock,
  Package,
  MapPin,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/account", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/account/profile", icon: UserCircle, label: "Profile" },
  { to: "/account/security", icon: Lock, label: "Security" },
  { to: "/orders", icon: Package, label: "Orders" },
  { to: "/address", icon: MapPin, label: "Addresses" },
];

export const AccountSidebar = () => {
  return (
    <nav className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
      {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};