import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import UserProfile from "../../users/models/userProfile.model.js";
import { canSendMail, sendMail } from "../../../shared/emails/mailer.js";
import { buildPasswordResetEmail } from "../../../shared/emails/resetPassword.js";
import { buildVerificationEmail } from "../../../shared/emails/verification.email.js";
import { generateTokens } from "../../../shared/utils/generateToken.js";

const EMAIL_VERIFICATION_EXPIRES_IN =
  Number(process.env.EMAIL_VERIFICATION_EXPIRES_IN_MS) || 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRES_IN =
  Number(process.env.PASSWORD_RESET_EXPIRES_IN_MS) || 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateRandomToken = () => crypto.randomBytes(32).toString("hex");

const getBackendUrl = () =>
  process.env.SERVER_URL || process.env.API_URL || "http://localhost:5000";

const getPasswordResetUrl = (token) =>
  process.env.RESET_PASSWORD_URL ||
  `${getBackendUrl()}/api/auth/reset-password?token=${token}`;

const getRefreshTokenSecret = () => {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error(
      "JWT refresh token secret is not configured. Set REFRESH_TOKEN_SECRET or JWT_REFRESH_SECRET."
    );
  }

  return secret;
};

const hasEmailTransport = () =>
  Boolean(
    (process.env.SMTP_HOST || process.env.EMAIL_HOST) &&
      (process.env.SMTP_USER || process.env.EMAIL_USER) &&
      (process.env.SMTP_PASSWORD || process.env.EMAIL_PASS)
  );

const safeUser = (user) => ({
  _id: user._id,
  userId: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isVerified: user.isEmailVerified,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const assertAccountIsActive = async (userId) => {
  const profile = await UserProfile.findOne({ userId }).select("accountStatus");

  // Users without a profile are treated as active. The profile document is
  // created lazily by the Users module, so login must not fail just because
  // a customer has never opened their profile page.
  if (profile && profile.accountStatus !== "active") {
    const error = new Error("This account is inactive. Reactivate it to continue.");
    error.statusCode = 403;
    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  if (!hasEmailTransport() || !canSendMail()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Auth] Verification email skipped because SMTP is not configured correctly."
      );
    }
    return;
  }

  const verificationUrl = `${getBackendUrl()}/api/auth/verify-email?token=${token}`;
  const emailContent = buildVerificationEmail({
    name: user.name,
    verifyUrl: verificationUrl,
    appName: "NextCart",
  });

  try {
    await sendMail({
      to: user.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Auth] Verification email skipped in development:", error.message);
      return;
    }

    throw error;
  }
};

const sendPasswordResetEmail = async (user, token) => {
  if (!hasEmailTransport()) {
    return;
  }

  const resetUrl = getPasswordResetUrl(token);
  const emailContent = buildPasswordResetEmail({
    name: user.name,
    resetUrl,
    appName: "NextCart",
  });

  await sendMail({
    to: user.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};

export const register = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: "customer",
  });

  const verificationToken = generateRandomToken();
  user.emailVerificationTokenHash = hashToken(verificationToken);
  user.emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN);
  await user.save();

  sendVerificationEmail(user, verificationToken).catch((error) => {
    console.error("[Auth] Verification email failed:", error.message);
  });

  return {
    userId: user._id,
    message: "Registration successful. Please verify your email.",
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isEmailVerified) {
    const error = new Error("Please verify your email before logging in");
    error.statusCode = 403;
    throw error;
  }

  await assertAccountIsActive(user._id);

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenIssuedAt = new Date();
  // user.lastLoginAt = new Date(user.lastLoginAt).toLocaleString("en-IN",{
  //   timeZone: "Asia/Kolkata"
  // });
  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: safeUser(user),
  };
};

export const logout = async (userId) => {
  if (!userId) {
    return { message: "Logged out successfully" };
  }

  await User.findByIdAndUpdate(userId, {
    $set: {
      refreshTokenHash: null,
      refreshTokenIssuedAt: null,
    },
  });

  return { message: "Logged out successfully" };
};

export const refreshAccessToken = async (incomingToken) => {
  const decoded = jwt.verify(incomingToken, getRefreshTokenSecret());
  const userId = decoded.userId || decoded._id || decoded.id;

  if (!userId) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  if (decoded.tokenType !== "refresh") {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(userId).select("+refreshTokenHash");

  if (!user || !user.refreshTokenHash) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  if (user.refreshTokenHash !== hashToken(incomingToken)) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  await assertAccountIsActive(user._id);

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenIssuedAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: safeUser(user),
  };
};

export const verifyEmail = async (token) => {
  if (!token) {
    const error = new Error("Verification token is required");
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashToken(token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");

  if (!user) {
    const error = new Error("Verification token is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  return { message: "You are verified successfully" };
};

export const resendVerification = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.isEmailVerified) {
    return {
      message: "If the account exists and is not verified, a new verification email has been sent.",
    };
  }

  const verificationToken = generateRandomToken();
  user.emailVerificationTokenHash = hashToken(verificationToken);
  user.emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN);
  await user.save();

  sendVerificationEmail(user, verificationToken).catch((error) => {
    console.error("[Auth] Verification email resend failed:", error.message);
  });

  return {
    message: "If the account exists and is not verified, a new verification email has been sent.",
  };
};

export const forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    const token = generateRandomToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_IN);
    await user.save();

    sendPasswordResetEmail(user, token).catch((error) => {
      console.error("[Auth] Password reset email failed:", error.message);
    });
  }

  return {
    message: "If an account with that email exists, a password reset link has been sent.",
  };
};

export const resetPassword = async (token, password) => {
  if (!token) {
    const error = new Error("Reset token is required");
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpiresAt +password");

  if (!user) {
    const error = new Error("Reset token is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.refreshTokenHash = null;
  user.refreshTokenIssuedAt = null;
  await user.save();

  return { message: "Password updated successfully" };
};
