const express = require("express");
const router = express.Router();

// Import controllers
const ReleaseController = require("../controllers/release.controller");
const MilestoneController = require("../controllers/milestone.controller");

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
const {
  releaseSchemas,
  milestoneSchemas,
} = require("../validations/releases-milestones.validation");

// ============================================
// RELEASE ROUTES
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/releases:
 *   get:
 *     summary: Get all releases for a project
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, in_progress, testing, released, cancelled]
 *     responses:
 *       200:
 *         description: List of releases
 */
router.get(
  "/projects/:projectId/releases",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(releaseSchemas.getReleases),
  ReleaseController.getReleases.bind(ReleaseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/releases:
 *   post:
 *     summary: Create a new release
 *     tags: [Releases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *             properties:
 *               version:
 *                 type: string
 *                 pattern: ^\d+\.\d+\.\d+$
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planned, in_progress, testing, released, cancelled]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               release_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Release created
 */
router.post(
  "/projects/:projectId/releases",
  authenticate,
  rateLimiter(),
  validateRequest(releaseSchemas.createRelease),
  ReleaseController.createRelease.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}:
 *   get:
 *     summary: Get a release by ID
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Release details
 */
router.get(
  "/releases/:id",
  authenticate,
  ReleaseController.getReleaseById.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}:
 *   put:
 *     summary: Update a release
 *     tags: [Releases]
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
 *               version:
 *                 type: string
 *                 pattern: ^\d+\.\d+\.\d+$
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planned, in_progress, testing, released, cancelled]
 *               release_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Release updated
 */
router.put(
  "/releases/:id",
  authenticate,
  validateRequest(releaseSchemas.updateRelease),
  ReleaseController.updateRelease.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}/status:
 *   patch:
 *     summary: Update release status
 *     tags: [Releases]
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
 *                 enum: [planned, in_progress, testing, released, cancelled]
 *     responses:
 *       200:
 *         description: Release status updated
 */
router.patch(
  "/releases/:id/status",
  authenticate,
  validateRequest(releaseSchemas.updateReleaseStatus),
  ReleaseController.updateReleaseStatus.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}:
 *   delete:
 *     summary: Delete a release
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Release deleted
 */
router.delete(
  "/releases/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  ReleaseController.deleteRelease.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}/features:
 *   post:
 *     summary: Add features to a release
 *     tags: [Releases]
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
 *               - featureIds
 *             properties:
 *               featureIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Features added to release
 */
router.post(
  "/releases/:id/features",
  authenticate,
  validateRequest(releaseSchemas.addFeaturesToRelease),
  ReleaseController.addFeaturesToRelease.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}/features/{featureId}:
 *   delete:
 *     summary: Remove a feature from a release
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Feature removed from release
 */
router.delete(
  "/releases/:id/features/:featureId",
  authenticate,
  ReleaseController.removeFeatureFromRelease.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}/progress:
 *   get:
 *     summary: Get release progress
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Release progress
 */
router.get(
  "/releases/:id/progress",
  authenticate,
  ReleaseController.getReleaseProgress.bind(ReleaseController)
);

/**
 * @swagger
 * /api/releases/{id}/changelog:
 *   get:
 *     summary: Generate changelog
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Changelog generated
 */
router.get(
  "/releases/:id/changelog",
  authenticate,
  ReleaseController.generateChangelog.bind(ReleaseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/releases/statistics:
 *   get:
 *     summary: Get release statistics
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Release statistics
 */
router.get(
  "/projects/:projectId/releases/statistics",
  authenticate,
  ReleaseController.getReleaseStatistics.bind(ReleaseController)
);

// ============================================
// MILESTONE ROUTES
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   get:
 *     summary: Get all milestones for a project
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed]
 *     responses:
 *       200:
 *         description: List of milestones
 */
router.get(
  "/projects/:projectId/milestones",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(milestoneSchemas.getMilestones),
  MilestoneController.getMilestones.bind(MilestoneController)
);

/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   post:
 *     summary: Create a new milestone
 *     tags: [Milestones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - target_date
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, delayed]
 *               target_date:
 *                 type: string
 *                 format: date
 *               completed_date:
 *                 type: string
 *                 format: date
 *               progress_percentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       201:
 *         description: Milestone created
 */
router.post(
  "/projects/:projectId/milestones",
  authenticate,
  rateLimiter(),
  validateRequest(milestoneSchemas.createMilestone),
  MilestoneController.createMilestone.bind(MilestoneController)
);

/**
 * @swagger
 * /api/milestones/{id}:
 *   get:
 *     summary: Get a milestone by ID
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Milestone details
 */
router.get(
  "/milestones/:id",
  authenticate,
  MilestoneController.getMilestoneById.bind(MilestoneController)
);

/**
 * @swagger
 * /api/milestones/{id}:
 *   put:
 *     summary: Update a milestone
 *     tags: [Milestones]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, delayed]
 *               target_date:
 *                 type: string
 *                 format: date
 *               completed_date:
 *                 type: string
 *                 format: date
 *               progress_percentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Milestone updated
 */
router.put(
  "/milestones/:id",
  authenticate,
  validateRequest(milestoneSchemas.updateMilestone),
  MilestoneController.updateMilestone.bind(MilestoneController)
);

/**
 * @swagger
 * /api/milestones/{id}/status:
 *   patch:
 *     summary: Update milestone status
 *     tags: [Milestones]
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
 *                 enum: [not_started, in_progress, completed, delayed]
 *     responses:
 *       200:
 *         description: Milestone status updated
 */
router.patch(
  "/milestones/:id/status",
  authenticate,
  validateRequest(milestoneSchemas.updateMilestoneStatus),
  MilestoneController.updateMilestoneStatus.bind(MilestoneController)
);

/**
 * @swagger
 * /api/milestones/{id}:
 *   delete:
 *     summary: Delete a milestone
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Milestone deleted
 */
router.delete(
  "/milestones/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  MilestoneController.deleteMilestone.bind(MilestoneController)
);

/**
 * @swagger
 * /api/milestones/{id}/progress:
 *   get:
 *     summary: Get milestone progress
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Milestone progress
 */
router.get(
  "/milestones/:id/progress",
  authenticate,
  MilestoneController.getMilestoneProgress.bind(MilestoneController)
);

/**
 * @swagger
 * /api/projects/{projectId}/milestones/overdue:
 *   get:
 *     summary: Get overdue milestones
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Overdue milestones
 */
router.get(
  "/projects/:projectId/milestones/overdue",
  authenticate,
  MilestoneController.getOverdueMilestones.bind(MilestoneController)
);

/**
 * @swagger
 * /api/projects/{projectId}/milestones/statistics:
 *   get:
 *     summary: Get milestone statistics
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Milestone statistics
 */
router.get(
  "/projects/:projectId/milestones/statistics",
  authenticate,
  MilestoneController.getMilestoneStatistics.bind(MilestoneController)
);

/**
 * @swagger
 * /api/projects/{projectId}/milestones/bulk-update:
 *   post:
 *     summary: Bulk update milestone progress
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     progress_percentage:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *     responses:
 *       200:
 *         description: Milestone progress updated
 */
router.post(
  "/projects/:projectId/milestones/bulk-update",
  authenticate,
  authorize(["admin", "project_manager"]),
  MilestoneController.bulkUpdateProgress.bind(MilestoneController)
);

module.exports = router;
