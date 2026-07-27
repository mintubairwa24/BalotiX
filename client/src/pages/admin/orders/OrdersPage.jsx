/**
 * PAGE: src/pages/admin/orders/OrdersPage.jsx
 *
 * PURPOSE:
 * The /admin/orders route — renders inside AdminLayout's <Outlet />.
 * Composes OrderSearch, OrderFilters, OrdersTable, and UpdateOrderStatusModal.
 *
 * AUTHORIZATION:
 * Uses AdminRoute wrapper in AppRoutes.jsx which checks user.role === "admin".
 * All API calls to GET /api/orders are protected by requireRole("admin") middleware.
 *
 * PRODUCTION-READY BECAUSE:
 * - "Add" CTA not needed — orders are created by customers, not admins
 * - Responsive toolbar layout with search + filters
 * - Dark mode via dark: classes
 * - Modal mounted once at page level, covers all orders
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import OrderSearch from "../../../components/admin/orders/OrderSearch/OrderSearch";
import OrderFilters from "../../../components/admin/orders/OrderFilters/OrderFilters";
import OrdersTable from "../../../components/admin/orders/OrdersTable/OrdersTable";
import UpdateOrderStatusModal from "../../../components/admin/orders/UpdateOrderStatusModal/UpdateOrderStatusModal";

const OrdersPage = () => {
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
          Orders
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <OrderSearch />
        <OrderFilters />
      </div>

      <OrdersTable />

      <UpdateOrderStatusModal />
    </div>
  );
};

export default OrdersPage;

