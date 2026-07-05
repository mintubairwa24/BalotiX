/**
 * src/hooks/useCategories.js
 *
 * PURPOSE:
 *   React Query hook for the complete category list. Returns both the
 *   nested tree (for CategorySidebar) and a flat array (for CategoryGrid).
 *   Builds both from a single API call — no double-fetching.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   GET /categories?flat=false&status=active
 *   The backend returns a nested tree when flat=false.
 *   We also derive a flat array locally (depth-first traversal) for the
 *   CategoryGrid — one request, two representations.
 *
 * QUERY KEY DESIGN:
 *   ["categories", "all"] — structured key allows:
 *   - queryClient.invalidateQueries({ queryKey: ["categories"] })
 *     to bust ALL category queries when admin edits a category
 *   - queryClient.invalidateQueries({ queryKey: ["categories", "all"] })
 *     to bust only this query without affecting detail queries
 *
 * STALE TIME:
 *   5 minutes — categories change rarely. A longer stale time reduces
 *   unnecessary refetches since category structure is stable.
 *
 * RETURN SHAPE:
 *   {
 *     categories: Category[],     → nested tree (for sidebar)
 *     flatCategories: Category[], → flat array (for grid)
 *     rootCategories: Category[], → only level=0 categories (for nav)
 *     isLoading, isFetching, isError, error
 *   }
 *
 * REUSE:
 *   CategorySidebar → uses `categories` (tree)
 *   CategoryGrid    → uses `flatCategories`
 *   Header Navbar   → uses `rootCategories` for top-level nav links
 *   CategoryPreview (Phase 7+) → uses `flatCategories`
 */

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/category.service";

// ── Flatten a nested category tree into a single array ────────────────────────
// Depth-first traversal — parent always comes before its children.
function flattenTree(categories = [], depth = 0) {
  return categories.reduce((acc, category) => {
    acc.push({ ...category, depth });
    if (category.children?.length) {
      acc.push(...flattenTree(category.children, depth + 1));
    }
    return acc;
  }, []);
}

export function useCategories() {
  const queryResult = useQuery({
    queryKey: ["categories", "all"],

    queryFn: () =>
      getCategories({ flat: false, status: "active" }).then((res) => res.data),

    // Categories are stable — 5 minute stale time prevents unnecessary requests
    staleTime: 1000 * 60 * 5,

    retry: 1,
  });

  const rawCategories = queryResult.data?.data?.categories ?? [];

  // Nested tree — used by CategorySidebar (already assembled by backend)
  const categories = rawCategories;

  // Flat array — derived locally from the tree
  const flatCategories = flattenTree(rawCategories);

  // Root-only — level === 0, used by top-level navigation
  const rootCategories = rawCategories.filter((c) => c.level === 0);

  return {
    // ── Data ─────────────────────────────────────────────────────────────
    categories,
    flatCategories,
    rootCategories,

    // ── Query states ──────────────────────────────────────────────────────
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
  };
}