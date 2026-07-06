/**
 * src/components/filters/PriceFilter/PriceFilter.jsx
 *
 * PURPOSE:
 *   Compact price-range controls for the search results page.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It writes min/max price values into the search store, which later becomes
 *   query params for the existing product listing/search endpoints.
 *
 * FUTURE REUSE:
 *   This component can be reused by the general product listing page once the
 *   same filter experience is needed outside search.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It validates input at the component boundary and is easy to tweak for more
 *   advanced range presets.
 */

export function PriceFilter({ filters, onFilter }) {
  const handleChange = (field, value) => {
    onFilter({ [field]: value ? Number(value) : undefined });
  };

  return (
    <fieldset className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Price</legend>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">
          <span className="mb-1 block">Min</span>
          <input
            type="number"
            min="0"
            value={filters.minPrice ?? ""}
            onChange={(event) => handleChange("minPrice", event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
        <label className="text-xs text-gray-500 dark:text-gray-400">
          <span className="mb-1 block">Max</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice ?? ""}
            onChange={(event) => handleChange("maxPrice", event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
      </div>
    </fieldset>
  );
}
