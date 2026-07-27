/**
 * COMPONENT: src/components/admin/orders/OrdersPagination/OrdersPagination.jsx
 *
 * PURPOSE:
 * Pagination controls for the admin orders table. Displays page numbers
 * and Previous/Next buttons, reading and updating the current page from
 * adminOrders.store.js.
 *
 * REUSES:
 * Backend pagination metadata — NEVER implements client-side pagination.
 * The backend returns { currentPage, totalPages, totalCount, limit } and
 * this component renders controls that call setPage() on the store.
 *
 * Same pattern as ProductsPagination, CategoriesPagination, etc.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";

export const OrdersPagination = ({ pagination }) => {
  const page = useAdminOrdersStore((s) => s.page);
  const setPage = useAdminOrdersStore((s) => s.setPage);

  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalCount, limit } = pagination;
  const activePage = currentPage ?? page;

  // Generate page numbers to display (max 7)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, activePage - 2);
      let end = Math.min(totalPages - 1, activePage + 2);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-medium">
          {Math.min((activePage - 1) * limit + 1, totalCount)}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(activePage * limit, totalCount)}
        </span>{" "}
        of <span className="font-medium">{totalCount}</span> orders
      </p>

      <nav className="flex items-center gap-1">
        <button
          onClick={() => setPage(activePage - 1)}
          disabled={activePage <= 1}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium ${
                p === activePage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => setPage(activePage + 1)}
          disabled={activePage >= totalPages}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default OrdersPagination;

