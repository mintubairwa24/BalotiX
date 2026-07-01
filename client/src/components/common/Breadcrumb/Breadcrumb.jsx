/**
 * src/components/common/Breadcrumb/Breadcrumb.jsx
 *
 * PURPOSE:
 *   Reusable breadcrumb trail for product, category, account, and
 *   admin pages. Renders a semantic <nav> with structured data
 *   (aria-label="Breadcrumb") for accessibility and SEO.
 *
 * USAGE:
 *   <Breadcrumb
 *     items={[
 *       { label: "Home", path: "/" },
 *       { label: "Mobiles", path: "/category/mobiles" },
 *       { label: "iPhone 15 Pro" },   ← last item, no path = current page
 *     ]}
 *   />
 *
 * FUTURE PAGES THAT WILL USE THIS:
 *   ProductDetailPage  → Home > Category > Product Name
 *   CategoryPage       → Home > Category Name
 *   AccountOrderDetail → Home > My Account > Orders > Order #
 *   AdminProductEdit   → Admin > Products > Edit Product
 *
 * The last item (no `path`) is rendered as plain text (current page).
 */

import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center flex-wrap gap-1">
        {/* Always prepend Home */}
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors"
            aria-label="Home"
          >
            <Home size={14} />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              <ChevronRight
                size={14}
                className="text-gray-300 dark:text-gray-600 flex-shrink-0"
                aria-hidden="true"
              />

              {isLast || !item.path ? (
                <span
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[180px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[180px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}