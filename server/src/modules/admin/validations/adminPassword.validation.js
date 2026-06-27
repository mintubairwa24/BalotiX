import { z } from "zod";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

/**
 * updatePasswordSchema
 *
 * WHY THIS FILE EXISTS:
 *   Admin password changes are security-sensitive enough to deserve their
 *   own validation schema instead of being buried inside the controller or
 *   service. That keeps the contract explicit: the route accepts exactly
 *   three fields, and it rejects weak or inconsistent data before the
 *   service touches MongoDB.
 *
 * SECURITY CHOICES:
 *   - currentPassword is mandatory so a stolen token alone is not enough.
 *   - newPassword must be strong enough for a privileged account.
 *   - confirmNewPassword prevents typos from locking an admin out.
 *   - newPassword cannot equal currentPassword, because a no-op password
 *     change is not a meaningful security update.
 *   - strict() rejects any extra payload fields, so the endpoint only ever
 *     processes the three values it is designed to handle.
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: "Current password is required",
        invalid_type_error: "Current password must be a string",
      })
      .min(1, "Current password is required"),
    newPassword: z
      .string({
        required_error: "New password is required",
        invalid_type_error: "New password must be a string",
      })
      .min(8, "New password must be at least 8 characters long")
      .regex(passwordPattern, {
        message:
          "New password must include uppercase, lowercase, number, and special character",
      }),
    confirmNewPassword: z
      .string({
        required_error: "Confirm new password is required",
        invalid_type_error: "Confirm new password must be a string",
      })
      .min(1, "Confirm new password is required"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Passwords do not match",
      });
    }

    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password must be different from the current password",
      });
    }
  });
