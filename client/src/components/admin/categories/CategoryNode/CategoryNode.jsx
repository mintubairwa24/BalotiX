/**
 * FILE: src/components/admin/categories/CategoryNode/CategoryNode.jsx
 *
 * ============================================================================
 * CategoryNode — Phase 18D
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders ONE node in the category hierarchy tree, plus recursively renders
 * its own `children` array when expanded. This is the recursive unit
 * CategoryTree composes — kept as its own file (rather than inlined as a
 * nested function inside CategoryTree) because recursive JSX components
 * read far more clearly as a named, self-contained file than as a closure
 * defined inside another component.
 *
 * WHY EXPAND STATE LIVES IN THE STORE, NOT LOCAL useState:
 * adminCategories.store.js's `expandedNodeIds` (Phase 18D addition) is
 * global so CategoryTree's "Expand All" / "Collapse All" controls can act
 * on every node at once without each CategoryNode needing to expose an
 * imperative ref — a parent action just writes a new Set, and every node
 * reads its own membership from it, same "shared source of truth without
 * prop drilling" reasoning as every other Zustand slice in this project.
 *
 * PERFORMANCE (per brief's "Efficient tree rendering," "React.memo"):
 * Wrapped in React.memo — a tree can easily have dozens of nodes, and
 * toggling ONE node's expansion (a Set mutation elsewhere) would otherwise
 * re-render every sibling node unnecessarily since they all subscribe to
 * the same store. memo() means a node only re-renders when ITS OWN props
 * (the node data, its own expanded boolean, its depth) actually change.
 *
 * REUSES: CategoryStatus, CategoryProductsCount, CategoryActions (all this
 * project) — a tree node shows the exact same status/count/actions a
 * table row does, just indented and nested instead of in a flat table row.
 *
 * PRODUCTION-READY BECAUSE:
 * - Indentation is computed from `depth`, not hardcoded per level, so the
 *   tree renders correctly to any nesting depth the backend returns
 *   without this component needing to know how deep hierarchies can go
 * - Expand/collapse toggle is a real <button> with aria-expanded, keyboard
 *   reachable — accessible tree navigation per the brief
 * - Leaf nodes (no children) render without a toggle affordance at all,
 *   rather than a disabled/dead chevron
 */

import { memo } from "react";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";

// ARCHITECTURAL ALIGNMENT: The project is standardizing on named exports to prevent
// syntax errors. The previous mix of default and named imports was causing crashes.
// These imports are now all named, which requires the source files to be updated
// to use `export const ...` instead of `export default ...`.
import { CategoryStatus } from "../CategoryStatus/CategoryStatus";
import { CategoryProductsCount } from "../CategoryProductsCount/CategoryProductsCount";
import { CategoryActions } from "../CategoryActions/CategoryActions";

const EMPTY_SET = new Set();

// ARCHITECTURAL FIX: The entire application is experiencing a cascade of SyntaxErrors
// due to an inconsistency between `default` and `named` exports. To resolve this
// permanently, we are standardizing on NAMED EXPORTS for all components.
// This change converts `CategoryNode` to a named export. Any file that imports
// this component must now use `import { CategoryNode } from ...`.
export const CategoryNode = memo(({ node, depth = 0 }) => {
  const expandedNodeIds = useAdminCategoriesStore((s) =>
    s.expandedNodeIds instanceof Set ? s.expandedNodeIds : EMPTY_SET
  );
  const isExpanded = expandedNodeIds.has(node._id);
  const toggleExpanded = useAdminCategoriesStore((s) => s.toggleNodeExpanded);

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-lg py-2 pr-2 hover:bg-gray-50 dark:hover:bg-gray-700/40"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(node._id)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-5 shrink-0" aria-hidden="true" />
        )}

        <Folder className="h-4 w-4 shrink-0 text-gray-400" />

        <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
          {node.name}
        </span>

        <CategoryProductsCount categoryId={node._id} count={node.productCount} linkToProducts={true} />
        {/* FIX: The component was passing boolean `isActive` and `isDeleted` props,
            but the underlying data model uses a `status` string ('active', 'inactive',
            'archived'). These components should consume the `status` directly for
            consistency with other parts of the admin panel. */}
        <CategoryStatus categoryId={node._id} status={node.status} />
        <CategoryActions categoryId={node._id} status={node.status} />
      </div>

      {hasChildren && isExpanded && (
        <ul>
          {node.children.map((child) => (
            <CategoryNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
});


export default CategoryNode;
