/**
 * CartSummary.jsx
 *
 * Renders the cart totals and checkout button.
 * This component was likely working correctly because it uses the pre-calculated
 * `subtotal` and `total` virtuals from the main `cart` object.
 */
import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/CurrencyFormatter";

export const CartSummary = ({ cart, isLocked }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-4 border-b pb-3">Order Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          {/* This uses the server-calculated virtual property, which was always correct. */}
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        {cart.appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({cart.appliedCoupon.code})</span>
            <span>- {formatCurrency(cart.appliedCoupon.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          {/* This also uses the correct server-calculated virtual. */}
          <span>{formatCurrency(cart.total)}</span>
        </div>
      </div>
      <Link
        to="/checkout"
        className={`w-full text-center bg-green-600 text-white py-3 rounded-md mt-6 block
          ${
            isLocked
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-green-700"
          }`}
        onClick={(e) => isLocked && e.preventDefault()}
      >
        Proceed to Checkout
      </Link>
    </div>
  );
};