/**
 * FILE: src/components/admin/inventory/InventoryRow/InventoryRow.jsx
 *
 * ============================================================================
 * InventoryRow — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a single inventory item's `<tr>` inside InventoryTable —
 * thumbnail, product name + SKU, current stock (with reserved stock as
 * subtext if present), InventoryStatus, and InventoryActions. Exact
 * sibling of ProductRow/CouponRow.
 *
 * WHY currentStock IS SHOWN PLAIN, NOT AS A PROGRESS BAR AGAINST A
 * THRESHOLD: unlike CouponUsage's progress bar (which visualizes a known,
 * fixed limit — usageLimit), a low-stock threshold is a business rule
 * this frontend deliberately doesn't know the shape of (see
 * InventoryStatus's header) — there's no confirmed "target" to draw a
 * bar against. The badge (InventoryStatus) is the correct place to show
 * "is this concerning," computed by the backend; the raw number here is
 * just the raw number.
 *
 * PRODUCTION-READY BECAUSE:
 * - Falls back to a placeholder icon if a product has no image
 * - Long names truncate with `title` tooltip rather than breaking row height
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ImageOff } from "lucide-react";
import { InventoryStatus } from "../InventoryStatus/InventoryStatus";
import { InventoryActions } from "../InventoryActions/InventoryActions"; 

export const InventoryRow = ({ item }) => {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="h-10 w-10 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300 dark:border-gray-600 dark:text-gray-600">
            <ImageOff className="h-4 w-4" />
          </div>
        )}
      </td>
      <td className="max-w-[220px] p-3">
        <p
          title={item.productName}
          className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {item.productName}
        </p>
        {item.sku && (
          <p className="truncate font-mono text-xs text-gray-400 dark:text-gray-500">
            {item.sku}
          </p>
        )}
      </td>
      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
        {item.currentStock}
        {item.reservedStock > 0 && (
          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
            ({item.reservedStock} reserved)
          </span>
        )}
      </td>
      <td className="p-3">
        <InventoryStatus status={item.status} />
      </td>
      <td className="p-3">
        <InventoryActions productId={item.productId} />
      </td>
    </tr>
  );
};

export default InventoryRow;