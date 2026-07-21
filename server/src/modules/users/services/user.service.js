/**
 * user.service.js
 *
 * This service provides the core business logic for user management that
 * other modules, like the Admin module, can consume. It is the single
 * source of truth for interacting with User and UserProfile models.
 */

import mongoose from "mongoose";
import User from "../models/user.model.js";

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