/**
 * src/pages/checkout/CheckoutPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * The checkout review page at route /checkout. This is where the
 * purchase funnel (Cart -> Checkout -> Payment [future]) narrows down
 * to a single decision: review everything and place the order.
 * 
 * RESPONSIBILITIES:
 * 1. Fetch the current cart (useCartQuery, reused from Phase 9)
 * 2. Lock the cart for checkout (useCheckoutStart, reused from Phase 9)
 *    — this reserves stock and prevents concurrent modification while
 *    the user is on this page. Triggered ONCE per checkout session via
 *    checkout.store's hasTriggeredCheckoutStart flag.
 * 3. Compose the review UI from checkout components (this phase) built
 *    on TOP of Phase 9/10/11 components (CartSummary-equivalent totals,
 *    CouponSummary, AddressSelector)
 * 4. On successful order creation, redirect to CheckoutSuccessRedirect
 *    (this phase) which hands off to the future Payment page
 * 5. On unmount without completing, abandon the checkout lock
 *    (useCheckoutAbandon, reused from Phase 9) so stock is released
 * 
 * BACKEND INTEGRATION:
 * - GET cart (Phase 9 cart.service.js)
 * - GET addresses (Phase 11 address.service.js, via CheckoutAddress)
 * - POST /cart/checkout/start (Phase 9 — locks cart, reserves stock)
 * - POST /orders (this phase — creates the order)
 * - POST /cart/checkout/abandon (Phase 9 — released if user leaves)
 * 
 * NOT IN SCOPE FOR THIS PHASE:
 * - Payment gateway (Razorpay) integration
 * - Payment verification
 * - Payment success/failure pages
 * This page's job ends the moment the order is created — it redirects
 * to a stub page (CheckoutSuccessRedirect) that a future phase will
 * wire up to real payment.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import { useCartQuery, useCheckoutStart, useCheckoutAbandon } from "../../hooks/useCart";
import { useCheckoutStore } from "../../store/checkout.store";

import {
  CheckoutLayout,
  CheckoutProgress,
  CheckoutAddress,
  CheckoutItems,
  CheckoutCoupon,
  CheckoutSummary,
  CheckoutActions,
  CheckoutSkeleton,
} from "../../components/checkout";
import { CartEmpty } from "../../components/cart";

export const CheckoutPage = () => {
  const navigate = useNavigate();

  const { data: cart, isLoading, isError, error } = useCartQuery();

  const {
    selectedAddressId,
    currentStep,
    hasTriggeredCheckoutStart,
    markCheckoutStartTriggered,
    resetCheckoutStore,
  } = useCheckoutStore();

  // Reused from Phase 9 — locks the cart and reserves stock for checkout
  const { mutate: startCheckout } = useCheckoutStart();
  // Reused from Phase 9 — releases the lock if user abandons checkout
  const { mutate: abandonCheckout } = useCheckoutAbandon();

  // Trigger checkout-start exactly once, when cart is loaded and not
  // already locked
  useEffect(() => {
    if (
      !isLoading &&
      cart &&
      Array.isArray(cart.items) &&
      cart.items.length > 0 &&
      cart.status !== "checkout_in_progress" &&
      !hasTriggeredCheckoutStart
    ) {
      startCheckout(undefined, {
        onSuccess: () => markCheckoutStartTriggered(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, cart]);

  // Release the checkout lock if the user navigates away without
  // completing the order (cleanup on unmount)
  useEffect(() => {
    return () => {
      // Only abandon if we actually started checkout and didn't finish
      if (hasTriggeredCheckoutStart && currentStep !== "done") {
        abandonCheckout();
      }
      resetCheckoutStore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by CheckoutActions after the order is successfully created
  const handleOrderPlaced = (order) => {
    navigate(`/checkout/success/${order._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <CheckoutSkeleton />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to load checkout
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                {error?.message || "Something went wrong"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty Cart — nothing to check out */}
      {!isLoading && !isError && (!cart || cart.items?.length === 0) && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <CartEmpty onBrowse={() => navigate("/")} />
        </div>
      )}

      {/* Main Checkout Review */}
      {!isLoading && !isError && cart && cart.items?.length > 0 && (
        <CheckoutLayout
          progress={<CheckoutProgress currentStep={currentStep} />}
          left={
            <>
              <CheckoutAddress />
              <CheckoutItems items={cart.items} />
              <CheckoutCoupon cart={cart} />
            </>
          }
          right={
            <>
              <CheckoutSummary cart={cart} />
              <CheckoutActions
                cart={cart}
                selectedAddressId={selectedAddressId}
                onOrderPlaced={handleOrderPlaced}
              />
            </>
          }
        />
      )}
    </div>
  );
};