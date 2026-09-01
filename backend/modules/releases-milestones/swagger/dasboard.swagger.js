/**
 * @swagger
 * components:
 *   schemas:

 *     DashboardStatistics:
 *       type: object
 *       properties:
 *         total_items:
 *           type: integer
 *           example: 42
 *
 *         total_releases:
 *           type: integer
 *           example: 18
 *
 *         total_milestones:
 *           type: integer
 *           example: 24
 *
 *         completed_items:
 *           type: integer
 *           example: 20
 *
 *         active_items:
 *           type: integer
 *           example: 22
 *
 *         completion_rate:
 *           type: integer
 *           example: 48
 *
 *         releases:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *
 *             byStatus:
 *               type: object
 *               properties:
 *                 planned:
 *                   type: integer
 *                 in_progress:
 *                   type: integer
 *                 testing:
 *                   type: integer
 *                 released:
 *                   type: integer
 *                 cancelled:
 *                   type: integer
 *
 *             latestRelease:
 *               type: object
 *               nullable: true
 *
 *             nextRelease:
 *               type: object
 *               nullable: true
 *
 *         milestones:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *
 *             byStatus:
 *               type: object
 *               properties:
 *                 not_started:
 *                   type: integer
 *                 in_progress:
 *                   type: integer
 *                 completed:
 *                   type: integer
 *                 delayed:
 *                   type: integer
 *
 *             averageProgress:
 *               type: integer
 *
 *             overdueCount:
 *               type: integer
 *
 *             completedCount:
 *               type: integer
 *
 *             completionRate:
 *               type: integer
 *
 *
 *     ReleasesMilestonesDashboardItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *
 *         type:
 *           type: string
 *           enum:
 *             - release
 *             - milestone
 *
 *         project_id:
 *           type: string
 *           format: uuid
 *
 *         title:
 *           type: string
 *
 *         description:
 *           type: string
 *           nullable: true
 *
 *         status:
 *           type: string
 *
 *         progress:
 *           type: integer
 *
 *         activity_date:
 *           type: string
 *           format: date-time
 *
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *         updated_at:
 *           type: string
 *           format: date-time
 */
