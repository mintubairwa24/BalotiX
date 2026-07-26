/**
 * FILE: src/pages/admin/inventory/InventoryDetailsPage.jsx
 *
 * ============================================================================
 * InventoryDetailsPage — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/inventory/:productId route. A thin shell (Convention #3)
 * that does the role-gate check, then renders
 * <InventoryDetails productId={productId} /> — InventoryDetails itself
 * owns the actual data-fetching and composition. Mirrors how
 * UserDetailsPage stayed thin and delegated to UserDetails in Phase 18C.
 *
 * PRODUCTION-READY BECAUSE:
 * - Breadcrumb-style back link keeps the admin oriented within the
 *   Inventory section
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "../../../store/auth.store";
import { InventoryDetails } from "../../../components/admin/inventory/InventoryDetails/InventoryDetails";

const InventoryDetailsPage = () => {
  const { productId } = useParams();
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
      <Link
        to="/admin/inventory"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      <InventoryDetails productId={productId} />
    </div>
  );
};

export default InventoryDetailsPage;