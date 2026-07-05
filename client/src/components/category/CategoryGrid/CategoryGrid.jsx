/**
 * src/components/category/CategoryGrid/CategoryGrid.jsx
 *
 * PURPOSE:
 *   Responsive grid of category cards used on the CategoryPage to display
 *   sub-categories of the current category, or all root categories on the
 *   main categories landing.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Receives `categories` from the useCategories() hook.
 *   Each category object shape: { _id, name, slug, image, productCount, level }
 *   Clicking a card navigates to /category/:slug.
 *
 * WHY SEPARATE FROM THE HOMEPAGES CategoryPreview:
 *   CategoryPreview (home) is a marketing section — it shows 8 curated
 *   categories with decorative icons from home.constants.js.
 *   CategoryGrid (this file) is a functional navigation component —
 *   it renders real backend data with no decoration overrides.
 *   Different purpose, different data source, different component.
 *
 * STATES:
 *   Loading  → shows CategorySkeleton cards
 *   Empty    → shows CategoryEmpty variant="empty"
 *   Populated → shows animated category cards
 *
 * REUSE:
 *   CategoryPage uses this to show sub-categories of the current category.
 *   A future "All Categories" standalone page would also use this.
 *
 * PROPS:
 *   categories  → Category[] from useCategories() or useCategory()
 *   isLoading   → boolean
 *   isError     → boolean
 *   onRetry     → () => void — passed to CategoryEmpty for retry CTA
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";

import { CategorySkeleton } from "../CategorySkeleton/CategorySkeleton";
import { CategoryEmpty } from "../CategoryEmpty/CategoryEmpty";
import { buildPath, ROUTES } from "../../../constants/route.constants";

// Gradient palette for cards without a category image
const CARD_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-purple-500 to-fuchsia-600",
  "from-sky-500 to-blue-600",
  "from-lime-500 to-green-600",
];

// ── Single category card ───────────────────────────────────────────────────────
function CategoryCard({ category, index }) {
  const { name, slug, image, productCount } = category;
  const categoryPath = buildPath(ROUTES.CATEGORY, { slug });
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={categoryPath}
        className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-50 dark:hover:shadow-indigo-950/50 transition-all duration-200"
        aria-label={`${name} — ${productCount?.toLocaleString("en-IN") ?? 0} products`}
      >
        {/* Icon / Image */}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}
          aria-hidden="true"
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover rounded-2xl"
              loading="lazy"
            />
          ) : (
            <Package size={22} className="text-white" />
          )}
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-1">
          {name}
        </p>

        {/* Product count */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {productCount?.toLocaleString("en-IN") ?? 0} items
        </p>

        {/* Arrow indicator */}
        <ChevronRight
          size={14}
          className="mt-2 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

// ── Grid container ─────────────────────────────────────────────────────────────
export function CategoryGrid({
  categories = [],
  isLoading = false,
  isError = false,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <CategorySkeleton variant="card" count={10} />
      </div>
    );
  }

  if (isError) {
    return <CategoryEmpty variant="error" onRetry={onRetry} />;
  }

  if (!categories.length) {
    return <CategoryEmpty variant="empty" />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((category, index) => (
        <CategoryCard key={category._id} category={category} index={index} />
      ))}
    </div>
  );
}