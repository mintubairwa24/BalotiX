/**
 * src/components/coupon/CouponSkeleton/CouponSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Loading skeleton shown while:
 * - Validating coupon code (dry run)
 * - Applying coupon to cart (modifying cart)
 * 
 * Matches CouponForm dimensions to prevent layout shift during loading.
 * Shows animated placeholder.
 * 
 * USAGE:
 * {isValidating && <CouponSkeleton />}
 * {isApplying && <CouponSkeleton />}
 */

export const CouponSkeleton = () => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-pulse">
      {/* Form header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32" />
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-6" />
      </div>

      {/* Input + button skeleton */}
      <div className="space-y-3">
        {/* Input skeleton */}
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg" />

        {/* Button skeleton */}
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg" />
      </div>
    </div>
  );
};