/**
 * src/components/product/ProductInfo/ProductInfo.jsx
 *
 * PURPOSE:
 *   Right-column component for ProductDetailsPage. Owns all purchase-intent
 *   UI: title, brand, rating, pricing, stock status, quantity selector,
 *   Add to Cart button, Add to Wishlist button, and product attributes.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Receives the full Product object from GET /products/slug/:slug.
 *   Key backend virtual fields used here:
 *     effectivePrice     → what the customer actually pays (use this, not price)
 *     discountPercentage → computed "X% off" badge
 *     isInStock          → controls Add to Cart button state
 *     isLowStock         → shows "Only a few left" urgency badge
 *     ratingBreakdown    → { "1": N, "2": N, ... "5": N } for star distribution
 *
 * CART / WISHLIST STUBS:
 *   handleAddToCart and handleWishlist are UI stubs here.
 *   Phase 7 (Cart & Wishlist Module) replaces them:
 *     useMutation → cartService.addItem(productId, quantity)
 *     useMutation → wishlistService.addItem(productId)
 *   Then call useCartStore().increment() / useWishlistStore().increment()
 *   to update the header badge count.
 *   Zero JSX changes to this component.
 *
 * PRICE RULE (PROJECT_CONTEXT.md Part 10, Rule 8):
 *   All prices from the backend are in paise.
 *   119900 paise = ₹1,19,900.
 *   formatPrice() handles the conversion display.
 *
 * PROPS:
 *   product → full backend Product object from useProduct() hook
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star, ShoppingCart, Truck, Shield,
  RefreshCw, Zap, Minus, Plus, Check, CreditCard,
} from "lucide-react";
import { useAddToCart } from "../../hooks/useCart";
import { useCartStore } from "../../store/cart.store";
import { WishlistButton } from "../../components/wishlist/WishlistButton/WishlistButton";

const formatPrice = (paise) =>
  `₹${Number(paise).toLocaleString("en-IN")}`;

// ── Star rating display ────────────────────────────────────────────────────────
function StarDisplay({ rating, totalReviews }) {
  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${rating} out of 5 stars from ${totalReviews} reviews`}
    >
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < Math.floor(rating)
                ? "text-amber-400 fill-amber-400"
                : i < rating
                ? "text-amber-400 fill-amber-200"
                : "text-gray-200 dark:text-gray-700"
            }
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {rating}
      </span>
      <span className="text-sm text-gray-400 dark:text-gray-500">
        ({Number(totalReviews).toLocaleString("en-IN")} reviews)
      </span>
    </div>
  );
}

// ── Trust badge ────────────────────────────────────────────────────────────────
function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <Icon size={14} className="text-indigo-500 shrink-0" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { increment } = useCartStore();
  const { mutate: addItem, isPending: isAddingToCart } = useAddToCart({
    onSuccess: () => {
      increment();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    },
  });

  if (!product) return null;

  const {
    name, brand, sku,
    effectivePrice, price, salePrice,
    isOnSale, discountPercentage,
    averageRating, totalReviews,
    isInStock, isLowStock, stockQuantity,
    description,
    attributes,
    categoryId,
  } = product;

  // ── Quantity controls ──────────────────────────────────────────────────────
  const maxQty = Math.min(stockQuantity ?? 10, 10);
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

  // ── Action stubs (Phase 7 replaces these with real mutations) ──────────────
  const handleAddToCart = () => {
    if (!isInStock || isAddingToCart) return;
    addItem({ productId: product._id, quantity });
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    addItem({ productId: product._id, quantity });
    window.location.href = "/cart";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ── Brand + category ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          {brand}
        </span>
        {categoryId?.name && (
          <>
            <span className="text-gray-200 dark:text-gray-700">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {categoryId.name}
            </span>
          </>
        )}
        <span className="ml-auto text-[10px] font-mono text-gray-300 dark:text-gray-700">
          SKU: {sku}
        </span>
      </div>

      {/* ── Product name ─────────────────────────────────────────────── */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
        {name}
      </h1>

      {/* ── Rating ───────────────────────────────────────────────────── */}
      {averageRating > 0 && (
        <StarDisplay rating={averageRating} totalReviews={totalReviews} />
      )}

      {/* ── Price block ──────────────────────────────────────────────── */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl font-black text-gray-900 dark:text-white">
          {formatPrice(effectivePrice)}
        </span>
        {isOnSale && salePrice && (
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(price)}
          </span>
        )}
        {isOnSale && discountPercentage > 0 && (
          <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
            <Zap size={12} fill="currentColor" aria-hidden="true" />
            {discountPercentage}% off
          </span>
        )}
      </div>

      {/* ── Stock status ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {isInStock ? (
          <>
            <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              In Stock
            </span>
            {isLowStock && stockQuantity && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                — Only {stockQuantity} left
              </span>
            )}
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Out of Stock
            </span>
          </>
        )}
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800" />

      {/* ── Quantity selector ────────────────────────────────────────── */}
      {isInStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
            Quantity
          </span>
          <div
            className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            role="group"
            aria-label="Quantity selector"
          >
            <button
              onClick={decreaseQty}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span
              className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <button
              onClick={increaseQty}
              disabled={quantity >= maxQty}
              className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Action buttons ───────────────────────────────────────────── */}
      <div className="flex gap-3">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || isAddingToCart}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200",
            !isInStock
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : addedToCart
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40",
          ].join(" ")}
          aria-label={
            !isInStock ? "Out of stock" : addedToCart ? "Added to cart" : "Add to cart"
          }
        >
          {addedToCart ? (
            <>
              <Check size={16} aria-hidden="true" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={16} aria-hidden="true" />
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!isInStock}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/40 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
        >
          <CreditCard size={16} aria-hidden="true" />
          Buy Now
        </button>

        {/* Wishlist */}
        <WishlistButton
          productId={product._id}
          productName={name}
          size="md"
          className="w-12 h-12"
        />
      </div>

      {/* ── Trust badges ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
        <TrustBadge icon={Truck}     label="Free delivery on ₹499+" />
        <TrustBadge icon={Shield}    label="Secure payment" />
        <TrustBadge icon={RefreshCw} label="7-day easy returns" />
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      {description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            About this product
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      )}

      {/* ── Attributes / Specifications ─────────────────────────────── */}
      {/*
        Backend sends:  attributes: { ram: "8GB", storage: "256GB", ... }
        Rendered as a key-value table.
        Phase 6+: could be replaced by a dedicated Specifications tab.
      */}
      {attributes && Object.keys(attributes).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Specifications
          </h3>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {Object.entries(attributes).map(([key, value], i) => (
              <div
                key={key}
                className={[
                  "flex items-start gap-4 px-4 py-3 text-sm",
                  i % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-900/50"
                    : "bg-white dark:bg-gray-900",
                ].join(" ")}
              >
                <span className="w-28 text-gray-500 dark:text-gray-400 capitalize shrink-0">
                  {key}
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}