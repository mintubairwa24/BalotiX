/**
 * src/store/payment.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages PAYMENT UI STATE ONLY (not server data).
 * 
 * React Query owns the server state:
 *   - Order details — useOrderById equivalent (order.service.js, Phase 12)
 *   - Payment session details — useCreatePaymentSession (this phase)
 *   - Verification result — useVerifyPayment (this phase)
 *   - Payment status — usePaymentStatus (this phase)
 * 
 * Zustand owns the FLOW STATE — where the user currently is in the
 * multi-step payment process, which spans:
 *   1. Backend call (create session)      -> "creating_session"
 *   2. Razorpay's own hosted modal        -> "awaiting_payment"
 *   3. Backend call (verify)              -> "verifying"
 *   4. Terminal state                     -> "success" | "failed"
 * 
 * WHY A STATUS MACHINE INSTEAD OF SEPARATE BOOLEANS:
 * Payment has several loading phases (session creation, waiting for the
 * user inside Razorpay's UI, verification) that are mutually exclusive.
 * A single `status` string avoids invalid combinations (e.g. "verifying"
 * AND "awaiting_payment" both true) that separate isLoading booleans
 * could accidentally allow.
 * 
 * PERSISTENCE:
 * Does NOT persist to localStorage. On refresh, status resets to
 * "idle" — PaymentPage re-derives the real state from the backend via
 * usePaymentStatus() rather than trusting stale client state, which
 * matters a lot here since payment is a sensitive, money-moving flow.
 */

import { create } from "zustand";

export const usePaymentStore = create((set) => ({
  // "idle" | "creating_session" | "awaiting_payment" | "verifying" | "success" | "failed"
  status: "idle",

  // Human-readable error message for the current failure (if any)
  errorMessage: null,

  // The order this payment attempt is for
  currentOrderId: null,

  /**
   * Set the current order being paid for
   * Called when PaymentPage mounts with an :orderId param
   */
  setCurrentOrderId: (orderId) =>
    set(() => ({
      currentOrderId: orderId,
    })),

  /**
   * Move the flow into "creating_session" (backend call in flight)
   */
  startSessionCreation: () =>
    set(() => ({
      status: "creating_session",
      errorMessage: null,
    })),

  /**
   * Move the flow into "awaiting_payment" (Razorpay modal is open,
   * waiting on the user)
   */
  startAwaitingPayment: () =>
    set(() => ({
      status: "awaiting_payment",
      errorMessage: null,
    })),

  /**
   * Move the flow into "verifying" (backend verifying Razorpay's response)
   */
  startVerifying: () =>
    set(() => ({
      status: "verifying",
      errorMessage: null,
    })),

  /**
   * Mark payment as successfully verified
   */
  markSuccess: () =>
    set(() => ({
      status: "success",
      errorMessage: null,
    })),

  /**
   * Mark payment as failed, with an optional message
   * 
   * @param {string} message - human-readable failure reason (from
   *   backend error, Razorpay's own failure callback, or a generic
   *   fallback — NEVER a raw signature/verification detail)
   */
  markFailed: (message) =>
    set(() => ({
      status: "failed",
      errorMessage: message || "Payment could not be completed",
    })),

  /**
   * Reset the entire payment flow state
   * Called when:
   * - User clicks "Retry Payment"
   * - User navigates to a different order's payment page
   * - Component unmounts
   */
  resetPaymentStore: () =>
    set(() => ({
      status: "idle",
      errorMessage: null,
      currentOrderId: null,
    })),
}));