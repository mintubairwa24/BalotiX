/**
 * FILE: src/components/admin/products/ProductSearch/ProductSearch.jsx
 *
 * ============================================================================
 * ProductSearch — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A debounced text input that drives the admin product table's `search`
 * query param. Debounced client-side so the admin can type a full product
 * name without firing a network request per keystroke — the ACTUAL search
 * (matching, ranking) happens entirely on the backend (reusing its
 * existing Phase 5/7 search implementation), this component only decides
 * WHEN to ask for it.
 *
 * WHY LOCAL STATE + DEBOUNCE, NOT WRITING TO THE STORE ON EVERY KEYSTROKE:
 * useAdminProductsStore().setSearch() resets page to 1 and (via
 * useAdminProductsList's queryKey) triggers a new network request. Writing
 * on every keystroke would mean a request per character. This component
 * keeps the input's immediate value in local useState for a responsive
 * typing feel, and only commits to the shared store — and therefore only
 * triggers a fetch — 400ms after the admin stops typing.
 *
 * REUSES:
 * Same debounce-then-commit-to-store pattern as the customer catalog's
 * search (Phase 7) — no new debouncing technique introduced.
 *
 * PRODUCTION-READY BECAUSE:
 * - Syncs FROM the store on mount/external reset (e.g. ProductsEmpty's
 *   "Clear filters") so the input never shows stale text after an external
 *   reset
 * - Debounce timer is cleaned up on unmount (no state update after unmount)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";

const DEBOUNCE_MS = 400;

const ProductSearch = () => {
  const storeSearch = useAdminProductsStore((s) => s.search);
  const setSearch = useAdminProductsStore((s) => s.setSearch);

  const [value, setValue] = useState(storeSearch);
  const debounceRef = useRef(null);

  // Keep the input in sync if the store's search is reset externally
  // (e.g. ProductsEmpty's "Clear filters" button).
  useEffect(() => {
    setValue(storeSearch);
  }, [storeSearch]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value !== storeSearch) setSearch(value);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products by name..."
        aria-label="Search products"
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;