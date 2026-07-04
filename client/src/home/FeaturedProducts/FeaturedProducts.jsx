/**
 * src/components/home/FeaturedProducts/FeaturedProducts.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level component that owns the "Featured Products" block on
 *   the homepage. It manages:
 *   - Section heading, subtitle and "View All" link
 *   - The product grid layout (responsive columns)
 *   - Loading state via skeletons
 *   - Mapping product data to ProductPreviewCard components
 *   - Scroll-triggered entrance animation
 *
 * WHY IT IS REUSABLE:
 *   Accepts optional `products` and `isLoading` props with sensible defaults.
 *   Today: renders MOCK_FEATURED_PRODUCTS (static, no API call).
 *   Phase 5: pass React Query data directly — zero JSX changes:
 *     <FeaturedProducts products={queryData} isLoading={isLoading} />
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 (Product Module):
 *   const { data, isLoading } = useQuery({
 *     queryKey: ["products", "featured"],
 *     queryFn: () => api.get("/products/featured?limit=8").then(r => r.data.data.products),
 *     staleTime: 1000 * 60 * 5,
 *   });
 *   Pass `data` and `isLoading` directly. The component is already
 *   wired to handle both states.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The 4-column grid collapses to 2 on mobile — preventing cramped cards.
 *   skeletonCount matches the default product count (8) so the loading
 *   layout shift is imperceptible.
 *
 * PROPS:
 *   products      → array of product objects (default: MOCK_FEATURED_PRODUCTS)
 *   isLoading     → boolean (default: false)
 *   skeletonCount → number of skeleton placeholders to show (default: 8)
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { ProductPreviewCard } from "./ProductPreviewCard";
import { ProductPreviewSkeleton } from "./ProductPreviewSkeleton";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { MOCK_FEATURED_PRODUCTS } from "../../../constants/home.constants";
import { ROUTES } from "../../../constants/route.constants";

export function FeaturedProducts({
  products = MOCK_FEATURED_PRODUCTS,
  isLoading = false,
  skeletonCount = 8,
}) {
  const [ref, isInView] = useIntersectionObserver();

  return (
    <section
      className="py-14 sm:py-20 bg-white dark:bg-gray-950"
      aria-label="Featured Products"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section heading row ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
              Editor's Choice
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Handpicked by our team for quality, value, and customer satisfaction.
            </p>
          </div>

          <Link
            to={`${ROUTES.PRODUCTS}?isFeatured=true`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group flex-shrink-0"
          >
            View All Featured
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ── Product grid ──────────────────────────────────────── */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            // Skeleton loading state — matches card layout exactly
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <ProductPreviewSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            // Empty state
            <div className="py-16 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                No featured products at the moment.
              </p>
            </div>
          ) : (
            // Populated product grid
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product) => (
                <ProductPreviewCard
                  key={product._id}
                  product={product}
                  variant="default"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}