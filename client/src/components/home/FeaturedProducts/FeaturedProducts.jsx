/**
 * src/components/home/FeaturedProducts/FeaturedProducts.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level controller for the featured products marketing block.
 *   It owns the heading, responsive grid, loading state, and CTA.
 *
 * WHY IT IS REUSABLE:
 *   The component accepts product data and loading flags, so Phase 5 can
 *   feed live backend products into the exact same structure.
 *
 * FUTURE PHASE CONNECTION:
 *   The static `MOCK_FEATURED_PRODUCTS` can be swapped for a live query
 *   response without changing the JSX inside this file.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The skeleton count matches the default card count to prevent visual
 *   layout shift when the section is populated later.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="bg-white py-14 dark:bg-gray-950 sm:py-20" aria-label="Featured products">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Editor's Choice
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Handpicked by our team for quality, value, and customer satisfaction.
            </p>
          </div>

          <Link
            to={`${ROUTES.PRODUCTS}?isFeatured=true`}
            className="group inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View All Featured
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <ProductPreviewSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No featured products at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <ProductPreviewCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
