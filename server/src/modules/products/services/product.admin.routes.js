/**
 * product.admin.routes.js
 *
 * ARCHITECTURAL PURPOSE:
 * Defines all admin-only routes for product management. These routes are
 * mounted under the `/api/admin` prefix and are protected by authentication
 * and role-checking middleware.
 *
 * This file is the solution to the persistent data issues in the admin panel.
 * It ensures that requests from the admin UI are handled by dedicated controllers
 * that call the correct, admin-specific service functions (`getAdminProducts`,
 * `archiveProduct`, etc.), providing the complete and unfiltered data required.
 */

import express from 'express';
import {
  getProductsForAdmin,
  archiveProduct,
} from '../../products/controllers/product.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import { validateQuery } from '../../../shared/middleware/validate.middleware.js';
import { adminProductQuerySchema } from '../../products/validations/product.validation.js';

const router = express.Router();

// GET /api/admin/products - Fetch all products for the admin list
// FIX: The server is crashing because `auth.middleware.js` does not export a function named `protect`.
// This was missed in the previous fix.
// The correct function for checking authentication, used consistently in all other admin routes
// (e.g., `admin.routes.js`), is `requireAuth`.
// This change replaces the incorrect `protect` with the correct `requireAuth`, which will
// finally resolve the server startup crash.
router.get('/products', requireAuth, requireRole("admin"), validateQuery(adminProductQuerySchema), getProductsForAdmin);

// DELETE /api/admin/products/:id - Archive a product
// FIX: The server crashed because this file tried to import `archiveProductHandler`,
// but the controller (`product.controller.js`) exports the function as `archiveProduct`.
// This change corrects the function name to match the actual export, which will
// resolve the `SyntaxError` and allow the server to start.
router.delete('/products/:id', requireAuth, requireRole("admin"), archiveProduct);

export default router;