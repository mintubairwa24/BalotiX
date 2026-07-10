/**
 * src/pages/checkout/CartPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Full page view of the shopping cart
 * Integrates all cart components: CartHeader, CartList, CartSummary
 * Manages cart data fetching and checkout flow initiation
 * 
 * ROUTE:
 * Path: /cart
 * Protected: Yes (authenticated users only)
 * 
 * LAYOUT:
 * - Header section (title, item count, continue shopping)
 * - Left: Cart items list (CartList)
 * - Right: Cart summary and checkout button (CartSummary)
 * - Responsive: Stack on mobile
 * 
 * STATES HANDLED:
 * 1. Loading: Show CartSkeleton while fetching
 * 2. Error: Show error message with retry button
 * 3. Empty: Show CartEmpty component
 * 4. Normal: Show full cart with all items
 * 5. Checkout Lock: Show warning, disable controls
 * 
 * CHECKOUT LOCK BEHAVIOR:
 * When cart.status === "checkout_in_progress":
 * - Show amber warning banner
 * - All quantity/remove controls disabled
 * - "Proceed to Checkout" button hidden
 * - This allows user to see lock status and know checkout is active
 * 
 * FUTURE PHASES:
 * - Phase 10 Checkout: Replace CartPage with CheckoutPage (address, payment)
 * - Phase 11 Orders: Add order history tab to this page
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useCartQuery, isCheckoutLocked } from "../../hooks/useCart";
import { CartHeader } from "../../components/cart/CartHeader/CartHeader";
import { CartList } from "../../components/cart/CartList/CartList";
import { CartSummary } from "../../components/cart/CartSummary/CartSummary";
import { CartEmpty } from "../../components/cart/CartEmpty/CartEmpty";
import { CartSkeleton } from "../../components/cart/CartSkeleton/CartSkeleton";

export const CartPage = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading, error, refetch } = useCartQuery();

  // Check if user is authenticated (cart query will fail if not)
  useEffect(() => {
    if (error?.response?.status === 401) {
      navigate("/login", { state: { from: "/cart" } });
    }
  }, [error, navigate]);

  // Determine lock state
  const isLocked = isCheckoutLocked(cart);

  // Determine content to display
  const isEmpty = !isLoading && (!cart?.items || cart.items.length === 0);
  const hasError = error && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <CartHeader
          itemCount={cart?.itemCount || 0}
          onContinue={() => navigate("/")}
        />

        {/* Error State */}
        {hasError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Failed to load cart
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                {error?.response?.data?.message || "Something went wrong"}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !hasError && (
          <div className="space-y-8">
            <CartSkeleton count={5} />
          </div>
        )}

        {/* Empty State */}
        {isEmpty && !hasError && <CartEmpty onBrowse={() => navigate("/")} />}

        {/* Full Cart with Items */}
        {!isLoading && !hasError && !isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Cart Items (2/3 width on desktop) */}
            <div className="lg:col-span-2">
              {/* Checkout Lock Warning */}
              {isLocked && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <span className="font-semibold">⚠️ Checkout in Progress</span>
                    <br />
                    Your cart is locked while you complete checkout. You cannot
                    modify items. Either complete your payment or{" "}
                    <button
                      onClick={() => {
                        // Later: show modal to confirm abandonment
                        navigate("/cart");
                      }}
                      className="underline hover:no-underline font-semibold"
                    >
                      cancel checkout
                    </button>
                    .
                  </p>
                </div>
              )}

              {/* Items List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <CartList
                  items={cart.items}
                  isLocked={isLocked}
                />
              </div>
            </div>

            {/* Right Column: Summary & Checkout (1/3 width on desktop) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg p-6">
                <CartSummary
                  cart={cart}
                  isLocked={isLocked}
                  onCheckoutStart={(data) => {
                    // Navigate to checkout with order details
                    navigate(`/checkout?orderId=${data.orderId}`, {
                      state: { order: data },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};