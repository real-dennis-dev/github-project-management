// src/modules/progress-timeline/routes/progress.routes.js
const express = require("express");

const { ProgressController } = require("../controllers/progress.controller");
const { ProgressMiddleware } = require("../middleware/progress.middleware");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const SecurityMiddleware = require("../../../common/middleware/security.middleware");
const DataMiddleware = require("../../../common/middleware/data.middleware");
const router = express.Router();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

// ==================== TIMELINE ROUTES ====================

/**
 * GET /api/projects/:projectId/timeline
 * Get project timeline with filtering
 */
router.get(
  "/projects/:projectId/timeline",
  ProgressMiddleware.validateProjectIdParam,
  ProgressMiddleware.validateProjectId,
  ProgressMiddleware.validateTimelineQuery,
  DataMiddleware.pagination,
  DataMiddleware.filterParser,
  DataMiddleware.sortParser,
  ProgressController.getTimeline
);

/**
 * POST /api/projects/:projectId/timeline
 * Add timeline entry
 */
router.post(
  "/projects/:projectId/timeline",
  ProgressMiddleware.validateProjectIdParam,
  ProgressMiddleware.validateProjectId,
  ProgressMiddleware.validateCreateTimelineEntry,
  ProgressMiddleware.checkDuplicateEntry,
  SecurityMiddleware.rateLimiter(),
  ProgressController.addTimelineEntry
);

/**
 * POST /api/projects/:projectId/timeline/bulk
 * Bulk add timeline entries
 */
router.post(
  "/projects/:projectId/timeline/bulk",
  ProgressMiddleware.validateProjectIdParam,
  ProgressMiddleware.validateProjectId,
  SecurityMiddleware.rateLimiter(),
  ProgressController.bulkAddTimelineEntries
);

/**
 * PUT /api/timeline/:id
 * Update timeline entry
 */
router.put(
  "/timeline/:id",
  ProgressMiddleware.validateTimelineIdParam,
  ProgressMiddleware.validateTimelineId,
  ProgressMiddleware.validateUpdateTimelineEntry,
  SecurityMiddleware.rateLimiter(),
  ProgressController.updateTimelineEntry
);

/**
 * DELETE /api/timeline/:id
 * Delete timeline entry
 */
router.delete(
  "/timeline/:id",
  ProgressMiddleware.validateTimelineIdParam,
  ProgressMiddleware.validateTimelineId,
  ProgressMiddleware.checkLastEntryForFeature,
  SecurityMiddleware.rateLimiter(),
  ProgressController.deleteTimelineEntry
);

// ==================== OVERVIEW & REPORT ROUTES ====================

/**
 * GET /api/projects/:projectId/progress-overview
 * Get progress overview
 */
router.get(
  "/projects/:projectId/progress-overview",
  ProgressMiddleware.validateProjectIdParam,
  ProgressMiddleware.validateProjectId,
  ProgressController.getProgressOverview
);

/**
 * GET /api/projects/:projectId/monthly-progress
 * Get monthly progress
 */
router.get(
  "/projects/:projectId/monthly-progress",
  ProgressMiddleware.validateProjectIdParam,
  ProgressMiddleware.validateProjectId,
  ProgressMiddleware.validateMonthlyProgressQuery,
  ProgressController.getMonthlyProgress
);

/**
 * GET /api/projects/:projectId/progress-report
 * Generate progress report
 */
router.get(
  "/projects/:projectId/progress-report",
  ProgressMiddleware.validateProjectIdParam,
  ProgressMiddleware.validateProjectId,
  SecurityMiddleware.rateLimiter(),
  ProgressController.generateProgressReport
);

module.exports = router;
