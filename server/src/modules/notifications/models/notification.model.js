/**
 * notification.model.js
 *
 * WHO CALLS IT:
 *   notification.service.js imports this model for all DB operations.
 *   email.service.js never touches this model directly — it only ever
 *   sends the actual email; notification.service.js is the layer that
 *   decides a Notification document should exist and updates its status
 *   based on what email.service.js reports back.
 *
 * WHY IT EXISTS:
 *   Every other module in this codebase produces an EVENT a customer
 *   should be told about — an order confirmed, a payment succeeded, a
 *   coupon was created. This collection is the durable record of "we
 *   told this user about this event," independent of WHICH channel
 *   delivered it (email today, push/SMS in the future — see the `type`
 *   field below) and independent of whether delivery actually succeeded.
 *   Without this collection, "did we email this customer about their
 *   refund" would be an unanswerable question the moment the email
 *   itself left the SMTP queue — this is the audit trail, and it is also
 *   what powers the in-app notification bell/inbox feature.
 *
 * FOR A JUNIOR DEVELOPER — WHY THREE SEPARATE ENUMS (type/event/status)
 * INSTEAD OF ONE COMBINED FIELD:
 *   `type` answers WHICH CHANNEL this notification travels through
 *   (EMAIL today; IN_APP and SYSTEM are also supported now for anything
 *   that should show in a notification inbox without necessarily being
 *   emailed). `event` answers WHAT HAPPENED that triggered it (an
 *   enumerated, closed list — not a free-text string — so every part of
 *   the codebase that creates a notification is forced to pick from a
 *   known, intentional set of business events, the same discipline
 *   review.model.js uses for moderationStatus). `status` answers WHETHER
 *   DELIVERY SUCCEEDED, which is a property of the SENDING ATTEMPT, not
 *   of the event itself — the same event (ORDER_CONFIRMED) could
 *   legitimately be PENDING, then SENT, or fail and become FAILED,
 *   without the event itself changing. Collapsing these into one field
 *   would make filtering ("show me every failed email") or reporting
 *   ("how many order-confirmation emails were sent today") far harder to
 *   express as a clean query.
 *
 * INPUT:   Raw JS object passed to `Notification.create({...})`
 * OUTPUT:  Mongoose Document instance
 */

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      // Who this notification is FOR. Every ownership check in
      // notification.service.js (getUserNotifications, markAsRead,
      // deleteNotification) filters or compares against this field —
      // "never expose another user's notifications" is enforced
      // entirely through this one field being the scope of every query,
      // the same ownership discipline Cart/Wishlist/Orders/Reviews all
      // already established.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      // WHICH DELIVERY CHANNEL. EMAIL is the only channel actually wired
      // to a real sender today (email.service.js). IN_APP represents a
      // notification meant only to appear in a customer's in-app
      // notification inbox/bell icon, with no outbound email at all
      // (e.g. a lower-priority informational event). SYSTEM is reserved
      // for internal/admin-facing notifications that aren't really
      // "from" the storefront in the customer sense (e.g. a future
      // low-stock alert routed through this same collection rather than
      // Inventory's separate email concern). Keeping this as its own
      // enum — rather than assuming "every notification is an email" —
      // is what makes "future compatibility: Push Notifications, SMS"
      // a matter of adding new enum values and a new service function,
      // not redesigning this schema.
      type: String,
      enum: {
        values: ["EMAIL", "IN_APP", "SYSTEM"],
        message: "{VALUE} is not a valid notification type",
      },
      required: true,
    },

    event: {
      // WHAT BUSINESS EVENT triggered this notification. A closed enum
      // (not free text) so every module that creates a notification must
      // pick from a known, intentional list — this is what lets a future
      // admin dashboard build a reliable "notification analytics" view
      // (e.g. "PAYMENT_FAILED notifications this week") without having
      // to fuzzy-match arbitrary strings.
      type: String,
      enum: {
        values: [
          "WELCOME_EMAIL",
          "EMAIL_VERIFICATION",
          "PASSWORD_RESET",
          "ORDER_CONFIRMED",
          "ORDER_SHIPPED",
          "ORDER_DELIVERED",
          "PAYMENT_SUCCESS",
          "PAYMENT_FAILED",
          "REFUND_PROCESSED",
          "COUPON_CREATED",
          "REVIEW_REMINDER",
        ],
        message: "{VALUE} is not a valid notification event",
      },
      required: true,
    },

    title: {
      // Short headline, shown in an in-app notification list (e.g. "Your
      // order has shipped!"). For EMAIL-type notifications, this is also
      // used as the email subject line by email.service.js, so the two
      // surfaces (in-app inbox, email subject) stay consistent without
      // maintaining the text twice.
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: 150,
    },

    message: {
      // The full notification body. For EMAIL notifications, this is the
      // PLAIN-TEXT fallback/summary — the actual rich HTML email body is
      // generated separately by email.service.js's templates and is NOT
      // stored here, since HTML templates can be large and are
      // regenerable from the underlying event data at send time; storing
      // every full HTML email permanently in this collection would bloat
      // it without benefit, whereas a concise plain-text message is
      // exactly what an in-app notification list needs to display.
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: 1000,
    },

    status: {
      // PENDING: the Notification document was created but the send
      //          attempt has not yet been made or completed.
      // SENT:    delivery succeeded (the email left the SMTP provider
      //          successfully, or — for IN_APP/SYSTEM types, which have
      //          no external delivery step — the record itself existing
      //          IS the delivery, so it is marked SENT immediately).
      // FAILED:  the send attempt was made and failed (e.g. SMTP error).
      //          A FAILED notification is never silently retried by this
      //          module today — see notification.service.js's
      //          sendNotification for why that is a deliberate, narrow
      //          scope rather than a missing retry-queue feature.
      type: String,
      enum: {
        values: ["PENDING", "SENT", "FAILED"],
        message: "{VALUE} is not a valid notification status",
      },
      default: "PENDING",
    },

    isRead: {
      // Specifically for the IN_APP inbox experience — has the customer
      // opened/acknowledged this notification in the UI. Meaningless for
      // a pure EMAIL notification (a customer "reading" their email
      // inbox is not something this backend can observe), but kept on
      // every notification document uniformly rather than only on
      // IN_APP ones, since a single getUserNotifications listing query
      // (mixing all types) is simpler to write and to paginate when
      // every document has the same shape.
      type: Boolean,
      default: false,
    },

    metadata: {
      // FUTURE COMPATIBILITY: a free-form bag for channel-specific or
      // event-specific extra data that doesn't warrant its own named
      // field on every notification — e.g. an orderId/paymentId/couponId
      // the notification relates to (for a future "click to view order"
      // deep link), or delivery-provider-specific data once SMS/Push
      // providers are integrated (a push notification's device token
      // response, an SMS provider's message SID). Mixed type
      // deliberately, mirroring the same reasoning payment.model.js's
      // metadata field and coupon.service.js's CouponRedemption design
      // already established for "this varies per event/provider, don't
      // force a rigid shape."
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    sentAt: {
      // When delivery actually succeeded — distinct from createdAt
      // (when the Notification document/intent was first created).
      // For a PENDING notification this is null; set the moment
      // notification.service.js's sendNotification successfully
      // delivers it. This gap between createdAt and sentAt is exactly
      // what a future queue-based architecture (RabbitMQ/Redis — see
      // file-level future-compatibility notes in notification.service.js)
      // would need to measure delivery latency.
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// userId + createdAt: THE core query this collection exists to serve —
// "list this user's notifications, newest first" — compound so this one
// index covers the exact shape of that query without Mongo needing to
// intersect two separate single-field indexes. This is the same
// compound-index reasoning order.model.js used for { userId, createdAt }.
notificationSchema.index({ userId: 1, createdAt: -1 });

// userId + isRead: powers the "unread notification count" badge — a
// query like { userId, isRead: false } needs to stay fast even for a
// customer with thousands of historical notifications, which is exactly
// the "optimize for unread notification count" requirement. A compound
// index here means that count is an indexed lookup, not a collection scan.
notificationSchema.index({ userId: 1, isRead: 1 });

// status: powers a future admin/ops view like "all FAILED notifications
// today" without scanning the whole collection — useful the moment any
// retry or alerting tooling is built on top of this module.
notificationSchema.index({ status: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;