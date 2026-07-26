/**
 * src/components/category/CategoryHeader/CategoryHeader.jsx
 *
 * PURPOSE:
 *   Full-width header section for CategoryPage showing:
 *   - Category name (H1)
 *   - Category description
 *   - Category image (if provided by backend)
 *   - Product count badge
 *   - Breadcrumb navigation
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Receives `category` from the useCategory() hook:
 *   GET /categories/slug/:slug → { name, description, image, productCount, level }
 *
 *   `image` may be null — the component handles this gracefully with a
 *   gradient placeholder based on the category's level in the tree.
 *   `productCount` comes from the backend's cached denormalized count.
 *
 * WHY SEPARATE FROM CategoryPage:
 *   CategoryPage owns the layout and data orchestration.
 *   CategoryHeader owns only the hero area at the top of the page.
 *   Future A/B tests (e.g. image-heavy vs text-only header) only need
 *   to swap this component without touching the page logic.
 *
 * REUSE:
 *   CategoryPage.jsx is the only consumer today.
 *   Future: Admin category preview could render this in read-only mode.
 *
 * PROPS:
 *   category    → full Category object from backend
 *   breadcrumb  → [{ _id, name, slug }] for the CategoryBreadcrumb
 *   isLoading   → boolean — renders skeleton variant
 */

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { CategoryBreadcrumb } from "../CategoryBreadcrumb/CategoryBreadcrumb";
import { CategorySkeleton } from "../CategorySkeleton/CategorySkeleton";

// Gradient palette cycling by category level or index
const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-purple-500 to-fuchsia-600",
];

export function CategoryHeader({ category, breadcrumb = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 pt-6 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategorySkeleton variant="header" />
        </div>
      </div>
    );
  }

  if (!category) return null;

  const { name, description, image, productCount, level = 0 } = category;

  // Pick a gradient based on category level to add visual variety
  const gradient = GRADIENTS[level % GRADIENTS.length];

  return (
    <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <CategoryBreadcrumb
          breadcrumb={breadcrumb}
          currentCategory={category}
        />

        {/* Header content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-5 flex items-start gap-6"
        >
          {/* Category icon / image */}
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            aria-hidden="true"
          >
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover rounded-2xl"
                loading="eager"
              />
            ) : (
              <Package size={28} className="text-white" />
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {name}
              </h1>
              {productCount > 0 && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                  {productCount.toLocaleString("en-IN")} products
                </span>
              )}
            </div>

            {description && (
              <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}