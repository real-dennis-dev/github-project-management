const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Load environment variables
dotenv.config();

// Import middleware
const authMiddleware = require("./shared/middleware/auth.middleware");
const validationMiddleware = require("./shared/middleware/validation.middleware");
const errorMiddleware = require("./shared/middleware/error.middleware");
const loggingMiddleware = require("./shared/middleware/logging.middleware");
const securityMiddleware = require("./shared/middleware/security.middleware");
const dataMiddleware = require("./shared/middleware/data.middleware");

// Import logger
const logger = require("./config/logger");

// Import routes (to be implemented)
// const projectRoutes = require('./modules/project-management/routes');
// const githubRoutes = require('./modules/github-integration/routes');
// etc.

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(securityMiddleware.helmetSecurity());
app.use(securityMiddleware.corsHandler());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("combined", { stream: logger.stream }));

// Apply custom logging
app.use(loggingMiddleware.logRequest);
app.use(loggingMiddleware.logPerformance);

// Apply security middleware
app.use(securityMiddleware.sanitizeInput);
app.use(securityMiddleware.rateLimiter());

// Apply data middleware
app.use(dataMiddleware.filterParser);
app.use(dataMiddleware.sortParser);

// Public routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Protected routes (require authentication)
app.use("/api", authMiddleware.authenticate);
app.use(loggingMiddleware.auditLog);

// Mount routes
// app.use('/api/projects', projectRoutes);
// app.use('/api/github', githubRoutes);
// etc.

// Error handling middleware
app.use(errorMiddleware.notFoundHandler);
app.use(errorMiddleware.errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
