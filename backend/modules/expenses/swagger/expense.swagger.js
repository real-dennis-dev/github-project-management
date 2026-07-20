/**
 * Swagger documentation for Expenses Module
 */

// ============================================
// EXPENSE SCHEMAS
// ============================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
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
 *         description:
 *           type: string
 *           example: "AWS EC2 Monthly Hosting"
 *         amount:
 *           type: number
 *           format: float
 *           example: 49.99
 *         formatted_amount:
 *           type: string
 *           example: "$49.99"
 *         category:
 *           type: string
 *           enum: [hosting, database, domain, api, software, hardware, marketing, other]
 *           example: "hosting"
 *         category_label:
 *           type: string
 *           example: "Hosting"
 *         category_icon:
 *           type: string
 *           example: "☁️"
 *         category_color:
 *           type: string
 *           example: "#4CAF50"
 *         expense_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         formatted_date:
 *           type: string
 *           example: "1/15/2024"
 *         vendor:
 *           type: string
 *           example: "Amazon Web Services"
 *         receipt_url:
 *           type: string
 *           format: uri
 *           example: "https://example.com/receipts/123.pdf"
 *         recurring:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *
 *     ExpenseCreate:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *       properties:
 *         description:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *           example: "AWS EC2 Monthly Hosting"
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           example: 49.99
 *         category:
 *           type: string
 *           enum: [hosting, database, domain, api, software, hardware, marketing, other]
 *           default: other
 *           example: "hosting"
 *         expense_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         vendor:
 *           type: string
 *           maxLength: 100
 *           example: "Amazon Web Services"
 *         receipt_url:
 *           type: string
 *           format: uri
 *           maxLength: 500
 *           example: "https://example.com/receipts/123.pdf"
 *         recurring:
 *           type: boolean
 *           default: false
 *           example: true
 *
 *     ExpenseUpdate:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *         amount:
 *           type: number
 *           minimum: 0.01
 *         category:
 *           type: string
 *           enum: [hosting, database, domain, api, software, hardware, marketing, other]
 *         expense_date:
 *           type: string
 *           format: date
 *         vendor:
 *           type: string
 *           maxLength: 100
 *         receipt_url:
 *           type: string
 *           format: uri
 *           maxLength: 500
 *         recurring:
 *           type: boolean
 *
 *     ExpenseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Expense retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Expense'
 *
 *     ExpensesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Expenses retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Expense'
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
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 average:
 *                   type: number
 *                 max:
 *                   type: number
 *                 min:
 *                   type: number
 *                 count:
 *                   type: integer
 *                 recurring:
 *                   type: integer
 *                 formatted_total:
 *                   type: string
 *                 formatted_average:
 *                   type: string
 *
 *     ExpenseSummary:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           example: 1250.50
 *         average:
 *           type: number
 *           example: 104.21
 *         count:
 *           type: integer
 *           example: 12
 *         formatted_total:
 *           type: string
 *           example: "$1,250.50"
 *         formatted_average:
 *           type: string
 *           example: "$104.21"
 *         categories:
 *           type: object
 *         monthlyData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: integer
 *               month_name:
 *                 type: string
 *               total:
 *                 type: number
 *               count:
 *                 type: integer
 *               formatted_total:
 *                 type: string
 *         yearlyTotal:
 *           type: number
 *         recurringTotal:
 *           type: number
 *         summary:
 *           type: string
 *
 *     CategoryBreakdown:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *         category_label:
 *           type: string
 *         category_icon:
 *           type: string
 *         category_color:
 *           type: string
 *         total:
 *           type: number
 *         formatted_total:
 *           type: string
 *         count:
 *           type: integer
 *         percentage:
 *           type: number
 *         expenses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Expense'
 */

// ============================================
// EXPENSE TAGS
// ============================================

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management endpoints
 */

// ============================================
// EXPENSE ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/expenses:
 *   get:
 *     summary: Get all expenses for a project
 *     tags: [Expenses]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [hosting, database, domain, api, software, hardware, marketing, other]
 *         description: Filter by category
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses up to this date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount filter
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount filter
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor (partial match)
 *       - in: query
 *         name: recurring
 *         schema:
 *           type: boolean
 *         description: Filter by recurring status
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
 *           enum: [expense_date, amount, category, created_at]
 *           default: expense_date
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
 *         description: Expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpensesListResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
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
 *             $ref: '#/components/schemas/ExpenseCreate'
 *     responses:
 *       201:
 *         description: Expense created successfully
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
 *                   example: "Expense created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
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
 * /api/expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense UUID
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseUpdate'
 *     responses:
 *       200:
 *         description: Expense updated successfully
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
 *                   example: "Expense updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Expense UUID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
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
 *                   example: "Expense deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/expenses/summary:
 *   get:
 *     summary: Get expense summary
 *     tags: [Expenses]
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
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to filter (default: current year)
 *     responses:
 *       200:
 *         description: Expense summary retrieved successfully
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
 *                   example: "Expense summary retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseSummary'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/expenses/categories:
 *   get:
 *     summary: Get expenses by category
 *     tags: [Expenses]
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
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter up to this date
 *     responses:
 *       200:
 *         description: Expenses by category retrieved successfully
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
 *                   example: "Expenses by category retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryBreakdown'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/expenses/total:
 *   get:
 *     summary: Get total expenses
 *     tags: [Expenses]
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
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter up to this date
 *     responses:
 *       200:
 *         description: Total expenses calculated successfully
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
 *                   example: "Total expenses calculated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     count:
 *                       type: integer
 *                     average:
 *                       type: number
 *                     formatted_total:
 *                       type: string
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           label:
 *                             type: string
 *                           total:
 *                             type: number
 *                           formatted_total:
 *                             type: string
 *                           percentage:
 *                             type: number
 *                           count:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/expenses/monthly:
 *   get:
 *     summary: Get monthly expenses
 *     tags: [Expenses]
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
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to filter (default: current year)
 *     responses:
 *       200:
 *         description: Monthly expenses retrieved successfully
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
 *                   example: "Monthly expenses retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: integer
 *                       month_name:
 *                         type: string
 *                       total:
 *                         type: number
 *                       formatted_total:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       average:
 *                         type: number
 *                       formatted_average:
 *                         type: string
 *                       expenses:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Expense'
 *                       categories:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/expenses/export:
 *   get:
 *     summary: Export expenses
 *     tags: [Expenses]
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
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter up to this date
 *     responses:
 *       200:
 *         description: Expenses exported successfully
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
 *                   example: "Expenses exported successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     expenses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Expense'
 *                     report:
 *                       type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     format:
 *                       type: string
 *                     count:
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
 * /api/projects/{projectId}/expenses/statistics:
 *   get:
 *     summary: Get expense statistics
 *     tags: [Expenses]
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
 *         description: Expense statistics retrieved successfully
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
 *                   example: "Expense statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       $ref: '#/components/schemas/ExpenseSummary'
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryBreakdown'
 *                     categoryOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           color:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

module.exports = {
  // Exports for Swagger
};
