/**
 * src/components/orders/OrderSkeleton/OrderSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Loading skeleton for order screens. Supports two variants via a prop
 * rather than being split into two separate components, since both
 * shapes are simple and closely related (both are "cards with lines"):
 * - "list": multiple compact OrderCard-shaped skeletons (OrdersPage)
 * - "detail": single detailed skeleton matching OrderDetailsPage's
 *   sections (items, address, summary)
 * 
 * Same principle as CartSkeleton (Phase 9) and AddressSkeleton
 * (Phase 11) — prevents layout shift once real data arrives.
 * 
 * Props:
 * - variant: "list" | "detail" (default "list")
 * - count: number of skeleton cards (variant="list" only, default 3)
 */

export const OrderSkeleton = ({ variant = "list", count = 3 }) => {
  if (variant === "detail") {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32" />
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
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
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        </div>
      </div>
    );
  }

  // variant === "list"
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-24" />
          </div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};