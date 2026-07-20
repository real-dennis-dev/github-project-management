/**
 * @swagger
 * components:
 *   schemas:
 *     JournalEntry:
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
 *         entry_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         finished_today:
 *           type: string
 *           example: "Completed user authentication module"
 *         problems:
 *           type: string
 *           example: "Database connection timeout issues"
 *         tomorrow_plan:
 *           type: string
 *           example: "Fix database connection and add tests"
 *         mood:
 *           type: string
 *           enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
 *           example: "😊"
 *         notes:
 *           type: string
 *           example: "Need to review the architecture"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     JournalEntryCreate:
 *       type: object
 *       properties:
 *         entry_date:
 *           type: string
 *           format: date
 *           default: current date
 *         finished_today:
 *           type: string
 *           maxLength: 2000
 *         problems:
 *           type: string
 *           maxLength: 2000
 *         tomorrow_plan:
 *           type: string
 *           maxLength: 2000
 *         mood:
 *           type: string
 *           enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
 *           default: "😐"
 *         notes:
 *           type: string
 *           maxLength: 5000
 *
 *     JournalEntryUpdate:
 *       type: object
 *       properties:
 *         entry_date:
 *           type: string
 *           format: date
 *         finished_today:
 *           type: string
 *           maxLength: 2000
 *         problems:
 *           type: string
 *           maxLength: 2000
 *         tomorrow_plan:
 *           type: string
 *           maxLength: 2000
 *         mood:
 *           type: string
 *           enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
 *         notes:
 *           type: string
 *           maxLength: 5000
 *
 *     JournalStats:
 *       type: object
 *       properties:
 *         totalEntries:
 *           type: integer
 *         dateRange:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *             end:
 *               type: string
 *               format: date
 *             days:
 *               type: integer
 *         completionStats:
 *           type: object
 *           properties:
 *             withFinished:
 *               type: integer
 *             withProblems:
 *               type: integer
 *             withPlans:
 *               type: integer
 *             withNotes:
 *               type: integer
 *         moodDistribution:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *         moodTrend:
 *           type: object
 *           properties:
 *             overall:
 *               type: string
 *               enum: [excellent, good, neutral, poor, bad]
 *             trend:
 *               type: string
 *               enum: [improving, declining, stable]
 *             distribution:
 *               type: object
 *             dominantMood:
 *               type: string
 *             averageScore:
 *               type: number
 *         streak:
 *           type: object
 *           properties:
 *             currentStreak:
 *               type: integer
 *             longestStreak:
 *               type: integer
 *             totalDays:
 *               type: integer
 *         weeklySummary:
 *           type: object
 *           properties:
 *             hasEntries:
 *               type: boolean
 *             summary:
 *               type: object
 *
 *     MoodTrend:
 *       type: object
 *       properties:
 *         overall:
 *           type: string
 *           enum: [excellent, good, neutral, poor, bad]
 *         trend:
 *           type: string
 *           enum: [improving, declining, stable]
 *         distribution:
 *           type: object
 *         weeklyAverage:
 *           type: number
 *         dominantMood:
 *           type: string
 *         averageScore:
 *           type: number
 *         totalEntries:
 *           type: integer
 *         moodChanges:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               change:
 *                 type: number
 *               description:
 *                 type: string
 *
 *     WeeklySummary:
 *       type: object
 *       properties:
 *         hasEntries:
 *           type: boolean
 *         summary:
 *           type: object
 *           properties:
 *             weekRange:
 *               type: object
 *               properties:
 *                 start:
 *                   type: string
 *                 end:
 *                   type: string
 *             totalEntries:
 *               type: integer
 *             completionRate:
 *               type: integer
 *             problemRate:
 *               type: integer
 *             planningRate:
 *               type: integer
 *             averageMood:
 *               type: number
 *             moodLabel:
 *               type: string
 *             dominantMood:
 *               type: string
 *             bestDay:
 *               type: object
 *             worstDay:
 *               type: object
 *             keyAccomplishments:
 *               type: array
 *               items:
 *                 type: string
 *             keyProblems:
 *               type: array
 *               items:
 *                 type: string
 *             summaryText:
 *               type: string
 */

/**
 * @swagger
 * tags:
 *   name: Journal
 *   description: Daily journal management endpoints
 */

// ============================================
// JOURNAL ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/journal:
 *   get:
 *     summary: Get all journal entries for a project
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries up to this date
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *           enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
 *         description: Filter by mood
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [entry_date, created_at, mood]
 *           default: entry_date
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Journal entries retrieved successfully
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
 *                     $ref: '#/components/schemas/JournalEntry'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                     filters:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/JournalEntryCreate'
 *     responses:
 *       201:
 *         description: Journal entry created successfully
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
 *                   example: "Journal entry created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/JournalEntry'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Entry already exists for this date
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/journal/{id}:
 *   get:
 *     summary: Get a journal entry by ID
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Journal entry retrieved successfully
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
 *                   $ref: '#/components/schemas/JournalEntry'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Journal entry not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/JournalEntryUpdate'
 *     responses:
 *       200:
 *         description: Journal entry updated successfully
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
 *                   example: "Journal entry updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/JournalEntry'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Journal entry not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Journal entry deleted successfully
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
 *                   example: "Journal entry deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Journal entry not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/journal/date/{date}:
 *   get:
 *     summary: Get journal entry by specific date
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to look up (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Journal entry retrieved successfully
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
 *                   $ref: '#/components/schemas/JournalEntry'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No journal entry found for this date
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/journal/today:
 *   get:
 *     summary: Get or create today's journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Today's journal entry retrieved successfully
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
 *                   $ref: '#/components/schemas/JournalEntry'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/journal/month:
 *   get:
 *     summary: Get journal entries for a specific month
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *         description: Year (e.g., 2024)
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: Month's journal entries retrieved successfully
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
 *                     entries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JournalEntry'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         moodTrend:
 *                           $ref: '#/components/schemas/MoodTrend'
 *                         month:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid year or month
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/journal/stats:
 *   get:
 *     summary: Get journal statistics and analytics
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Journal statistics retrieved successfully
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
 *                   $ref: '#/components/schemas/JournalStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/journal/export:
 *   get:
 *     summary: Export journal entries
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
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
 *         description: Export format
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries up to this date
 *     responses:
 *       200:
 *         description: Journal entries exported successfully
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
  // Export for Swagger
};
