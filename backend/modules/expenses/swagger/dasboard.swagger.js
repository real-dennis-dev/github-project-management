
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     ExpenseDashboardStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           format: float
 *           example: 12540.75
 *
 *         count:
 *           type: integer
 *           example: 87
 *
 *         average:
 *           type: number
 *           format: float
 *           example: 144.15
 *
 *         max:
 *           type: number
 *           format: float
 *           example: 2500
 *
 *         min:
 *           type: number
 *           format: float
 *           example: 5.99
 *
 *         recurring_count:
 *           type: integer
 *           example: 12
 *
 *         recurring_total:
 *           type: number
 *           example: 1200
 *
 *         current_month_total:
 *           type: number
 *           example: 1450.50
 *
 *         previous_month_total:
 *           type: number
 *           example: 1200
 *
 *         monthly_change_percentage:
 *           type: number
 *           example: 20.88
 *
 *         formatted_total:
 *           type: string
 *           example: "$12,540.75"
 *
 *         formatted_average:
 *           type: string
 *           example: "$144.15"
 *
 *         formatted_max:
 *           type: string
 *           example: "$2,500.00"
 *
 *         formatted_min:
 *           type: string
 *           example: "$5.99"
 *
 *         formatted_recurring_total:
 *           type: string
 *           example: "$1,200.00"
 *
 *         formatted_current_month_total:
 *           type: string
 *           example: "$1,450.50"
 *
 *         formatted_previous_month_total:
 *           type: string
 *           example: "$1,200.00"
 *
 *
 *     ExpenseDashboardCategory:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           example: hosting
 *
 *         category_label:
 *           type: string
 *           example: Hosting
 *
 *         category_icon:
 *           type: string
 *           example: "☁️"
 *
 *         category_color:
 *           type: string
 *           example: "#4CAF50"
 *
 *         total:
 *           type: number
 *           example: 4500
 *
 *         formatted_total:
 *           type: string
 *           example: "$4,500.00"
 *
 *         count:
 *           type: integer
 *           example: 18
 *
 *         percentage:
 *           type: number
 *           example: 35.88
 *
 *
 *     ExpenseDashboardProject:
 *       type: object
 *       properties:
 *         project_id:
 *           type: string
 *           format: uuid
 *
 *         project_name:
 *           type: string
 *           example: Readly
 *
 *         total:
 *           type: number
 *           example: 5200
 *
 *         formatted_total:
 *           type: string
 *           example: "$5,200.00"
 *
 *         count:
 *           type: integer
 *           example: 27
 *
 *         percentage:
 *           type: number
 *           example: 41.47
 *
 *
 *     ExpenseDashboardMonthlyTrend:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           example: "2026-08"
 *
 *         total:
 *           type: number
 *           example: 1800
 *
 *         formatted_total:
 *           type: string
 *           example: "$1,800.00"
 *
 *         count:
 *           type: integer
 *           example: 14
 *
 *         average:
 *           type: number
 *           example: 128.57
 *
 *         formatted_average:
 *           type: string
 *           example: "$128.57"
 *
 *
 *     ExpenseDashboardPagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *
 *         limit:
 *           type: integer
 *           example: 20
 *
 *         total:
 *           type: integer
 *           example: 87
 *
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 *
 *
 *     ExpenseDashboardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *
 *         message:
 *           type: string
 *           example: Expense dashboard retrieved successfully
 *
 *         data:
 *           type: object
 *           properties:
 *
 *             statistics:
 *               $ref: '#/components/schemas/ExpenseDashboardStatistics'
 *
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpenseDashboardCategory'
 *
 *             projects:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpenseDashboardProject'
 *
 *             monthlyTrend:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpenseDashboardMonthlyTrend'
 *
 *             topExpense:
 *               allOf:
 *                 - $ref: '#/components/schemas/Expense'
 *               nullable: true
 *
 *             latestExpenses:
 *               type: array
 *               description: Latest expenses across all projects sorted newest first
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Expense'
 *                   - type: object
 *                     properties:
 *                       project_id:
 *                         type: string
 *                         format: uuid
 *                       project_name:
 *                         type: string
 *                         example: Readly
 *
 *             pagination:
 *               $ref: '#/components/schemas/ExpenseDashboardPagination'
 *
 *             filters:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                   nullable: true
 *                 fromDate:
 *                   type: string
 *                   format: date
 *                   nullable: true
 *                 toDate:
 *                   type: string
 *                   format: date
 *                   nullable: true
 *                 minAmount:
 *                   type: number
 *                   nullable: true
 *                 maxAmount:
 *                   type: number
 *                   nullable: true
 *                 vendor:
 *                   type: string
 *                   nullable: true
 *                 recurring:
 *                   type: boolean
 *                   nullable: true
 *
 *             generatedAt:
 *               type: string
 *               format: date-time
 */
```

Then add the endpoint documentation:

```javascript
/**
 * @swagger
 * /api/expenses/dashboard:
 *   get:
 *     summary: Get expenses dashboard
 *     description: |
 *       Returns financial statistics and the latest expenses
 *       across all projects accessible to the authenticated user.
 *
 *       No project ID is required because the dashboard is
 *       intentionally aggregated across all projects.
 *
 *     tags:
 *       - Expenses
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum:
 *             - hosting
 *             - database
 *             - domain
 *             - api
 *             - software
 *             - hardware
 *             - marketing
 *             - other
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
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: recurring
 *         schema:
 *           type: boolean
 *
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
 *     responses:
 *
 *       200:
 *         description: Expense dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseDashboardResponse'
 *
 *       400:
 *         description: Invalid dashboard query parameters
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
