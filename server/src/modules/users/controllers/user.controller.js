import * as userService from "../services/user.service.js";

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