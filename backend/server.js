const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const logger = require("./common/config/logger");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  logger.info("🚀 Server started successfully");
  logger.info(`Environment : ${process.env.NODE_ENV || "development"}`);
  logger.info(`Host        : ${HOST}`);
  logger.info(`Port        : ${PORT}`);
  logger.info(`URL         : http://localhost:${PORT}`);
});

/**
 * Graceful shutdown
 */
const shutdown = (signal) => {
  logger.warn(`${signal} received. Shutting down server...`);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection", {
    reason,
    promise,
  });
});

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });

  process.exit(1);
});
