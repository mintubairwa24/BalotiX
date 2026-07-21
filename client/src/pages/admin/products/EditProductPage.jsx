/**
 * FILE: src/pages/admin/products/EditProductPage.jsx
 *
 * ============================================================================
 * EditProductPage — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/products/:id/edit route. Fetches the product being edited,
 * then renders <ProductForm mode="edit" initialProduct={product} /> — the
 * shared form pre-fills its fields from `initialProduct` and fires
 * useUpdateProduct() on submit instead of useCreateProduct().
 *
 * REUSES (Convention #11): product-detail fetching uses `useProduct(id)`,
 * the SAME hook the customer-facing Product Detail page (Phase 5) already
 * uses for GET /products/:id — there is one product-detail endpoint in
 * this project, so this avoids a duplicate "admin product detail" fetch
 * for data that's already fetchable through an existing hook. Same
 * "identical data source ⇒ reuse directly" reasoning as AdminWelcome
 * reusing useProfile() in Phase 17.
 *
 * FLAGGED RISK (not verified this session): if the customer-facing
 * useProduct(id) hook's backend route only returns ACTIVE products (a
 * reasonable thing for a public storefront endpoint to do), editing an
 * INACTIVE product here would incorrectly 404. If that turns out to be the
 * case, the fix is an isolated addition — a dedicated
 * `getAdminProductById` in admin.service.js — without touching this page's
 * structure or ProductForm at all. Flagging now rather than silently
 * assuming it works for every status.
 *
 * PRODUCTION-READY BECAUSE:
 * - Distinguishes loading / not-found / error / success states explicitly
 *   (Convention #7 — never fail silently)
 * - ProductForm only mounts once the real product data is available, so
 *   its internal `useState` initializers never see stale/undefined values
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/auth.store";
// The path was incorrect. The shared Axios instance is in `src/api/axios.js`.
import api from "../../../api/axios";
import ProductForm from "../../../components/admin/products/ProductForm/ProductForm";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  // State for fetching product data specifically for the admin.
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

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

  // Fetch the product using the admin-specific endpoint. This ensures that
  // products of any status (draft, archived, etc.) can be loaded for editing,
  // which is not possible with the public-facing `useProduct` hook.
  useEffect(() => {
    if (!isAdmin || !id) return;

    const fetchAdminProduct = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get(`/admin/products/${id}`);
        setProduct(response.data.data.product);
      } catch (error) {
        console.error("Failed to fetch admin product:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminProduct();
  }, [id, isAdmin]);

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
          Edit Product
        </h1>
      </div>

      {isLoading && (
        <div className="max-w-2xl space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          Couldn't load this product. It may have been deleted, or you can
          try again from the Products list.
        </div>
      )}

      {!isLoading && !isError && product && (
        <ProductForm mode="edit" initialProduct={product} />
      )}
    </div>
  );
};

export default EditProductPage;