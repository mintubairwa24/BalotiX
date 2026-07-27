/**
 * PAGE: src/pages/admin/orders/OrderDetailsPage.jsx
 *
 * PURPOSE:
 * The /admin/orders/:id route — renders inside AdminLayout's <Outlet />.
 * Fetches full order detail including items via useAdminOrderDetail hook.
 *
 * BACKEND INTEGRATION:
 * GET /api/orders/:id — returns { success, data: { order, items } }
 * where order.userId is populated with name and email.
 *
 * COMPONENT COMPOSITION:
 * - Loading state: Skeleton placeholder
 * - Error state: Error message with retry button
 * - Empty state: "Order not found"
 * - Content: OrderDetails component
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store";
import { useAdminOrderDetail } from "../../../hooks/useAdminOrders";
import OrderDetails from "../../../components/admin/orders/OrderDetails/OrderDetails";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";

  const { order, items, isLoading, isError, error, refetch } =
    useAdminOrderDetail(id);

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
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/orders"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load order details."}
          </p>
          <button
            onClick={refetch}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Success — order data */}
      {!isLoading && !isError && !order && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order not found.
          </p>
          <Link
            to="/admin/orders"
            className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
          >
            Return to orders list
          </Link>
        </div>
      )}

      {!isLoading && !isError && order && (
        <OrderDetails order={order} items={items} />
      )}
    </div>
  );
};

export default OrderDetailsPage;

