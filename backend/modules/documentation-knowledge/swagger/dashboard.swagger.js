/**
 * @swagger
 * /api/documentation-knowledge/stats:
 *   get:
 *     summary: Dashboard – aggregated stats + combined latest items
 *     description: |
 *       Returns overall statistics for **all documentation across every project**
 *       and **all knowledge-base entries**, plus a combined list of the most recent
 *       items sorted by latest activity. Ideal for a module-level dashboard.
 *       The user can click any item in the list to open its detail view.
 *     tags: [Documentation, Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items to return in the combined list
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at]
 *           default: updated_at
 *         description: Field to sort the combined list by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Stats and combined latest items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totals:
 *                           type: object
 *                           properties:
 *                             documentation:
 *                               type: integer
 *                             knowledge:
 *                               type: integer
 *                             combined:
 *                               type: integer
 *                         byType:
 *                           type: object
 *                           properties:
 *                             documentation:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                   count:
 *                                     type: integer
 *                             knowledge:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   category:
 *                                     type: string
 *                                   count:
 *                                     type: integer
 *                         recentActivity:
 *                           type: object
 *                           properties:
 *                             last7Days:
 *                               type: object
 *                               properties:
 *                                 documentation: { type: integer }
 *                                 knowledge: { type: integer }
 *                                 combined: { type: integer }
 *                             last30Days:
 *                               type: object
 *                               properties:
 *                                 documentation: { type: integer }
 *                                 knowledge: { type: integer }
 *                                 combined: { type: integer }
 *                     items:
 *                       type: array
 *                       description: Combined list of latest documentation + knowledge entries (clickable)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           type:
 *                             type: string
 *                             enum: [documentation, knowledge]
 *                             description: Use this to decide which detail endpoint to call
 *                           title:
 *                             type: string
 *                           subtitle:
 *                             type: string
 *                             description: doc_type or category
 *                           projectId:
 *                             type: string
 *                             format: uuid
 *                             nullable: true
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                 message:
 *                   type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
