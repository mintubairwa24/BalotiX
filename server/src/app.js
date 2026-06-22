/**
 * app.js
 *
 * WHY IT EXISTS:
 *   This is the Express application entry point. It wires together all global
 *   middleware, mounts all module routers, and registers the global error handler.
 *   The actual HTTP server (app.listen) lives in server.js or index.js, keeping
 *   this file importable for testing without starting a real server.
 *
 * MIDDLEWARE ORDER:
 *   Security (Helmet, CORS) → Logging (Morgan) → Parsing (JSON, cookies)
 *   → Module routes → 404 handler → Global error handler
 *
 *   This order is not arbitrary. Helmet must run before any route sends headers.
 *   Error handler must be last — it only catches errors from routes above it.
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/routes/auth.routes.js";
import productRoutes from "./modules/products/routes/product.routes.js";
import categoryRoutes from "./modules/categories/routes/category.routes.js";
import inventoryRoutes from "./modules/inventory/routes/inventory.routes.js";
import cartRoutes from "./modules/cart/routes/cart.routes.js";
import wishlistRoutes from "./modules/wishlist/routes/wishlist.routes.js";
import couponRoutes from "./modules/coupons/routes/coupon.routes.js";
import orderRoutes from "./modules/orders/routes/order.routes.js";
import paymentRoutes from "./modules/payments/routes/payment.routes.js";
import reviewRoutes from "./modules/reviews/routes/review.routes.js";
import { errorHandler } from "./shared/middleware/errorHandler.middleware.js";
import notificationRoutes from "./modules/notifications/routes/notification.routes.js";

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
// Helmet sets secure HTTP headers: Content-Security-Policy, X-XSS-Protection,
// X-Frame-Options, etc. One line protects against a wide class of attacks.
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// Only allow requests from your frontend origin.
// credentials: true required for cookies (JWT in HttpOnly cookie) to be sent.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Request Logging ───────────────────────────────────────────────────────────
// Morgan logs: method, URL, status, response time.
// "dev" format in development, "combined" (Apache-style) in production.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Reject payloads over 10KB (DoS protection)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses cookies so req.cookies.accessToken works

// ── Module Routes ─────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
// Future modules mount here:
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/notifications", notificationRoutes);
// Future modules mount here:



// ── Health Check ──────────────────────────────────────────────────────────────
// Used by Render/deployment platforms to verify the server is running.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NextCart API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
// Catches any request that did not match a registered route.
// Express 5 / path-to-regexp rejects "*" as a mount path, so this must be
// a pathless middleware.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// MUST be the last middleware registered.
// Catches all errors passed via next(error) from any route or middleware above.
app.use(errorHandler);

export default app;
