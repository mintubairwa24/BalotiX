/**
 * FILE: src/components/admin/inventory/LowStockCard/LowStockCard.jsx
 *
 * ============================================================================
 * LowStockCard — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Summary stat cards at the top of InventoryPage — total items, low-stock
 * count, out-of-stock count — per the brief's "Low-stock indicators"
 * feature. Same visual pattern as DashboardStats (Phase 17) and
 * CategoryStatistics (Phase 18D): small icon+number cards, no charts.
 *
 * DATA SOURCE (flagged): reads the `summary` object assumed to be bundled
 * directly in GET /admin/inventory's response (see admin.service.js's
 * header) — NOT a separate stats endpoint. This means these counts are
 * assumed to be STORE-WIDE (computed server-side across all inventory,
 * not just the current page), unlike CategoryStatistics' Phase 18D
 * fallback which had to settle for current-page-only counts because no
 * such summary field was assumed there. If `summary` isn't actually
 * present in your backend's response, this component falls back to
 * counting only the CURRENTLY LOADED PAGE's items (clearly labeled as
 * such) rather than silently showing wrong/undefined numbers.
 *
 * WHY LOW-STOCK/OUT-OF-STOCK CARDS ARE CLICKABLE FILTERS:
 * Clicking either card applies that status as the InventoryFilters value
 * — a natural, low-friction way to jump straight to "show me what needs
 * attention" without manually opening the filter dropdown. This reuses
 * the SAME `setStatus` store action InventoryFilters itself calls, not a
 * separate filtering mechanism.
 *
 * PRODUCTION-READY BECAUSE:
 * - Explicit about being page-scoped in the fallback case, never
 *   misleading
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Package, AlertTriangle, XCircle } from "lucide-react";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";

export const StatCard = ({ icon: Icon, label, value, accent, onClick }) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 text-left dark:border-gray-700 dark:bg-gray-800 ${
        onClick ? "transition hover:border-indigo-300 dark:hover:border-indigo-700" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`rounded-lg p-1.5 ${accent}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
    </Wrapper>
  );
};

export const LowStockCard = ({ summary, items = [] }) => {
  const setStatus = useAdminInventoryStore((s) => s.setStatus);

  const isPageScoped = !summary;
  const totalItems = summary?.totalItems ?? items.length;
  const lowStockCount = summary?.lowStockCount ?? items.filter((i) => i.status === "low_stock").length;
  const outOfStockCount = summary?.outOfStockCount ?? items.filter((i) => i.status === "out_of_stock").length;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={Package}
          label="Total Items"
          value={totalItems}
          accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockCount}
          accent="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
          onClick={() => setStatus("low_stock")}
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={outOfStockCount}
          accent="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
          onClick={() => setStatus("out_of_stock")}
        />
      </div>
      {isPageScoped && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Counts reflect the current page only — backend-wide summary not available.
        </p>
      )}
    </div>
  );
};

export default LowStockCard;

