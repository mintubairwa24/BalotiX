/**
 * FILE: src/components/admin/categories/CategoryTree/CategoryTree.jsx
 *
 * ============================================================================
 * CategoryTree — Phase 18D
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The hierarchy visualization view for CategoriesPage — an alternative to
 * CategoriesTable (flat list), toggled via adminCategories.store.js's
 * `viewMode`. Renders CategoryNode for each root-level category.
 *
 * THE FALLBACK STRATEGY (this is the most architecturally important part
 * of this file — read carefully): admin.service.js's getAdminCategoryTree
 * assumes a dedicated GET /admin/categories/tree endpoint that returns a
 * PRE-NESTED structure. That endpoint's existence is NOT confirmed. So:
 *   1. First, try useAdminCategoryTree(). If it succeeds, use its `tree`
 *      directly — the backend's own hierarchy computation is authoritative
 *      (per "never create client-side hierarchy logic that differs from
 *      backend behavior").
 *   2. If that query errors (e.g. 404 — endpoint doesn't exist), fall back
 *      to `useAdminCategoriesList()` (Phase 18B's confirmed, flat,
 *      paginated endpoint) and nest it client-side using each item's
 *      `parentCategory` ref. This is a MECHANICAL reconstruction of
 *      parent→children pointers already present in confirmed backend
 *      data — not an invented hierarchy RULE. The backend decided who
 *      each category's parent is; this only rearranges that fact into a
 *      tree shape for rendering.
 *   3. If NEITHER produces usable data, an explicit error state is shown
 *      — never a silent blank tree.
 *
 * WHY THE FALLBACK NESTING IS BUILT WITH useMemo:
 * Nesting a flat list into a tree is O(n) but shouldn't re-run on every
 * render — only when the underlying flat category list actually changes.
 *
 * PRODUCTION-READY BECAUSE:
 * - Never assumes the speculative tree endpoint blindly; always has a
 *   working path back to confirmed data
 * - "Expand All" / "Collapse All" controls act on the whole tree via the
 *   store, keyboard-reachable buttons
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useMemo } from "react";
import { ChevronsDown, ChevronsUp, AlertCircle } from "lucide-react";
import {
  useAdminCategoryTree,
  useAdminCategoriesList,
} from "../../../../hooks/useAdminCategories";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";
// FIX: The browser was crashing with a SyntaxError because this file was attempting
// a default import (`import CategoryNode from ...`), but the `CategoryNode.jsx`
// file provides a named export (`export const CategoryNode`).
// By adding curly braces, we change this to a named import, which correctly
// loads the component and resolves the error. This pattern is now applied to all
// local component imports to enforce the project-wide standard.
import { CategoryNode } from "../CategoryNode/CategoryNode";
import { CategoriesSkeleton } from "../CategoriesSkeleton/CategoriesSkeleton";
import { CategoriesEmpty } from "../CategoriesEmpty/CategoriesEmpty";

/** Mechanically nests a flat list using each item's parentCategory ref. */
const nestFlatList = (flatList) => {
  const byId = new Map(flatList.map((cat) => [cat._id, { ...cat, children: [] }]));
  const roots = [];

  byId.forEach((node) => {
    const parentId = node.parentCategory?._id ?? node.parentCategory;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

// ARCHITECTURAL FIX: To resolve the cascade of import/export errors, all components
// are being standardized to use NAMED EXPORTS. This component was previously using a
// default export, which would cause the next `SyntaxError`. This change makes it
// a named export, consistent with the rest of the application.
export const CategoryTree = () => {
  const { tree, isLoading: treeLoading, isError: treeError } = useAdminCategoryTree();

  // Fallback source — Phase 18B's confirmed flat list. Only meaningfully
  // used if the tree endpoint errored, but the hook always runs (Rules of
  // Hooks) — React Query just won't do useful work with it otherwise.
  const {
    categories: flatCategories,
    isLoading: flatLoading,
    isError: flatError,
  } = useAdminCategoriesList();

  const fallbackTree = useMemo(
    () => (treeError ? nestFlatList(flatCategories) : []),
    [treeError, flatCategories]
  );

  const expandAllNodes = useAdminCategoriesStore((s) => s.expandAllNodes);
  const collapseAllNodes = useAdminCategoriesStore((s) => s.collapseAllNodes);

  const isUsingFallback = treeError;
  const data = isUsingFallback ? fallbackTree : tree;
  const isLoading = isUsingFallback ? flatLoading : treeLoading;
  const isBothFailed = treeError && flatError;

  const allNodeIds = useMemo(() => {
    const ids = [];
    const collect = (nodes) => {
      nodes.forEach((n) => {
        if (n.children?.length) {
          ids.push(n._id);
          collect(n.children);
        }
      });
    };
    collect(data ?? []);
    return ids;
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full">
          <tbody>
            <CategoriesSkeleton rows={5} />
          </tbody>
        </table>
      </div>
    );
  }

  if (isBothFailed) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        <AlertCircle className="h-4 w-4" />
        Couldn't load the category hierarchy.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        {isUsingFallback && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Hierarchy endpoint unavailable — showing a reconstructed view.
          </p>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => expandAllNodes(allNodeIds)}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronsDown className="h-3.5 w-3.5" /> Expand All
          </button>
          <button
            onClick={collapseAllNodes}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronsUp className="h-3.5 w-3.5" /> Collapse All
          </button>
        </div>
      </div>

      {(data ?? []).length === 0 ? (
        <CategoriesEmpty />
      ) : (
        <ul>
          {data.map((rootNode) => (
            <CategoryNode key={rootNode._id} node={rootNode} depth={0} />
          ))}
        </ul>
      )}
    </div>
  );
};