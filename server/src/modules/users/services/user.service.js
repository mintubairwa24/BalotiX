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
    payload.firstName !== undefined ? String(payload.firstName).trim() : currentProfileObj.firstName || currentName.firstName;
  const nextLastName =
    payload.lastName !== undefined ? String(payload.lastName).trim() : currentProfileObj.lastName || currentName.lastName;
  const nextPhoneNumber =
    payload.phoneNumber !== undefined ? String(payload.phoneNumber).trim() : currentProfileObj.phoneNumber || "";
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

export const getUserAddresses = async (userId) => {
  // Placeholder: In a real app, this would query an Address model.
  return [];
};

export const getUserActivity = async (userId) => {
  // Placeholder: In a real app, this would query an ActivityLog model.
  return [];
};
