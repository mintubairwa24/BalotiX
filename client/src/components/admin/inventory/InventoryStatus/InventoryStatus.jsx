/**
 * FILE: src/components/admin/inventory/InventoryStatus/InventoryStatus.jsx
 *
 * ============================================================================
 * InventoryStatus — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a product's stock status as a colored badge — "In Stock" /
 * "Low Stock" / "Out of Stock".
 *
 * WHY THIS IS DISPLAY-ONLY AND NEVER COMPUTES ITS OWN THRESHOLD LOGIC
 * (the most important design decision in this phase, worth repeating
 * here where it matters most): this component receives a `status` string
 * and renders it — it does NOT compare `currentStock` to
 * `lowStockThreshold` itself. The brief is explicit: "reuse backend...
 * stock adjustment logic" and "do not invent business logic." Deciding
 * WHAT COUNTS AS "low" stock is a business rule (is the threshold per-
 * product? store-wide? does it account for reserved/pending-order stock?)
 * that only the backend should own — reimplementing that comparison here,
 * even if it happened to match today, would silently drift the moment the
 * backend's rule changes (e.g. a per-category threshold override added
 * later) without this component ever knowing. So: this badge trusts
 * whatever `status` the backend already computed and sent, full stop.
 *
 * WHY THIS ISN'T CLICKABLE (unlike ProductStatus/CouponStatus):
 * Stock status isn't a togglable flag an admin flips — it's a DERIVED
 * READ of current stock level. There's nothing to "activate/deactivate"
 * here; the only way to change it is to actually adjust stock (via
 * UpdateStockModal), which is a different, more deliberate action than a
 * one-click status toggle.
 *
 * PRODUCTION-READY BECAUSE:
 * - Falls back to a neutral "Unknown" badge if `status` is an unexpected
 *   value, rather than rendering nothing or crashing on an unmapped case
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { CheckCircle, AlertTriangle, XCircle, HelpCircle, Ban } from "lucide-react";

const STATUS_CONFIG = {
  in_stock: {
    label: "In Stock",
    icon: CheckCircle,
    classes: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  low_stock: {
    label: "Low Stock",
    icon: AlertTriangle,
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  out_of_stock: {
    label: "Out of Stock",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  discontinued: {
    label: "Discontinued",
    icon: Ban,
    classes: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
};

const FALLBACK_CONFIG = {
  label: "Unknown",
  icon: HelpCircle,
  classes: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

export const InventoryStatus = ({ status }) => {
  const { label, icon: Icon, classes } = STATUS_CONFIG[status] ?? FALLBACK_CONFIG;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

export default InventoryStatus;  
