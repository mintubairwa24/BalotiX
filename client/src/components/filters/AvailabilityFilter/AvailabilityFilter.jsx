/**
 * src/components/filters/AvailabilityFilter/AvailabilityFilter.jsx
 *
 * PURPOSE:
 *   Availability selection control for in-stock-only searches.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It maps the UI choice to the supported inStock flag for the product API.
 *
 * FUTURE REUSE:
 *   This pattern can be used in other listing surfaces that need stock filtering.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It is easy to understand and avoids overloading the state shape with too many booleans.
 */

export function AvailabilityFilter({ filters, onFilter }) {
  return (
    <fieldset className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Availability</legend>
      <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {[
          { value: "all", label: "All products" },
          { value: "inStock", label: "In stock only" },
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name="availability"
              value={option.value}
              checked={filters.availability === option.value}
              onChange={() => onFilter({ availability: option.value })}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
