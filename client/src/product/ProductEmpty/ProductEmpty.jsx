/**
 * src/components/product/ProductEmpty/ProductEmpty.jsx
 *
 * PURPOSE:
 *   Empty state component shown when:
 *   - A product listing returns 0 results (active filters return nothing)
 *   - A search query returns no matches
 *   - A category has no active products
 *
 * WHY THIS EXISTS AS A SEPARATE COMPONENT:
 *   Empty states are a UX critical path — they must guide the user to
 *   a recovery action rather than showing a blank page. Centralising this
 *   in one component ensures consistent messaging and action placement.
 *
 * VARIANTS:
 *   "filtered"  → "No products match your filters" + reset CTA
 *   "search"    → "No results for [query]" + browse CTA
 *   "category"  → "No products in this category yet" + browse CTA
 *   "generic"   → generic empty state (default)
 *
 * REUSE:
 *   ProductListingPage, CategoryPage, SearchPage, WishlistPage all use
 *   this component — they pass the appropriate variant and onReset handler.
 *
 * PROPS:
 *   variant     → "filtered" | "search" | "category" | "generic"
 *   query       → string — shown in the "search" variant message
 *   onReset     → function — called when the user clicks "Clear Filters"
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageSearch, SearchX, FolderX, ShoppingBag } from "lucide-react";
import { ROUTES } from "../../../src/constants/route.constants";

const VARIANT_CONFIG = {
  filtered: {
    icon: PackageSearch,
    title: "No products match your filters",
    description:
      "Try adjusting your filters or clearing them to see more products.",
    showReset: true,
    ctaLabel: "Browse All Products",
    ctaPath: ROUTES.PRODUCTS,
  },
  search: {
    icon: SearchX,
    title: "No results found",
    description:
      "We couldn't find any products matching your search. Try different keywords.",
    showReset: false,
    ctaLabel: "Browse All Products",
    ctaPath: ROUTES.PRODUCTS,
  },
  category: {
    icon: FolderX,
    title: "No products in this category yet",
    description:
      "We're adding new products every day. Check back soon!",
    showReset: false,
    ctaLabel: "Explore All Categories",
    ctaPath: ROUTES.PRODUCTS,
  },
  generic: {
    icon: ShoppingBag,
    title: "No products available",
    description:
      "There are no products to display right now.",
    showReset: false,
    ctaLabel: "Go to Homepage",
    ctaPath: ROUTES.HOME,
  },
};

export function ProductEmpty({ variant = "generic", query = "", onReset }) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.generic;
  const Icon = config.icon;

  const title =
    variant === "search" && query
      ? `No results for "${query}"`
      : config.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      {/* Illustration */}
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-6">
        <Icon size={36} className="text-indigo-400 dark:text-indigo-500" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mb-8">
        {config.description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Reset filters button */}
        {config.showReset && onReset && (
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Clear All Filters
          </button>
        )}

        {/* Browse CTA */}
        <Link
          to={config.ctaPath}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
        >
          {config.ctaLabel}
        </Link>
      </div>
    </motion.div>
  );
}