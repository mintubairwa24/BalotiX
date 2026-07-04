/**
 * src/components/home/CategoryPreview/CategoryCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Atomic card component for a single category. The parent
 *   CategoryPreview.jsx maps over the category array and renders
 *   one of these per category — separation of list vs item logic.
 *
 * WHY IT IS REUSABLE:
 *   - HomePage: CategoryPreview renders an 8-card grid
 *   - Future: Header mega-menu could render a compact variant
 *   - Future: CategoryPage sidebar could render a list variant
 *   The `variant` prop slot is already prepared for this.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 (Category Module) — category data will come from
 *   GET /categories?flat=false&status=active via React Query.
 *   The prop interface { category } already matches the backend shape
 *   (see home.constants.js MOCK_CATEGORIES). Zero refactoring needed.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Link wraps the entire card — the full card is the clickable target,
 *   which is a larger touch target and better for accessibility.
 *   The icon gradient uses Tailwind JIT classes stored in the constants
 *   object — this is safe because all values are present in the constant
 *   file at build time, so Tailwind's content scanner picks them up.
 *
 * PROPS:
 *   category → { _id, name, slug, icon, productCount, gradient, bgLight, bgDark }
 *              Shape matches MOCK_CATEGORIES in home.constants.js
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { buildPath, ROUTES } from "../../../constants/route.constants";

export function CategoryCard({ category }) {
  const { name, slug, icon: Icon, productCount, gradient } = category;

  const categoryPath = buildPath(ROUTES.CATEGORY, { slug });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={categoryPath}
        className="group flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-50 dark:hover:shadow-indigo-950/50 transition-all duration-200 text-center"
        aria-label={`Shop ${name} — ${productCount.toLocaleString("en-IN")} products`}
      >
        {/* ── Icon container with gradient ──────────────────────── */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
          aria-hidden="true"
        >
          <Icon size={22} className="text-white" />
        </div>

        {/* ── Text ──────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            {name}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {productCount.toLocaleString("en-IN")} items
          </p>
        </div>
      </Link>
    </motion.div>
  );
}