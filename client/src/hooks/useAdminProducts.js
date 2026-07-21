/**
 * FILE: src/hooks/useAdminProducts.js
 *
 * ============================================================================
 * useAdminProducts — Phase 18A (Admin Product Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query boundary between the pure-Axios service files
 * (admin.service.js, product.service.js) and the Products UI. Owns: cache
 * keys, response unwrapping, and — for the list query — deriving its params
 * straight from adminProducts.store.js so components never have to
 * assemble query params themselves.
 *
 * BACKEND COMMUNICATION:
 * - useAdminProductsList() → admin.service.js#getAdminProducts(params)
 *   → GET /admin/products?page=&limit=&search=&category=&status=&sortBy=&sortOrder=
 * - useCreateProduct() → product.service.js#createProduct(formData) → POST /products
 * - useUpdateProduct() → product.service.js#updateProduct(id, formData) → PUT /products/:id
 * - useDeleteProduct() → product.service.js#deleteProduct(id) → DELETE /products/:id
 * - useToggleProductStatus() → product.service.js#toggleProductStatus(id, isActive)
 *   → PATCH /products/:id/status
 *
 * WHY THE LIST QUERY READS THE STORE DIRECTLY:
 * adminProducts.store.js is the single source of truth for "what is the
 * admin currently looking at" (search/filter/sort/page). Rather than have
 * ProductsPage read the store AND pass eight props down into this hook,
 * the hook subscribes to the store itself — same pattern as how
 * useDashboardStats didn't need any params in Phase 17, except here the
 * query genuinely has shape-changing inputs, so it must react to them.
 * Every value read from the store is included in the queryKey, so React
 * Query automatically refetches whenever search/filter/sort/page changes —
 * no manual refetch() calls needed for those interactions.
 *
 * MUTATIONS — WHY THEY ALL INVALIDATE THE SAME QUERY KEY PREFIX:
 * create/update/delete/toggle all call
 * `queryClient.invalidateQueries({ queryKey: ["admin", "products"] })`
 * rather than a fully-specific key — this intentionally invalidates the
 * list at ANY page/filter/sort combination that's currently mounted or
 * cached, so a create on page 1 doesn't leave a stale cached page 2 lying
 * around. This is the standard React Query "invalidate the family, not the
 * exact key" pattern for list+mutation screens.
 *
 * PRODUCTION-READY BECAUSE:
 * - Components never see Axios, FormData construction, or raw error
 *   objects — only { data, isLoading, isError, mutate, isPending }
 * - `keepPreviousData`-style UX: React Query v5 exposes `isPlaceholderData`
 *   when combined with `placeholderData: keepPreviousData`, avoiding a full
 *   loading-skeleton flash on every page/filter change — smoother admin UX
 *   for a table that's re-queried often
 * - Each mutation resolves/rejects predictably so ProductForm/DeleteProductModal
 *   can show inline success/error state without duplicating try/catch logic
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../services/product.service";
import { getAdminProducts } from "../services/admin.service";
import { useAdminProductsStore } from "../store/adminProducts.store";

const PRODUCTS_QUERY_KEY = ["admin", "products"];

/**
 * Fetches the admin product list using the current search/filter/sort/page
 * state from adminProducts.store.js. No params needed — this hook reads
 * everything it needs directly from the store.
 */
export const useAdminProductsList = () => {
  const { search, category, status, sortBy, sortOrder, page, limit } =
    useAdminProductsStore();

  const query = useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, { search, category, status, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const response = await getAdminProducts({
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData, // avoids skeleton flash between pages/filters
    staleTime: 30 * 1000,
  });

  return {
    products: query.data?.products ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/** Creates a product, then invalidates the admin products list. */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

/** Updates a product, then invalidates the admin products list. */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

/** Deletes a product, then invalidates the admin products list. */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

/** Flips a product's active/inactive status, then invalidates the list. */
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => toggleProductStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};