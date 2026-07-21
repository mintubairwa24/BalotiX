/**
 * FILE: src/components/admin/users/UserSearch/UserSearch.jsx
 *
 * ============================================================================
 * UserSearch — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A debounced text input driving the admin user table's `search` query
 * param. Exact sibling of ProductSearch/CategorySearch — same debounce-
 * then-commit-to-store pattern. Per the brief, this single field is
 * assumed to search name/email/phone/user-id together (one input, one
 * backend `search` param — see admin.service.js's header for why this
 * isn't four separate fields).
 *
 * PRODUCTION-READY BECAUSE:
 * - Syncs FROM the store on mount/external reset (e.g. UserEmpty's
 *   "Clear filters")
 * - Debounce timer cleaned up on unmount
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";

const DEBOUNCE_MS = 400;

const UserSearch = () => {
  const storeSearch = useAdminUsersStore((s) => s.search);
  const setSearch = useAdminUsersStore((s) => s.setSearch);

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
        placeholder="Search by name, email, phone, or ID..."
        aria-label="Search users"
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

export default UserSearch;