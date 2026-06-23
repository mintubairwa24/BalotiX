/**
 * auth.middleware.js
 *
 * Shared authentication middleware for the ecommerce app.
 * Supports both:
 * - HttpOnly cookie JWTs for browser sessions
 * - Bearer JWTs for API clients / frontend auth headers
 *
 * req.user is normalized to always include:
 * - _id
 * - userId
 * - role
 */

import jwt from "jsonwebtoken";
import UserProfile from "../../modules/users/models/userProfile.model.js";

const getAccessTokenSecret = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(
      "JWT access token secret is not configured. Set ACCESS_TOKEN_SECRET or JWT_ACCESS_SECRET."
    );
  }

  return secret;
};

const extractBearerToken = (req) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const extractCookieToken = (req) => req.cookies?.accessToken || null;

const normalizeUserPayload = (decoded) => {
  const userId = decoded.userId || decoded._id || decoded.id;
  const normalized = {
    ...decoded,
  };

  if (userId) {
    normalized._id = normalized._id || userId;
    normalized.userId = normalized.userId || userId;
  }

  return normalized;
};

const isStatusCheckBypassed = (req) => {
  const path = (req.originalUrl || req.url || "").split("?")[0];

  // Deactivated users must still be able to log out and call the explicit
  // reactivation endpoint. Everything else that requires auth is locked.
  return path === "/api/auth/logout" || path === "/api/users/reactivate";
};

const denyInactiveAccount = (res) =>
  res.status(403).json({
    success: false,
    message: "This account is inactive. Reactivate it to continue.",
  });

export const authenticate = (req, res, next) => {
  try {
    const token = extractBearerToken(req) || extractCookieToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, getAccessTokenSecret());
    req.user = normalizeUserPayload(decoded);

    if (!isStatusCheckBypassed(req)) {
      const userId = req.user?._id || req.user?.userId;

      if (userId) {
        UserProfile.findOne({ userId })
          .select("accountStatus")
          .then((profile) => {
            if (profile && profile.accountStatus !== "active") {
              return denyInactiveAccount(res);
            }

            return next();
          })
          .catch(() =>
            res.status(500).json({
              success: false,
              message: "Unable to verify account status.",
            })
          );

        return;
      }
    }

    return next();
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

export const requireAuth = authenticate;

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
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

  return next();
};
