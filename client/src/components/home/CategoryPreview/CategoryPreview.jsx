/**
 * src/components/home/CategoryPreview/CategoryPreview.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level category showcase for the home page. It manages the
 *   heading, responsive grid, animation timing, and the "all categories"
 *   call to action.
 *
 * WHY IT IS REUSABLE:
 *   The component can accept a categories array later without changing
 *   its layout, so live backend data can replace the placeholders safely.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 will feed real category documents here. The grid and card
 *   architecture already match that future API contract.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The list is capped at nine visible cards so the section stays visually
 *   balanced and performant on both mobile and desktop screens.
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { CategoryCard } from "./CategoryCard";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { MOCK_CATEGORIES } from "../../../constants/home.constants";
import { ROUTES } from "../../../constants/route.constants";

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

export function CategoryPreview({ categories = MOCK_CATEGORIES }) {
  const [ref, isInView] = useIntersectionObserver();
  const visibleCategories = categories.slice(0, 9);

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900/50 sm:py-20" aria-label="Shop by category">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Explore
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              From electronics to everyday essentials, find everything you need.
            </p>
          </div>

          <Link
            to={ROUTES.PRODUCTS}
            className="group inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            All Categories
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
        >
          {visibleCategories.map((category) => (
            <motion.div key={category._id} variants={itemVariants}>
              <CategoryCard category={category} />
            </motion.div>
          ))}

          <motion.div variants={itemVariants}>
            <Link
              to={ROUTES.PRODUCTS}
              className="group flex h-full min-h-[110px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-center shadow-md shadow-indigo-200 transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 dark:shadow-indigo-900/50 sm:p-5"
              aria-label="Browse all categories"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                <ArrowRight size={22} className="text-white" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold leading-tight text-white">
                All Categories
              </p>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
