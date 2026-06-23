/**
 * orderCounter.model.js
 *
 * WHO CALLS IT:
 *   Only order.service.js's generateOrderNumber() helper touches this
 *   model. Nothing else in the codebase reads or writes it.
 *
 * WHY IT EXISTS:
 *   Generating a sequential, gapless-per-year order number like
 *   "ORD-2026-000001" requires an atomic counter. Counting existing
 *   Order documents (Order.countDocuments() + 1) would race under
 *   concurrent order creation — two customers checking out in the same
 *   millisecond could both read the same count and both compute the same
 *   "next" number, producing two orders with an identical orderNumber and
 *   violating Order's unique index at the worst possible moment (after
 *   payment has already started). This collection exists solely to make
 *   the increment atomic at the database level, the same problem
 *   Inventory's findOneAndUpdate + $inc pattern solves for stock counts.
 *
 * WHY ONE DOCUMENT PER YEAR (not one global counter):
 *   The order number format embeds the year (ORD-<year>-<seq>), and the
 *   sequence portion resets to 000001 every January 1st rather than
 *   climbing forever. Using the year string itself as _id means
 *   generateOrderNumber's findOneAndUpdate with upsert:true both creates
 *   the first counter for a new year AND increments an existing year's
 *   counter, in a single atomic call — no separate "does this year's
 *   counter exist yet" check is needed.
 *
 * INPUT:   Never constructed directly — only ever touched via
 *          findOneAndUpdate({ _id: year }, { $inc: { seq: 1 } }, { upsert: true })
 * OUTPUT:  { _id: "2026", seq: 1 } style documents, one per calendar year
 */

import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema({
  // Using the year itself (as a string) as the primary key means there is
  // naturally exactly one counter document per year — no separate unique
  // index needed, _id already enforces it.
  _id: { type: String, required: true },

  // The running sequence for this year. Only ever modified via atomic
  // $inc — never read, incremented in JS, and saved back, which would
  // reopen the exact race condition this model exists to close.
  seq: { type: Number, default: 0 },
});

const OrderCounter =
  mongoose.models.OrderCounter || mongoose.model("OrderCounter", orderCounterSchema);

export default OrderCounter;
