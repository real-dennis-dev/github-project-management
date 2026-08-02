const express = require("express");
const router = express.Router();

// Import controllers
const JournalController = require("../controllers/journal.controller");

// Import middleware
const {
  authenticate,
  authorize,
} = require("../../../common/middleware/auth.middleware");
const {
  validateRequest,
  validateQuery,
  validateParams,
} = require("../../../common/middleware/validation.middleware");
const {
  pagination,
  filterParser,
  sortParser,
} = require("../../../common/middleware/data.middleware");
const {
  rateLimiter,
} = require("../../../common/middleware/security.middleware");

// Import validation schemas
const { journalSchemas } = require("../validations/journal.validation");

// ============================================
// JOURNAL ROUTES
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
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *           enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
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
 *     responses:
 *       200:
 *         description: Journal entries retrieved successfully
 */
router.get(
  "/projects/:projectId/journal",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(journalSchemas.getJournalEntries),
  JournalController.getJournalEntries.bind(JournalController)
);

/**
 * @swagger
 * /api/projects/{projectId}/journal:
 *   post:
 *     summary: Create a new journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entry_date:
 *                 type: string
 *                 format: date
 *               finished_today:
 *                 type: string
 *               problems:
 *                 type: string
 *               tomorrow_plan:
 *                 type: string
 *               mood:
 *                 type: string
 *                 enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Journal entry created
 */
router.post(
  "/projects/:projectId/journal",
  authenticate,
  rateLimiter(),
  validateRequest(journalSchemas.createJournalEntry),
  JournalController.createJournalEntry.bind(JournalController)
);

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
 *         description: Journal entry retrieved
 */
router.get(
  "/journal/:id",
  authenticate,
  JournalController.getJournalEntryById.bind(JournalController)
);

/**
 * @swagger
 * /api/journal/{id}:
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
 *             type: object
 *             properties:
 *               entry_date:
 *                 type: string
 *                 format: date
 *               finished_today:
 *                 type: string
 *               problems:
 *                 type: string
 *               tomorrow_plan:
 *                 type: string
 *               mood:
 *                 type: string
 *                 enum: [😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Journal entry updated
 */
router.put(
  "/journal/:id",
  authenticate,
  validateRequest(journalSchemas.updateJournalEntry),
  JournalController.updateJournalEntry.bind(JournalController)
);

/**
 * @swagger
 * /api/journal/{id}:
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
 *         description: Journal entry deleted
 */
router.delete(
  "/journal/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  JournalController.deleteJournalEntry.bind(JournalController)
);

/**
 * @swagger
 * /api/projects/{projectId}/journal/date/{date}:
 *   get:
 *     summary: Get journal entry by date
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
 *     responses:
 *       200:
 *         description: Journal entry retrieved
 */
router.get(
  "/projects/:projectId/journal/date/:date",
  authenticate,
  validateParams(journalSchemas.getJournalByDate),
  JournalController.getJournalByDate.bind(JournalController)
);

/**
 * @swagger
 * /api/projects/{projectId}/journal/today:
 *   get:
 *     summary: Get today's journal entry
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
 *         description: Today's journal entry retrieved
 */
router.get(
  "/projects/:projectId/journal/today",
  authenticate,
  JournalController.getTodayEntry.bind(JournalController)
);

/**
 * @swagger
 * /api/projects/{projectId}/journal/month:
 *   get:
 *     summary: Get journal entries by month
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
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Month's journal entries retrieved
 */
router.get(
  "/projects/:projectId/journal/month",
  authenticate,
  JournalController.getJournalByMonth.bind(JournalController)
);

/**
 * @swagger
 * /api/projects/{projectId}/journal/stats:
 *   get:
 *     summary: Get journal statistics
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
 *         description: Journal statistics retrieved
 */
router.get(
  "/projects/:projectId/journal/stats",
  authenticate,
  JournalController.getJournalStats.bind(JournalController)
);

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
 *         description: Journal entries exported
 */
router.get(
  "/projects/:projectId/journal/export",
  authenticate,
  JournalController.exportJournal.bind(JournalController)
);

module.exports = router;
