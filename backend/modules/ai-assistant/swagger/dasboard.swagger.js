/**
 * @swagger
 * components:
 *   schemas:
 *
 *     AIDashboardStats:
 *       type: object
 *       properties:
 *
 *         stats:
 *           type: object
 *           properties:
 *
 *             totalInteractions:
 *               type: integer
 *               example: 124
 *
 *             totalProjects:
 *               type: integer
 *               example: 8
 *
 *             questions:
 *               type: integer
 *               example: 73
 *
 *             analyses:
 *               type: integer
 *               example: 21
 *
 *             reports:
 *               type: integer
 *               example: 12
 *
 *             summaries:
 *               type: integer
 *               example: 8
 *
 *             actions:
 *               type: integer
 *               example: 6
 *
 *             trends:
 *               type: integer
 *               example: 4
 *
 *             lastActivityAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: "2026-09-01T07:30:00.000Z"
 *
 *         activities:
 *           type: array
 *           description: AI activity sorted from newest to oldest
 *           items:
 *             type: object
 *             properties:
 *
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "4e5b3d6c-3a77-4c3d-8c12-12f5f0d4a111"
 *
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *                 example: "4e5b3d6c-3a77-4c3d-8c12-12f5f0d4a111"
 *
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "f3c7d3b2-4f8e-4e8a-9f0b-88f7c12a9001"
 *
 *               projectName:
 *                 type: string
 *                 example: "Payment Platform"
 *
 *               projectStatus:
 *                 type: string
 *                 nullable: true
 *                 example: "in_progress"
 *
 *               type:
 *                 type: string
 *                 enum:
 *                   - ask_question
 *                   - analyze_project
 *                   - summarize_text
 *                   - generate_report
 *                   - suggest_next_actions
 *                   - analyze_trends
 *                 example: analyze_project
 *
 *               title:
 *                 type: string
 *                 example: Project Analysis
 *
 *               question:
 *                 type: string
 *                 nullable: true
 *                 example: "[analyze_project] Analyze the current project risks"
 *
 *               answer:
 *                 type: string
 *                 nullable: true
 *                 example: "[usage tracking]"
 *
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-01T07:30:00.000Z"
 *
 *         pagination:
 *           type: object
 *           properties:
 *
 *             page:
 *               type: integer
 *               example: 1
 *
 *             limit:
 *               type: integer
 *               example: 20
 *
 *             total:
 *               type: integer
 *               example: 124
 *
 *             totalPages:
 *               type: integer
 *               example: 7
 *
 *             hasNextPage:
 *               type: boolean
 *               example: true
 *
 *             hasPreviousPage:
 *               type: boolean
 *               example: false
 *
 *         filters:
 *           type: object
 *           properties:
 *
 *             fromDate:
 *               type: string
 *               format: date-time
 *               nullable: true
 *
 *             toDate:
 *               type: string
 *               format: date-time
 *               nullable: true
 *
 *             type:
 *               type: string
 *               nullable: true
 *
 *             projectId:
 *               type: string
 *               format: uuid
 *               nullable: true
 */
