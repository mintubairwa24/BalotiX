/**
 * admin.controller.js
 *
 * Handles HTTP requests for the admin-only user management endpoints.
 * Follows the thin-controller pattern: extracts data from the request,
 * calls the corresponding service function, and sends the response.
 */

import * as adminService from "../services/admin.service.js";

/**
 * GET /api/admin/users
 * Admin only.
 */
export const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Admin only.
 */
export const getUserById = async (req, res, next) => {
  try {
    const result = await adminService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Admin only. Updates user status to 'active' or 'suspended'.
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await adminService.updateUserStatus(
      req.params.id,
      status,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * Admin only. Updates user role to 'customer' or 'admin'.
 */
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.changeUserRole(
      req.params.id,
      role,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};