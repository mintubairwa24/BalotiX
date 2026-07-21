/**
 * FILE: src/components/admin/products/ProductRow/ProductRow.jsx
 *
 * ============================================================================
 * ProductRow — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a single product's `<tr>` inside ProductsTable — thumbnail,
 * name + category, price, ProductStatus (badge/toggle), and
 * ProductActions (edit/delete). Kept separate from ProductsTable so the
 * table component only handles table-level concerns (headers, sorting,
 * loading/empty states) while each row's layout lives here.
 *
 * MONEY HANDLING (Convention #1 — strict): `product.effectivePrice`
 * arrives in PAISE from GET /admin/products. This component does ZERO
 * arithmetic — only formatting, identical technique to DashboardStats
 * (Phase 17): `₹${(paise/100).toLocaleString("en-IN", {...})}`.
 *
 * REUSES:
 * ProductStatus and ProductActions (both this phase) are composed here
 * rather than duplicated inline — keeps each concern testable/reusable on
 * its own.
 *
 * PRODUCTION-READY BECAUSE:
 * - Falls back to a placeholder icon if a product has no images yet
 *   (a draft product created without uploading an image shouldn't break
 *   the row's layout)
 * - Long names truncate with `title` tooltip rather than breaking the
 *   table's row height
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ImageOff } from "lucide-react";
import ProductStatus from "../ProductStatus/ProductStatus";
import ProductActions from "../ProductActions/ProductActions";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ProductRow = ({ product }) => {
  const thumbnail = product.images?.[0];

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.name}
            className="h-12 w-12 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300 dark:border-gray-600 dark:text-gray-600">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </td>
      <td className="max-w-[220px] p-3">
        <p
          title={product.name}
          className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {product.name}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {product.category?.name ?? "Uncategorized"}
        </p>
      </td>
      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
        {formatPaise(product.effectivePrice)}
      </td>
      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
        {product.stock ?? "—"}
      </td>
      <td className="p-3">
        <ProductStatus productId={product._id} isActive={product.isActive} />
      </td>
      <td className="p-3">
        <ProductActions productId={product._id} />
      </td>
    </tr>
  );
};

export default ProductRow;