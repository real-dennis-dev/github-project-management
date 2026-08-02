const express = require("express");
const router = express.Router();

// Import controller
const TechDebtController = require("../controllers/tech-debt.controller");

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

// Import validation schemas
const { techDebtSchemas } = require("../validations/tech-debt.validation");

// Import custom middleware
const TechDebtMiddleware = require("../middleware/tech-debt.middleware");

// ============================================
// TECH DEBT ROUTES
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt:
 *   get:
 *     summary: Get all tech debt items for a project
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [identified, planned, in_progress, resolved, ignored]
 *       - in: query
 *         name: search
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
 *         description: List of tech debt items
 */
router.get(
  "/projects/:projectId/tech-debt",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(techDebtSchemas.getTechDebt),
  TechDebtController.getTechDebt.bind(TechDebtController)
);

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt:
 *   post:
 *     summary: Create a new tech debt item
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - reason
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               reason:
 *                 type: string
 *               impact:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [identified, planned, in_progress, resolved, ignored]
 *               estimated_effort_hours:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tech debt item created
 */
router.post(
  "/projects/:projectId/tech-debt",
  authenticate,
  rateLimiter(),
  TechDebtMiddleware.sanitizeTechDebtData,
  validateRequest(techDebtSchemas.createTechDebt),
  TechDebtController.createTechDebt.bind(TechDebtController)
);

/**
 * @swagger
 * /api/tech-debt/{id}:
 *   get:
 *     summary: Get a tech debt item by ID
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tech debt item details
 */
router.get(
  "/tech-debt/:id",
  authenticate,
  TechDebtMiddleware.validateTechDebtExists,
  TechDebtController.getTechDebtById.bind(TechDebtController)
);

/**
 * @swagger
 * /api/tech-debt/{id}:
 *   put:
 *     summary: Update a tech debt item
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               reason:
 *                 type: string
 *               impact:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [identified, planned, in_progress, resolved, ignored]
 *               estimated_effort_hours:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tech debt item updated
 */
router.put(
  "/tech-debt/:id",
  authenticate,
  TechDebtMiddleware.validateTechDebtExists,
  TechDebtMiddleware.checkModificationPermission,
  TechDebtMiddleware.sanitizeTechDebtData,
  validateRequest(techDebtSchemas.updateTechDebt),
  TechDebtController.updateTechDebt.bind(TechDebtController)
);

/**
 * @swagger
 * /api/tech-debt/{id}/status:
 *   patch:
 *     summary: Update tech debt status
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [identified, planned, in_progress, resolved, ignored]
 *     responses:
 *       200:
 *         description: Tech debt status updated
 */
router.patch(
  "/tech-debt/:id/status",
  authenticate,
  TechDebtMiddleware.validateTechDebtExists,
  TechDebtMiddleware.checkModificationPermission,
  validateRequest(techDebtSchemas.updateTechDebtStatus),
  TechDebtController.updateTechDebtStatus.bind(TechDebtController)
);

/**
 * @swagger
 * /api/tech-debt/{id}:
 *   delete:
 *     summary: Delete a tech debt item
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tech debt item deleted
 */
router.delete(
  "/tech-debt/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  TechDebtMiddleware.validateTechDebtExists,
  TechDebtController.deleteTechDebt.bind(TechDebtController)
);

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt/overview:
 *   get:
 *     summary: Get tech debt overview
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tech debt overview with metrics
 */
router.get(
  "/projects/:projectId/tech-debt/overview",
  authenticate,
  TechDebtController.getTechDebtOverview.bind(TechDebtController)
);

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt/score:
 *   get:
 *     summary: Get tech debt score
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tech debt score and recommendations
 */
router.get(
  "/projects/:projectId/tech-debt/score",
  authenticate,
  TechDebtController.getTechDebtScore.bind(TechDebtController)
);

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt/statistics:
 *   get:
 *     summary: Get tech debt statistics
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tech debt statistics
 */
router.get(
  "/projects/:projectId/tech-debt/statistics",
  authenticate,
  TechDebtController.getTechDebtStatistics.bind(TechDebtController)
);

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt/export:
 *   get:
 *     summary: Export tech debt items
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *     responses:
 *       200:
 *         description: Exported tech debt data
 */
router.get(
  "/projects/:projectId/tech-debt/export",
  authenticate,
  TechDebtController.exportTechDebt.bind(TechDebtController)
);

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt/refactoring-suggestions:
 *   get:
 *     summary: Get refactoring suggestions
 *     tags: [TechDebt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Refactoring suggestions
 */
router.get(
  "/projects/:projectId/tech-debt/refactoring-suggestions",
  authenticate,
  TechDebtController.getRefactoringSuggestions.bind(TechDebtController)
);

module.exports = router;
