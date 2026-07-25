/**
 * FILE: src/components/admin/coupons/CouponSearch/CouponSearch.jsx
 *
 * ============================================================================
 * CouponSearch — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A debounced text input driving the admin coupon table's `search` query
 * param — assumed to match a coupon's `code` field (the only obviously
 * searchable text on a coupon; there's no name/description field in the
 * assumed schema). Exact sibling of ProductSearch/CategorySearch/
 * UserSearch — same debounce-then-commit-to-store pattern, so the admin
 * can type a full or partial code without firing a request per keystroke.
 *
 * WHY THE INPUT UPPERCASES AS-YOU-TYPE:
 * Coupon codes are conventionally stored/matched uppercase (SAVE20, not
 * save20) — this is a small UX courtesy, not a business rule invented
 * client-side; the actual case-sensitivity of matching remains whatever
 * the backend's `search` implementation does.
 *
 * PRODUCTION-READY BECAUSE:
 * - Syncs FROM the store on mount/external reset (e.g. CouponsEmpty's
 *   "Clear filters")
 * - Debounce timer cleaned up on unmount
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAdminCouponsStore } from "../../../../store/adminCoupons.store";

const DEBOUNCE_MS = 400;

export const CouponSearch = () => {
  const storeSearch = useAdminCouponsStore((s) => s.search);
  const setSearch = useAdminCouponsStore((s) => s.setSearch);

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
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder="Search by coupon code..."
        aria-label="Search coupons"
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

export default CouponSearch;
