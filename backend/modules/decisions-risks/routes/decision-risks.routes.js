const express = require("express");
const router = express.Router();

// Import controllers
const DecisionController = require("../controllers/decision.controller");
const RiskController = require("../controllers/risk.controller");
const DecisionRiskStatsController = require("../controllers/decision-risk-stats.controller");
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
  decisionSchemas,
  riskSchemas,
  decisionRiskStatsSchema,
} = require("../validations/decisions-risks.validation");

// ============================================
// DECISION ROUTES
// ============================================

/**
 * @swagger
 * /api/decisions-risks/stats:
 *   get:
 *     summary: Get decisions and risks dashboard statistics
 *     description: >
 *       Returns aggregated decision and risk statistics across
 *       all projects available to the authenticated user.
 *     tags:
 *       - Decisions & Risks Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional project filter
 *
 *       - in: query
 *         name: decisionImpact
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - low
 *             - medium
 *             - high
 *             - critical
 *         description: Filter decisions by impact
 *
 *       - in: query
 *         name: riskLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - low
 *             - medium
 *             - high
 *             - critical
 *         description: Filter risks by risk level
 *
 *       - in: query
 *         name: riskStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - identified
 *             - monitoring
 *             - mitigated
 *             - realized
 *             - closed
 *         description: Filter risks by status
 *
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for dashboard statistics
 *
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for dashboard statistics
 *
 *       - in: query
 *         name: months
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 12
 *         description: Number of months to return in trend data
 *
 *     responses:
 *       200:
 *         description: Decision and risk dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Decision and risk statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/DecisionRiskDashboardStats'
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  "/decisions-risks/stats",
  authenticate,
  rateLimiter(),
  validateQuery(decisionRiskStatsSchema),
  DecisionRiskStatsController.getDecisionRiskStats.bind(
    DecisionRiskStatsController
  )
);
/**
 * @swagger
 * /api/projects/{projectId}/decisions:
 *   get:
 *     summary: Get all decisions for a project
 *     tags: [Decisions]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: impact
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of decisions
 */
router.get(
  "/projects/:projectId/decisions",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(decisionSchemas.getDecisions),
  DecisionController.getDecisions.bind(DecisionController)
);

/**
 * @swagger
 * /api/projects/{projectId}/decisions:
 *   post:
 *     summary: Create a new decision
 *     tags: [Decisions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - decision
 *               - reason
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               decision:
 *                 type: string
 *               reason:
 *                 type: string
 *               impact:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               alternatives:
 *                 type: string
 *               decision_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Decision created
 */
router.post(
  "/projects/:projectId/decisions",
  authenticate,
  rateLimiter(),
  validateRequest(decisionSchemas.createDecision),
  DecisionController.createDecision.bind(DecisionController)
);

/**
 * @swagger
 * /api/decisions/{id}:
 *   get:
 *     summary: Get a decision by ID
 *     tags: [Decisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Decision details
 */
router.get(
  "/decisions/:id",
  authenticate,
  DecisionController.getDecisionById.bind(DecisionController)
);

/**
 * @swagger
 * /api/decisions/{id}:
 *   put:
 *     summary: Update a decision
 *     tags: [Decisions]
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
 *               decision:
 *                 type: string
 *               reason:
 *                 type: string
 *               impact:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               alternatives:
 *                 type: string
 *               decision_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Decision updated
 */
router.put(
  "/decisions/:id",
  authenticate,
  validateRequest(decisionSchemas.updateDecision),
  DecisionController.updateDecision.bind(DecisionController)
);

/**
 * @swagger
 * /api/decisions/{id}:
 *   delete:
 *     summary: Delete a decision
 *     tags: [Decisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Decision deleted
 */
router.delete(
  "/decisions/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  DecisionController.deleteDecision.bind(DecisionController)
);

/**
 * @swagger
 * /api/projects/{projectId}/decisions/export:
 *   get:
 *     summary: Export decisions
 *     tags: [Decisions]
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
 *         description: Decision report
 */
