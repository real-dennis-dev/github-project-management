/**
 * @swagger
 * /api/tech-debt/stats:
 *   get:
 *     summary: Get global technical debt dashboard statistics
 *     description: >
 *       Returns technical debt statistics aggregated across
 *       every project accessible to the authenticated user.
 *       No project ID is required.
 *     tags:
 *       - TechDebt
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for latest tech debt items
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of latest items
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *
 *     responses:
 *       200:
 *         description: Global tech debt dashboard statistics
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
 *                   example: Global tech debt statistics retrieved successfully
 *
 *                 data:
 *                   type: object
 *
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 145
 *
 *                         totalProjects:
 *                           type: integer
 *                           example: 12
 *
 *                         unresolvedItems:
 *                           type: integer
 *                           example: 98
 *
 *                         resolvedItems:
 *                           type: integer
 *                           example: 47
 *
 *                         resolutionRate:
 *                           type: number
 *                           example: 32
 *
 *                         estimatedEffortHours:
 *                           type: number
 *                           example: 1240
 *
 *                         averageImpact:
 *                           type: number
 *                           example: 61
 *
 *                         totalCost:
 *                           type: number
 *                           example: 93000
 *
 *                         score:
 *                           type: number
 *                           example: 67
 *
 *                         level:
 *                           type: string
 *                           enum:
 *                             - low
 *                             - medium
 *                             - high
 *                             - critical
 *                           example: high
 *
 *                     distributions:
 *                       type: object
 *                       properties:
 *                         byPriority:
 *                           type: object
 *                           properties:
 *                             low:
 *                               type: integer
 *                             medium:
 *                               type: integer
 *                             high:
 *                               type: integer
 *                             critical:
 *                               type: integer
 *
 *                         byStatus:
 *                           type: object
 *                           properties:
 *                             identified:
 *                               type: integer
 *                             planned:
 *                               type: integer
 *                             in_progress:
 *                               type: integer
 *                             resolved:
 *                               type: integer
 *                             ignored:
 *                               type: integer
 *
 *                     projects:
 *                       type: array
 *                       description: Tech debt statistics grouped by project
 *                       items:
 *                         type: object
 *                         properties:
 *                           projectId:
 *                             type: string
 *                             format: uuid
 *
 *                           projectName:
 *                             type: string
 *
 *                           total:
 *                             type: integer
 *
 *                           unresolved:
 *                             type: integer
 *
 *                           resolved:
 *                             type: integer
 *
 *                           critical:
 *                             type: integer
 *
 *                           high:
 *                             type: integer
 *
 *                           medium:
 *                             type: integer
 *
 *                           low:
 *                             type: integer
 *
 *                           estimatedEffort:
 *                             type: number
 *
 *                     highestImpactItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *
 *                           projectId:
 *                             type: string
 *                             format: uuid
 *
 *                           projectName:
 *                             type: string
 *
 *                           title:
 *                             type: string
 *
 *                           priority:
 *                             type: string
 *
 *                           status:
 *                             type: string
 *
 *                           impact:
 *                             type: object
 *
 *                     latest:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           description: Latest tech debt records sorted by updated_at descending
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *
 *                               projectId:
 *                                 type: string
 *                                 format: uuid
 *
 *                               project:
 *                                 type: object
 *
 *                               title:
 *                                 type: string
 *
 *                               description:
 *                                 type: string
 *
 *                               priority:
 *                                 type: string
 *
 *                               status:
 *                                 type: string
 *
 *                               estimatedEffortHours:
 *                                 type: number
 *
 *                               impactScore:
 *                                 type: number
 *
 *                               impactLevel:
 *                                 type: string
 *
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
