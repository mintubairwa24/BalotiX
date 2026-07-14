/**
 * ============================================================================
 * src/components/admin/QuickActions/QuickActions.jsx
 * QuickActions — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A grid of shortcut buttons to the admin CRUD sections (Products, Orders,
 * Users, Coupons, Categories). This is explicitly a PREVIEW of future
 * navigation, not functional navigation — per the Phase 17 brief:
 * "DO NOT BUILD: Product/Category/User/Order/Coupon CRUD" and
 * "QuickActions component should link to these as future routes only."
 *
 * WHY DISABLED, NOT REAL LINKS:
 * None of /admin/products, /admin/orders, /admin/users, /admin/coupons,
 * /admin/categories exist as routes yet (they're future phases). Rendering
 * them as real <Link>s would produce dead/404 navigation the moment an
 * admin clicks — instead each action is a disabled button with a visible
 * "Soon" badge, so the dashboard communicates the FUTURE information
 * architecture without shipping broken UX today.
 *
 * HOW TO ACTIVATE LATER:
 * When a future phase adds a real route (e.g. Phase 18 ships
 * /admin/products), flip that single action's `enabled: true` in the
 * ACTIONS array below and it automatically becomes a real <Link> — no
 * structural change needed elsewhere in this component.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero dead links / zero 404s (Convention #10 — conditional features
 *   degrade gracefully; here the "feature" is the target route itself)
 * - Single source of truth (ACTIONS array) for both the visual scaffold
 *   today and the real navigation tomorrow — no rewrite needed later
 * - Fully keyboard/screen-reader accessible: disabled actions use a real
 *   <button disabled> (not a styled div) so assistive tech announces them
 *   correctly as unavailable
 */

import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users, Tag, FolderTree } from "lucide-react";

const ACTIONS = [
  { key: "products", label: "Products", icon: Package, to: "/admin/products", enabled: false },
  { key: "orders", label: "Orders", icon: ShoppingCart, to: "/admin/orders", enabled: false },
  { key: "users", label: "Users", icon: Users, to: "/admin/users", enabled: false },
  { key: "coupons", label: "Coupons", icon: Tag, to: "/admin/coupons", enabled: false },
  { key: "categories", label: "Categories", icon: FolderTree, to: "/admin/categories", enabled: false },
];

const ActionCard = ({ action }) => {
  const { icon: Icon, label, to, enabled } = action;

  const baseClasses =
    "relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition";

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={`${label} management — coming soon`}
        className={`${baseClasses} cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-600`}
      >
        <span className="absolute right-2 top-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          Soon
        </span>
        <Icon className="h-5 w-5" />
        {label}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClasses} border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
};

export const QuickActions = () => (
  <div>
    <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {ACTIONS.map((action) => (
        <ActionCard key={action.key} action={action} />
      ))}
    </div>
  </div>
);

export default QuickActions;