/**
 * validate.middleware.js
 *
 * WHO CALLS IT:
 *   product.routes.js (and every other module's routes) uses these middleware
 *   factories to attach Zod validation to specific routes.
 *
 * WHY IT EXISTS:
 *   Instead of duplicating try/catch + Zod parsing in every controller,
 *   we centralise validation into two reusable middleware factories:
 *     - validate()      validates req.body
 *     - validateQuery() validates req.query
 *
 *   If validation passes, it REPLACES req.body / req.query with the parsed,
 *   type-coerced result from Zod. This means by the time the controller runs,
 *   it receives clean, typed data — not raw strings from HTTP.
 *
 *   If validation fails, it immediately returns a 400 response with a
 *   structured error array. The controller never runs.
 *
 * INPUT:   A Zod schema object
 * OUTPUT:  An Express middleware function
 */

/**
 * Validates req.body against a Zod schema.
 * Replaces req.body with the Zod-parsed result (typed, defaults applied).
 *
 * @param {ZodSchema} schema - The Zod schema to validate against
 * @returns {Function}       - Express middleware function
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  // FIX: Add a more explicit development log for undefined request bodies.
  // This helps immediately identify when a body-parsing middleware (like express.json())
  // is missing or has not run for the current route.
  if (req.body === undefined && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
    console.error(`[VALIDATION_ERROR] req.body is undefined for ${req.method} ${req.originalUrl}. Check if express.json() middleware is correctly applied before this route.`);
  }

  if (!result.success) {
    // Log the invalid request body during development so we can fix mismatched payloads.
    if (process.env.NODE_ENV !== "production") {
      console.error("Validation failed for request body:", req.body);
      console.error(
        "Validation issues:",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    // Format Zod errors into a clean array of { field, message } objects
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Replace req.body with Zod's parsed output — coerced types, defaults applied
  req.body = result.data;
  next();
};

/**
 * Validates req.query against a Zod schema.
 * Replaces req.query with the Zod-parsed result (coerces strings to numbers, etc.)
 *
 * @param {ZodSchema} schema - The Zod schema to validate against
 * @returns {Function}       - Express middleware function
 */
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors,
    });
  }

  // Express 5 exposes req.query via a getter on IncomingMessage, so direct
  // assignment throws "Cannot set property query ... which has only a getter".
  // Defining an own property on this request instance safely overrides that
  // getter for the rest of the request lifecycle.
  Object.defineProperty(req, "query", {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};
