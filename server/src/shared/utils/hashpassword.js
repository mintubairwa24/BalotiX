import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;

export const hashPassword = async (password, saltRounds = DEFAULT_SALT_ROUNDS) => {
  if (!password) {
    throw new Error("Password is required");
  }

  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(plainPassword, hashedPassword);
};

