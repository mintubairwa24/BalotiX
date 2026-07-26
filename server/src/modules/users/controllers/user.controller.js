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
