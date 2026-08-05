/**
 * user.service.js
 *
 * This service provides the core business logic for user management that
 * other modules, like the Admin module, can consume. It is the single
 * source of truth for interacting with User and UserProfile models.
 */

import mongoose from "mongoose";
import User from "../models/user.model.js";
import UserProfile from "../models/userProfile.model.js";

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" "),
  };
};

export const normalizeProfilePayload = (payload = {}) => {
  const normalized = { ...payload };

  if (
    normalized.name &&
    normalized.firstName === undefined &&
    normalized.lastName === undefined
  ) {
    const { firstName, lastName } = splitName(normalized.name);
    normalized.firstName = firstName;
    normalized.lastName = lastName;
  }

  delete normalized.name;
  return normalized;
};

const buildProfileResponse = (user, profile) => {
  const userObj = user?.toObject ? user.toObject() : user;
  const profileObj = profile?.toObject ? profile.toObject() : profile || {};
  const derivedName =
    [profileObj.firstName, profileObj.lastName].filter(Boolean).join(" ").trim() ||
    userObj?.name ||
    "";

  return {
    ...profileObj,
    name: derivedName,
    email: userObj?.email,
    emailVerified: userObj?.isEmailVerified ?? false,
    isEmailVerified: userObj?.isEmailVerified ?? false,
    role: userObj?.role,
    createdAt: userObj?.createdAt,
    updatedAt: userObj?.updatedAt,
    avatarUrl: profileObj?.avatar || null,
  };
};

/**
 * Fetches a paginated list of all users for the admin panel.
 * @param {object} query - Query parameters for filtering, sorting, and pagination.
 * @returns {Promise<object>} - An object containing the list of users and pagination info.
 */
export const getAllUsers = async (query) => {
  const { page = 1, limit = 10, search, status, role, verified, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.isBlocked = status === 'suspended';
  }

  if (verified) {
    filter.isEmailVerified = verified === 'verified';
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Fetches a single user by their ID.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<object>} - The user document.
 */
export const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }
  const user = await User.findById(userId).lean();
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const getMyProfile = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  const [user, profile] = await Promise.all([
    User.findById(userId)
      .select("name email role isEmailVerified createdAt updatedAt")
      .lean(),
    UserProfile.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean(),
  ]);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return { profile: buildProfileResponse(user, profile) };
};

/**
 * Updates a user's data. This is a generic function used for various updates,
 * including profile edits and status changes (blocking/unblocking).
 * @param {string} userId - The ID of the user to update.
 * @param {object} payload - The fields to update.
 * @param {string} [adminId] - The ID of the admin performing the action, for auditing.
 * @returns {Promise<object>} - The updated user document.
 */
