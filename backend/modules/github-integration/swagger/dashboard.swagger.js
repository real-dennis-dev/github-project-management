/**
 * @swagger
 * /api/github/stats:
 *   get:
 *     summary: Get GitHub dashboard statistics
 *     description: |
 *       Returns aggregated GitHub statistics across all projects
 *       accessible to the authenticated user.
 *
 *       This endpoint intentionally does not accept a projectId.
 *       Statistics are aggregated across all accessible projects
 *       and repositories.
 *
 *       The activity list combines commits, pull requests and issues
 *       into a single timeline sorted by the latest activity.
 *
 *     tags:
 *       - GitHub
 *
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
 *         description: Activity page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of activity records per page
 *
 *     responses:
 *       200:
 *         description: GitHub dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: object
 *
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: integer
 *                           example: 8
 *
 *                         repositories:
 *                           type: integer
 *                           example: 14
 *
 *                         commits:
 *                           type: integer
 *                           example: 1248
 *
 *                         branches:
 *                           type: integer
 *                           example: 42
 *
 *                         pullRequests:
 *                           type: integer
 *                           example: 156
 *
 *                         issues:
 *                           type: integer
 *                           example: 87
 *
 *                         openPullRequests:
 *                           type: integer
 *                           example: 12
 *
 *                         mergedPullRequests:
 *                           type: integer
 *                           example: 133
 *
 *                         closedPullRequests:
 *                           type: integer
 *                           example: 11
 *
 *                         openIssues:
 *                           type: integer
 *                           example: 24
 *
 *                         closedIssues:
 *                           type: integer
 *                           example: 63
 *
 *                         totalAdditions:
 *                           type: integer
 *                           example: 48291
 *
 *                         totalDeletions:
 *                           type: integer
 *                           example: 19482
 *
 *                         totalChanges:
 *                           type: integer
 *                           example: 67773
 *
 *                     projects:
 *                       type: array
 *                       description: Project-level GitHub statistics sorted by latest activity
 *                       items:
 *                         type: object
 *                         properties:
 *                           projectId:
 *                             type: string
 *                             format: uuid
 *
 *                           projectName:
 *                             type: string
 *                             example: Readly
 *
 *                           latestActivityAt:
 *                             type: string
 *                             format: date-time
 *
 *                           stats:
 *                             type: object
 *                             properties:
 *                               repositories:
 *                                 type: integer
 *                               commits:
 *                                 type: integer
 *                               branches:
 *                                 type: integer
 *                               pullRequests:
 *                                 type: integer
 *                               issues:
 *                                 type: integer
 *                               openPullRequests:
 *                                 type: integer
 *                               mergedPullRequests:
 *                                 type: integer
 *                               openIssues:
 *                                 type: integer
 *                               closedIssues:
 *                                 type: integer
 *
 *                           repositories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 repositoryId:
 *                                   type: string
 *                                   format: uuid
 *
 *                                 projectId:
 *                                   type: string
 *                                   format: uuid
 *
 *                                 name:
 *                                   type: string
 *                                   example: readly-api
 *
 *                                 owner:
 *                                   type: string
 *                                   example: dennis
 *
 *                                 url:
 *                                   type: string
 *                                   format: uri
 *
 *                                 defaultBranch:
 *                                   type: string
 *                                   example: main
 *
 *                                 lastSyncedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *
 *                                 latestActivityAt:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *
 *                                 stats:
 *                                   type: object
 *                                   properties:
 *                                     commits:
 *                                       type: integer
 *                                     branches:
 *                                       type: integer
 *                                     pullRequests:
 *                                       type: integer
 *                                     issues:
 *                                       type: integer
 *                                     openPullRequests:
 *                                       type: integer
 *                                     mergedPullRequests:
 *                                       type: integer
 *                                     closedPullRequests:
 *                                       type: integer
 *                                     openIssues:
 *                                       type: integer
 *                                     closedIssues:
 *                                       type: integer
 *                                     additions:
 *                                       type: integer
 *                                     deletions:
 *                                       type: integer
 *                                     totalChanges:
 *                                       type: integer
 *
 *                     activity:
 *                       type: array
 *                       description: |
 *                         Unified GitHub activity feed containing commits,
 *                         pull requests and issues sorted from newest to oldest.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *
 *                           type:
 *                             type: string
 *                             enum:
 *                               - commit
 *                               - pull_request
 *                               - issue
 *
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *
 *                           project:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *
 *                           repository:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               owner:
 *                                 type: string
 *                               url:
 *                                 type: string
 *                                 format: uri
 *
 *                           data:
 *                             type: object
 *
 *                           navigation:
 *                             type: object
 *                             properties:
 *                               projectId:
 *                                 type: string
 *                                 format: uuid
 *                               repositoryId:
 *                                 type: string
 *                                 format: uuid
 *                               resource:
 *                                 type: string
 *                                 enum:
 *                                   - commits
 *                                   - pull-requests
 *                                   - issues
 *                               resourceId:
 *                                 type: string
 *
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 1491
 *                         pages:
 *                           type: integer
 *                           example: 75
 *
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *
 *       401:
 *         description: Authentication required
 *
 *       500:
 *         description: Failed to retrieve GitHub dashboard statistics
 */
