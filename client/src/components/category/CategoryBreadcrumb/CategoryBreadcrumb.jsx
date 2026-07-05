/**
 * src/components/category/CategoryBreadcrumb/CategoryBreadcrumb.jsx
 *
 * PURPOSE:
 *   Category-specific breadcrumb component that builds the navigation trail
 *   from the backend's GET /categories/:id/breadcrumb response.
 *
 * WHY NOT USE THE GENERIC Breadcrumb COMPONENT DIRECTLY:
 *   The generic Breadcrumb (components/common/Breadcrumb/Breadcrumb.jsx)
 *   accepts a flat `items` array. CategoryBreadcrumb transforms the backend
 *   breadcrumb response (array of { _id, name, slug }) into the correct
 *   shape AND adds "All Categories" as the first item.
 *
 *   This keeps the transformation logic here (category-domain code)
 *   rather than leaking it into CategoryPage or the generic Breadcrumb.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Receives `breadcrumb` from useCategory() hook:
 *   GET /categories/:id/breadcrumb → [{ _id, name, slug }, ...]
 *   Ordered root → immediate parent (current category NOT included).
 *   This component appends the current category as the final non-linked item.
 *
 * REUSE:
 *   CategoryPage.jsx imports this.
 *   Future: ProductDetailsPage could extend this to show
 *   Home > Category > Sub-category > Product Name
 *
 * PROPS:
 *   breadcrumb       → [{ _id, name, slug }] from GET /categories/:id/breadcrumb
 *   currentCategory  → { name, slug } — the current (active) category
 */

import { Breadcrumb } from "../../common/Breadcrumb/Breadcrumb";
import { buildPath, ROUTES } from "../../../constants/route.constants";

export function CategoryBreadcrumb({ breadcrumb = [], currentCategory }) {
  // Transform backend breadcrumb response into the generic Breadcrumb item shape
  const items = [
    // 1. "All Categories" — always first after Home (Home is prepended by Breadcrumb)
    { label: "Categories", path: ROUTES.PRODUCTS },

    // 2. Ancestor categories (root → parent of current)
    ...breadcrumb.map((ancestor) => ({
      label: ancestor.name,
      path: buildPath(ROUTES.CATEGORY, { slug: ancestor.slug }),
    })),

    // 3. Current category — no path (renders as plain text, aria-current="page")
    ...(currentCategory
      ? [{ label: currentCategory.name }]
      : []),
  ];

  return <Breadcrumb items={items} />;
}