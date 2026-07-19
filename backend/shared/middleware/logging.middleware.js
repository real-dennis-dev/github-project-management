const logger = require("../../config/logger");

class LoggingMiddleware {
  // Logs incoming requests
  logRequest(req, res, next) {
    const start = Date.now();

    // Log request
    logger.info("Request received:", {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Log response when finished
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info("Request completed:", {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }

  // Logs response time
  logPerformance(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        logger.warn("Slow request detected:", {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
        });
      }
    });

    next();
  }

  // Logs critical operations
  auditLog(req, res, next) {
    const originalSend = res.send;
    res.send = function (data) {
      // Log critical operations
      const isCritical = ["POST", "PUT", "PATCH", "DELETE"].includes(
        req.method
      );
      if (isCritical) {
        logger.info("Audit log:", {
          user: req.user?.id || "anonymous",
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          data: JSON.parse(data || "{}"),
        });
      }
      originalSend.call(this, data);
    };
    next();
  }
}

module.exports = new LoggingMiddleware();
