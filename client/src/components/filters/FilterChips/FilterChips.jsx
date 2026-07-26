/**
 * src/components/filters/FilterChips/FilterChips.jsx
 *
 * PURPOSE:
 *   Visible, removable filter summary chips for the active search state.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   The chips simply reflect the current client filter state; the underlying
 *   search hook translates them into backend query params on each request.
 *
 * FUTURE REUSE:
 *   These chips can be reused by the main product listing experience as a shared
 *   "active filters" pattern.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   They make the current refinement state obvious to the user and reduce the
 *   chance of confusion when many filters are active.
 */

import { X } from "lucide-react";

export function FilterChips({ filters = [], onRemove, onClearAll }) {
  if (!filters.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove(filter.key)}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
        >
          <span>{filter.label}</span>
          <X size={13} />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Clear all
      </button>
    </div>
  );
}
