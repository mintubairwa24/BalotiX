/**
 * src/components/ui/Loader/SectionLoader.jsx
 *
 * PURPOSE:
 *   Inline loader for sections within a page — e.g. while a product grid,
 *   order list, or review section is fetching. Does NOT overlay the whole
 *   viewport; it renders in-flow where the content will appear.
 *
 * USAGE:
 *   <SectionLoader />               → default height
 *   <SectionLoader height="h-96" /> → taller section
 */

export function SectionLoader({ height = "h-64" }) {
  return (
    <div className={`${height} flex items-center justify-center w-full`}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
      </div>
    </div>
  );
}