/**
 * src/hooks/useCategory.js
 *
 * PURPOSE:
 *   React Query hook for a single category's detail page.
 *   Fetches category data AND its ancestor breadcrumb chain in parallel
 *   using useQueries — both are needed before the page can render fully.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Two parallel requests:
 *   1. GET /categories/slug/:slug → category details (name, description, image)
 *   2. GET /categories/:id/breadcrumb → ancestor chain for breadcrumb nav
 *      (request 2 runs only after request 1 resolves and gives us the _id)
 *
 * WHY NOT useQueries FOR PARALLEL FETCH:
 *   The breadcrumb requires the category _id from request 1.
 *   We use a dependent query (enabled: Boolean(category?._id)) — request 2
 *   starts automatically once request 1 has the _id. This is React Query's
 *   recommended pattern for dependent queries.
 *
 * RETURN SHAPE:
 *   {
 *     category: Category | null,
 *     breadcrumb: [{ _id, name, slug }, ...],  → root → parent order
 *     isLoading,     → true while either query is loading
 *     isFetching,    → true while background refetch is happening
 *     isError,
 *     isNotFound     → true when backend returns 404
 *   }
 *
 * QUERY KEY DESIGN:
 *   ["categories", "detail", slug]
 *   ["categories", "breadcrumb", categoryId]
 *   Both are busted by: queryClient.invalidateQueries({ queryKey: ["categories"] })
 *
 * REUSE:
 *   CategoryPage imports this hook directly.
 *   Future AdminCategoryEdit page will use getCategoryById instead.
 */

import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug, getCategoryBreadcrumb } from "../services/category.service";

export function useCategory(slug) {
  // ── Query 1: Category detail by slug ──────────────────────────────────────
  const categoryQuery = useQuery({
    queryKey: ["categories", "detail", slug],

    queryFn: () =>
      getCategoryBySlug(slug).then((res) => res.data),

    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,

    retry: (failureCount, error) => {
      // Do NOT retry on 404 — category genuinely doesn't exist
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  const category = categoryQuery.data?.data?.category ?? null;

  // ── Query 2: Breadcrumb chain (dependent on category._id) ─────────────────
  const breadcrumbQuery = useQuery({
    queryKey: ["categories", "breadcrumb", category?._id],

    queryFn: () =>
      getCategoryBreadcrumb(category._id).then((res) => res.data),

    // Only runs after query 1 resolves and provides the _id
    enabled: Boolean(category?._id),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const breadcrumb = breadcrumbQuery.data?.data?.breadcrumb ?? [];

  // isNotFound: true when backend returns 404 for the category slug
  const isNotFound =
    categoryQuery.isError && categoryQuery.error?.response?.status === 404;

  return {
    category,
    breadcrumb,

    // Both queries must be done before we consider the page "loaded"
    isLoading: categoryQuery.isLoading || (Boolean(category?._id) && breadcrumbQuery.isLoading),
    isFetching: categoryQuery.isFetching || breadcrumbQuery.isFetching,
    isError: categoryQuery.isError,
    error: categoryQuery.error,
    isNotFound,
  };
}