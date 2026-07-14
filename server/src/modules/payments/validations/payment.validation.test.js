import test from "node:test";
import assert from "node:assert/strict";
import { verifyPaymentSchema } from "./payment.validation.js";

test("verifyPaymentSchema accepts camelCase Razorpay fields and orderId", () => {
  const result = verifyPaymentSchema.parse({
    orderId: "507f1f77bcf86cd799439011",
    razorpayOrderId: "order_123",
    razorpayPaymentId: "pay_123",
    razorpaySignature: "sig_123",
  });

  assert.deepEqual(result, {
    orderId: "507f1f77bcf86cd799439011",
    razorpayOrderId: "order_123",
    razorpayPaymentId: "pay_123",
    razorpaySignature: "sig_123",
  });
});

test("verifyPaymentSchema rejects missing required payment fields", () => {
  assert.throws(() => {
    verifyPaymentSchema.parse({
      orderId: "507f1f77bcf86cd799439011",
      razorpayOrderId: "order_123",
      razorpayPaymentId: "pay_123",
    });
  });
});
