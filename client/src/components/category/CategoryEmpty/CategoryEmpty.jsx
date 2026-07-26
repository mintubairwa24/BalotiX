/**
 * src/components/category/CategoryEmpty/CategoryEmpty.jsx
 *
 * PURPOSE:
 *   Empty state component shown when:
 *   - The category list returns 0 results
 *   - A category slug is not found (404)
 *   - A category has no active sub-categories to display
 *
 * WHY SEPARATE FROM ProductEmpty:
 *   Category empty states have different recovery actions — you don't
 *   "clear filters" for categories, you navigate to browse products instead.
 *   Separate component means separate messaging, separate CTAs, clean code.
 *
 * VARIANTS:
 *   "empty"    → No categories exist (API returned empty array)
 *   "notfound" → Category slug 404 from backend
 *   "error"    → API call failed (network error, 500, etc.)
 *
 * REUSE:
 *   CategoryGrid.jsx  → variant="empty"
 *   CategoryPage.jsx  → variant="notfound" | variant="error"
 *
 * PROPS:
 *   variant   → "empty" | "notfound" | "error"
 *   onRetry   → function — called on "Try Again" for error variant
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderX, ServerCrash, Layers } from "lucide-react";
import { ROUTES } from "../../../constants/route.constants";

const VARIANT_CONFIG = {
  empty: {
    icon: Layers,
    title: "No categories yet",
    description: "Categories are being set up. Browse our full product catalogue while you wait.",
    ctaLabel: "Browse Products",
    ctaPath: ROUTES.PRODUCTS,
    showRetry: false,
  },
  notfound: {
    icon: FolderX,
    title: "Category not found",
    description: "The category you're looking for doesn't exist or may have been removed.",
    ctaLabel: "All Categories",
    ctaPath: ROUTES.PRODUCTS,
    showRetry: false,
  },
  error: {
    icon: ServerCrash,
    title: "Failed to load categories",
    description: "Something went wrong. Please check your connection and try again.",
    ctaLabel: "Browse Products",
    ctaPath: ROUTES.PRODUCTS,
    showRetry: true,
  },
};

export function CategoryEmpty({ variant = "empty", onRetry }) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.empty;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-6">
        <Icon size={36} className="text-indigo-400 dark:text-indigo-500" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {config.title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mb-8">
        {config.description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {config.showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Try Again
          </button>
        )}
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