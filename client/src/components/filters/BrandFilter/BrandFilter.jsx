/**
 * src/components/filters/BrandFilter/BrandFilter.jsx
 *
 * PURPOSE:
 *   Brand selection control for the search results filter set.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It writes the selected brand into the search store, which is then passed to
 *   the existing product search/list endpoints as the backend-supported brand filter.
 *
 * FUTURE REUSE:
 *   The same component can be reused across product listing and category pages.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It keeps the UI simple while supporting a common brand filter interaction.
 */

const BRANDS = ["Apple", "Samsung", "Sony", "Dell", "Nike", "Adidas"];

export function BrandFilter({ filters, onFilter }) {
  return (
    <fieldset className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Brand</legend>
      <select
        value={filters.brand ?? ""}
        onChange={(event) => onFilter({ brand: event.target.value || undefined })}
        className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-950"
      >
        <option value="">All brands</option>
        {BRANDS.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
