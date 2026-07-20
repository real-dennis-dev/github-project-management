/**
 * Swagger documentation for Vision Board Module
 */

// ============================================
// VISION BOARD SCHEMAS
// ============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     VisionGoal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         goal:
 *           type: string
 *         description:
 *           type: string
 *         target_timeline:
 *           type: string
 *         priority:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         category:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         project_count:
 *           type: integer
 *         linked_projects:
 *           type: array
 *           items:
 *             type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         formatted:
 *           type: object
 *           properties:
 *             display_goal:
 *               type: string
 *             display_description:
 *               type: string
 *             status_color:
 *               type: string
 *             priority_label:
 *               type: string
 *             progress_bar:
 *               type: string
 *             progress_label:
 *               type: string
 *
 *     VisionGoalCreate:
 *       type: object
 *       required:
 *         - goal
 *       properties:
 *         goal:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *         description:
 *           type: string
 *         target_timeline:
 *           type: string
 *         priority:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           default: 0
 *         category:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *           default: draft
 *
 *     VisionGoalUpdate:
 *       type: object
 *       properties:
 *         goal:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *         description:
 *           type: string
 *         target_timeline:
 *           type: string
 *         priority:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         category:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *
 *     VisionGoalProgress:
 *       type: object
 *       properties:
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         totalProjects:
 *           type: integer
 *         completedProjects:
 *           type: integer
 *         inProgressProjects:
 *           type: integer
 *         notStartedProjects:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *         completionRatio:
 *           type: string
 *         summary:
 *           type: string
 *
 *     VisionStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         byStatus:
 *           type: object
 *           properties:
 *             draft:
 *               type: integer
 *             active:
 *               type: integer
 *             completed:
 *               type: integer
 *             archived:
 *               type: integer
 *         byCategory:
 *           type: object
 *         averagePriority:
 *           type: number
 *         averageProgress:
 *           type: integer
 *         completedCount:
 *           type: integer
 *         activeCount:
 *           type: integer
 *         draftCount:
 *           type: integer
 */

// ============================================
// VISION BOARD API DOCUMENTATION
// ============================================

/**
 * @swagger
 * tags:
 *   name: Vision Board
 *   description: Vision board management endpoints
 */

/**
 * @swagger
 * /api/vision-board:
 *   get:
 *     summary: Get all vision goals
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
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
 *           enum: [created_at, priority, goal, status]
 *           default: priority
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
 *         description: Vision goals retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VisionGoal'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     statistics:
 *                       $ref: '#/components/schemas/VisionStatistics'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board:
 *   post:
 *     summary: Create a new vision goal
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisionGoalCreate'
 *     responses:
 *       201:
 *         description: Vision goal created successfully
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
 *                   example: "Vision goal created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/VisionGoal'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}:
 *   get:
 *     summary: Get a vision goal by ID
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
 *     responses:
 *       200:
 *         description: Vision goal retrieved successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/VisionGoal'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vision goal not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}:
 *   put:
 *     summary: Update a vision goal
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisionGoalUpdate'
 *     responses:
 *       200:
 *         description: Vision goal updated successfully
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
 *                   example: "Vision goal updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/VisionGoal'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Vision goal not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}:
 *   delete:
 *     summary: Delete a vision goal
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
 *     responses:
 *       200:
 *         description: Vision goal deleted successfully
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
 *                   example: "Vision goal deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Vision goal not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}/projects:
 *   post:
 *     summary: Link a project to a vision goal
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
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
 *                 description: Project UUID
 *     responses:
 *       200:
 *         description: Project linked successfully
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
 *                   example: "Project linked to vision goal successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     link:
 *                       type: object
 *                     goal:
 *                       $ref: '#/components/schemas/VisionGoal'
 *                     project:
 *                       type: object
 *       400:
 *         description: Validation error or project already linked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vision goal or project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}/projects/{projectId}:
 *   delete:
 *     summary: Unlink a project from a vision goal
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project unlinked successfully
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
 *                   example: "Project unlinked from vision goal successfully"
 *                 data:
 *                   $ref: '#/components/schemas/VisionGoal'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vision goal, project, or link not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}/progress:
 *   get:
 *     summary: Get goal progress
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
 *     responses:
 *       200:
 *         description: Goal progress retrieved successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/VisionGoalProgress'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vision goal not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/{id}/available-projects:
 *   get:
 *     summary: Get available projects for linking
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vision goal UUID
 *     responses:
 *       200:
 *         description: Available projects retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       completion_percentage:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vision goal not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/statistics:
 *   get:
 *     summary: Get vision board statistics
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                 data:
 *                   $ref: '#/components/schemas/VisionStatistics'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/options:
 *   get:
 *     summary: Get options for UI
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Options retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           color:
 *                             type: string
 *                     priorities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: integer
 *                           label:
 *                             type: string
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vision-board/export:
 *   get:
 *     summary: Export vision goals
 *     tags: [Vision Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: Vision goals exported successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VisionGoal'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     format:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

module.exports = {
  // Tag and schema exports for Swagger
};
