import * as authService from "../services/auth.service.js";
import sendResponse from "../../../shared/utils/sendResponse.js";
import User from "../models/user.model.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getLoginUrl = () =>
  process.env.LOGIN_URL || `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;

const renderResetSuccessPage = ({ message, loginUrl }) => {
  const safeMessage = escapeHtml(message);
  const safeLoginUrl = escapeHtml(loginUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Updated</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, Helvetica, sans-serif;
        background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
        color: #111827;
      }
      .card {
        width: min(92vw, 480px);
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        padding: 32px;
        text-align: center;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }
      p {
        margin: 0 0 20px;
        color: #4b5563;
        line-height: 1.6;
      }
      a {
        display: inline-block;
        padding: 12px 18px;
        border-radius: 10px;
        background: #2563eb;
        color: #ffffff;
        text-decoration: none;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${safeMessage}</h1>
      <p>You can now log in again with your new password.</p>
      <a href="${safeLoginUrl}">Back to Login</a>
    </main>
    <script>
      window.setTimeout(() => {
        window.location.href = "${safeLoginUrl}";
      }, 2500);
    </script>
  </body>
</html>`;
};

const renderResetPasswordPage = ({
  token = "",
  title,
  message,
  error = false,
  loginUrl = getLoginUrl(),
}) => {
  const safeToken = escapeHtml(token);
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeLoginUrl = escapeHtml(loginUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, Helvetica, sans-serif;
        background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
        color: #111827;
      }
      .card {
        width: min(92vw, 480px);
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        padding: 32px;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }
      p {
        margin: 0 0 20px;
        color: #4b5563;
        line-height: 1.6;
      }
      label {
        display: block;
        font-size: 14px;
        font-weight: 700;
        margin: 16px 0 8px;
      }
      input {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        font-size: 15px;
      }
      input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
      }
      button {
        width: 100%;
        margin-top: 22px;
        padding: 12px 16px;
        border: 0;
        border-radius: 10px;
        background: #111827;
        color: #ffffff;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .message {
        margin-top: 16px;
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 14px;
        line-height: 1.5;
        background: ${error ? "#fef2f2" : "#ecfeff"};
        color: ${error ? "#991b1b" : "#155e75"};
      }
      .hidden {
        display: none;
      }
      .footer {
        margin-top: 18px;
        font-size: 13px;
        color: #6b7280;
      }
      .actions {
        margin-top: 18px;
      }
      .actions a {
        display: inline-block;
        width: 100%;
        box-sizing: border-box;
        text-align: center;
        padding: 12px 16px;
        border-radius: 10px;
        background: #2563eb;
        color: #ffffff;
        text-decoration: none;
        font-weight: 700;
      }
      .footer a {
        color: #2563eb;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      <form id="resetForm" method="post" action="/api/auth/reset-password" ${error ? 'class="hidden"' : ""}>
        <input type="hidden" id="token" name="token" value="${safeToken}" />

        <label for="password">New password</label>
        <input id="password" name="password" type="password" minlength="8" maxlength="128" required />

        <label for="confirmPassword">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" minlength="8" maxlength="128" required />

        <button id="submitBtn" type="submit">Reset Password</button>
      </form>
      <div id="status" class="message ${error ? "" : "hidden"}">${safeMessage}</div>
      <div class="footer">
        After resetting, return to the app and log in with your new password.
      </div>
    </main>
  </body>
</html>`;
};

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

    if (req.accepts("html")) {
      return res.status(200).send(`
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Email Verified</title>
            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                display: flex;
                min-height: 100vh;
                align-items: center;
                justify-content: center;
                margin: 0;
                background: #f6f9fc;
                color: #111827;
              }
              .card {
                background: #fff;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 32px 40px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
                text-align: center;
              }
              h1 {
                margin: 0 0 12px;
                font-size: 28px;
              }
              p {
                margin: 0;
                color: #4b5563;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>You are verified successfully</h1>
              <p>You can now go back and log in to your account.</p>
            </div>
          </body>
        </html>
      `);
    }

    return sendResponse(res, {
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPasswordPage = async (req, res) => {
  const token = req.query?.token;

  if (!token) {
    return res
      .status(400)
      .send(
        renderResetPasswordPage({
          title: "Reset link missing",
          message: "This password reset link is missing its token. Please request a new reset email.",
          error: true,
        })
      );
  }

  return res.status(200).send(
    renderResetPasswordPage({
      token,
      title: "Reset your password",
      message: "Enter your new password below to complete the reset.",
    })
  );
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

    if (req.accepts("html")) {
      return res.status(200).send(
        renderResetSuccessPage({
          message: result.message,
          loginUrl: getLoginUrl(),
        })
      );
    }

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
