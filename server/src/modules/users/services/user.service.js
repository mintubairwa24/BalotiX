/**
 * user.service.js
 *
 * WHO CALLS IT:
 *   user.controller.js is the only HTTP-facing caller. Future internal
 *   workflows could also call these functions, but they must pass a valid
 *   authenticated userId and are still subject to the same ownership rules.
 *
 * WHY IT EXISTS:
 *   This file is the ownership and business-rule boundary for customer
 *   profile data. It knows how to create a profile lazily, how to keep
 *   exactly one default address, how to refuse mutations on inactive
 *   accounts, and how to isolate each request to the authenticated user.
 *
 * OWNERSHIP RULE:
 *   There are no userId route parameters in this module. Every operation is
 *   scoped to the caller's authenticated identity (`req.user._id`), which
 *   prevents one customer from reading or writing another customer's data
 *   even if they guess an ObjectId or addressId.
 *
 * SCALABILITY NOTE:
 *   This implementation deliberately keeps user profile reads and writes
 *   in a single document. That is a good fit for the small, frequently
 *   accessed record that defines an ecommerce customer account. If later
 *   growth introduces unusually large address books or many preference
 *   variants, the service can split those concerns into separate bounded
 *   contexts without changing the controller contract.
 */

import mongoose from "mongoose";
import User from "../../auth/models/user.model.js";
import UserProfile from "../models/userProfile.model.js";

const throwHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const assertValidUserId = (userId) => {
  if (!isValidObjectId(userId)) {
    throwHttpError(400, "Invalid user ID format");
  }
};

const ensureAuthUserExists = async (userId) => {
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throwHttpError(404, "User account not found");
  }
};

const getOrCreateProfile = async (userId) => {
  assertValidUserId(userId);
  await ensureAuthUserExists(userId);

  let profile = await UserProfile.findOne({ userId });

  // A profile is created lazily so the first profile read does not require
  // a separate onboarding endpoint. This mirrors the cart/wishlist pattern
  // already used elsewhere in the codebase.
  if (!profile) {
    profile = await UserProfile.create({ userId });
  }

  return profile;
};

const ensureAccountIsActive = (profile) => {
  if (profile.accountStatus !== "active") {
    throwHttpError(
      403,
      "This account is inactive. Reactivate it before making profile changes."
    );
  }
};

const normalizeAddressDefaults = (profile, preferredAddressId = null) => {
  if (!profile.addresses || profile.addresses.length === 0) {
    return;
  }

  if (preferredAddressId) {
    for (const address of profile.addresses) {
      address.isDefault = address._id.toString() === preferredAddressId.toString();
    }
    return;
  }

  const currentDefault = profile.addresses.find((address) => address.isDefault);
  const targetId = currentDefault?._id || profile.addresses[0]._id;

  for (const address of profile.addresses) {
    address.isDefault = address._id.toString() === targetId.toString();
  }
};

const toProfilePayload = (profile) => profile.toJSON();

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const getProfile = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  return toProfilePayload(profile);
};

export const updateProfile = async (userId, payload) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  const fields = ["firstName", "lastName", "phoneNumber", "gender", "dateOfBirth"];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      profile[field] = payload[field];
    }
  }

  await profile.save();
  return toProfilePayload(profile);
};

export const updateAvatar = async (userId, avatar) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  profile.avatar = avatar;
  await profile.save();

  return toProfilePayload(profile);
};

export const updatePreferences = async (userId, payload) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  // Preferences are patched field-by-field so callers can change one
  // setting without resending the full object and accidentally overwriting
  // unrelated values.
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      profile.preferences[key] = value;
    }
  }

  profile.markModified("preferences");
  await profile.save();

  return toProfilePayload(profile);
};

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export const getAddresses = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const payload = toProfilePayload(profile);

  payload.addresses = [...payload.addresses].sort((a, b) => {
    if (a.isDefault === b.isDefault) {
      return 0;
    }
    return a.isDefault ? -1 : 1;
  });

  return payload.addresses;
};

