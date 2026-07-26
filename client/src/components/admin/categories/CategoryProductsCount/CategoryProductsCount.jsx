/**
 * FILE: src/components/admin/categories/CategoryProductsCount/CategoryProductsCount.jsx
 *
 * ============================================================================
 * CategoryProductsCount — Phase 18D
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A small, reused display for a category's `productCount` — extracted as
 * its own component because it's now needed in TWO places that didn't
 * both exist before this phase: CategoryRow (the flat table, Phase 18B)
 * and the new CategoryNode (the tree view, Phase 18D). Rather than inline
 * the same "N products" span twice with slightly different styling in
 * each, one small component keeps the visual language identical wherever
 * a product count appears.
 *
 * WHY THIS ALSO DOUBLES AS A LINK WHEN `linkToProducts` IS TRUE:
 * On the tree view especially, an admin exploring the hierarchy benefits
 * from jumping straight to "show me these products" — this links to
 * Phase 18A's Products page pre-filtered by category
 * (`/admin/products?category={id}`), reusing that existing filter param
 * rather than inventing a new products-by-category view.
 *
 * PRODUCTION-READY BECAUSE:
 * - Renders "0 products" plainly rather than hiding the count entirely
 *   when empty — an admin scanning the tree needs to see empty categories
 *   just as clearly as populated ones
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Package } from "lucide-react";

export  const CategoryProductsCount = ({
  categoryId,
  count = 0,
  linkToProducts = false,
}) => {
  const content = (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <Package className="h-3 w-3" />
      {count} product{count === 1 ? "" : "s"}
    </span>
  );

  if (linkToProducts && categoryId) {
    return (
      <Link
        to={`/admin/products?category=${categoryId}`}
        className="hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default CategoryProductsCount;
