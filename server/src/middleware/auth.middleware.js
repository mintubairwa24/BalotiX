/**
 * auth.middleware.js
 *
 * WHO CALLS IT:
 *   Every protected route in every module (products, orders, cart, etc.)
 *   uses requireAuth and requireRole from this file.
 *
 * WHY IT EXISTS:
 *   Centralises JWT verification and RBAC so the same logic is never
 *   duplicated across modules. A bug fix here protects every route at once.
 *
 * NOTE ON EXISTING AUTH SYSTEM:
 *   Per the project context, authentication is already built. This middleware
 *   integrates with it — it reads the JWT from the HttpOnly cookie (the
 *   pattern your auth module uses) and attaches req.user for downstream use.
 *
 * INPUT:   req with cookies.accessToken (set by auth login endpoint)
 * OUTPUT:  req.user populated, or a 401/403 response
 */

import jwt from "jsonwebtoken";

/**
 * requireAuth
 * Verifies the JWT access token from the HttpOnly cookie.
 * On success: attaches the decoded payload to req.user and calls next().
 * On failure: returns 401 Unauthorized.
 */
export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach the decoded payload so controllers and services can access user info
    // Typical payload: { _id, email, role, iat, exp }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

/**
 * requireRole
 * Factory function — returns middleware that checks req.user.role.
 * MUST be used AFTER requireAuth (requires req.user to already exist).
 *
 * Usage: requireRole("admin") or requireRole("customer")
 *
 * @param  {...string} roles  - One or more allowed roles
 * @returns {Function}        - Express middleware
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    // Defensive check — requireAuth should have run first
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action.",
    });
  }

  next();
};