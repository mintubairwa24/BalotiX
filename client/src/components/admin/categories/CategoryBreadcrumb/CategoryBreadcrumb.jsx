/**
 * FILE: src/components/admin/categories/CategoryBreadcrumb/CategoryBreadcrumb.jsx
 *
 * ============================================================================
 * CategoryBreadcrumb — Phase 18D
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a category's ancestor chain (Root > Parent > This Category) —
 * per the brief's "Breadcrumb hierarchy" requirement under CATEGORY TREE.
 * Used on EditCategoryPage so an admin editing a deeply-nested category
 * can see exactly where it sits without mentally tracing parentCategory
 * references themselves.
 *
 * WHY THIS BUILDS THE CHAIN FROM `category.ancestors` IF PRESENT, ELSE
 * WALKS `parentCategory` CLIENT-SIDE (flagged, documented fallback — same
 * resilience principle as CategoryTree's tree/flat-list fallback):
 * The richest possible backend contract would return a precomputed
 * `ancestors: [{_id, name}, ...]` array directly on the category detail
 * response — cheaper to render, no N+1 lookups. That field's existence is
 * NOT confirmed (flagged). Failing that, this component falls back to
 * walking `category.parentCategory` one level up using whatever flat
 * category list is already in the React Query cache (passed in via
 * `allCategories`) — this only reconstructs a SINGLE ancestor level
 * client-side per render pass (not a deep recursive walk), which is a
 * deliberately conservative fallback: if your hierarchy is more than one
 * level deep and `ancestors` isn't provided, only the immediate parent
 * will show, not the full chain. This is called out explicitly rather
 * than silently under-delivering — a partial breadcrumb is honest; a
 * client-side reimplementation of full backend hierarchy-walking logic
 * would risk drifting from "never create client-side hierarchy logic
 * that differs from backend behavior."
 *
 * PRODUCTION-READY BECAUSE:
 * - Never breaks if ancestor data is incomplete — renders whatever chain
 *   it can, always ending with the current category
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { ChevronRight, Folder } from "lucide-react";

export const CategoryBreadcrumb = ({ category, allCategories = [] }) => {
  if (!category) return null;

  let chain;
  if (Array.isArray(category.ancestors)) {
    // Preferred: backend-provided full ancestor chain (flagged assumption).
    chain = [...category.ancestors, { _id: category._id, name: category.name }];
  } else if (category.parentCategory) {
    // Fallback: one level up only, from already-cached flat list — see header.
    const parent = allCategories.find((c) => c._id === category.parentCategory._id);
    chain = [
      ...(parent ? [{ _id: parent._id, name: parent.name }] : []),
      { _id: category._id, name: category.name },
    ];
  } else {
    chain = [{ _id: category._id, name: category.name }];
  }

  return (
    <nav aria-label="Category hierarchy" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
      <Folder className="h-3.5 w-3.5" />
      {chain.map((node, i) => {
        const isLast = i === chain.length - 1;
        return (
          <span key={node._id} className="flex items-center gap-1">
            {isLast ? (
              <span className="font-medium text-gray-700 dark:text-gray-200">{node.name}</span>
            ) : (
              <Link
                to={`/admin/categories/${node._id}/edit`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {node.name}
              </Link>
            )}
            {!isLast && <ChevronRight className="h-3 w-3" />}
          </span>
        );
      })}
    </nav>
  );
};

export default CategoryBreadcrumb;