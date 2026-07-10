/**
 * src/components/checkout/CheckoutLayout/CheckoutLayout.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Pure structural/layout component for the checkout page. Composes
 * children into a responsive two-column grid:
 *   - Left column (2/3 width on desktop): address, items, coupon
 *   - Right column (1/3 width on desktop): price summary, place order
 * 
 * This mirrors the CartPage layout pattern (Phase 9) for visual
 * consistency across the purchase funnel, but is its own component
 * since checkout has different sections (address selection, no
 * quantity editing) than the cart.
 * 
 * Kept deliberately free of data-fetching or business logic — it only
 * arranges whatever is passed to it via props. CheckoutPage decides
 * WHAT to render; CheckoutLayout decides WHERE it goes.
 * 
 * Props:
 * - progress: <CheckoutProgress /> element (top of page)
 * - left: array/node of left-column content (address, items, coupon)
 * - right: array/node of right-column content (summary, actions)
 */

export const CheckoutLayout = ({ progress, left, right }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Progress Stepper */}
      {progress}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Address, Items, Coupon */}
        <div className="lg:col-span-2 space-y-4">{left}</div>

        {/* Right Column: Summary + Place Order (sticky on desktop) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4">{right}</div>
        </div>
      </div>
    </div>
  );
};