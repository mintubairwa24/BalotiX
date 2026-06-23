/**
 * user.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/users".
 *   Example: app.use("/api/users", userRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the authenticated customer profile surface for the ecommerce
 *   backend. Every route requires requireAuth. There is no public surface
 *   and no admin-only surface in this module because the only actor that
 *   should mutate this data is the owner of the profile.
 *
 * ROUTE ORDER:
 *   Literal routes are declared before parameterised address routes so
 *   Express never confuses a fixed action path with an ObjectId segment.
 *   This matters most for routes like "/addresses/:addressId/default".
 */

import express from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  addAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
  updateAvatarSchema,
  updatePreferencesSchema,
} from "../validations/user.validation.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Every route below requires authentication. User data is always scoped to
// the authenticated caller, never to a route param userId.
// ---------------------------------------------------------------------------

router.get("/profile", requireAuth, userController.getProfile);

router.patch(
  "/profile",
  productRateLimiter,
  requireAuth,
  validate(updateProfileSchema),
  userController.updateProfile
);

router.patch(
  "/avatar",
  productRateLimiter,
  requireAuth,
  validate(updateAvatarSchema),
  userController.updateAvatar
);

router.patch(
  "/preferences",
  productRateLimiter,
  requireAuth,
  validate(updatePreferencesSchema),
  userController.updatePreferences
);

router.get("/addresses", requireAuth, userController.getAddresses);

router.post(
  "/addresses",
  productRateLimiter,
  requireAuth,
  validate(addAddressSchema),
  userController.addAddress
);

// Literal action path before the general param route.
router.patch(
  "/addresses/:addressId/default",
  productRateLimiter,
  requireAuth,
  userController.setDefaultAddress
);

router.patch(
  "/addresses/:addressId",
  productRateLimiter,
  requireAuth,
  validate(updateAddressSchema),
  userController.updateAddress
);

router.delete(
  "/addresses/:addressId",
  productRateLimiter,
  requireAuth,
  userController.deleteAddress
);

router.patch(
  "/deactivate",
  productRateLimiter,
  requireAuth,
  userController.deactivateAccount
);

router.patch(
  "/reactivate",
  productRateLimiter,
  requireAuth,
  userController.reactivateAccount
);

export default router;
