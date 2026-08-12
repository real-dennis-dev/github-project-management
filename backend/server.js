const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const logger = require("./common/config/logger");
const { supabaseAdmin, supabase } = require("./common/config/supabase");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

/**
 * Check Supabase connectivity
 */
const checkSupabaseConnection = async () => {
  try {
    logger.info("Checking Supabase connection...");

    const { error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    logger.info("Supabase connection established successfully.");

    return true;
  } catch (error) {
    logger.error("Supabase connection failed.", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return false;
  }
};

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Check Supabase BEFORE starting HTTP server
    const supabaseConnected = await checkSupabaseConnection();

    if (!supabaseConnected) {
      logger.error("Server startup aborted because Supabase is unavailable.");

      process.exit(1);
    }

    const server = app.listen(PORT, HOST, () => {
      logger.info("🚀 Server started successfully");
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
  } catch (error) {
    logger.error("Failed to start server.", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();
