/**
 * FILE: src/pages/admin/products/CreateProductPage.jsx
 *
 * ============================================================================
 * CreateProductPage — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/products/create route. A thin shell (Convention #3) that does
 * the role-gate check (see ProductsPage.jsx's header for why this check is
 * duplicated across the three product pages rather than extracted yet),
 * then renders <ProductForm mode="create" /> with no `initialProduct` —
 * ProductForm handles everything else, including which mutation
 * (useCreateProduct) fires on submit.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero duplicated form logic — ProductForm is the single implementation
 *   shared with EditProductPage
 * - Breadcrumb-style back link keeps the admin oriented within the
 *   Products section
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "../../../store";
import ProductForm from "../../../components/admin/products/ProductForm/ProductForm";

const CreateProductPage = () => {
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
      <div>
        <Link
          to="/admin/products"
          className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Create Product
        </h1>
      </div>

      <ProductForm mode="create" />
    </div>
  );
};

export default CreateProductPage;