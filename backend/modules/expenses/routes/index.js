const express = require("express");
const router = express.Router();

// Import controllers
const ExpenseController = require("../controllers/expense.controller");

// Import middleware
const {
  authenticate,
  authorize,
} = require("../../../common/middleware/auth.middleware");
const {
  validateRequest,
  validateQuery,
} = require("../../../common/middleware/validation.middleware");
const {
  pagination,
  filterParser,
  sortParser,
} = require("../../../common/middleware/data.middleware");
const {
  rateLimiter,
} = require("../../../common/middleware/security.middleware");
const ExpenseMiddleware = require("../middleware/expense.middleware");

// Import validation schemas
const { expenseSchemas } = require("../validations/expense.validation");

// ============================================
// EXPENSE ROUTES
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/expenses:
 *   get:
 *     summary: Get all expenses for a project
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [hosting, database, domain, api, software, hardware, marketing, other]
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
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *       - in: query
 *         name: recurring
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get(
  "/projects/:projectId/expenses",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(expenseSchemas.getExpenses),
  ExpenseController.getExpenses.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - amount
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [hosting, database, domain, api, software, hardware, marketing, other]
 *               expense_date:
 *                 type: string
 *                 format: date
 *               vendor:
 *                 type: string
 *               receipt_url:
 *                 type: string
 *               recurring:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Expense created
 */
router.post(
  "/projects/:projectId/expenses",
  authenticate,
  rateLimiter(),
  ExpenseMiddleware.sanitizeExpenseData,
  validateRequest(expenseSchemas.createExpense),
  ExpenseController.createExpense.bind(ExpenseController)
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense details
 */
router.get(
  "/expenses/:id",
  authenticate,
  ExpenseController.getExpenseById.bind(ExpenseController)
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
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
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [hosting, database, domain, api, software, hardware, marketing, other]
 *               expense_date:
 *                 type: string
 *                 format: date
 *               vendor:
 *                 type: string
 *               receipt_url:
 *                 type: string
 *               recurring:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Expense updated
 */
router.put(
  "/expenses/:id",
  authenticate,
  ExpenseMiddleware.sanitizeExpenseData,
  ExpenseMiddleware.validateExpenseExists,
  validateRequest(expenseSchemas.updateExpense),
  ExpenseController.updateExpense.bind(ExpenseController)
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense deleted
 */
router.delete(
  "/expenses/:id",
  authenticate,
  authorize(["admin", "project_manager"]),
  ExpenseMiddleware.validateExpenseExists,
  ExpenseController.deleteExpense.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses/summary:
 *   get:
 *     summary: Get expense summary
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expense summary
 */
router.get(
  "/projects/:projectId/expenses/summary",
  authenticate,
  ExpenseController.getExpenseSummary.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses/categories:
 *   get:
 *     summary: Get expenses by category
 *     tags: [Expenses]
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
 *     responses:
 *       200:
 *         description: Expenses grouped by category
 */
router.get(
  "/projects/:projectId/expenses/categories",
  authenticate,
  ExpenseController.getExpensesByCategory.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses/total:
 *   get:
 *     summary: Get total expenses
 *     tags: [Expenses]
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
 *     responses:
 *       200:
 *         description: Total expenses
 */
router.get(
  "/projects/:projectId/expenses/total",
  authenticate,
  ExpenseController.getTotalExpenses.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses/monthly:
 *   get:
 *     summary: Get monthly expenses
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly expenses breakdown
 */
router.get(
  "/projects/:projectId/expenses/monthly",
  authenticate,
  validateQuery(expenseSchemas.getMonthlyExpenses),
  ExpenseController.getMonthlyExpenses.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses/export:
 *   get:
 *     summary: Export expenses
 *     tags: [Expenses]
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
 *         description: Exported expenses
 */
router.get(
  "/projects/:projectId/expenses/export",
  authenticate,
  ExpenseController.exportExpenses.bind(ExpenseController)
);

/**
 * @swagger
 * /api/projects/{projectId}/expenses/statistics:
 *   get:
 *     summary: Get expense statistics
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Expense statistics
 */
router.get(
  "/projects/:projectId/expenses/statistics",
  authenticate,
  ExpenseController.getExpenseStatistics.bind(ExpenseController)
);

module.exports = router;
