/**
 * src/components/filters\DiscountFilter\DiscountFilter.jsx
 *
 * PURPOSE:
 *   Discount percentage selector for the search results experience.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It reinforces the client-side refinement of the search results using the
 *   backend product payload, which already exposes discount metadata.
 *
 * FUTURE REUSE:
 *   This filter can be reused in future promotional or deals-oriented views.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It offers a lightweight UX for sale-focused shoppers without adding backend complexity.
 */

export function DiscountFilter({ filters, onFilter }) {
  const options = [10, 20, 30];

  return (
    <fieldset className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Discount</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onFilter({ discount: option })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${filters.discount === option ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
          >
            {option}%+
          </button>
        ))}
      </div>
    </fieldset>
  );
}
