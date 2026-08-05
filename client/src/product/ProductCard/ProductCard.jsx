/**
 * src/components/product/ProductCard/ProductCard.jsx
 *
 * PURPOSE:
 *   The authoritative product card for Phase 5+. Used across:
 *   - ProductListingPage (this phase)
 *   - CategoryPage (Phase 6)
 *   - SearchPage (Phase 6)
 *   - WishlistPage (Phase 7)
 *   - RelatedProducts section (this phase)
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Props match the exact shape of the backend Product object from
 *   GET /products (PROJECT_CONTEXT.md Part 4). Key fields:
 *   - effectivePrice → backend VIRTUAL (price after any sale)
 *   - discountPercentage → backend VIRTUAL (sale % off)
 *   - isInStock → backend VIRTUAL (from Inventory module)
 *   - thumbnail → image URL from backend (null for now, shows placeholder)
 *
 * PRICE RULE (PROJECT_CONTEXT.md Part 10, Rule 8):
 *   ALL prices from backend are in paise (₹1 = 100 paise).
 *   119900 → "₹1,19,900" via formatPrice().
 *   ALWAYS use effectivePrice for display, NEVER raw price.
 *
 * CART / WISHLIST STUBS:
 *   handleAddToCart and handleWishlist are UI stubs.
 *   Phase 7 (Cart & Wishlist Module) will:
 *   1. Import useMutation from @tanstack/react-query
 *   2. Call cartService.addItem(productId, 1) / wishlistService.addItem(productId)
 *   3. On success, call useCartStore().increment() / useWishlistStore().increment()
 *   Zero JSX changes needed — only the onClick body changes.
 *
 * PROPS:
 *   product  → full backend Product object
 *   variant  → "default" | "compact"
 *   onCart   → optional override for cart action (for testing/storybook)
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Zap, Eye, CreditCard } from "lucide-react";
import { buildPath, ROUTES } from "../../constants/route.constants";
import { useAddToCart } from "../../hooks/useCart";
import { useCartStore } from "../../store/cart.store";
import { WishlistButton } from "../../components/wishlist/WishlistButton/WishlistButton";

const formatPrice = (paise) =>
  `₹${(Number(paise) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function ProductCard({ product, variant = "default", onCart }) {
  const [addedToCart, setAddedToCart] = useState(false);
  const { increment } = useCartStore();
  const { mutate: addItem, isPending: isAddingToCart } = useAddToCart({
    onSuccess: () => {
      increment();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);
    },
  });

  if (!product) return null;

  const {
    _id, name, slug, brand, thumbnail,
    effectivePrice, price,
    isOnSale, discountPercentage,
    averageRating, totalReviews,
    isInStock, isLowStock,
  } = product;

  const productPath = buildPath(ROUTES.PRODUCT_DETAIL, { slug });
  const isCompact = variant === "compact";

  // ── Action handlers (stubs — replaced in Phase 7) ──────────────────────────
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock || isAddingToCart) return;
    if (onCart) { onCart(_id); return; }
    addItem({ productId: _id, quantity: 1 });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock) return;
    addItem({ productId: _id, quantity: 1 });
    window.location.href = "/cart";
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/30 transition-shadow duration-300"
    >
      {/* ── Image area ─────────────────────────────────────────────── */}
      <div className={`relative ${isCompact ? "h-44" : "h-56"} bg-gray-50 dark:bg-gray-800 overflow-hidden`}>
        <Link to={productPath} tabIndex={-1} aria-hidden="true" className="block h-full">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            // Placeholder — removed when backend provides thumbnail URLs
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 flex items-center justify-center">
                <ShoppingCart size={28} className="text-indigo-400" aria-hidden="true" />
              </div>
            </div>
          )}
        </Link>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {isOnSale && discountPercentage > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
              <Zap size={9} aria-hidden="true" />
              {discountPercentage}% OFF
            </span>
          )}
          {isLowStock && isInStock && (
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              Only a few left
            </span>
          )}
          {!isInStock && (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Hover action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <WishlistButton
            productId={_id}
            productName={name}
            size="sm"
            className="w-8 h-8 rounded-full"
          />

          <Link
            to={productPath}
            className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label={`Quick view ${name}`}
          >
            <Eye size={14} />
          </Link>
        </div>
      </div>

      {/* ── Product info ────────────────────────────────────────────── */}
      <div className={isCompact ? "p-3" : "p-4"}>
        {/* Brand */}
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">
          {brand}
        </p>

        {/* Name */}
        <Link
          to={productPath}
          className="block text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
        >
          {name}
        </Link>

        {/* Rating */}
        {!isCompact && averageRating > 0 && (
          <div
            className="flex items-center gap-1.5 mt-2"
            aria-label={`${averageRating} out of 5 stars from ${totalReviews} reviews`}
          >
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 dark:text-gray-700"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({Number(totalReviews).toLocaleString("en-IN")})
            </span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex flex-wrap items-center justify-between mt-3 gap-2 inline">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0 flex-1">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatPrice(effectivePrice)}
            </span>
            {isOnSale && price !== effectivePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          <div className="flex items-center mt-2  gap-2 shrink-0">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || isAddingToCart}
              className={[
                "flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl transition-all duration-200",
                !isInStock
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : addedToCart
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                    : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white",
              ].join(" ")}
              aria-label={!isInStock ? "Out of stock" : addedToCart ? "Added to cart" : `Add ${name} to cart`}
            >
              <ShoppingCart size={13} aria-hidden="true" />
              <span className="hidden sm:inline">
                {!isInStock ? "Sold Out" : addedToCart ? "Added!" : "Add"}
              </span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!isInStock}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Buy ${name} now`}
            >
              <CreditCard size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Buy</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}