/**
 * src/schemas/auth.schemas.js
 *
 * PURPOSE:
 *   Zod validation schemas for all authentication forms. Passed to
 *   React Hook Form via @hookform/resolvers/zod.
 *
 * RELATIONSHIP TO BACKEND:
 *   The backend validates independently with its own schema layer.
 *   These are NOT a replacement — they provide instant client-side
 *   feedback before a request is ever sent.
 *
 * REUSE:
 *   Imported directly into LoginForm, RegisterForm, ForgotPasswordForm,
 *   ResetPasswordForm (src/components/auth/).
 */

import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

// ─── Login ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Register ───────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Forgot Password ────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

// ─── Reset Password ─────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });