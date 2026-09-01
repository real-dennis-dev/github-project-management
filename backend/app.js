const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Load environment variables
dotenv.config();

// Import middleware
const errorMiddleware = require("./common/middleware/error.middleware");
const loggingMiddleware = require("./common/middleware/logging.middleware");
const securityMiddleware = require("./common/middleware/security.middleware");
const dataMiddleware = require("./common/middleware/data.middleware");

// Routes
// const AIAssistantRoutes = require("./modules/ai-assistant/routes/ai-assistant.routes");
const authRoutes = require("./modules/auth/routes/auth.routes");
const dailyJournalRoutes = require("./modules/daily-journal/routes/daily-journal.routes");
const decisionRisksRoutes = require("./modules/decisions-risks/routes/decision-risks.routes");
const documentationRoutes = require("./modules/documentation-knowledge/routes/documentation-knowledge");
const expensesRoutes = require("./modules/expenses/routes/expense.routes");
const githubIntegrationRoutes = require("./modules/github-integration/routes/github-integration.routes");
const progressRoutes = require("./modules/progress-timeline/routes/progress.routes");
const bugRoutes = require("./modules/project-management/routes/bug.routes");
const featureRoutes = require("./modules/project-management/routes/feature.routes");
const projectRoutes = require("./modules/project-management/routes/project.routes");
const releaseMilestoneRoutes = require("./modules/releases-milestones/routes/release-milestone.routes");
const techDebtRoutes = require("./modules/tech-debt/routes/tech-debt.routes");
const visionBoardRoutes = require("./modules/vision-board/routes/vision-board");

// Logger
const logger = require("./common/config/logger");

// Create Express app
const app = express();

// =======================
// Global Middleware
// =======================

app.use(securityMiddleware.helmetSecurity());
app.use(securityMiddleware.corsHandler());
app.use(cookieParser());
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
// app.use(securityMiddleware.rateLimiter());

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
// AI Assistant
// app.use("/api/ai", AIAssistantRoutes);

// Authentication
app.use("/api/auth", authRoutes);

// Personal Management
app.use("/api", dailyJournalRoutes);
app.use("/api", decisionRisksRoutes);
app.use("/api/documentation", documentationRoutes);
app.use("/api", expensesRoutes);

// Integrations
app.use("/api/github", githubIntegrationRoutes);

// Project Management
app.use("/api", progressRoutes);
app.use("/api", bugRoutes);
app.use("/api", featureRoutes);
app.use("/api", projectRoutes);
app.use("/api/releases", releaseMilestoneRoutes);
app.use("/api", techDebtRoutes);
app.use("/api/vision-board", visionBoardRoutes);

// =======================
// Error Handling
// =======================

app.use(errorMiddleware.notFoundHandler);
app.use(errorMiddleware.errorHandler);

module.exports = app;
