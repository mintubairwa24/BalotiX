/**
 * src/components/home/CategoryPreview/CategoryPreview.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level component that owns:
 *   - The section heading and "All Categories" link
 *   - The responsive grid layout
 *   - The staggered scroll-entry animation via useIntersectionObserver
 *   - Mapping category data to CategoryCard components
 *
 * WHY IT IS REUSABLE:
 *   Accepts an optional `categories` prop. If not provided it falls
 *   back to MOCK_CATEGORIES. This means:
 *   - Today: renders static data, zero network dependency
 *   - Phase 5: pass live data from React Query without touching this file
 *     <CategoryPreview categories={queryData?.categories} isLoading={isLoading} />
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 (Category Module):
 *   const { data, isLoading } = useQuery({
 *     queryKey: ["categories"],
 *     queryFn: () => api.get("/categories?flat=false&status=active").then(r => r.data),
 *   });
 *   <CategoryPreview categories={data?.data} isLoading={isLoading} />
 *   The prop interface is already designed to accept this. Zero JSX refactoring.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Stagger animation uses Framer Motion variants propagated from parent
 *   `motion.div` to children. This is the correct pattern — stagger
 *   is controlled at the container level, not at the individual child level,
 *   which prevents N independent timers and ensures visual coherence.
 *
 * PROPS:
 *   categories  → array of category objects (falls back to MOCK_CATEGORIES)
 *   isLoading   → boolean (skeleton loading state, prepared for Phase 5)
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { CategoryCard } from "./CategoryCard";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { MOCK_CATEGORIES } from "../../../constants/home.constants";
import { ROUTES } from "../../../constants/route.constants";

// ── Framer Motion variant config ───────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function CategoryPreview({ categories = MOCK_CATEGORIES, isLoading = false }) {
  const [ref, isInView] = useIntersectionObserver();

  // Limit to 9 items — one slot reserved for the "All Categories" card
  const visibleCategories = categories.slice(0, 9);

  return (
    <section
      className="py-14 sm:py-20 bg-gray-50 dark:bg-gray-900/50"
      aria-label="Shop by Category"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section heading row ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
              Explore
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              From electronics to everyday essentials — find everything you need.
            </p>
          </div>

          <Link
            to={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group flex-shrink-0"
          >
            All Categories
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ── Category grid ─────────────────────────────────────── */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {/* Category cards */}
          {visibleCategories.map((category) => (
            <motion.div key={category._id} variants={itemVariants}>
              <CategoryCard category={category} />
            </motion.div>
          ))}

          {/* "All Categories" CTA card — always last */}
          <motion.div variants={itemVariants}>
            <Link
              to={ROUTES.PRODUCTS}
              className="group flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 text-center h-full min-h-[110px] shadow-md shadow-indigo-200 dark:shadow-indigo-900/50"
              aria-label="Browse all categories"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowRight size={22} className="text-white" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-white leading-tight">
                All Categories
              </p>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}