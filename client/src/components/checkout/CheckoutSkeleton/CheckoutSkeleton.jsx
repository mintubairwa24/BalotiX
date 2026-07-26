/**
 * src/components/checkout/CheckoutSkeleton/CheckoutSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Loading skeleton shown while CheckoutPage is fetching initial data
 * (cart via useCartQuery, addresses via useAddresses).
 * 
 * Matches the two-column CheckoutLayout shape (items+address on the
 * left, summary on the right) to prevent layout shift once real data
 * arrives — same principle as CartSkeleton (Phase 9) and
 * AddressSkeleton (Phase 11).
 */

export const CheckoutSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      {/* Left Column: Items + Address skeleton */}
      <div className="lg:col-span-2 space-y-4">
        {/* Address card skeleton */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          </div>
        </div>

        {/* Items skeleton */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Summary skeleton */}
      <div className="lg:col-span-1">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-full mt-4" />
        </div>
      </div>
    </div>
  );
};