import User from "../../auth/models/user.model.js";

/**
 * adminPassword.service.js
 *
 * WHY THIS FILE EXISTS:
 *   Password updates are business logic, not HTTP logic. The controller
 *   should only pass sanitized input here, and this service should own every
 *   security decision: lookup, verification, comparison, mutation, and
 *   session invalidation.
 *
 * SECURITY MODEL:
 *   1. Load the authenticated admin from MongoDB.
 *   2. Select the hashed password explicitly, because it is hidden by default.
 *   3. Verify the supplied current password before doing anything else.
 *   4. Refuse a no-op password change where the new password equals the old.
 *   5. Save the new password through the User model so the schema's bcrypt
 *      pre-save hook hashes it with the project's standard 12 rounds.
 *   6. Clear refresh-token state so any long-lived sessions are forced to
 *      re-authenticate with the new credential.
 */

export const updateAdminPassword = async ({
  adminId,
  currentPassword,
  newPassword,
}) => {
  if (!adminId) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }

  const admin = await User.findById(adminId).select(
    "+password role email refreshTokenHash refreshTokenIssuedAt"
  );

  if (!admin || admin.role !== "admin") {
    const error = new Error("Admin account not found");
    error.statusCode = 404;
    throw error;
  }

  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error("New password must be different from the current password");
    error.statusCode = 400;
    throw error;
  }

  // Assigning the plain password here is safe because the User model's
  // pre-save hook hashes it with bcrypt before MongoDB receives the write.
  admin.password = newPassword;
  admin.refreshTokenHash = null;
  admin.refreshTokenIssuedAt = null;
  await admin.save();

  return {
    message: "Admin password updated successfully",
  };
};
