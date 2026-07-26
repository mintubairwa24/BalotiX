/**
 * user.validation.js
 *
 * WHO CALLS IT:
 *   user.routes.js uses these Zod schemas through the shared validate()
 *   middleware before any request reaches the controller.
 *
 * WHY IT EXISTS:
 *   The user module is a high-trust boundary: one bad payload should not be
 *   able to corrupt a profile, break the embedded address array, or create
 *   malformed preferences. The schemas below are intentionally strict and
 *   explicit, which keeps the service layer focused on business rules rather
 *   than input shape cleanup.
 */

import { z } from "zod";

const phoneNumberSchema = z
  .string()
  .trim()
  .min(7, "Phone number must be at least 7 characters")
  .max(20, "Phone number must not exceed 20 characters")
  .regex(/^\+?[0-9\s().-]+$/, "Phone number contains invalid characters");

const optionalText = (min, max, fieldLabel) =>
  z
    .preprocess((value) => (value === "" ? undefined : value),
      z
        .string()
        .trim()
        .min(min, `${fieldLabel} must be at least ${min} characters`)
        .max(max, `${fieldLabel} must not exceed ${max} characters`)
        .nullable()
        .optional()
    );

const addressCoreSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Address label is required")
    .max(50, "Address label must not exceed 50 characters"),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must not exceed 100 characters"),
  phoneNumber: phoneNumberSchema,
  addressLine1: z
    .string()
    .trim()
    .min(1, "Address line 1 is required")
    .max(150, "Address line 1 must not exceed 150 characters"),
  addressLine2: z
    .string()
    .trim()
    .max(150, "Address line 2 must not exceed 150 characters")
    .optional()
    .default(""),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters"),
  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(100, "State must not exceed 100 characters"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country must not exceed 100 characters"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Postal code is required")
    .max(20, "Postal code must not exceed 20 characters"),
  isDefault: z.boolean().optional().default(false),
});

const profileUpdateSchema = z
  .object({
    firstName: optionalText(1, 50, "First name"),
    lastName: optionalText(1, 50, "Last name"),
    phoneNumber: z.preprocess(
      (value) => (value === "" ? undefined : value),
      phoneNumberSchema.nullable().optional()
    ),
    gender: z
      .enum(["male", "female", "other", "prefer_not_to_say"])
      .nullable()
      .optional(),
    dateOfBirth: z
      .preprocess((value) => {
        if (value === undefined || value === null || value === "") {
          return value;
        }

        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? value : parsedDate;
      }, z.date().nullable().optional()),
  })
  .superRefine((data, ctx) => {
    if (Object.values(data).every((value) => value === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one profile field is required",
      });
    }
  });

const avatarUpdateSchema = z.object({
  avatar: z
    .string()
    .trim()
    .url("Avatar must be a valid URL")
    .max(2048, "Avatar URL must not exceed 2048 characters"),
});

const preferencesUpdateSchema = z
  .object({
    emailPromotions: z.boolean().optional(),
    orderUpdates: z.boolean().optional(),
    wishlistReminders: z.boolean().optional(),
    productBackInStock: z.boolean().optional(),
    preferredLanguage: z
      .string()
      .trim()
      .min(2, "Preferred language must be at least 2 characters")
      .max(10, "Preferred language must not exceed 10 characters")
      .optional(),
    preferredCurrency: z
      .string()
      .trim()
      .length(3, "Preferred currency must be a 3-letter code")
      .optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.values(data).every((value) => value === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one preference is required",
      });
    }
  });

export const addAddressSchema = addressCoreSchema;

export const updateAddressSchema = addressCoreSchema
  .omit({ isDefault: true })
  .partial()
  .superRefine((data, ctx) => {
    if (Object.values(data).every((value) => value === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one address field is required",
      });
    }
  });

export const updateProfileSchema = profileUpdateSchema;
export const updateAvatarSchema = avatarUpdateSchema;
export const updatePreferencesSchema = preferencesUpdateSchema;
