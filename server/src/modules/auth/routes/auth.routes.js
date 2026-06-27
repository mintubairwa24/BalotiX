import express from "express";
import rateLimit from "express-rate-limit";

import * as authController from "../controllers/auth.controllers.js";
import {
  validate,
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";
import { authenticate } from "../../../shared/middleware/auth.middleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many attempts. Try again in 15 minutes." },
});

router.post("/register", authLimiter, validate(registerSchema), authController.register);

router.post("/login", authLimiter, validate(loginSchema), authController.login);

router.post("/logout", authenticate, authController.logout);

router.post("/refresh-token", authController.refreshToken);

router.get("/verify-email", authController.verifyEmail);

router.get("/reset-password", authController.resetPasswordPage);

router.get("/me", authenticate, authController.me);

router.post(
  "/resend-verification",
  authLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
