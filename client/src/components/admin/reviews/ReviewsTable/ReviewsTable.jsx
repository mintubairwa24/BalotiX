import { ArrowUpDown, AlertCircle } from "lucide-react";
import { ReviewRow } from "../ReviewRow/ReviewRow";
import { ReviewsSkeleton } from "../ReviewsSkeleton/ReviewsSkeleton";
import { ReviewsEmpty } from "../ReviewsEmpty/ReviewsEmpty";
import { ReviewsPagination } from "../ReviewsPagination/ReviewsPagination";

const COLUMNS = [
  { key: "title", label: "Review", sortable: false },
  { key: "rating", label: "Rating", sortable: true },
  { key: "user", label: "Reviewer", sortable: false },
  { key: "product", label: "Product", sortable: false },
  { key: "moderationStatus", label: "Status", sortable: false },
  { key: "createdAt", label: "Created", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

export const ReviewsTable = ({
  reviews,
  pagination,
  isLoading,
  isError,
  error,
  refetch,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onHide,
  onRestore,
  onDelete,
  hidePending,
  restorePending,
  deletePending,
  hasFilters = false,
  onResetFilters,
}) => {
  const handleSortClick = (key) => {
    const nextOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    onSortChange(key, nextOrder);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSortClick(column.key)}
                      className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {column.label}
                      <ArrowUpDown
                        className={`h-3 w-3 ${
                          sortBy === column.key
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <ReviewsSkeleton rows={pagination?.limit ?? 5} />}

            {!isLoading &&
              !isError &&
              reviews.map((review) => (
                <ReviewRow
                  key={review._id}
                  review={review}
                  onHide={onHide}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  isHidePending={hidePending}
                  isRestorePending={restorePending}
                  isDeletePending={deletePending}
                />
              ))}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between gap-3 p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.message ?? "Couldn't load reviews."}
          </span>
          <button
            type="button"
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <ReviewsEmpty hasFilters={hasFilters} onReset={onResetFilters} />
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <div className="p-4">
          <ReviewsPagination pagination={pagination} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default ReviewsTable;
