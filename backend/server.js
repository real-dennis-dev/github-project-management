const express = require("express");
const dotenv = require("dotenv");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Load environment variables
dotenv.config();

// Import middleware
const authMiddleware = require("./shared/middleware/auth.middleware");
const validationMiddleware = require("./shared/middleware/validation.middleware");
const errorMiddleware = require("./shared/middleware/error.middleware");
const loggingMiddleware = require("./shared/middleware/logging.middleware");
const securityMiddleware = require("./shared/middleware/security.middleware");
const dataMiddleware = require("./shared/middleware/data.middleware");

// Routes
const progressRoutes = require("./modules/progress-timeline/routes/progress.routes");
const documentationRoutes = require("./modules/documentation-knowledge/routes");

// Logger
const logger = require("./config/logger");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Global Middleware
// =======================

app.use(securityMiddleware.helmetSecurity());
app.use(securityMiddleware.corsHandler());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Custom logging
app.use(loggingMiddleware.logRequest);
app.use(loggingMiddleware.logPerformance);

// Security middleware
app.use(securityMiddleware.sanitizeInput);
app.use(securityMiddleware.rateLimiter());

// Data middleware
app.use(dataMiddleware.filterParser);
app.use(dataMiddleware.sortParser);

// =======================
// Public Routes
// =======================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// =======================
// Protected Routes
// =======================

app.use("/api", authMiddleware.authenticate);

app.use(loggingMiddleware.auditLog);

// =======================
// Swagger Documentation
// =======================

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Documentation & Knowledge Base API",
      version: "1.0.0",
      description: "API for managing project documentation and knowledge base",

      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/modules/*/swagger/*.swagger.js", "./src/modules/*/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =======================
// API Routes
// =======================

app.use("/api", progressRoutes);

app.use("/api", documentationRoutes);

// =======================
// Error Handling
// =======================

app.use(errorMiddleware.notFoundHandler);

app.use(errorMiddleware.errorHandler);

// =======================
// Start Server
// =======================

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
