/**
 * @swagger
 * components:
 *   schemas:
 *
 *     VisionDashboardStats:
 *       type: object
 *       properties:
 *         total_goals:
 *           type: integer
 *           example: 12
 *
 *         draft_goals:
 *           type: integer
 *           example: 2
 *
 *         active_goals:
 *           type: integer
 *           example: 7
 *
 *         completed_goals:
 *           type: integer
 *           example: 2
 *
 *         archived_goals:
 *           type: integer
 *           example: 1
 *
 *         average_priority:
 *           type: number
 *           example: 6.4
 *
 *         average_goal_progress:
 *           type: integer
 *           example: 58
 *
 *         total_projects:
 *           type: integer
 *           example: 28
 *
 *         linked_projects:
 *           type: integer
 *           example: 21
 *
 *         unlinked_projects:
 *           type: integer
 *           example: 7
 *
 *         completed_projects:
 *           type: integer
 *           example: 9
 *
 *         in_progress_projects:
 *           type: integer
 *           example: 10
 *
 *         not_started_projects:
 *           type: integer
 *           example: 9
 *
 *         average_project_completion:
 *           type: integer
 *           example: 48
 *
 *         overall_progress:
 *           type: integer
 *           example: 48
 *
 *
 *     VisionDashboardItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *
 *         type:
 *           type: string
 *           example: vision_goal
 *
 *         title:
 *           type: string
 *           example: Launch SaaS Platform
 *
 *         description:
 *           type: string
 *           nullable: true
 *
 *         category:
 *           type: string
 *           example: Product
 *
 *         status:
 *           type: string
 *           enum:
 *             - draft
 *             - active
 *             - completed
 *             - archived
 *
 *         priority:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *
 *         priority_label:
 *           type: string
 *           example: Critical
 *
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *
 *         progress_status:
 *           type: string
 *           enum:
 *             - not_started
 *             - in_progress
 *             - completed
 *
 *         project_count:
 *           type: integer
 *
 *         completed_projects:
 *           type: integer
 *
 *         in_progress_projects:
 *           type: integer
 *
 *         not_started_projects:
 *           type: integer
 *
 *         target_timeline:
 *           type: string
 *           nullable: true
 *
 *         created_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *         latest_activity:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *
 *     VisionDashboard:
 *       type: object
 *       properties:
 *         stats:
 *           $ref: '#/components/schemas/VisionDashboardStats'
 *
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VisionDashboardItem'
 *
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *
 *             limit:
 *               type: integer
 *
 *             total:
 *               type: integer
 *
 *             totalPages:
 *               type: integer
 *
 *         generated_at:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/vision-board/dashboard:
 *   get:
 *     summary: Get Vision Board dashboard
 *     description: |
 *       Returns aggregated Vision Board statistics and a
 *       chronologically sorted list of vision goals across
 *       all projects.
 *
 *       No project ID is required because the dashboard
 *       represents the entire Vision Board.
 *
 *     tags:
 *       - Vision Board
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Dashboard page
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of dashboard items
 *
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - ASC
 *             - DESC
 *           default: DESC
 *         description: |
 *           Sort dashboard items according to their latest
 *           activity. DESC returns the most recently active
 *           items first.
 *
 *     responses:
 *
 *       200:
 *         description: Vision Board dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Vision board dashboard retrieved successfully
 *
 *                 data:
 *                   $ref: '#/components/schemas/VisionDashboard'
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