export const addAddress = async (userId, addressPayload) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  const shouldBecomeDefault =
    addressPayload.isDefault === true || profile.addresses.length === 0;

  const newAddress = profile.addresses.create({
    label: addressPayload.label,
    fullName: addressPayload.fullName,
    phoneNumber: addressPayload.phoneNumber,
    addressLine1: addressPayload.addressLine1,
    addressLine2: addressPayload.addressLine2 ?? "",
    city: addressPayload.city,
    state: addressPayload.state,
    country: addressPayload.country,
    postalCode: addressPayload.postalCode,
    isDefault: shouldBecomeDefault,
  });

  profile.addresses.push(newAddress);

  if (shouldBecomeDefault) {
    normalizeAddressDefaults(profile, newAddress._id);
  } else {
    normalizeAddressDefaults(profile);
  }

  await profile.save();
  return toProfilePayload(profile);
};

export const updateAddress = async (userId, addressId, payload) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  if (!isValidObjectId(addressId)) {
    throwHttpError(400, "Invalid address ID format");
  }

  const address = profile.addresses.id(addressId);
  if (!address) {
    throwHttpError(404, "Address not found");
  }

  const fields = [
    "label",
    "fullName",
    "phoneNumber",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "country",
    "postalCode",
  ];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      address[field] = payload[field];
    }
  }

  // We intentionally do not allow the generic update endpoint to change
  // default status. That keeps "edit the address" separate from "choose the
  // default address," which makes the API easier to reason about and avoids
  // accidental default flips from a broad profile form submission.
  normalizeAddressDefaults(profile);

  await profile.save();
  return toProfilePayload(profile);
};

export const deleteAddress = async (userId, addressId) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  if (!isValidObjectId(addressId)) {
    throwHttpError(400, "Invalid address ID format");
  }

  const address = profile.addresses.id(addressId);
  if (!address) {
    throwHttpError(404, "Address not found");
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  if (profile.addresses.length > 0) {
    if (wasDefault) {
      normalizeAddressDefaults(profile);
    } else {
      normalizeAddressDefaults(profile);
    }
  }

  await profile.save();
  return toProfilePayload(profile);
};

export const setDefaultAddress = async (userId, addressId) => {
  const profile = await getOrCreateProfile(userId);
  ensureAccountIsActive(profile);

  if (!isValidObjectId(addressId)) {
    throwHttpError(400, "Invalid address ID format");
  }

  const address = profile.addresses.id(addressId);
  if (!address) {
    throwHttpError(404, "Address not found");
  }

  normalizeAddressDefaults(profile, addressId);
  await profile.save();

  return toProfilePayload(profile);
};

// ---------------------------------------------------------------------------
// Account status
// ---------------------------------------------------------------------------

export const deactivateAccount = async (userId) => {
  const profile = await getOrCreateProfile(userId);

  if (profile.accountStatus === "inactive") {
    return toProfilePayload(profile);
  }

  profile.accountStatus = "inactive";
  profile.deactivatedAt = new Date();
  profile.reactivatedAt = null;

  // Deactivation is a real lockout, not just a UI flag. Clearing the
  // stored refresh token means future refresh attempts fail immediately,
  // even if the client keeps an old cookie around.
  await User.findByIdAndUpdate(userId, {
    $set: {
      refreshTokenHash: null,
      refreshTokenIssuedAt: null,
    },
  });

  await profile.save();

  return toProfilePayload(profile);
};

export const reactivateAccount = async (userId) => {
  const profile = await getOrCreateProfile(userId);

  if (profile.accountStatus === "active") {
    return toProfilePayload(profile);
  }

  profile.accountStatus = "active";
  profile.reactivatedAt = new Date();
  await profile.save();

  return toProfilePayload(profile);
};
