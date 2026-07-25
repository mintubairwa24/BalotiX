/**
 * StockHistory for the admin inventory detail view.
 */

import { ArrowUpCircle, ArrowDownCircle, RotateCw, History } from "lucide-react";
import { useStockHistory } from "../../../../hooks/useAdminInventory";

const TYPE_ICON = {
  restock: { icon: ArrowUpCircle, classes: "text-green-600 dark:text-green-400" },
  return: { icon: ArrowUpCircle, classes: "text-green-600 dark:text-green-400" },
  release: { icon: ArrowUpCircle, classes: "text-green-600 dark:text-green-400" },
  sale: { icon: ArrowDownCircle, classes: "text-red-600 dark:text-red-400" },
  reservation: { icon: ArrowDownCircle, classes: "text-red-600 dark:text-red-400" },
  adjustment: { icon: RotateCw, classes: "text-indigo-600 dark:text-indigo-400" },
};

const formatDateTime = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const StockHistory = ({ productId }) => {
  const { history, isLoading, isError } = useStockHistory(productId);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Stock History
      </h2>

      {isLoading && (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      )}

      {isError && (
        <p className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <History className="h-4 w-4" />
          Stock history is not available for this product.
        </p>
      )}

      {!isLoading && !isError && history.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No stock movements recorded yet.
        </p>
      )}

      {!isLoading && !isError && history.length > 0 && (
        <ol className="space-y-3">
          {history.map((entry) => {
            const { icon: Icon, classes } = TYPE_ICON[entry.type] ?? TYPE_ICON.adjustment;
            const quantityLabel =
              entry.quantity > 0 ? `+${entry.quantity}` : `-${Math.abs(entry.quantity)}`;
            const timestamp = entry.createdAt ?? entry.timestamp;

            return (
              <li key={entry._id} className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${classes}`} />
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium capitalize">{entry.type}</span> {quantityLabel}
                    {entry.note && (
                      <span className="text-gray-400 dark:text-gray-500"> - {entry.note}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDateTime(timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default StockHistory;