export const updateUser = async (userId, payload, adminId) => {
  const user = await User.findByIdAndUpdate(userId, { $set: payload }, { new: true }).lean();
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateMyProfile = async (userId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  const normalizedPayload = normalizeProfilePayload(payload);

  const user = await User.findById(userId).select("name email role isEmailVerified createdAt updatedAt");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const currentProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const currentProfileObj = currentProfile.toObject ? currentProfile.toObject() : currentProfile;
  const currentName = splitName(user.name || "");

  const nextFirstName =
    normalizedPayload.firstName !== undefined ? String(normalizedPayload.firstName).trim() : currentProfileObj.firstName || currentName.firstName;
  const nextLastName =
    normalizedPayload.lastName !== undefined ? String(normalizedPayload.lastName).trim() : currentProfileObj.lastName || currentName.lastName;
  const nextPhoneNumber =
    normalizedPayload.phoneNumber !== undefined ? String(normalizedPayload.phoneNumber).trim() : currentProfileObj.phoneNumber || "";
  const nextName = [nextFirstName, nextLastName].filter(Boolean).join(" ").trim() || user.name || "";

  await User.findByIdAndUpdate(
    userId,
    { $set: { name: nextName } },
    { new: true }
  );

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        firstName: nextFirstName,
        lastName: nextLastName,
        phoneNumber: nextPhoneNumber,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const refreshedUser = await User.findById(userId)
    .select("name email role isEmailVerified createdAt updatedAt")
    .lean();

  return { profile: buildProfileResponse(refreshedUser, updatedProfile) };
};

/**
 * Changes a user's role.
 * @param {string} userId - The ID of the user.
 * @param {'customer'|'admin'} role - The new role.
 * @param {string} adminId - The ID of the admin performing the action.
 * @returns {Promise<object>} - The updated user document.
 */
export const changeRole = async (userId, role, adminId) => {
  return updateUser(userId, { role }, adminId);
};

/**
 * Soft-deletes a user account.
 * @param {string} userId - The ID of the user to deactivate.
 * @param {string} adminId - The ID of the admin performing the action.
 * @returns {Promise<object>} - The updated user document.
 */
export const deactivateUser = async (userId, adminId) => {
  return updateUser(userId, { isDeleted: true, deletedAt: new Date() }, adminId);
};

const ensureValidObjectId = (value, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${label} format`);
    error.statusCode = 400;
    throw error;
  }
};

const getUserProfileDoc = async (userId) => {
  const user = await User.findById(userId).select("name email role isEmailVerified createdAt updatedAt");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return { user, profile };
};

const normalizeAddressPayload = (payload = {}) => {
  const address = {
    label: String(payload.label || "").trim(),
    fullName: String(payload.fullName || "").trim(),
    phoneNumber: String(payload.phoneNumber || "").trim(),
    addressLine1: String(payload.addressLine1 || "").trim(),
    addressLine2: String(payload.addressLine2 || "").trim(),
    city: String(payload.city || "").trim(),
    state: String(payload.state || "").trim(),
    country: String(payload.country || "").trim(),
    postalCode: String(payload.postalCode || "").trim(),
    isDefault: Boolean(payload.isDefault),
  };

  return address;
};

export const getUserAddresses = async (userId) => {
  ensureValidObjectId(userId, "user ID");

  const profile = await UserProfile.findOne({ userId }).lean();
  if (!profile) {
    return [];
  }

  return profile.addresses || [];
};

export const createUserAddress = async (userId, payload) => {
  ensureValidObjectId(userId, "user ID");

  const { profile } = await getUserProfileDoc(userId);
  const normalizedAddress = normalizeAddressPayload(payload);

  const nextAddresses = [...(profile.addresses || [])];
  const newAddress = {
    ...normalizedAddress,
    _id: new mongoose.Types.ObjectId(),
  };

  if (normalizedAddress.isDefault) {
    nextAddresses.forEach((address) => {
      address.isDefault = false;
    });
    newAddress.isDefault = true;
  }

  nextAddresses.push(newAddress);

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: { addresses: nextAddresses } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return updatedProfile.addresses.at(-1);
};

export const getUserAddressById = async (userId, addressId) => {
  ensureValidObjectId(userId, "user ID");
  ensureValidObjectId(addressId, "address ID");

  const profile = await UserProfile.findOne({ userId }).lean();
  if (!profile) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  const address = (profile.addresses || []).find(
    (item) => item._id.toString() === addressId
  );

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  return address;
};

export const updateUserAddress = async (userId, addressId, payload) => {
  ensureValidObjectId(userId, "user ID");
  ensureValidObjectId(addressId, "address ID");

  const { profile } = await getUserProfileDoc(userId);
  const addresses = [...(profile.addresses || [])];
  const currentIndex = addresses.findIndex((item) => item._id.toString() === addressId);

  if (currentIndex === -1) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  const nextAddress = {
    ...addresses[currentIndex].toObject ? addresses[currentIndex].toObject() : addresses[currentIndex],
    ...normalizeAddressPayload(payload),
  };

  addresses[currentIndex] = nextAddress;

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: { addresses } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return updatedProfile.addresses[currentIndex];
};

export const deleteUserAddress = async (userId, addressId) => {
  ensureValidObjectId(userId, "user ID");
  ensureValidObjectId(addressId, "address ID");

  const { profile } = await getUserProfileDoc(userId);
  const addresses = [...(profile.addresses || [])];
  const existingIndex = addresses.findIndex((item) => item._id.toString() === addressId);

  if (existingIndex === -1) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  if (addresses.length === 1) {
    const error = new Error("You must keep at least one address on your account");
    error.statusCode = 400;
    throw error;
  }

  const [removedAddress] = addresses.splice(existingIndex, 1);
  if (removedAddress.isDefault && addresses.length > 0) {
    addresses[0].isDefault = true;
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    { $set: { addresses } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return { deletedAddressId: addressId };
};

export const setDefaultUserAddress = async (userId, addressId) => {
  ensureValidObjectId(userId, "user ID");
  ensureValidObjectId(addressId, "address ID");

  const { profile } = await getUserProfileDoc(userId);
  const addresses = [...(profile.addresses || [])];
  const targetIndex = addresses.findIndex((item) => item._id.toString() === addressId);

  if (targetIndex === -1) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  addresses.forEach((address, index) => {
    address.isDefault = index === targetIndex;
  });

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: { addresses } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return updatedProfile.addresses[targetIndex];
};

export const getUserActivity = async (userId) => {
  // Placeholder: In a real app, this would query an ActivityLog model.
  return [];
};
