/**
 * src/components/product/RelatedProducts/RelatedProducts.jsx
 *
 * PURPOSE:
 *   Section shown below the product detail panel. Fetches products
 *   from the same category as the current product, enabling product
 *   discovery without the user navigating back to the listing page.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   GET /products?categoryId=<id>&status=active&limit=4
 *   The categoryId comes from the current product's categoryId._id
 *   (populated by the backend when fetching the product by slug).
 *
 *   The current product is excluded from results by filtering on the
 *   frontend (one extra request is cheaper than a backend param that
 *   doesn't exist). If the backend adds an `exclude` param later,
 *   just pass it in the query — zero component changes needed.
 *
 * QUERY KEY:
 *   ["products", "related", productId, categoryId]
 *   Scoped so it never collides with the listing page query.
 *   Invalidated when the user navigates to a different product.
 *
 * WHY THIS IS SEPARATE FROM ProductDetailsPage:
 *   The detail page owns the product data.
 *   RelatedProducts owns its own data fetch (a different query) and
 *   its own loading/empty states.
 *   Keeping them separate means the page renders instantly with the
 *   main product while related products load in the background.
 *
 * PROPS:
 *   currentProductId  → string — excluded from related results
 *   categoryId        → string — backend ObjectId of the product's category
 *   categoryName      → string — used in the section heading
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { getProducts } from "../../../src/services/product.service";
import { ProductCard } from "../ProductCard/ProductCard";
import { ProductSkeleton } from "../ProductSkeleton/ProductSkeleton";
import { ROUTES } from "../../../src/constants/route.constants";

export function RelatedProducts({ currentProductId, categoryId, categoryName = "Related" }) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "related", currentProductId, categoryId],

    queryFn: () =>
      getProducts({
        categoryId,
        status: "active",
        limit: 5,         // fetch 5, we'll show 4 after excluding current
        sortBy: "averageRating",
        sortOrder: "desc",
      }).then((res) => res.data),

    // Only fetch when we have a valid categoryId
    enabled: Boolean(categoryId),

    staleTime: 1000 * 60 * 5,
  });

  // Exclude the current product and limit to 4
  const allProducts = data?.data?.products ?? [];
  const related = allProducts
    .filter((p) => p._id !== currentProductId)
    .slice(0, 4);

  // Don't render the section at all if there's nothing to show and not loading
  if (!isLoading && related.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
      {/* ── Section heading ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <span className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
            More from this category
          </span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {categoryName} Products
          </h2>
        </div>

        {categoryId && (
          <Link
            to={`${ROUTES.PRODUCTS}?categoryId=${categoryId}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
          >
            View All
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>

      {/* ── Product grid ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          <ProductSkeleton count={4} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {related.map((product) => (
            <ProductCard key={product._id} product={product} variant="default" />
          ))}
        </motion.div>
      )}
    </section>
  );
}