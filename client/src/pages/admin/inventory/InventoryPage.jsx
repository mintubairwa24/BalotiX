/**
 * FILE: src/pages/admin/inventory/InventoryPage.jsx
 *
 * ============================================================================
 * InventoryPage — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/inventory route (rendered inside AdminLayout's <Outlet />,
 * Phase 17). Composes LowStockCard (summary), InventorySearch +
 * InventoryFilters in a toolbar row, and InventoryTable — which itself
 * mounts UpdateStockModal. Exact sibling of ProductsPage/CouponsPage,
 * minus a "Create" button (see InventoryEmpty's header for why inventory
 * records aren't independently creatable).
 *
 * WHY LowStockCard READS FROM THE SAME LIST QUERY AS THE TABLE:
 * `useAdminInventoryList()` is called here (for `summary`/`items`) AND
 * inside InventoryTable — React Query dedupes identical queries, so this
 * is one network request shared across both, not two.
 *
 * AUTHORIZATION (Convention: reuse the existing auth system):
 * Same role-check pattern duplicated across every admin page since Phase
 * 17 — now duplicated across fourteen admin pages. Flagged again, not
 * addressed here, consistent with every prior phase's note.
 *
 * PRODUCTION-READY BECAUSE:
 * - Toolbar (search + filters) wraps responsively on narrow admin viewports
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import { useAdminInventoryList } from "../../../hooks/useAdminInventory";
import { InventorySearch } from "../../../components/admin/inventory/InventorySearch/InventorySearch";
import { InventoryFilters } from "../../../components/admin/inventory/InventoryFilters/InventoryFilters";
import { InventoryTable } from "../../../components/admin/inventory/InventoryTable/InventoryTable";
import { LowStockCard } from "../../../components/admin/inventory/LowStockCard/LowStockCard";

const InventoryPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  const { items, summary } = useAdminInventoryList();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      setBlocked(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, isAdmin, navigate]);

  if (isAuthLoading) return null;
  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting…
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Inventory</h1>

      <LowStockCard summary={summary} items={items} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <InventorySearch />
        <InventoryFilters />
      </div>

      <InventoryTable />
    </div>
  );
};

export default InventoryPage;