/**
 * userProfile.model.js
 *
 * WHO CALLS IT:
 *   user.service.js is the only module that should write to this model.
 *   Controllers never touch MongoDB directly; they call service methods,
 *   and the service enforces ownership, status checks, and address rules
 *   before any document mutation happens.
 *
 * WHY IT EXISTS:
 *   The auth User model is intentionally small and security-centric
 *   (identity, password, tokens, role). This profile document stores the
 *   customer-facing account data that changes frequently and does not
 *   belong in the authentication record: names, phone, avatar, gender,
 *   date of birth, preferences, and embedded addresses.
 *
 * ARCHITECTURE CHOICE:
 *   Addresses are embedded subdocuments rather than a separate collection.
 *   That keeps the common read path fast and atomic: one profile lookup can
 *   return the entire address book, and default-address changes can be made
 *   inside a single document write without coordinating two collections.
 *
 * SCALABILITY NOTE:
 *   This design is intentionally ideal for the typical ecommerce customer
 *   profile, where the address list is small and heavily read. If the
 *   product ever evolves into a B2B or enterprise use case with hundreds of
 *   addresses per account, moving addresses into a dedicated collection
 *   would be the natural next step. For the current store, embedded data is
 *   simpler, faster, and safer.
 */

import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: {
      // A human-friendly nickname such as "Home", "Office", or "Warehouse".
      // This is used by the UI, not by shipping logic.
      type: String,
      required: [true, "Address label is required"],
      trim: true,
      maxlength: [50, "Address label must not exceed 50 characters"],
    },
    fullName: {
      // The recipient name printed on the shipping label.
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name must not exceed 100 characters"],
    },
    phoneNumber: {
      // Kept on every address so logistics labels can be generated without
      // looking up the parent profile again during checkout or fulfillment.
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [10, "Phone number must not exceed 10 characters"],
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
      maxlength: [150, "Address line 1 must not exceed 150 characters"],
    },
    addressLine2: {
      // Optional second line for apartment/suite/unit details.
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Address line 2 must not exceed 150 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City must not exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State must not exceed 100 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [100, "Country must not exceed 100 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      maxlength: [20, "Postal code must not exceed 20 characters"],
    },
    isDefault: {
      // Exactly one address should usually be marked default. The service
      // layer keeps this invariant consistent whenever addresses are added,
      // updated, deleted, or explicitly promoted.
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      // One profile document per auth user. The unique index below makes
      // that a database guarantee, not just an application convention.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name must not exceed 50 characters"],
      default: "",
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name must not exceed 50 characters"],
      default: "",
    },

    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must not exceed 20 characters"],
      default: "",
    },

    avatar: {
      // Future cloud-storage ready: the field stores a URL/string pointer,
      // not binary image data. When a real upload service is added later,
      // the only thing that should change is how this string is populated.
      type: String,
      default: null,
      trim: true,
    },

    gender: {
      type: String,
      default: null,
      validate: {
        validator: (value) =>
          value == null ||
          ["male", "female", "other", "prefer_not_to_say"].includes(value),
        message: "{VALUE} is not a valid gender value",
      },
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    preferences: {
      // These fields are intentionally simple booleans/strings so the
      // frontend can patch preferences independently without needing a
      // separate preferences collection or a complex JSON blob parser.
      emailPromotions: { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
      wishlistReminders: { type: Boolean, default: true },
      productBackInStock: { type: Boolean, default: true },
      preferredLanguage: { type: String, default: "en", trim: true },
      preferredCurrency: { type: String, default: "USD", trim: true },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },

    accountStatus: {
      // "active" is the normal state. "inactive" is used when the user
      // deactivates their own account. "suspended" is included for future
      // moderation/admin workflows without forcing a schema migration.
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    deactivatedAt: {
      // Audit trail for when the account moved into the inactive state.
      type: Date,
      default: null,
    },

    reactivatedAt: {
      // Audit trail for the most recent reactivation.
      type: Date,
      default: null,
    },

    addresses: {
      // Embedded array keeps the common profile/address read path atomic.
      type: [addressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userProfileSchema.index({ userId: 1, accountStatus: 1 });

const UserProfile =
  mongoose.models.UserProfile || mongoose.model("UserProfile", userProfileSchema);

export default UserProfile;
