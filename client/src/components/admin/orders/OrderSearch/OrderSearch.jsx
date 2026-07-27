/**
 * COMPONENT: src/components/admin/orders/OrderSearch/OrderSearch.jsx
 *
 * PURPOSE:
 * Search input for the admin orders list. Searches by order number via
 * backend GET /api/orders?search=... (orderQuerySchema supports search).
 *
 * REUSES:
 * useDebounce from src/hooks/useDebounce.js — waits 400ms after the user
 * stops typing before updating the store, preventing a request on every keystroke.
 *
 * BACKEND INTEGRATION:
 * The store's `search` value is read by useAdminOrdersList() which passes
 * it as the `search` query param to GET /api/orders. Backend
 * order.service.js's getAllOrders filters by orderNumber with $regex.
 */

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";
import { useDebounce } from "../../../../hooks/useDebounce";

export const OrderSearch = () => {
  const storeSearch = useAdminOrdersStore((s) => s.search);
  const setSearch = useAdminOrdersStore((s) => s.setSearch);
  const [local, setLocal] = useState(storeSearch);
  const debouncedValue = useDebounce(local, 400);
  const inputRef = useRef(null);

  // Sync debounced value to store
  useEffect(() => {
    if (debouncedValue !== storeSearch) {
      setSearch(debouncedValue);
    }
  }, [debouncedValue, storeSearch, setSearch]);

  // Sync external store changes (e.g., resetFilters) back to local
  useEffect(() => {
    setLocal(storeSearch);
  }, [storeSearch]);

  const handleClear = () => {
    setLocal("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search by order number..."
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default OrderSearch;

