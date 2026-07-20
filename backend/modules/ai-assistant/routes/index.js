const express = require("express");
const router = express.Router();

// Import controllers
const AIAssistantController = require("../controllers/ai-assistant.controller");

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
  rateLimiter,
} = require("../../../common/middleware/security.middleware");

// Import module middleware
const AIMiddleware = require("../middleware/ai-assistant.middleware");

// Import validation schemas
const { aiSchemas } = require("../validations/ai-assistant.validation");

// ============================================
// AI ASSISTANT ROUTES
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/ai/ask:
 *   post:
 *     summary: Ask AI a question about the project
 *     tags: [AI Assistant]
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
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Question to ask the AI
 *               context:
 *                 type: object
 *                 properties:
 *                   includeFeatures:
 *                     type: boolean
 *                   includeBugs:
 *                     type: boolean
 *                   includeDecisions:
 *                     type: boolean
 *                   includeRisks:
 *                     type: boolean
 *                   includeMilestones:
 *                     type: boolean
 *                   includeTechDebt:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: AI response
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/projects/:projectId/ai/ask",
  authenticate,
  AIMiddleware.validateProjectExists,
  AIMiddleware.validateProviderAvailability,
  AIMiddleware.validateAILimits,
  AIMiddleware.rateLimitAI,
  AIMiddleware.sanitizeAIInput,
  validateRequest(aiSchemas.askQuestion),
  AIMiddleware.logAIActivity,
  AIMiddleware.validateResponseQuality,
  AIAssistantController.askQuestion.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/projects/{projectId}/ai/analyze:
 *   post:
 *     summary: Analyze the project and provide insights
 *     tags: [AI Assistant]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               focus:
 *                 type: string
 *                 enum: [overall, risks, performance, quality, resources, timeline]
 *                 default: overall
 *               depth:
 *                 type: string
 *                 enum: [quick, standard, deep]
 *                 default: standard
 *     responses:
 *       200:
 *         description: Project analysis
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/projects/:projectId/ai/analyze",
  authenticate,
  AIMiddleware.validateProjectExists,
  AIMiddleware.validateProviderAvailability,
  AIMiddleware.validateAILimits,
  AIMiddleware.rateLimitAI,
  validateRequest(aiSchemas.analyzeProject),
  AIMiddleware.logAIActivity,
  AIAssistantController.analyzeProject.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/projects/{projectId}/ai/conversations:
 *   get:
 *     summary: Get conversation history
 *     tags: [AI Assistant]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: questionContains
 *         schema:
 *           type: string
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
 *         description: Conversation history
 */
router.get(
  "/projects/:projectId/ai/conversations",
  authenticate,
  AIMiddleware.validateProjectExists,
  validateQuery(aiSchemas.getConversations),
  AIMiddleware.logAIActivity,
  AIAssistantController.getConversations.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   get:
 *     summary: Get a specific conversation
 *     tags: [AI Assistant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversation details
 *       404:
 *         description: Conversation not found
 */
router.get(
  "/ai/conversations/:id",
  authenticate,
  AIMiddleware.logAIActivity,
  AIAssistantController.getConversation.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/ai/summarize:
 *   post:
 *     summary: Summarize text
 *     tags: [AI Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to summarize
 *               maxLength:
 *                 type: integer
 *                 default: 500
 *               format:
 *                 type: string
 *                 enum: [paragraph, bullet, numbered]
 *                 default: paragraph
 *     responses:
 *       200:
 *         description: Summarized text
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/ai/summarize",
  authenticate,
  AIMiddleware.validateProviderAvailability,
  AIMiddleware.rateLimitAI,
  AIMiddleware.sanitizeAIInput,
  validateRequest(aiSchemas.summarizeText),
  AIMiddleware.logAIActivity,
  AIAssistantController.summarizeText.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/projects/{projectId}/ai/report:
 *   post:
 *     summary: Generate an AI-powered report
 *     tags: [AI Assistant]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [executive, technical, risk, progress, comprehensive]
 *                 default: comprehensive
 *               format:
 *                 type: string
 *                 enum: [json, markdown, html]
 *                 default: json
 *               includeCharts:
 *                 type: boolean
 *                 default: false
 *               period:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Generated report
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/projects/:projectId/ai/report",
  authenticate,
  AIMiddleware.validateProjectExists,
  AIMiddleware.validateProviderAvailability,
  AIMiddleware.validateAILimits,
  AIMiddleware.rateLimitAI,
  validateRequest(aiSchemas.generateReport),
  AIMiddleware.logAIActivity,
  AIAssistantController.generateReport.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/projects/{projectId}/ai/actions:
 *   get:
 *     summary: Get suggested next actions
 *     tags: [AI Assistant]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Suggested actions
 *       429:
 *         description: Rate limit exceeded
 */
router.get(
  "/projects/:projectId/ai/actions",
  authenticate,
  AIMiddleware.validateProjectExists,
  AIMiddleware.validateProviderAvailability,
  AIMiddleware.rateLimitAI,
  AIMiddleware.logAIActivity,
  AIAssistantController.suggestNextActions.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/projects/{projectId}/ai/trends:
 *   get:
 *     summary: Analyze project trends
 *     tags: [AI Assistant]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trend analysis
 *       429:
 *         description: Rate limit exceeded
 */
router.get(
  "/projects/:projectId/ai/trends",
  authenticate,
  AIMiddleware.validateProjectExists,
  AIMiddleware.validateProviderAvailability,
  AIMiddleware.rateLimitAI,
  AIMiddleware.logAIActivity,
  AIAssistantController.analyzeTrends.bind(AIAssistantController)
);

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Get AI assistant status
 *     tags: [AI Assistant]
 *     responses:
 *       200:
 *         description: AI assistant status
 */
router.get(
  "/ai/status",
  authenticate,
  AIAssistantController.getStatus.bind(AIAssistantController)
);

module.exports = router;
