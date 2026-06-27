import * as adminPasswordService from "../services/adminPassword.service.js";

/**
 * adminPassword.controller.js
 *
 * WHY THIS FILE EXISTS:
 *   Express controllers should remain thin. Their only job is to translate
 *   HTTP input into a service call and translate the result back into a
 *   response. All security-sensitive decisions stay in the service layer.
 *
 * FLOW:
 *   - req.user is populated by requireAuth
 *   - req.user.role is verified by requireRole("admin")
 *   - the validated password payload is passed into the service
 *   - success or failure is returned in the project-wide JSON shape
 */

export const updatePassword = async (req, res, next) => {
  try {
    const result = await adminPasswordService.updateAdminPassword({
      adminId: req.user._id || req.user.userId,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};
