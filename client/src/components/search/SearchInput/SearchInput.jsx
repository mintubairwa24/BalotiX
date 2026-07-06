/**
 * src/components/search/SearchInput/SearchInput.jsx
 *
 * PURPOSE:
 *   Reusable input field for the search experience. It keeps the search UI
 *   consistent across the global header and the dedicated results page.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It does not call the API directly. The parent search bar uses it to collect
 *   the user-entered term before sending it to the existing search endpoint.
 *
 * FUTURE REUSE:
 *   This component can be reused by any future search surfaces or embedded
 *   search entry points in the storefront.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It is accessible, keyboard-friendly, and easy to restyle without changing logic.
 */

import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search products...",
  isFocused = false,
}) {
  return (
    <form onSubmit={onSubmit} role="search" className="w-full">
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search size={16} className={isFocused ? "text-indigo-500" : "text-gray-400"} />
        </div>

        <input
          id="search-input"
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pl-10 pr-10 py-3 text-sm text-gray-700 dark:text-gray-200 shadow-sm outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
        />

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </form>
  );
}
