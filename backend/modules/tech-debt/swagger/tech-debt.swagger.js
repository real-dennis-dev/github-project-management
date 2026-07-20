/**
 * Swagger documentation for Tech Debt Module
 */

/**
 * @swagger
 * tags:
 *   name: TechDebt
 *   description: Technical debt management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TechDebt:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         project_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         reason:
 *           type: string
 *         impact:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         status:
 *           type: string
 *           enum: [identified, planned, in_progress, resolved, ignored]
 *         estimated_effort_hours:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     TechDebtCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - reason
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *         description:
 *           type: string
 *           minLength: 10
 *         reason:
 *           type: string
 *           minLength: 5
 *         impact:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           default: medium
 *         status:
 *           type: string
 *           enum: [identified, planned, in_progress, resolved, ignored]
 *           default: identified
 *         estimated_effort_hours:
 *           type: integer
 *           minimum: 0
 *
 *     TechDebtUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *         description:
 *           type: string
 *           minLength: 10
 *         reason:
 *           type: string
 *           minLength: 5
 *         impact:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         status:
 *           type: string
 *           enum: [identified, planned, in_progress, resolved, ignored]
 *         estimated_effort_hours:
 *           type: integer
 *           minimum: 0
 *
 *     TechDebtStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [identified, planned, in_progress, resolved, ignored]
 *
 *     TechDebtResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/TechDebt'
 *
 *     TechDebtListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TechDebt'
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
 *             metrics:
 *               type: object
 *
 *     TechDebtOverview:
 *       type: object
 *       properties:
 *         metrics:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             byPriority:
 *               type: object
 *             byStatus:
 *               type: object
 *             totalEffort:
 *               type: integer
 *             averageImpact:
 *               type: integer
 *             resolutionRate:
 *               type: integer
 *         prioritizedItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TechDebt'
 *         totalEstimatedCost:
 *           type: integer
 *         summary:
 *           type: string
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *
 *     TechDebtScore:
 *       type: object
 *       properties:
 *         score:
 *           type: integer
 *         level:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         totalItems:
 *           type: integer
 *         criticalItems:
 *           type: integer
 *         highItems:
 *           type: integer
 *         mediumItems:
 *           type: integer
 *         lowItems:
 *           type: integer
 *         resolutionRate:
 *           type: integer
 *         estimatedEffort:
 *           type: integer
 *         unresolvedItems:
 *           type: integer
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 */

// ============================================
// TECH DEBT ENDPOINTS
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
 *         description: Project UUID
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [identified, planned, in_progress, resolved, ignored]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
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
 *           enum: [created_at, priority, status, estimated_effort_hours]
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
 *         description: Tech debt items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechDebtListResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/tech-debt:
 *   post:
 *     summary: Create a new tech debt item
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
 *         description: Project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TechDebtCreate'
 *     responses:
 *       201:
 *         description: Tech debt item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechDebtResponse'
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
 *         description: Tech debt UUID
 *     responses:
 *       200:
 *         description: Tech debt item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechDebtResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tech debt item not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Tech debt UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TechDebtUpdate'
 *     responses:
 *       200:
 *         description: Tech debt item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechDebtResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Tech debt item not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Tech debt UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TechDebtStatusUpdate'
 *     responses:
 *       200:
 *         description: Tech debt status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechDebtResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Tech debt item not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Tech debt UUID
 *     responses:
 *       200:
 *         description: Tech debt item deleted successfully
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
 *                   example: "Tech debt item deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Tech debt item not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Tech debt overview retrieved successfully
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
 *                   example: "Tech debt overview retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TechDebtOverview'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Tech debt score calculated successfully
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
 *                   example: "Tech debt score calculated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TechDebtScore'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Tech debt statistics retrieved successfully
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
 *                   example: "Tech debt statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     metrics:
 *                       type: object
 *                     topPriorities:
 *                       type: array
 *                     trendData:
 *                       type: object
 *                     totalCost:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Tech debt exported successfully
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
 *                   example: "Tech debt exported successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                     total:
 *                       type: integer
 *                     exportedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

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
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Refactoring suggestions retrieved successfully
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
 *                   example: "Refactoring suggestions retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       suggestion:
 *                         type: object
 *                         properties:
 *                           priority:
 *                             type: string
 *                           urgency:
 *                             type: integer
 *                           recommendedAction:
 *                             type: string
 *                           estimatedTimeframe:
 *                             type: string
 *                       effort:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

module.exports = {
  // Export for Swagger
};
