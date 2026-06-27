import "dotenv/config";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../modules/auth/models/user.model.js";

/**
 * createAdmin.js
 *
 * WHY THIS FILE EXISTS:
 *   Admin creation must never be exposed as an HTTP endpoint. A one-time
 *   terminal script is safer because it runs in a trusted operator context
 *   and it leaves no public attack surface behind.
 *
 * HOW IT WORKS:
 *   1. Prompt the operator for the admin's name, email, password, and
 *      password confirmation.
 *   2. Validate all inputs locally before touching the database.
 *   3. Connect to MongoDB and block creation if an admin already exists.
 *   4. Persist the admin through the User model so the schema's bcrypt
 *      password hashing hook is used consistently.
 *   5. Print clear login instructions and close the database connection.
 */

const SALT_FREE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const createPrompt = () =>
  readline.createInterface({
    input,
    output,
  });

const askText = (question) =>
  new Promise((resolve) => {
    const rl = createPrompt();
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer || "").trim());
    });
  });

const askHiddenText = (question) =>
  new Promise((resolve, reject) => {
    if (!input.isTTY || !output.isTTY) {
      askText(question).then(resolve).catch(reject);
      return;
    }

    let value = "";
    const originalRawMode = Boolean(input.isRaw);

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode(originalRawMode);
      input.pause();
      output.write("\n");
    };

    const finish = () => {
      cleanup();
      resolve(value);
    };

    const onData = (chunk) => {
      const chars = String(chunk);

      for (const char of chars) {
        if (char === "\r" || char === "\n") {
          finish();
          return;
        }

        if (char === "\u0003") {
          cleanup();
          reject(new Error("Admin creation cancelled by user"));
          return;
        }

        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }

        if (char === "\u001b") {
          continue;
        }

        if (char >= " " && char !== "\u007f") {
          value += char;
        }
      }
    };

    output.write(question);
    input.setRawMode(true);
    input.resume();
    input.setEncoding("utf8");
    input.on("data", onData);
  });

const fail = (message) => {
  console.error(`\n[Seed Admin] ${message}`);
  process.exitCode = 1;
  throw new Error(message);
};

const validateInputs = ({ name, email, password, confirmPassword }) => {
  if (!name) {
    fail("Admin name is required.");
  }

  if (name.length < 2 || name.length > 100) {
    fail("Admin name must be between 2 and 100 characters.");
  }

  if (!email) {
    fail("Admin email is required.");
  }

  if (!SALT_FREE_EMAIL.test(email)) {
    fail("Admin email must be a valid email address.");
  }

  if (!password) {
    fail("Admin password is required.");
  }

  if (!STRONG_PASSWORD.test(password)) {
    fail(
      "Admin password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    );
  }

  if (password !== confirmPassword) {
    fail("Password confirmation does not match.");
  }
};

const run = async () => {
  const name = await askText("Enter admin name: ");
  const email = await askText("Enter admin email: ");
  const password = await askHiddenText("Enter admin password: ");
  const confirmPassword = await askHiddenText("Confirm admin password: ");

  validateInputs({ name, email, password, confirmPassword });

  if (!process.env.MONGODB_URI) {
    fail("MONGODB_URI is missing from the environment.");
  }

  await connectDB();

  try {
    const existingAdmin = await User.findOne({ role: "admin" }).select("_id email role");

    if (existingAdmin) {
      fail(
        `An admin already exists in MongoDB (${existingAdmin.email}). Only one admin is allowed.`
      );
    }

    const emailInUse = await User.findOne({ email }).select("_id email role");

    if (emailInUse) {
      fail(
        `A user already exists with ${email}. Use a dedicated email address for the admin account.`
      );
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      isEmailVerified: true,
    });

    console.log("\n[Seed Admin] Admin created successfully.");
    console.log(`[Seed Admin] Email: ${admin.email}`);
    console.log("[Seed Admin] Role: admin");
    console.log("[Seed Admin] Login with the existing POST /api/auth/login endpoint.");
    console.log("[Seed Admin] No verification email is required for this account.");
  } finally {
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error(`[Seed Admin] Failed: ${error.message}`);
  process.exit(1);
});
