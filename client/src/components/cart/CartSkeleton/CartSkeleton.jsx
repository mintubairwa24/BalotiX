/**
 * src/components/cart/CartSkeleton/CartSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Placeholder skeleton while cart data is fetching
 * Matches CartItem dimensions exactly to prevent layout shift
 * Shows multiple skeleton items to set user expectations
 * 
 * USAGE:
 * const { data: cart, isLoading } = useCartQuery();
 * 
 * if (isLoading) return <CartSkeleton count={3} />;
 * if (cart?.items.length === 0) return <CartEmpty />;
 * return <CartList items={cart.items} />;
 */

const CartItemSkeleton = () => {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      {/* Image skeleton */}
      <div className="h-20 w-20 rounded-lg bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

      {/* Details skeleton */}
      <div className="flex-1">
        {/* Product name */}
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />

        {/* Price */}
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3" />

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>

      {/* Remove button skeleton */}
      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0" />
    </div>
  );
};

export const CartSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
    </div>
  );
};