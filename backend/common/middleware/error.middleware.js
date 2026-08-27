const logger = require("../config/logger");

class ErrorMiddleware {
  // Global error handler
  errorHandler(err, req, res, next) {
    logger.error("Error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    // Handle Supabase errors
    if (err.code && err.code.startsWith("PGRST")) {
      return res.status(400).json({
        error: "Database error",
        details: err.message,
      });
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        details: err.message,
      });
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: err.details || err.message,
      });
    }

    // Default error
    const status = err.status || 500;
    const message = err.message || "Internal server error";

    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handles 404 errors
  notFoundHandler(req, res, next) {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
      method: req.method,
    });
  }

  // Handles validation errors
  validationErrorHandler(err, req, res, next) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: err.details || err.message,
      });
    }
    next(err);
  }
}

module.exports = new ErrorMiddleware();
const stringUtils = new StringUtils();

module.exports = stringUtils;
module.exports.stringUtils = stringUtils;
