/**
 * src/components/product/ProductGrid/ProductGrid.jsx
 *
 * PURPOSE:
 *   Responsive grid container for the Phase 5 ProductCard components.
 *   Handles three states: loading (skeletons), empty (ProductEmpty),
 *   and populated (product cards).
 *
 * WHY SEPARATE FROM THE PAGE:
 *   ProductListingPage owns: filters, pagination controls, page layout.
 *   ProductGrid owns: the grid CSS, the loading/empty/data conditional.
 *   This separation means CategoryPage and SearchPage reuse this grid
 *   without copying the conditional rendering logic.
 *
 * LIST VIEW:
 *   When viewMode="list", renders cards in a single column with a
 *   horizontal layout. ProductCard's "compact" variant is used.
 *
 * PROPS:
 *   products      → array of Product objects from the backend
 *   isLoading     → boolean — show skeleton grid
 *   isFetching    → boolean — show subtle overlay while background refetching
 *   skeletonCount → number of skeleton cards (default 12)
 *   viewMode      → "grid" | "list"
 *   onReset       → passed to ProductEmpty for "clear filters" CTA
 *   emptyVariant  → "filtered" | "search" | "category" | "generic"
 */

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "../ProductCard/ProductCard";
import { ProductSkeleton } from "../ProductSkeleton/ProductSkeleton";
import { ProductEmpty } from "../ProductEmpty/ProductEmpty";

export function ProductGrid({
  products = [],
  isLoading = false,
  isFetching = false,
  skeletonCount = 12,
  viewMode = "grid",
  onReset,
  emptyVariant = "filtered",
  query = "",
}) {
  const isListView = viewMode === "list";

  if (isLoading) {
    return (
      <div
        className={
          isListView
            ? "space-y-4"
            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
        }
      >
        <ProductSkeleton count={skeletonCount} />
      </div>
    );
  }

  if (!products.length) {
    return (
      <ProductEmpty
        variant={emptyVariant}
        query={query}
        onReset={onReset}
      />
    );
  }

  return (
    <div className="relative">
      {/* Subtle overlay during background refetch */}
      {isFetching && (
        <div
          className="absolute inset-0 bg-white/50 dark:bg-gray-950/50 z-10 rounded-2xl pointer-events-none transition-opacity"
          aria-hidden="true"
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={
            isListView
              ? "space-y-4"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          }
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
            >
              <ProductCard
                product={product}
                variant={isListView ? "compact" : "default"}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}