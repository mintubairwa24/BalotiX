/**
 * src/components/home/CategoryPreview/CategoryCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Atomic card used by the home page category preview grid. It isolates
 *   the category item presentation from the grid mechanics above it.
 *
 * WHY IT IS REUSABLE:
 *   The card shape is intentionally generic enough for future category
 *   surfaces such as mega menus, category pages, or browse drawers.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 can feed live category records into the same card without any
 *   JSX changes because the prop shape mirrors the mock constant shape.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The clickable card area is the full component, which improves touch
 *   ergonomics and keeps the accessibility target large and obvious.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { buildPath, ROUTES } from "../../../constants/route.constants";

export function CategoryCard({ category }) {
  const { name, slug, icon: Icon, productCount, gradient } = category;
  const categoryPath = buildPath(ROUTES.CATEGORY, { slug });

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={categoryPath}
        className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 dark:border-slate-800 dark:bg-gray-900 dark:hover:border-indigo-800 dark:hover:shadow-indigo-950/50 sm:p-5"
        aria-label={`Shop ${name} - ${productCount.toLocaleString("en-IN")} products`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14`}
          aria-hidden="true"
        >
          <Icon size={22} className="text-white" />
        </div>

        <div>
          <p className="text-sm font-semibold leading-tight text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {name}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            {productCount.toLocaleString("en-IN")} items
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
