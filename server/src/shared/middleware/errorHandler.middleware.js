/**
 * errorHandler.middleware.js
 *
 * WHO CALLS IT:
 *   app.js registers this as the LAST middleware:
 *   app.use(errorHandler)
 *   It catches every error passed to next(error) from any route in any module.
 *
 * WHY IT EXISTS:
 *   Without a centralised error handler, every controller would need its own
 *   error formatting logic. With this, every module in NextCart gets consistent
 *   error responses without any extra work.
 *
 *   The pattern:
 *     Service throws:  const err = new Error("..."); err.statusCode = 404; throw err;
 *     Controller does: catch(error) { next(error) }
 *     This handler:    reads err.statusCode and formats the response
 *
 * ERROR RESPONSE SHAPE (consistent across all endpoints):
 *   {
 *     success: false,
 *     message: "Human-readable error",
 *     ...(development: { stack: "..." })
 *   }
 */

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log the full error server-side for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.url}: ${err?.name || "Error"}: ${err?.message || "Unknown error"}`);
  }

  // Determine HTTP status code
  // Priority: err.statusCode (set by service) → err.status → 500
  const statusCode = err.statusCode || err.status || 500;

  // ── Handle specific MongoDB/Mongoose errors ───────────────────────────────

  // Duplicate key error (e.g. unique index violation on slug or SKU)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    return res.status(409).json({
      success: false,
      message: `${field} already exists${value !== undefined ? ` (${value})` : ""}.`,
    });
  }

  // Mongoose validation error (schema-level, should be caught by Zod first)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // JWT errors (should be caught by requireAuth, this is the safety net)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // ── Generic error response ─────────────────────────────────────────────────
  const response = {
    success: false,
    message: err.message || "An unexpected error occurred",
  };

  // In development, include the stack trace for easier debugging
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
