/**
 * inventory.routes.js
 *
 * Defines routes for admin inventory management.
 */

import { Router } from "express";
import * as inventoryController from "./inventory.controller.js";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

// All routes in this file are for admins only.
router.use(requireAuth, requireRole("admin"));

router.get("/", inventoryController.getInventoryList);
router.get("/:id", inventoryController.getInventoryDetails);
router.patch("/:id/stock", inventoryController.updateStock);

export default router;