router.get(
  "/projects/:projectId/decisions/export",
  authenticate,
  DecisionController.exportDecisions.bind(DecisionController)
);

/**
 * @swagger
 * /api/projects/{projectId}/decisions/statistics:
 *   get:
 *     summary: Get decision statistics
 *     tags: [Decisions]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Decision statistics
 */
router.get(
  "/projects/:projectId/decisions/statistics",
  authenticate,
  DecisionController.getDecisionStatistics.bind(DecisionController)
);

// ============================================
// RISK ROUTES
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/risks:
 *   get:
 *     summary: Get all risks for a project
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *     responses:
 *       200:
 *         description: List of risks
 */
router.get(
  "/projects/:projectId/risks",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(riskSchemas.getRisks),
  RiskController.getRisks.bind(RiskController)
);

/**
 * @swagger
 * /api/projects/{projectId}/risks:
 *   post:
 *     summary: Create a new risk
 *     tags: [Risks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               risk_level:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [identified, monitoring, mitigated, realized, closed]
 *               reason:
 *                 type: string
 *               mitigation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk created
 */
router.post(
  "/projects/:projectId/risks",
  authenticate,
  rateLimiter(),
  validateRequest(riskSchemas.createRisk),
  RiskController.createRisk.bind(RiskController)
);

/**
 * @swagger
 * /api/risks/{id}:
 *   get:
 *     summary: Get a risk by ID
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Risk details
 */
router.get(
  "/risks/:id",
  authenticate,
  RiskController.getRiskById.bind(RiskController)
);

/**
 * @swagger
 * /api/risks/{id}:
 *   put:
 *     summary: Update a risk
 *     tags: [Risks]
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
 *               risk_level:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [identified, monitoring, mitigated, realized, closed]
 *               reason:
 *                 type: string
 *               mitigation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk updated
 */
router.put(
  "/risks/:id",
  authenticate,
  validateRequest(riskSchemas.updateRisk),
  RiskController.updateRisk.bind(RiskController)
);

/**
 * @swagger
 * /api/risks/{id}/status:
 *   patch:
 *     summary: Update risk status
 *     tags: [Risks]
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
 *                 enum: [identified, monitoring, mitigated, realized, closed]
 *     responses:
 *       200:
 *         description: Risk status updated
 */
router.patch(
  "/risks/:id/status",
  authenticate,
  validateRequest(riskSchemas.updateRiskStatus),
  RiskController.updateRiskStatus.bind(RiskController)
);

/**
 * @swagger
 * /api/risks/{id}:
 *   delete:
 *     summary: Delete a risk
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Risk deleted
 */
router.delete(
  "/risks/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  RiskController.deleteRisk.bind(RiskController)
);

/**
 * @swagger
 * /api/projects/{projectId}/risks/status/{status}:
 *   get:
 *     summary: Get risks by status
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *     responses:
 *       200:
 *         description: Risks with given status
 */
router.get(
  "/projects/:projectId/risks/status/:status",
  authenticate,
  RiskController.getRisksByStatus.bind(RiskController)
);

/**
 * @swagger
 * /api/projects/{projectId}/risks/report:
 *   get:
 *     summary: Generate risk report
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Risk report
 */
router.get(
  "/projects/:projectId/risks/report",
  authenticate,
  RiskController.generateRiskReport.bind(RiskController)
);

/**
 * @swagger
 * /api/projects/{projectId}/risks/score:
 *   get:
 *     summary: Get project risk score
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Risk score summary
 */
router.get(
  "/projects/:projectId/risks/score",
  authenticate,
  RiskController.getProjectRiskScore.bind(RiskController)
);

/**
 * @swagger
 * /api/projects/{projectId}/risks/matrix:
 *   get:
 *     summary: Get risk matrix
 *     tags: [Risks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Risk matrix data
 */
router.get(
  "/projects/:projectId/risks/matrix",
  authenticate,
  RiskController.getRiskMatrix.bind(RiskController)
);

module.exports = router;
