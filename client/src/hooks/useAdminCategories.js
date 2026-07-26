/**
 * FILE: src/hooks/useAdminCategories.js
 *
 * ============================================================================
 * useAdminCategories — Phase 18B (Admin Category Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query boundary between the pure-Axios service files
 * (admin.service.js, category.service.js) and the Categories UI. Exact
 * sibling of useAdminProducts.js (Phase 18A) — owns cache keys, response
 * unwrapping, and derives the list query's params straight from
 * adminCategories.store.js.
 *
 * BACKEND COMMUNICATION:
 * - useAdminCategoriesList() → admin.service.js#getAdminCategories(params)
 *   → GET /admin/categories?page=&limit=&search=&status=&parent=&sortBy=&sortOrder=
 * - useCreateCategory() → category.service.js#createCategory(formData) → POST /categories
 * - useUpdateCategory() → category.service.js#updateCategory(id, formData) → PUT /categories/:id
 * - useDeleteCategory() → category.service.js#deleteCategory(id) → DELETE /categories/:id
 * - useToggleCategoryStatus() → category.service.js#toggleCategoryStatus(id, isActive)
 *   → PATCH /categories/:id/status
 *
 * WHY THE LIST QUERY READS THE STORE DIRECTLY:
 * Identical reasoning to useAdminProductsList — adminCategories.store.js is
 * the single source of truth for "what is the admin currently looking at."
 * Every value read from the store is included in the queryKey, so React
 * Query automatically refetches on any search/filter/sort/page change.
 *
 * MUTATIONS — WHY THEY ALL INVALIDATE THE SAME QUERY KEY PREFIX:
 * create/update/delete/toggle all invalidate `["admin", "categories"]`
 * rather than one exact page/filter combination, so a create on page 1
 * doesn't leave a stale cached page 2 lying around — same "invalidate the
 * family, not the exact key" pattern as useAdminProducts.js.
 *
 * PRODUCTION-READY BECAUSE:
 * - Components never see Axios, FormData construction, or raw error
 *   objects — only { data, isLoading, isError, mutate, isPending }
 * - `placeholderData: keepPreviousData` avoids a full loading-skeleton
 *   flash on every page/filter change
 * - Each mutation resolves/rejects predictably so CategoryForm/
 *   DeleteCategoryModal can show inline success/error state
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { createCategory } from "../services/category.service";
import { updateCategory } from "../services/category.service";
import { deleteCategory } from "../services/category.service";
import { toggleCategoryStatus} from "../services/category.service";
import { restoreCategory } from "../services/category.service";
import { getAdminCategories, getAdminCategoryTree } from "../services/admin.service";
import { useAdminCategoriesStore } from "../store/adminCategories.store";

const CATEGORIES_QUERY_KEY = ["admin", "categories"];
const CATEGORY_TREE_QUERY_KEY = ["admin", "categories", "tree"];

/**
 * Fetches the admin category list using the current search/filter/sort/page
 * state from adminCategories.store.js. No params needed — this hook reads
 * everything it needs directly from the store.
 */
export const useAdminCategoriesList = () => {
  const { search, status, parentFilter, sortBy, sortOrder, page, limit } =
    useAdminCategoriesStore();

  const query = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, { search, status, parentFilter, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const response = await getAdminCategories({
        search: search || undefined,
        status: status || undefined,
        parent: parentFilter || undefined,
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
    categories: query.data?.categories ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/** Creates a category, then invalidates the admin categories list. */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

/** Updates a category, then invalidates the admin categories list. */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateCategory(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

/** Deletes a category, then invalidates the admin categories list. */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

/** Flips a category's active/inactive status, then invalidates the list. */
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => toggleCategoryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};



 
/**
 * ---------------------------------------------------------------------------
 * PHASE 18D — HIERARCHY TREE + RESTORE
 * ---------------------------------------------------------------------------
 */
 
/**
 * Fetches the category hierarchy as a nested tree, for CategoryTree.jsx.
 * FLAGGED FALLBACK BEHAVIOR: if GET /admin/categories/tree doesn't exist
 * on your backend (see admin.service.js's header — this endpoint is the
 * most speculative one in this phase), this query's `isError` will be
 * true, and CategoryTree.jsx is built to fall back to nesting the flat
 * useAdminCategoriesList() results client-side using each item's
 * `parentCategory` ref — see that component's header for the nesting
 * logic. This hook itself does NOT implement that fallback (a query hook
 * should only represent ONE request), it just exposes isError clearly
 * enough for the consumer to decide what to do next.
 */
export const useAdminCategoryTree = () => {
  const query = useQuery({
    queryKey: CATEGORY_TREE_QUERY_KEY,
    queryFn: async () => {
      const response = await getAdminCategoryTree();
      return response.data.data.tree ?? response.data.data.categories ?? [];
    },
    staleTime: 30 * 1000,
    retry: false, // don't retry a possibly-nonexistent endpoint 3x before falling back
  });
 
  return {
    tree: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
 
/**
 * Restores a soft-deleted category. Invalidates both the flat list and the
 * tree query, since a restored category should reappear in either view.
 */
export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORY_TREE_QUERY_KEY });
    },
  });
};
