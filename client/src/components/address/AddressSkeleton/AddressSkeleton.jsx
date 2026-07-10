/**
 * src/components/address/AddressSkeleton/AddressSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Loading skeleton shown while fetching addresses.
 * Prevents layout shift when data loads.
 * 
 * Shows while useAddresses() is loading.
 */

export const AddressSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse"
        >
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-3">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20" />
          </div>

          {/* Address lines skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
          </div>

          {/* Actions skeleton */}
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20" />
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};