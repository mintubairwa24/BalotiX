import * as userService from "../services/user.service.js";
import sendResponse from "../../../shared/utils/sendResponse.js";

/**
 * Controller to handle listing all users for an admin.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
export const listUsers = async (req, res, next) => {
  try {
    // req.query is safe to use here, assuming you use a validation middleware
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const result = await userService.getMyProfile(req.user._id || req.user.userId);
    return sendResponse(res, {
      statusCode: 200,
      message: "User profile loaded successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateMyProfile(req.user._id || req.user.userId, req.body);
    return sendResponse(res, {
      statusCode: 200,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const listAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getUserAddresses(req.user._id || req.user.userId);
    return sendResponse(res, {
      statusCode: 200,
      message: "Addresses loaded successfully",
      data: { addresses },
    });
  } catch (error) {
    return next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await userService.createUserAddress(
      req.user._id || req.user.userId,
      req.body
    );

    return sendResponse(res, {
      statusCode: 201,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    const address = await userService.getUserAddressById(
      req.user._id || req.user.userId,
      req.params.id
    );

    return sendResponse(res, {
      statusCode: 200,
      message: "Address loaded successfully",
      data: address,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await userService.updateUserAddress(
      req.user._id || req.user.userId,
      req.params.id,
      req.body
    );

    return sendResponse(res, {
      statusCode: 200,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const result = await userService.deleteUserAddress(
      req.user._id || req.user.userId,
      req.params.id
    );

    return sendResponse(res, {
      statusCode: 200,
      message: "Address deleted successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await userService.setDefaultUserAddress(
      req.user._id || req.user.userId,
      req.params.id
    );

    return sendResponse(res, {
      statusCode: 200,
      message: "Default address updated",
      data: address,
    });
  } catch (error) {
    return next(error);
  }
};
