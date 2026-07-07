// src/components/wishlist/WishlistGrid/WishlistGrid.jsx
//
// WHY THIS FILE EXISTS:
// Separates layout concerns (grid structure, AnimatePresence, stagger)
// from item concerns (WishlistItem). WishlistPage stays clean — it
// just renders <WishlistGrid items={wishlist.items} />.
//
// AnimatePresence wraps the grid so removed items animate OUT instead
// of blinking out. The `layout` prop on WishlistItem (set in that file)
// tells Framer Motion to animate remaining items into their new positions
// after a removal — the "shift fill" effect seen on Amazon/Flipkart.
//
// FUTURE MODULES:
// Phase 9  — OrdersGrid, ReviewsGrid follow the same pattern
// CartGrid (Phase 9) uses the same AnimatePresence exit pattern

import { AnimatePresence } from "framer-motion";
import { WishlistItem } from "../WishlistItem";

/**
 * @param {Array}  items — wishlist items array from GET /wishlist response
 * @param {boolean} isLoading — if true, parent should render WishlistSkeleton instead
 */
export function WishlistGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <WishlistItem
            key={item._id}       // stable key = wishlist item _id (not productId)
            item={item}
            index={index}        // staggered entrance delay
          />
        ))}
      </AnimatePresence>
    </div>
  );
}