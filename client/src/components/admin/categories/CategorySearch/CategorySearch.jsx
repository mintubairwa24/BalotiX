/**
 * FILE: src/components/admin/categories/CategorySearch/CategorySearch.jsx
 *
 * ============================================================================
 * CategorySearch — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A debounced text input driving the admin category table's `search` query
 * param. Exact sibling of ProductSearch (Phase 18A) — same debounce-then-
 * commit-to-store pattern, so the admin can type a full category name
 * without firing a network request per keystroke. The actual matching
 * happens entirely on the backend (reusing its existing search
 * implementation) — this component only decides WHEN to ask for it.
 *
 * PRODUCTION-READY BECAUSE:
 * - Syncs FROM the store on mount/external reset (e.g. CategoriesEmpty's
 *   "Clear filters") so the input never shows stale text after an
 *   external reset
 * - Debounce timer is cleaned up on unmount
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";

const DEBOUNCE_MS = 400;

const CategorySearch = () => {
  const storeSearch = useAdminCategoriesStore((s) => s.search);
  const setSearch = useAdminCategoriesStore((s) => s.setSearch);

  const [value, setValue] = useState(storeSearch);
  const debounceRef = useRef(null);

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
        placeholder="Search categories by name..."
        aria-label="Search categories"
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

export default CategorySearch;