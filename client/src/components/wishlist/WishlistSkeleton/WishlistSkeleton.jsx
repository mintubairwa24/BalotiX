// src/components/wishlist/WishlistSkeleton/WishlistSkeleton.jsx
//
// WHY THIS FILE EXISTS:
// Renders N placeholder cards that EXACTLY match WishlistItem's dimensions.
// "Exact match" is critical — mismatched skeletons cause layout shift (CLS)
// when real content loads in, degrading Core Web Vitals and UX.
//
// The shimmer animation is defined in src/styles/animations.css
// (class: "animate-shimmer") and reused across all skeleton components
// in the project (ProductSkeleton, CategorySkeleton, etc.).
//
// FUTURE MODULES:
// This pattern is reused verbatim for CartSkeleton (Phase 9),
// OrderSkeleton (Phase 10), and any other list-of-cards skeleton.

export function WishlistSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
          aria-hidden="true"
        >
          {/* Image placeholder */}
          <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 animate-shimmer" />

          {/* Content area */}
          <div className="p-4 space-y-3">
            {/* Brand */}
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-shimmer" />

            {/* Product name — two lines */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-shimmer" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-shimmer" />
            </div>

            {/* Rating */}
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-shimmer" />

            {/* Price */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-shimmer" />
              <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700 animate-shimmer" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <div className="h-9 flex-1 rounded-xl bg-gray-200 dark:bg-gray-700 animate-shimmer" />
              <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}