/**
 * src/components/cart/CartList/CartList.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Container component that renders all cart items using CartItem
 * Manages mutation state for update/remove operations
 * Respects checkout lock state from parent (cart data)
 * 
 * PROPS:
 * - items: Array of cart items
 * - isLocked: boolean (cart.status === "checkout_in_progress")
 * 
 * MUTATION INTEGRATION:
 * Uses useUpdateQuantity and useRemoveFromCart hooks
 * Passes isPending flags to CartItem to disable controls during mutation
 * 
 * OPTIMISTIC UPDATE PATTERN:
 * When user updates quantity or removes item:
 * 1. Mutation fires immediately (optimistic)
 * 2. React Query invalidates cart query
 * 3. Cart data refetches and UI updates
 * 
 * USAGE:
 * const { data: cart } = useCartQuery();
 * <CartList 
 *   items={cart?.items || []} 
 *   isLocked={cart?.status === "checkout_in_progress"}
 * />
 */

import { useUpdateQuantity, useRemoveFromCart } from "../../../hooks/useCart";
import { CartItem } from "../CartItem/CartItem";

export const CartList = ({ items = [], isLocked = false }) => {
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateQuantity();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();

  if (!items || items.length === 0) {
    return null; // CartEmpty handles empty state
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemove = (productId) => {
    removeItem({ productId });
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <CartItem
          key={item.productId}
          item={item}
          isLocked={isLocked}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          isPending={isUpdating || isRemoving}
        />
      ))}
    </div>
  );
};