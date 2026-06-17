/**
 * db.js
 *
 * WHY IT EXISTS:
 *   Centralises the MongoDB connection setup so it can be called once at
 *   startup and never duplicated. Uses Mongoose's built-in connection pooling.
 */

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    // console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    console.log(`[DB] Connected to MongoDB`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.info("[DB] MongoDB reconnected");
});

export default connectDB;