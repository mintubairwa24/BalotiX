import * as authService from "../services/auth.service.js";
import sendResponse from "../../../shared/utils/sendResponse.js";
import User from "../models/user.model.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendResponse(res, {
      statusCode: 201,
      message: result.message,
      data: { userId: result.userId },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: { accessToken, user },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user?._id || req.user?.userId);

    res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

    return sendResponse(res, {
      statusCode: 200,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const incomingToken = req.cookies?.refreshToken;

    if (!incomingToken) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "No refresh token",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(incomingToken);

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return sendResponse(res, {
      statusCode: 200,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await authService.verifyEmail(token);

    return sendResponse(res, {
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.body.email);

    return sendResponse(res, {
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);

    return sendResponse(res, {
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);

    return sendResponse(res, {
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    const user = await User.findById(userId).select(
      "name email role isEmailVerified createdAt updatedAt lastLoginAt"
    );

    if (!user) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      message: "User profile loaded successfully",
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
};
