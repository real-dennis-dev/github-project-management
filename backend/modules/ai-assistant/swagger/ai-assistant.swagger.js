/**
 * Swagger documentation for AI Assistant Module
 */

// ============================================
// AI ASSISTANT SCHEMAS
// ============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     AIQuestion:
 *       type: object
 *       required:
 *         - question
 *       properties:
 *         question:
 *           type: string
 *           description: The question to ask the AI
 *           example: "What are the main risks in this project?"
 *         context:
 *           type: object
 *           properties:
 *             includeFeatures:
 *               type: boolean
 *               default: true
 *             includeBugs:
 *               type: boolean
 *               default: true
 *             includeDecisions:
 *               type: boolean
 *               default: true
 *             includeRisks:
 *               type: boolean
 *               default: true
 *             includeMilestones:
 *               type: boolean
 *               default: true
 *             includeTechDebt:
 *               type: boolean
 *               default: true
 *
 *     AIResponse:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           example: "What are the main risks in this project?"
 *         response:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             type:
 *               type: string
 *             data:
 *               type: object
 *             raw:
 *               type: string
 *         quality:
 *           type: object
 *           properties:
 *             isValid:
 *               type: boolean
 *             issues:
 *               type: array
 *               items:
 *                 type: string
 *             metrics:
 *               type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *         context:
 *           type: object
 *           properties:
 *             projectName:
 *               type: string
 *             projectStatus:
 *               type: string
 *             featuresCount:
 *               type: integer
 *             bugsCount:
 *               type: integer
 *
 *     ProjectAnalysis:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           format: uuid
 *         focus:
 *           type: string
 *           enum: [overall, risks, performance, quality, resources, timeline]
 *         depth:
 *           type: string
 *           enum: [quick, standard, deep]
 *         analysis:
 *           type: object
 *         summary:
 *           type: string
 *         actions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               priority:
 *                 type: string
 *               source:
 *                 type: string
 *         metrics:
 *           type: object
 *           properties:
 *             features:
 *               type: integer
 *             bugs:
 *               type: integer
 *             decisions:
 *               type: integer
 *             risks:
 *               type: integer
 *             milestones:
 *               type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     TextSummary:
 *       type: object
 *       properties:
 *         originalLength:
 *           type: integer
 *         summaryLength:
 *           type: integer
 *         summary:
 *           type: object
 *         format:
 *           type: string
 *           enum: [paragraph, bullet, numbered]
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     Report:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [executive, technical, risk, progress, comprehensive]
 *         report:
 *           type: object
 *         sections:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *         summary:
 *           type: string
 *         metrics:
 *           type: object
 *         options:
 *           type: object
 *         generatedAt:
 *           type: string
 *           format: date-time
 *
 *     NextActions:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           format: uuid
 *         actions:
 *           type: object
 *           properties:
 *             immediate:
 *               type: array
 *               items:
 *                 type: object
 *             shortTerm:
 *               type: array
 *               items:
 *                 type: object
 *             mediumTerm:
 *               type: array
 *               items:
 *                 type: object
 *             longTerm:
 *               type: array
 *               items:
 *                 type: object
 *         summary:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     TrendAnalysis:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           format: uuid
 *         trends:
 *           type: object
 *           properties:
 *             positive:
 *               type: array
 *               items:
 *                 type: string
 *             negative:
 *               type: array
 *               items:
 *                 type: string
 *             neutral:
 *               type: array
 *               items:
 *                 type: string
 *         summary:
 *           type: string
 *         predictions:
 *           type: array
 *           items:
 *             type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

// ============================================
// AI ASSISTANT TAGS
// ============================================

/**
 * @swagger
 * tags:
 *   name: AI Assistant
 *   description: AI-powered project assistant endpoints
 */

// ============================================
// API ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/ai/ask:
 *   post:
 *     summary: Ask AI a question about the project
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIQuestion'
 *     responses:
 *       200:
 *         description: AI responded successfully
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
 *                   example: "AI responded successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       429:
 *         description: Rate limit exceeded
 *       503:
 *         description: AI service unavailable
 */

/**
 * @swagger
 * /api/projects/{projectId}/ai/analyze:
 *   post:
 *     summary: Analyze the project and provide insights
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
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
 *         description: Project analysis completed successfully
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
 *                   example: "Project analysis completed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ProjectAnalysis'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/projects/{projectId}/ai/conversations:
 *   get:
 *     summary: Get conversation history
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of conversations to return
 *       - in: query
 *         name: questionContains
 *         schema:
 *           type: string
 *         description: Filter conversations by question content
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
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
 *                   example: "Conversations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       project_id:
 *                         type: string
 *                         format: uuid
 *                       user_id:
 *                         type: string
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *                       context_data:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   get:
 *     summary: Get a specific conversation
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Conversation UUID
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
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
 *                   example: "Conversation retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     project_id:
 *                       type: string
 *                       format: uuid
 *                     user_id:
 *                       type: string
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     context_data:
 *                       type: object
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */

/**
 * @swagger
 * /api/ai/summarize:
 *   post:
 *     summary: Summarize text
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "This is a long text that needs to be summarized..."
 *               maxLength:
 *                 type: integer
 *                 default: 500
 *                 description: Maximum length of summary
 *               format:
 *                 type: string
 *                 enum: [paragraph, bullet, numbered]
 *                 default: paragraph
 *                 description: Output format
 *     responses:
 *       200:
 *         description: Text summarized successfully
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
 *                   example: "Text summarized successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TextSummary'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/projects/{projectId}/ai/report:
 *   post:
 *     summary: Generate an AI-powered report
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
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
 *                 description: Report type
 *               format:
 *                 type: string
 *                 enum: [json, markdown, html]
 *                 default: json
 *                 description: Output format
 *               includeCharts:
 *                 type: boolean
 *                 default: false
 *                 description: Include visualizations
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
 *         description: Report generated successfully
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
 *                   example: "Report generated successfully"
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Report'
 *                     - type: string
 *                       description: Markdown or HTML report
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/projects/{projectId}/ai/actions:
 *   get:
 *     summary: Get suggested next actions
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Next actions suggested successfully
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
 *                   example: "Next actions suggested successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NextActions'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/projects/{projectId}/ai/trends:
 *   get:
 *     summary: Analyze project trends
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Trend analysis completed successfully
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
 *                   example: "Trend analysis completed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TrendAnalysis'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Get AI assistant status
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI assistant status retrieved successfully
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
 *                   example: "AI assistant status retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       type: string
 *                     isFallback:
 *                       type: boolean
 *                     model:
 *                       type: string
 *                     cacheEnabled:
 *                       type: boolean
 *                     maxTokens:
 *                       type: integer
 *                     temperature:
 *                       type: number
 *                     features:
 *                       type: object
 *                     limits:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */

module.exports = {};
