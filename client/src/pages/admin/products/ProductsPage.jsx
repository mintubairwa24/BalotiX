/**
 * FILE: src/pages/admin/products/ProductsPage.jsx
 *
 * ============================================================================
 * ProductsPage — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/products route (rendered inside AdminLayout's <Outlet />,
 * Phase 17). Composes ProductSearch + ProductFilters in a toolbar row, the
 * ProductsTable itself, and mounts DeleteProductModal once at the page
 * level (it renders `null` until a delete is triggered from any
 * ProductActions button, so one instance here covers every row).
 *
 * AUTHORIZATION (Convention: reuse the existing auth system):
 * Uses the SAME role-check pattern AdminDashboardPage established in
 * Phase 17 (`user.role === "admin"` via useAuthStore). This phase adds
 * THREE admin pages (Products list/create/edit) all needing this same
 * check — which is exactly the trigger Phase 17's AdminDashboardPage
 * flagged for extracting a reusable <AdminRoute> guard wrapping
 * AdminLayout. That extraction is a clean, isolated infra follow-up (it
 * touches routing, not this feature's files) and intentionally NOT done
 * here, since Phase 18A's file list is scoped to the Products feature
 * only. Until then, this check is duplicated verbatim across
 * ProductsPage/CreateProductPage/EditProductPage — flagged, not hidden.
 *
 * PRODUCTION-READY BECAUSE:
 * - "Add Product" CTA is always reachable from the list, the natural entry
 *   point into CreateProductPage
 * - Toolbar (search + filters) wraps responsively on narrow admin viewports
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuthStore } from "../../../store";
import ProductSearch from "../../../components/admin/products/ProductSearch/ProductSearch";
import ProductFilters from "../../../components/admin/products/ProductFilters/ProductFilters";
import ProductsTable from "../../../components/admin/products/ProductsTable/ProductsTable";
import DeleteProductModal from "../../../components/admin/products/DeleteProductModal/DeleteProductModal";

const ProductsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Products
        </h1>
        <Link
          to="/admin/products/create"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProductSearch />
        <ProductFilters />
      </div>

      <ProductsTable />

      <DeleteProductModal />
    </div>
  );
};

export default ProductsPage;