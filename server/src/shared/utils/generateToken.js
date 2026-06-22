import jwt from "jsonwebtoken";

const getEnv = (primaryName, fallbackName, defaultValue) =>
  process.env[primaryName] || (fallbackName ? process.env[fallbackName] : undefined) || defaultValue;

const requireEnv = (primaryName, fallbackName) => {
  const value = getEnv(primaryName, fallbackName);

  if (!value) {
    throw new Error(`${primaryName}${fallbackName ? ` or ${fallbackName}` : ""} is not configured`);
  }

  return value;
};

export const generateAccessToken = (userId, role) =>
  jwt.sign(
    { userId, _id: userId, role, tokenType: "access" },
    requireEnv("ACCESS_TOKEN_SECRET", "JWT_ACCESS_SECRET"),
    { expiresIn: getEnv("ACCESS_TOKEN_EXPIRE", "ACCESS_TOKEN_EXPIRES_IN", "15m") }
  );

export const generateRefreshToken = (userId, role) =>
  jwt.sign(
    { userId, _id: userId, role, tokenType: "refresh" },
    requireEnv("REFRESH_TOKEN_SECRET", "JWT_REFRESH_SECRET"),
    { expiresIn: getEnv("REFRESH_TOKEN_EXPIRE", "REFRESH_TOKEN_EXPIRES_IN", "7d") }
  );

export const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);

  return { accessToken, refreshToken };
};

export default generateTokens;
