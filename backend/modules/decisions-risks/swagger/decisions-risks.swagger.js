/**
 * Swagger documentation for Decisions & Risks Module
 */

// ============================================
// DECISION SCHEMAS
// ============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Decision:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         project_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         title:
 *           type: string
 *           example: "Choose Database Technology"
 *         description:
 *           type: string
 *           example: "Need to select appropriate database for the project"
 *         decision:
 *           type: string
 *           example: "PostgreSQL with TimescaleDB extension"
 *         reason:
 *           type: string
 *           example: "Best for time-series data and scalability"
 *         impact:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "high"
 *         alternatives:
 *           type: string
 *           example: "MongoDB, MySQL, Cassandra"
 *         decision_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *
 *     DecisionCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - decision
 *         - reason
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: "Choose Database Technology"
 *         description:
 *           type: string
 *           minLength: 10
 *           example: "Need to select appropriate database for the project"
 *         decision:
 *           type: string
 *           minLength: 5
 *           example: "PostgreSQL with TimescaleDB extension"
 *         reason:
 *           type: string
 *           minLength: 5
 *           example: "Best for time-series data and scalability"
 *         impact:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           default: medium
 *           example: "high"
 *         alternatives:
 *           type: string
 *           example: "MongoDB, MySQL, Cassandra"
 *         decision_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *
 *     DecisionUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *         description:
 *           type: string
 *           minLength: 10
 *         decision:
 *           type: string
 *           minLength: 5
 *         reason:
 *           type: string
 *           minLength: 5
 *         impact:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         alternatives:
 *           type: string
 *         decision_date:
 *           type: string
 *           format: date
 *
 *     DecisionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Decision retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Decision'
 *
 *     DecisionsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Decisions retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Decision'
 *         meta:
 *           type: object
 *           properties:
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *             statistics:
 *               $ref: '#/components/schemas/DecisionStatistics'
 *
 *     DecisionStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 25
 *         byImpact:
 *           type: object
 *           properties:
 *             low:
 *               type: integer
 *             medium:
 *               type: integer
 *             high:
 *               type: integer
 *             critical:
 *               type: integer
 *         recentDecisions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Decision'
 *         impactDistribution:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               impact:
 *                 type: string
 *               count:
 *                 type: integer
 *               percentage:
 *                 type: string
 *
 *     DecisionReport:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         summary:
 *           type: string
 *         statistics:
 *           $ref: '#/components/schemas/DecisionStatistics'
 *         decisions:
 *           type: array
 *           items:
 *             type: object
 *         generatedAt:
 *           type: string
 *           format: date-time
 */

// ============================================
// RISK SCHEMAS
// ============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Risk:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         project_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         title:
 *           type: string
 *           example: "Database Performance Issues"
 *         description:
 *           type: string
 *           example: "Database may not scale for high concurrent users"
 *         risk_level:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "high"
 *         status:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *           example: "monitoring"
 *         reason:
 *           type: string
 *           example: "Expected 10K concurrent users"
 *         mitigation:
 *           type: string
 *           example: "Implement connection pooling and read replicas"
 *         risk_score:
 *           type: integer
 *           example: 75
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     RiskCreate:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: "Database Performance Issues"
 *         description:
 *           type: string
 *           example: "Database may not scale for high concurrent users"
 *         risk_level:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           default: medium
 *           example: "high"
 *         status:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *           default: identified
 *           example: "identified"
 *         reason:
 *           type: string
 *           example: "Expected 10K concurrent users"
 *         mitigation:
 *           type: string
 *           example: "Implement connection pooling and read replicas"
 *
 *     RiskUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *         description:
 *           type: string
 *         risk_level:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         status:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *         reason:
 *           type: string
 *         mitigation:
 *           type: string
 *
 *     RiskStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *
 *     RiskResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Risk retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Risk'
 *
 *     RisksListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Risks retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Risk'
 *         meta:
 *           type: object
 *           properties:
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *             summary:
 *               type: object
 *
 *     RiskReport:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         summary:
 *           type: string
 *         riskMatrix:
 *           type: object
 *         statistics:
 *           type: object
 *         prioritizedRisks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Risk'
 *         mitigationStrategies:
 *           type: object
 *         generatedAt:
 *           type: string
 *           format: date-time
 *
 *     RiskScore:
 *       type: object
 *       properties:
 *         totalScore:
 *           type: integer
 *         averageScore:
 *           type: integer
 *         criticalCount:
 *           type: integer
 *         highCount:
 *           type: integer
 *         riskLevel:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         totalRisks:
 *           type: integer
 */

