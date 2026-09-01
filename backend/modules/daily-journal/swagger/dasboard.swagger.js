/**
 * @swagger
 * components:
 *   schemas:
 *
 *     JournalDashboardProject:
 *       type: object
 *       properties:
 *         project:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             description:
 *               type: string
 *               nullable: true
 *
 *         stats:
 *           type: object
 *           properties:
 *             totalEntries:
 *               type: integer
 *               example: 28
 *
 *             completion:
 *               type: object
 *               properties:
 *                 finished:
 *                   type: integer
 *                   example: 89
 *                 problems:
 *                   type: integer
 *                   example: 32
 *                 plans:
 *                   type: integer
 *                   example: 75
 *                 notes:
 *                   type: integer
 *                   example: 54
 *
 *             mood:
 *               type: object
 *               properties:
 *                 distribution:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 trend:
 *                   $ref: '#/components/schemas/MoodTrend'
 *
 *             streak:
 *               $ref: '#/components/schemas/JournalStreak'
 *
 *             latestEntryDate:
 *               type: string
 *               format: date
 *               nullable: true
 *
 *         latestActivity:
 *           type: object
 *           nullable: true
 *           properties:
 *             type:
 *               type: string
 *               example: journal_entry
 *             date:
 *               type: string
 *               format: date
 *             createdAt:
 *               type: string
 *               format: date-time
 *             journalId:
 *               type: string
 *               format: uuid
 *
 *         latestEntry:
 *           allOf:
 *             - $ref: '#/components/schemas/JournalEntry'
 *           nullable: true
 *
 *
 *     JournalStreak:
 *       type: object
 *       properties:
 *         currentStreak:
 *           type: integer
 *           example: 5
 *         longestStreak:
 *           type: integer
 *           example: 14
 *         totalDays:
 *           type: integer
 *           example: 31
 *
 *
 *     JournalDashboardStats:
 *       type: object
 *       properties:
 *
 *         projects:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 12
 *             withEntries:
 *               type: integer
 *               example: 9
 *             withoutEntries:
 *               type: integer
 *               example: 3
 *
 *         journal:
 *           type: object
 *           properties:
 *             totalEntries:
 *               type: integer
 *               example: 247
 *
 *             latestEntry:
 *               type: object
 *               nullable: true
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 projectId:
 *                   type: string
 *                   format: uuid
 *                 date:
 *                   type: string
 *                   format: date
 *
 *             oldestEntry:
 *               type: object
 *               nullable: true
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 projectId:
 *                   type: string
 *                   format: uuid
 *                 date:
 *                   type: string
 *                   format: date
 *
 *         completionStats:
 *           type: object
 *           properties:
 *             withFinished:
 *               type: integer
 *               example: 82
 *             withProblems:
 *               type: integer
 *               example: 34
 *             withPlans:
 *               type: integer
 *               example: 76
 *             withNotes:
 *               type: integer
 *               example: 48
 *
 *         mood:
 *           type: object
 *           properties:
 *             distribution:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *             trend:
 *               $ref: '#/components/schemas/MoodTrend'
 *
 *         streak:
 *           $ref: '#/components/schemas/JournalStreak'
 *
 *         dateRange:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *               nullable: true
 *             end:
 *               type: string
 *               format: date
 *               nullable: true
 *
 *
 *     JournalDashboardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *
 *         message:
 *           type: string
 *           example: Journal dashboard statistics retrieved successfully
 *
 *         data:
 *           type: object
 *           properties:
 *             stats:
 *               $ref: '#/components/schemas/JournalDashboardStats'
 *
 *             projects:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JournalDashboardProject'
 *
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 20
 *                 total:
 *                   type: integer
 *                   example: 12
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 */

/**
 * @swagger
 * /api/daily-journal/stats:
 *   get:
 *     summary: Get daily journal dashboard statistics
 *     description: >
 *       Returns aggregated journal statistics across all projects owned by
 *       the authenticated user. No projectId is required. The response
 *       contains global statistics and project-level statistics sorted by
 *       latest journal activity.
 *     tags: [Journal]
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
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JournalDashboardResponse'
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
