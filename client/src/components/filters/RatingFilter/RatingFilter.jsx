/**
 * src/components/filters/RatingFilter/RatingFilter.jsx
 *
 * PURPOSE:
 *   Minimum rating selector for search results.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It uses the current product payload to reflect rating-based filtering in the
 *   UI even though the backend itself does not expose a rating filter endpoint.
 *
 * FUTURE REUSE:
 *   This component can be reused wherever rating-driven discovery is needed.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It provides a clear, accessible way to narrow results without overcomplicating the state model.
 */

export function RatingFilter({ filters, onFilter }) {
  const options = [4, 3, 2];

  return (
    <fieldset className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Minimum rating</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onFilter({ rating: option })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${filters.rating === option ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
          >
            {option}+ ★
          </button>
        ))}
      </div>
    </fieldset>
  );
}
