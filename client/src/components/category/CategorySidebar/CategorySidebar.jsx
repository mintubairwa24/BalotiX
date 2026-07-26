/**
 * src/components/category/CategorySidebar/CategorySidebar.jsx
 *
 * PURPOSE:
 *   Collapsible nested category tree sidebar for CategoryPage (desktop)
 *   and a drawer panel on mobile. Shows the full category hierarchy with
 *   expand/collapse, active state highlighting, and product counts.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Receives `categories` (nested tree) from useCategories() hook:
 *   GET /categories?flat=false&status=active
 *   The backend pre-assembles the nested tree — each category has a
 *   `children: []` array when flat=false. This component renders it.
 *
 * STATE MANAGEMENT:
 *   Tree expansion state lives in useCategoryStore (Zustand), NOT in this
 *   component. This means:
 *   - Expansion survives route changes (user navigates to product and back)
 *   - Expansion can be set from anywhere (CategoryPage auto-expands ancestors)
 *   - This component is purely presentational — it reads and triggers store actions
 *
 * RECURSIVE TREE RENDERING:
 *   CategoryTreeNode renders itself recursively for each level of nesting.
 *   The backend supports any depth; this component handles it without changes.
 *   Max practical depth from the backend is ~3 levels (root → child → grandchild).
 *
 * ACTIVE STATE:
 *   A node is "active" when its _id matches activeCategoryId in the store.
 *   Set by CategoryPage on mount using category._id.
 *
 * REUSE:
 *   CategoryPage renders this in a sidebar column on desktop.
 *   CategoryPage renders this inside a drawer on mobile.
 *   Future: Header mega-menu could reuse CategoryTreeNode for a horizontal variant.
 *
 * PROPS:
 *   categories       → Category[] (nested tree) from useCategories()
 *   activeCategoryId → string — the currently viewed category's _id
 *   isLoading        → boolean
 */

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Package, Layers } from "lucide-react";

import { useCategoryStore } from "../../../store/category.store";
import { CategorySkeleton } from "../CategorySkeleton/CategorySkeleton";
import { buildPath, ROUTES } from "../../../constants/route.constants";

// ── Recursive tree node ────────────────────────────────────────────────────────
function CategoryTreeNode({ category, depth = 0, activeCategoryId }) {
  const { toggleExpanded, isExpanded } = useCategoryStore();

  const hasChildren = category.children?.length > 0;
  const expanded = isExpanded(category._id);
  const isActive = category._id === activeCategoryId;
  const categoryPath = buildPath(ROUTES.CATEGORY, { slug: category.slug });

  // Indent deeper nodes for visual hierarchy
  const indentClass = depth === 0
    ? ""
    : depth === 1
    ? "ml-4"
    : depth === 2
    ? "ml-8"
    : "ml-10";

  return (
    <li className={indentClass}>
      <div className="flex items-center">
        {/* Expand/collapse toggle (only if has children) */}
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(category._id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400 transition-colors mr-1"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
          >
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight size={14} />
            </motion.div>
          </button>
        ) : (
          // Spacer to keep alignment consistent with nodes that have children
          <div className="w-6 flex-shrink-0" aria-hidden="true" />
        )}

        {/* Category link */}
        <Link
          to={categoryPath}
          className={[
            "flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
            isActive
              ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
          ].join(" ")}
          aria-current={isActive ? "page" : undefined}
        >
          {/* Icon — only on root level */}
          {depth === 0 && (
            <div
              className={[
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                isActive
                  ? "bg-indigo-100 dark:bg-indigo-900"
                  : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700",
              ].join(" ")}
              aria-hidden="true"
            >
              <Package size={13} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"} />
            </div>
          )}

          {/* Name */}
          <span className="flex-1 truncate">{category.name}</span>

          {/* Product count badge */}
          {category.productCount > 0 && (
            <span
              className={[
                "text-[10px] font-medium px-1.5 py-0.5 rounded-md flex-shrink-0",
                isActive
                  ? "text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900"
                  : "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800",
              ].join(" ")}
              aria-label={`${category.productCount} products`}
            >
              {category.productCount > 999
                ? `${Math.floor(category.productCount / 1000)}k`
                : category.productCount}
            </span>
          )}
        </Link>
      </div>

      {/* Child nodes — animated expand/collapse */}
      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-0.5 space-y-0.5 overflow-hidden"
          >
            {category.children.map((child) => (
              <CategoryTreeNode
                key={child._id}
                category={child}
                depth={depth + 1}
                activeCategoryId={activeCategoryId}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

// ── Sidebar container ──────────────────────────────────────────────────────────
export function CategorySidebar({
  categories = [],
  activeCategoryId = null,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="space-y-1">
        {/* Section header skeleton */}
        <div className="px-3 py-2 mb-3">
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
        <CategorySkeleton variant="sidebar" count={8} />
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="px-3 py-4 text-center">
        <Layers size={24} className="text-gray-300 dark:text-gray-700 mx-auto mb-2" aria-hidden="true" />
        <p className="text-xs text-gray-400 dark:text-gray-600">
          No categories found
        </p>
      </div>
    );
  }

  return (
    <nav aria-label="Category navigation">
      {/* Section header */}
      <div className="px-3 py-2 mb-2">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
          Categories
        </p>
      </div>

      {/* Tree */}
      <ul className="space-y-0.5">
        {categories.map((rootCategory) => (
          <CategoryTreeNode
            key={rootCategory._id}
            category={rootCategory}
            depth={0}
            activeCategoryId={activeCategoryId}
          />
        ))}
      </ul>

      {/* All products link */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 px-3">
        <Link
          to={ROUTES.PRODUCTS}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <Package size={13} aria-hidden="true" />
          View All Products
        </Link>
      </div>
    </nav>
  );
}