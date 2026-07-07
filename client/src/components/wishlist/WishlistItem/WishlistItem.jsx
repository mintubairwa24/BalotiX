// src/components/wishlist/WishlistItem/WishlistItem.jsx
//
// WHY THIS FILE EXISTS:
// Renders a single wishlist entry as a product card. Distinct from ProductCard
// (Phase 5) because the wishlist card needs a different action set:
//   • "Move to Cart" (primary) — calls useMoveToCart mutation
//   • "Remove"       (secondary) — calls useRemoveFromWishlist mutation
//   • NO "Add to Cart" button — the Move action handles that atomically
//
// HOW IT COMMUNICATES WITH THE BACKEND:
// All mutations go through useRemoveFromWishlist and useMoveToCart from
// useWishlist.js. This component has zero direct API knowledge.
//
// PRICE DISPLAY:
// ALL prices come from the backend in PAISE. We always display effectivePrice
// (the virtual field computed by the backend — salePrice if on sale, else price).
// Format: ₹${Number(paise).toLocaleString("en-IN")} — Business Rule 1.
//
// DATA SHAPE:
// Receives a single wishlist item object:
//   { _id, productId: { ...populated product }, addedAt }
// productId is the fully populated product (name, slug, effectivePrice, etc.)
//
// FUTURE MODULES:
// Phase 9  — OrderItem follows the same card pattern
// Phase 10 — Checkout order summary reuses price display helpers

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Star, AlertTriangle } from "lucide-react";

import { useRemoveFromWishlist, useMoveToCart } from "../../../hooks/useWishlist";

// ─── Price formatter — Business Rule 1 (Part 9 of PROJECT_CONTEXT.md) ────────
const formatPrice = (paise) =>
  `₹${Number(paise).toLocaleString("en-IN")}`;

// ─── Component ───────────────────────────────────────────────────────────────
/**
 * @param {object} item — single wishlist item from GET /wishlist response
 *   item.productId is the fully populated product object
 * @param {number} index — used for staggered entrance animation
 */
export function WishlistItem({ item, index = 0 }) {
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();
  const { mutate: moveToCart, isPending: isMoving } = useMoveToCart();

  // The wishlist endpoint populates productId with the full product object
  const product = item.productId;

  // ─── Derived display values ───────────────────────────────────────────
  // Always use effectivePrice for display (Business Rule 1)
  const displayPrice = formatPrice(product.effectivePrice);

  // Show original price struck-through only when there's an actual sale
  const showOriginalPrice = product.isOnSale && product.price !== product.salePrice;
  const originalPrice = showOriginalPrice ? formatPrice(product.price) : null;

  // Primary product image — prefer thumbnail, fall back to first image URL
  const imageUrl =
    product.thumbnail ??
    product.images?.find((img) => img.isPrimary)?.url ??
    product.images?.[0]?.url ??
    null;

  // Product detail page URL
  const productUrl = `/products/${product.slug}`;

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleRemove = (e) => {
    e.preventDefault();
    removeFromWishlist({ productId: product._id });
  };

  const handleMoveToCart = (e) => {
    e.preventDefault();
    moveToCart({ productId: product._id, quantity: 1 });
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      className={[
        "group relative flex flex-col",
        "bg-white dark:bg-gray-800",
        "rounded-2xl overflow-hidden",
        "border border-gray-100 dark:border-gray-700",
        "shadow-sm hover:shadow-md",
        "transition-shadow duration-300",
      ].join(" ")}
    >
      {/* ── Sale badge ───────────────────────────────────────────────── */}
      {product.isOnSale && product.discountPercentage > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {Math.round(product.discountPercentage)}% off
        </span>
      )}

      {/* ── Product image ─────────────────────────────────────────────── */}
      <Link to={productUrl} className="block aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // Fallback when no image is available
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <ShoppingCart size={40} />
          </div>
        )}
      </Link>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Brand */}
        {product.brand && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide truncate">
            {product.brand}
          </span>
        )}

        {/* Product name */}
        <Link
          to={productUrl}
          className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.totalReviews > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {product.averageRating?.toFixed(1)}{" "}
              <span className="text-gray-400 dark:text-gray-500">
                ({product.totalReviews.toLocaleString("en-IN")})
              </span>
            </span>
          </div>
        )}

        {/* Price block */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {displayPrice}
          </span>
          {showOriginalPrice && (
            <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
              {originalPrice}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-1.5">
          {product.isInStock ? (
            product.isLowStock ? (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle size={11} />
                Only {product.stockQuantity} left
              </span>
            ) : (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ In Stock
              </span>
            )
          ) : (
            <span className="text-xs text-red-500 dark:text-red-400 font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* ── Action buttons ──────────────────────────────────────────── */}
        <div className="flex gap-2 pt-2">
          {/* Move to Cart — primary action */}
          <button
            onClick={handleMoveToCart}
            disabled={isMoving || isRemoving || !product.isInStock}
            className={[
              "flex-1 flex items-center justify-center gap-1.5",
              "px-3 py-2 rounded-xl text-sm font-medium",
              "transition-colors duration-200",
              product.isInStock
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
              (isMoving || isRemoving) && "opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            {isMoving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={14} />
            )}
            {isMoving ? "Moving…" : "Move to Cart"}
          </button>

          {/* Remove — secondary action */}
          <button
            onClick={handleRemove}
            disabled={isMoving || isRemoving}
            aria-label={`Remove ${product.name} from wishlist`}
            className={[
              "flex items-center justify-center",
              "w-9 h-9 rounded-xl",
              "border border-gray-200 dark:border-gray-600",
              "text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400",
              "hover:border-red-300 dark:hover:border-red-500/40",
              "hover:bg-red-50 dark:hover:bg-red-900/20",
              "transition-colors duration-200",
              (isMoving || isRemoving) && "opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            {isRemoving ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}