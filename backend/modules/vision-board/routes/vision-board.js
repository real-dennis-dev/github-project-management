const express = require("express");
const router = express.Router();

// Import controllers
const VisionBoardController = require("../controllers/vision-board.controller");

// Import middleware
const {
  authenticate,
  authorize,
} = require("../../../common/middleware/auth.middleware");
const {
  validateRequest,
  validateQuery,
} = require("../../../common/middleware/validation.middleware");
const {
  pagination,
  filterParser,
  sortParser,
} = require("../../../common/middleware/data.middleware");
const {
  rateLimiter,
} = require("../../../common/middleware/security.middleware");
const VisionBoardMiddleware = require("../middleware/vision-board.middleware");

// Import validation schemas
const { visionSchemas } = require("../validations/vision-board.validation");

// ============================================
// VISION BOARD ROUTES
// ============================================
/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get Vision Board dashboard
 *     description: |
 *       Returns aggregated Vision Board statistics and recent
 *       vision goals across all projects. This endpoint does
 *       not require or accept a project ID.
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Dashboard page number
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of dashboard items to return
 *
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort dashboard items by latest activity
 *
 *     responses:
 *       200:
 *         description: Vision Board dashboard retrieved successfully
 *
 *       400:
 *         description: Invalid query parameters
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/dashboard",
  authenticate,
  validateQuery(visionSchemas.getDashboard),
  VisionBoardController.getDashboard.bind(VisionBoardController)
);
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all vision goals
 *     tags: [Vision Board]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of vision goals
 */
router.get(
  "/",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(visionSchemas.getGoals),
  VisionBoardController.getGoals.bind(VisionBoardController)
);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new vision goal
 *     tags: [Vision Board]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goal
 *             properties:
 *               goal:
 *                 type: string
 *               description:
 *                 type: string
 *               target_timeline:
 *                 type: string
 *               priority:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, archived]
 *     responses:
 *       201:
 *         description: Vision goal created
 */
router.post(
  "/",
  authenticate,
  rateLimiter(),
  VisionBoardMiddleware.sanitizeGoalData,
  validateRequest(visionSchemas.createGoal),
  VisionBoardController.createGoal.bind(VisionBoardController)
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Vision Board]
 *     responses:
 *       200:
 *         description: Categories list
 */
router.get(
  "/categories",
  authenticate,
  VisionBoardController.getCategories.bind(VisionBoardController)
);

/**
 * @swagger
 * /statistics:
 *   get:
 *     summary: Get vision board statistics
 *     tags: [Vision Board]
 *     responses:
 *       200:
 *         description: Statistics
 */
router.get(
  "/statistics",
  authenticate,
  VisionBoardController.getStatistics.bind(VisionBoardController)
);

/**
 * @swagger
 * /options:
 *   get:
 *     summary: Get options for UI
 *     tags: [Vision Board]
 *     responses:
 *       200:
 *         description: UI options
 */
router.get(
  "/options",
  authenticate,
  VisionBoardController.getOptions.bind(VisionBoardController)
);

/**
 * @swagger
 * /export:
 *   get:
 *     summary: Export vision goals
 *     tags: [Vision Board]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Exported data
 */
router.get(
  "/export",
  authenticate,
  VisionBoardController.exportGoals.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get a vision goal by ID
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vision goal details
 */
router.get(
  "/:id",
  authenticate,
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardController.getGoalById.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a vision goal
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal:
 *                 type: string
 *               description:
 *                 type: string
 *               target_timeline:
 *                 type: string
 *               priority:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, archived]
 *     responses:
 *       200:
 *         description: Vision goal updated
 */
router.put(
  "/:id",
  authenticate,
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardMiddleware.checkModificationPermission,
  VisionBoardMiddleware.sanitizeGoalData,
  validateRequest(visionSchemas.updateGoal),
  VisionBoardController.updateGoal.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a vision goal
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vision goal deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardController.deleteGoal.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}/projects:
 *   post:
 *     summary: Link a project to a vision goal
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *             properties:
 *               project_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Project linked successfully
 */
router.post(
  "/:id/projects",
  authenticate,
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardMiddleware.validateProjectExists,
  VisionBoardMiddleware.validateLinkNotExists,
  validateRequest(visionSchemas.linkProject),
  VisionBoardController.linkProjectToVision.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}/projects/{projectId}:
 *   delete:
 *     summary: Unlink a project from a vision goal
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project unlinked successfully
 */
router.delete(
  "/:id/projects/:projectId",
  authenticate,
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardMiddleware.validateProjectExists,
  VisionBoardMiddleware.validateLinkExists,
  VisionBoardController.unlinkProjectFromVision.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}/progress:
 *   get:
 *     summary: Get goal progress
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Goal progress
 */
router.get(
  "/:id/progress",
  authenticate,
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardController.getGoalProgress.bind(VisionBoardController)
);

/**
 * @swagger
 * /{id}/available-projects:
 *   get:
 *     summary: Get available projects for linking
 *     tags: [Vision Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Available projects
 */
router.get(
  "/:id/available-projects",
  authenticate,
  VisionBoardMiddleware.validateVisionGoalExists,
  VisionBoardController.getAvailableProjects.bind(VisionBoardController)
);

module.exports = router;
