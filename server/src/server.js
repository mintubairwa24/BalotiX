/**
 * server.js
 *
 * WHY IT EXISTS:
 *   Separates the HTTP server startup from the Express app definition.
 *   This makes app.js importable in tests without binding to a port.
 */

import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] NextCart API running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  });

  process.on("SIGTERM", () => {
    console.log("[Server] SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("[Server] HTTP server closed");
      process.exit(0);
    });
  });
};

startServer();