/**
 * src/hooks/useProduct.js
 *
 * PURPOSE:
 *   React Query hook for a single product's detail page.
 *   Fetches via GET /products/slug/:slug — the SEO-friendly route
 *   that the product detail page URL uses (/products/iphone-15-pro).
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   GET /products/slug/:slug returns the full product object with
 *   categoryId populated (name, slug). This populated data is used
 *   by the Breadcrumb component on ProductDetailsPage.
 *
 * QUERY KEY DESIGN:
 *   ["products", "detail", slug] — structured so:
 *   - queryClient.invalidateQueries({ queryKey: ["products"] })
 *     busts this query too when the admin edits a product
 *   - queryClient.getQueryData(["products", "detail", slug])
 *     allows optimistic prefetch from listing page hover
 *
 * PREFETCH STRATEGY (future optimisation):
 *   On ProductCard hover in the listing page, the detail query can be
 *   prefetched via queryClient.prefetchQuery — the cache is pre-warmed
 *   before the user clicks. The hook interface stays identical.
 *
 * RETURN SHAPE:
 *   {
 *     product: Product | null,
 *     isLoading, isError, error, isNotFound
 *   }
 *
 *   isNotFound: true when the backend returns 404 — ProductDetailsPage
 *   uses this to render a "Product not found" state instead of a crash.
 *
 * REUSE:
 *   ProductDetailsPage, product quick-view modal (future Phase 7).
 */

import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "../services/product.service";

export function useProduct(slug) {
  const queryResult = useQuery({
    queryKey: ["products", "detail", slug],

    queryFn: () =>
      getProductBySlug(slug).then((res) => res.data),

    // Disable the query if no slug is provided
    enabled: Boolean(slug),

    // Product detail data is valid for 5 minutes
    staleTime: 1000 * 60 * 5,

    // Do not retry on 404 — the product genuinely doesn't exist
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  const product = queryResult.data?.data?.product ?? null;

  // Detect 404 specifically so the page can show a proper empty state
  const isNotFound =
    queryResult.isError && queryResult.error?.response?.status === 404;

  return {
    product,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    isNotFound,
  };
}