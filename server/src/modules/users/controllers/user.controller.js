/**
 * user.controller.js
 *
 * WHO CALLS IT:
 *   user.routes.js wires each HTTP endpoint to one of these handlers.
 *
 * WHY IT EXISTS:
 *   Controllers stay intentionally thin. They extract the authenticated
 *   identity from req.user, hand validated payloads to the service layer,
 *   and translate the service result into a standard JSON response.
 *
 * OWNERSHIP REMINDER:
 *   There are no route params for user identity in this module. Every
 *   controller uses the authenticated user from the request context, which
 *   means the service layer always scopes the mutation to "me" and never
 *   to an arbitrary user-provided ID.
 */

import sendResponse from "../../../shared/utils/sendResponse.js";
import * as userService from "../services/user.service.js";

const getAuthUserId = (req) => req.user?._id || req.user?.userId;

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(getAuthUserId(req));
    return sendResponse(res, {
      statusCode: 200,
      message: "Profile loaded successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(getAuthUserId(req), req.body);
    return sendResponse(res, {
      statusCode: 200,
      message: "Profile updated successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const profile = await userService.updateAvatar(getAuthUserId(req), req.body.avatar);
    return sendResponse(res, {
      statusCode: 200,
      message: "Avatar updated successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const profile = await userService.updatePreferences(getAuthUserId(req), req.body);
    return sendResponse(res, {
      statusCode: 200,
      message: "Preferences updated successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getAddresses(getAuthUserId(req));
    return sendResponse(res, {
      statusCode: 200,
      message: "Addresses loaded successfully",
      data: { addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const profile = await userService.addAddress(getAuthUserId(req), req.body);
    return sendResponse(res, {
      statusCode: 201,
      message: "Address added successfully",
      data: { profile, addresses: profile.addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const profile = await userService.updateAddress(
      getAuthUserId(req),
      req.params.addressId,
      req.body
    );
    return sendResponse(res, {
      statusCode: 200,
      message: "Address updated successfully",
      data: { profile, addresses: profile.addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const profile = await userService.deleteAddress(getAuthUserId(req), req.params.addressId);
    return sendResponse(res, {
      statusCode: 200,
      message: "Address deleted successfully",
      data: { profile, addresses: profile.addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const profile = await userService.setDefaultAddress(
      getAuthUserId(req),
      req.params.addressId
    );
    return sendResponse(res, {
      statusCode: 200,
      message: "Default address updated successfully",
      data: { profile, addresses: profile.addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const deactivateAccount = async (req, res, next) => {
  try {
    const profile = await userService.deactivateAccount(getAuthUserId(req));
    return sendResponse(res, {
      statusCode: 200,
      message: "Account deactivated successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const reactivateAccount = async (req, res, next) => {
  try {
    const profile = await userService.reactivateAccount(getAuthUserId(req));
    return sendResponse(res, {
      statusCode: 200,
      message: "Account reactivated successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};