// ============================================
// DECISION API DOCUMENTATION
// ============================================

/**
 * @swagger
 * tags:
 *   name: Decisions
 *   description: Decision management endpoints
 *
 *   name: Risks
 *   description: Risk management endpoints
 */

// ============================================
// DECISION ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/decisions:
 *   get:
 *     summary: Get all decisions for a project
 *     tags: [Decisions]
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
 *         name: impact
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by impact level
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter decisions from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter decisions up to this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, decision_date, impact]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of decisions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DecisionsListResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/decisions:
 *   post:
 *     summary: Create a new decision
 *     tags: [Decisions]
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
 *             $ref: '#/components/schemas/DecisionCreate'
 *     responses:
 *       201:
 *         description: Decision created successfully
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
 *                   example: "Decision created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Decision'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/decisions/{id}:
 *   get:
 *     summary: Get a decision by ID
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Decision UUID
 *     responses:
 *       200:
 *         description: Decision retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DecisionResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Decision not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/decisions/{id}:
 *   put:
 *     summary: Update a decision
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Decision UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecisionUpdate'
 *     responses:
 *       200:
 *         description: Decision updated successfully
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
 *                   example: "Decision updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Decision'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Decision not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/decisions/{id}:
 *   delete:
 *     summary: Delete a decision
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Decision UUID
 *     responses:
 *       200:
 *         description: Decision deleted successfully
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
 *                   example: "Decision deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Decision not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/decisions/export:
 *   get:
 *     summary: Export decisions
 *     tags: [Decisions]
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
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: Decision report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DecisionReport'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/decisions/statistics:
 *   get:
 *     summary: Get decision statistics
 *     tags: [Decisions]
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
 *         description: Decision statistics retrieved successfully
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
 *                   example: "Decision statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DecisionStatistics'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

// ============================================
// RISK ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/risks:
 *   get:
 *     summary: Get all risks for a project
 *     tags: [Risks]
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
 *         name: level
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by risk level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, risk_level, status]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of risks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RisksListResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/risks:
 *   post:
 *     summary: Create a new risk
 *     tags: [Risks]
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
 *             $ref: '#/components/schemas/RiskCreate'
 *     responses:
 *       201:
 *         description: Risk created successfully
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
 *                   example: "Risk created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Risk'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/risks/{id}:
 *   get:
 *     summary: Get a risk by ID
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Risk UUID
 *     responses:
 *       200:
 *         description: Risk retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/risks/{id}:
 *   put:
 *     summary: Update a risk
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Risk UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskUpdate'
 *     responses:
 *       200:
 *         description: Risk updated successfully
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
 *                   example: "Risk updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Risk'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/risks/{id}/status:
 *   patch:
 *     summary: Update risk status
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Risk UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RiskStatusUpdate'
 *     responses:
 *       200:
 *         description: Risk status updated successfully
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
 *                   example: "Risk status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Risk'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/risks/{id}:
 *   delete:
 *     summary: Delete a risk
 *     tags: [Risks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Risk UUID
 *     responses:
 *       200:
 *         description: Risk deleted successfully
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
 *                   example: "Risk deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/risks/status/{status}:
 *   get:
 *     summary: Get risks by status
 *     tags: [Risks]
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
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [identified, monitoring, mitigated, realized, closed]
 *         description: Risk status
 *     responses:
 *       200:
 *         description: Risks with given status retrieved successfully
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
 *                   example: "Risks with status identified retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Risk'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/risks/report:
 *   get:
 *     summary: Generate risk report
 *     tags: [Risks]
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
 *         description: Risk report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiskReport'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/risks/score:
 *   get:
 *     summary: Get project risk score
 *     tags: [Risks]
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
 *         description: Project risk score calculated successfully
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
 *                   example: "Project risk score calculated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RiskScore'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/risks/matrix:
 *   get:
 *     summary: Get risk matrix
 *     tags: [Risks]
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
 *         description: Risk matrix generated successfully
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
 *                   example: "Risk matrix generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     low:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         medium:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         high:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         critical:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                     medium:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         medium:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         high:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         critical:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                     high:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         medium:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         high:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         critical:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                     critical:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         medium:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         high:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *                         critical:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Risk'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

module.exports = {
  // Tag and schema exports for Swagger
};
