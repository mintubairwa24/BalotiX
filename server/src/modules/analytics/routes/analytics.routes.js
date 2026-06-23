/**
 * analytics.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/analytics".
 *
 * WHY IT EXISTS:
 *   Analytics is an admin-only reporting surface. Every route requires
 *   requireAuth and requireRole("admin"). Customers must never reach it.
 *
 * ROUTE ORDER:
 *   Literal paths only, so ordering is straightforward. The router is
 *   intentionally flat because this is a reporting surface, not a resource
 *   tree with IDs or nested write actions.
 */

import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { publicRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  analyticsRangeSchema,
  analyticsExportSchema,
} from "../validations/analytics.validation.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getDashboard);
router.get("/revenue", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getRevenue);
router.get("/sales", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getSales);
router.get("/products", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getProducts);
router.get("/categories", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getCategories);
router.get("/customers", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getCustomers);
router.get("/coupons", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getCoupons);
router.get("/inventory", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getInventory);
router.get("/reviews", publicRateLimiter, validateQuery(analyticsRangeSchema), analyticsController.getReviews);
router.get("/export/csv", publicRateLimiter, validateQuery(analyticsExportSchema), analyticsController.exportCsv);
router.get("/export/excel", publicRateLimiter, validateQuery(analyticsExportSchema), analyticsController.exportExcel);

export default router;
