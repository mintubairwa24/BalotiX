/**
 * src/components/search/SearchSuggestions/SearchSuggestions.jsx
 *
 * PURPOSE:
 *   Lightweight dropdown for search suggestions rendered under the search input.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It consumes products returned by the existing search endpoint so the UI can
 *   show real product suggestions without inventing any new API contract.
 *
 * FUTURE REUSE:
 *   The same component can be used inside the main header, a flyout search panel,
 *   or a future mobile search experience.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It keeps suggestions small, readable, and keyboard accessible while avoiding
 *   expensive request waterfalls.
 */

import { Sparkles } from "lucide-react";

export function SearchSuggestions({ suggestions = [], isOpen = false, isLoading = false, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          Looking for matches...
        </div>
      ) : suggestions.length ? (
        <ul className="max-h-72 overflow-y-auto">
          {suggestions.map((product) => (
            <li key={product._id}>
              <button
                type="button"
                onClick={() => onSelect(product)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <Sparkles size={14} />
                </div>
                <span className="flex-1 truncate">{product.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          Try a broader keyword to see product suggestions.
        </div>
      )}
    </div>
  );
}
