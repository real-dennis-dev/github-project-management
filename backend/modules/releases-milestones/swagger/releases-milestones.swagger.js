/**
 * Swagger documentation for Releases & Milestones Module
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Release:
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
 *         version:
 *           type: string
 *           pattern: '^\d+\.\d+\.\d+$'
 *           example: "1.0.0"
 *         description:
 *           type: string
 *           example: "Initial production release with core features"
 *         status:
 *           type: string
 *           enum: [planned, in_progress, testing, released, cancelled]
 *           example: "planned"
 *         release_date:
 *           type: string
 *           format: date
 *           example: "2024-02-15"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *
 *     ReleaseDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Release'
 *         - type: object
 *           properties:
 *             features:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   is_completed:
 *                     type: boolean
 *             readiness:
 *               type: object
 *               properties:
 *                 percentage:
 *                   type: integer
 *                   example: 75
 *                 totalFeatures:
 *                   type: integer
 *                   example: 10
 *                 completedFeatures:
 *                   type: integer
 *                   example: 7
 *                 status:
 *                   type: string
 *                   example: "75% complete"
 *                 readiness:
 *                   type: string
 *                   enum: [low, medium, high, ready]
 *                   example: "high"
 *             total_features:
 *               type: integer
 *               example: 10
 *             completed_features:
 *               type: integer
 *               example: 7
 *
 *     ReleaseCreate:
 *       type: object
 *       required:
 *         - version
 *       properties:
 *         version:
 *           type: string
 *           pattern: '^\d+\.\d+\.\d+$'
 *           example: "1.0.0"
 *         description:
 *           type: string
 *           example: "Initial production release with core features"
 *         status:
 *           type: string
 *           enum: [planned, in_progress, testing, released, cancelled]
 *           default: planned
 *           example: "planned"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["123e4567-e89b-12d3-a456-426614174002"]
 *         release_date:
 *           type: string
 *           format: date
 *           example: "2024-02-15"
 *
 *     ReleaseUpdate:
 *       type: object
 *       properties:
 *         version:
 *           type: string
 *           pattern: '^\d+\.\d+\.\d+$'
 *           example: "1.0.1"
 *         description:
 *           type: string
 *           example: "Patch release with bug fixes"
 *         status:
 *           type: string
 *           enum: [planned, in_progress, testing, released, cancelled]
 *         release_date:
 *           type: string
 *           format: date
 *
 *     ReleaseStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [planned, in_progress, testing, released, cancelled]
 *           example: "released"
 *
 *     ReleaseProgress:
 *       type: object
 *       properties:
 *         percentage:
 *           type: integer
 *           example: 75
 *         totalFeatures:
 *           type: integer
 *           example: 10
 *         completedFeatures:
 *           type: integer
 *           example: 7
 *         status:
 *           type: string
 *           example: "75% complete"
 *         readiness:
 *           type: string
 *           enum: [low, medium, high, ready]
 *           example: "high"
 *
 *     ReleaseStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 5
 *         byStatus:
 *           type: object
 *           properties:
 *             planned:
 *               type: integer
 *             in_progress:
 *               type: integer
 *             testing:
 *               type: integer
 *             released:
 *               type: integer
 *             cancelled:
 *               type: integer
 *         latestRelease:
 *           $ref: '#/components/schemas/Release'
 *         nextRelease:
 *           $ref: '#/components/schemas/Release'
 *
 *     Milestone:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174010"
 *         project_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           example: "Alpha Release"
 *         description:
 *           type: string
 *           example: "Complete core features for alpha testing"
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed]
 *           example: "in_progress"
 *         target_date:
 *           type: string
 *           format: date
 *           example: "2024-03-15"
 *         completed_date:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: null
 *         progress_percentage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 60
 *         days_until_target:
 *           type: integer
 *           example: 15
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical, completed]
 *           example: "high"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *
 *     MilestoneCreate:
 *       type: object
 *       required:
 *         - name
 *         - target_date
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: "Alpha Release"
 *         description:
 *           type: string
 *           example: "Complete core features for alpha testing"
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed]
 *           default: not_started
 *         target_date:
 *           type: string
 *           format: date
 *           example: "2024-03-15"
 *         completed_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         progress_percentage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *
 *     MilestoneUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed]
 *         target_date:
 *           type: string
 *           format: date
 *         completed_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         progress_percentage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *
 *     MilestoneStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed]
 *
 *     MilestoneProgress:
 *       type: object
 *       properties:
 *         milestone_id:
 *           type: string
 *           format: uuid
 *         progress_percentage:
 *           type: integer
 *           example: 60
 *         status:
 *           type: string
 *           example: "in_progress"
 *         days_until_target:
 *           type: integer
 *           example: 15
 *         formatted:
 *           type: string
 *           example: "[████████░░░░░░░░░░] 60%"
 *
 *     MilestoneStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 8
 *         byStatus:
 *           type: object
 *           properties:
 *             not_started:
 *               type: integer
 *             in_progress:
 *               type: integer
 *             completed:
 *               type: integer
 *             delayed:
 *               type: integer
 *         averageProgress:
 *           type: integer
 *           example: 45
 *         overdueCount:
 *           type: integer
 *           example: 2
 *         completedCount:
 *           type: integer
 *           example: 3
 *         completionRate:
 *           type: integer
 *           example: 37
 *
 *     BulkUpdate:
 *       type: object
 *       required:
 *         - updates
 *       properties:
 *         updates:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - progress_percentage
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               progress_percentage:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *
 *   tags:
 *     - name: Releases
 *       description: Release management endpoints - Create, update, and track software releases
 *     - name: Milestones
 *       description: Milestone management endpoints - Track project milestones and progress
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/projects/{projectId}/releases:
 *   get:
 *     summary: Get all releases for a project
 *     description: Retrieves a paginated list of releases for a specific project with optional filtering
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, in_progress, testing, released, cancelled]
 *         description: Filter releases by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, release_date, version, status]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Releases retrieved successfully
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
 *                   example: "Releases retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReleaseDetail'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     statistics:
 *                       $ref: '#/components/schemas/ReleaseStatistics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new release
 *     description: Creates a new release for a project with semantic versioning
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReleaseCreate'
 *           example:
 *             version: "1.0.0"
 *             description: "Initial production release"
 *             status: "planned"
 *             release_date: "2024-02-15"
 *     responses:
 *       201:
 *         description: Release created successfully
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
 *                   example: "Release created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ReleaseDetail'
 *       400:
 *         description: Validation error - Invalid version format or duplicate version
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Project not found
 *       409:
 *         description: Version already exists for this project
 *       500:
 *         description: Internal server error
 *
 * /api/releases/{id}:
 *   get:
 *     summary: Get release by ID
 *     description: Retrieves detailed information about a specific release including its features and readiness
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     responses:
 *       200:
 *         description: Release retrieved successfully
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
 *                   example: "Release retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ReleaseDetail'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Release not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a release
 *     description: Updates release information including version, description, and status
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReleaseUpdate'
 *           example:
 *             version: "1.0.1"
 *             description: "Patch release with bug fixes"
 *             status: "testing"
 *     responses:
 *       200:
 *         description: Release updated successfully
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
 *                   example: "Release updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ReleaseDetail'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Release not found
 *       409:
 *         description: Version already exists
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a release
 *     description: Permanently deletes a release. Only allowed if no features are assigned.
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     responses:
 *       200:
 *         description: Release deleted successfully
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
 *                   example: "Release deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions or release has features
 *       404:
 *         description: Release not found
 *       500:
 *         description: Internal server error
 *
 * /api/releases/{id}/status:
 *   patch:
 *     summary: Update release status
 *     description: Updates the status of a release. Validates transition rules and feature completion for release
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReleaseStatusUpdate'
 *           example:
 *             status: "released"
 *     responses:
 *       200:
 *         description: Release status updated successfully
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
 *                   example: "Release status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ReleaseDetail'
 *       400:
 *         description: Invalid status transition or features not complete
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Release not found
 *       500:
 *         description: Internal server error
 *
 * /api/releases/{id}/features:
 *   post:
 *     summary: Add features to release
 *     description: Adds one or more features to a release
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featureIds
 *             properties:
 *               featureIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["123e4567-e89b-12d3-a456-426614174002"]
 *     responses:
 *       200:
 *         description: Features added successfully
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
 *                   example: "Features added to release successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       feature_id:
 *                         type: string
 *                         format: uuid
 *                       is_completed:
 *                         type: boolean
 *       400:
 *         description: Invalid feature IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Release not found or features not found
 *       500:
 *         description: Internal server error
 *
 * /api/releases/{id}/features/{featureId}:
 *   delete:
 *     summary: Remove feature from release
 *     description: Removes a feature from a release
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *       - in: path
 *         name: featureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The feature UUID
 *     responses:
 *       200:
 *         description: Feature removed successfully
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
 *                   example: "Feature removed from release successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Release or feature not found
 *       500:
 *         description: Internal server error
 *
 * /api/releases/{id}/progress:
 *   get:
 *     summary: Get release progress
 *     description: Calculates and returns the progress and readiness of a release
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     responses:
 *       200:
 *         description: Release progress retrieved successfully
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
 *                   example: "Release progress retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ReleaseProgress'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Release not found
 *       500:
 *         description: Internal server error
 *
 * /api/releases/{id}/changelog:
 *   get:
 *     summary: Generate changelog
 *     description: Generates a formatted changelog for a release
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The release UUID
 *     responses:
 *       200:
 *         description: Changelog generated successfully
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
 *                   example: "Changelog generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     changelog:
 *                       type: string
 *                       example: "# Release 1.0.0\n\n## Description\nInitial production release\n\n## Status\nRELEASED\n\n## Features\n1. ✅ Feature 1\n2. ✅ Feature 2"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Release not found
 *       500:
 *         description: Internal server error
 *
 * /api/projects/{projectId}/releases/statistics:
 *   get:
 *     summary: Get release statistics
 *     description: Returns comprehensive statistics about all releases for a project
 *     tags: [Releases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *     responses:
 *       200:
 *         description: Release statistics retrieved successfully
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
 *                   example: "Release statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ReleaseStatistics'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

// ============================================
// MILESTONE ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   get:
 *     summary: Get all milestones for a project
 *     description: Retrieves a paginated list of milestones for a specific project with optional filtering
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed, delayed]
 *         description: Filter milestones by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, target_date, status, progress_percentage]
 *           default: target_date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Milestones retrieved successfully
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
 *                   example: "Milestones retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Milestone'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     statistics:
 *                       $ref: '#/components/schemas/MilestoneStatistics'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new milestone
 *     description: Creates a new milestone for a project
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MilestoneCreate'
 *           example:
 *             name: "Alpha Release"
 *             description: "Complete core features for alpha testing"
 *             target_date: "2024-03-15"
 *             status: "planned"
 *     responses:
 *       201:
 *         description: Milestone created successfully
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
 *                   example: "Milestone created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Milestone'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 * /api/milestones/{id}:
 *   get:
 *     summary: Get milestone by ID
 *     description: Retrieves detailed information about a specific milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The milestone UUID
 *     responses:
 *       200:
 *         description: Milestone retrieved successfully
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
 *                   example: "Milestone retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Milestone'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a milestone
 *     description: Updates milestone information including name, description, status, and dates
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The milestone UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MilestoneUpdate'
 *           example:
 *             name: "Alpha Release - Extended"
 *             description: "Complete core features with additional UI polish"
 *             status: "in_progress"
 *             target_date: "2024-03-20"
 *             progress_percentage: 60
 *     responses:
 *       200:
 *         description: Milestone updated successfully
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
 *                   example: "Milestone updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Milestone'
 *       400:
 *         description: Validation error or invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a milestone
 *     description: Permanently deletes a milestone. Only allowed for non-completed milestones.
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The milestone UUID
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
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
 *                   example: "Milestone deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions or milestone is completed
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 *
 * /api/milestones/{id}/status:
 *   patch:
 *     summary: Update milestone status
 *     description: Updates the status of a milestone with transition validation
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The milestone UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MilestoneStatusUpdate'
 *           example:
 *             status: "in_progress"
 *     responses:
 *       200:
 *         description: Milestone status updated successfully
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
 *                   example: "Milestone status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Milestone'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 *
 * /api/milestones/{id}/progress:
 *   get:
 *     summary: Get milestone progress
 *     description: Calculates and returns detailed progress information for a milestone
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The milestone UUID
 *     responses:
 *       200:
 *         description: Milestone progress retrieved successfully
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
 *                   example: "Milestone progress retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MilestoneProgress'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Milestone not found
 *       500:
 *         description: Internal server error
 *
 * /api/projects/{projectId}/milestones/overdue:
 *   get:
 *     summary: Get overdue milestones
 *     description: Retrieves all overdue milestones for a project (incomplete milestones past their target date)
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *     responses:
 *       200:
 *         description: Overdue milestones retrieved successfully
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
 *                   example: "Overdue milestones retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Milestone'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 * /api/projects/{projectId}/milestones/statistics:
 *   get:
 *     summary: Get milestone statistics
 *     description: Returns comprehensive statistics about all milestones for a project
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *     responses:
 *       200:
 *         description: Milestone statistics retrieved successfully
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
 *                   example: "Milestone statistics retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MilestoneStatistics'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 * /api/projects/{projectId}/milestones/bulk-update:
 *   post:
 *     summary: Bulk update milestone progress
 *     description: Updates progress for multiple milestones in a single request
 *     tags: [Milestones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkUpdate'
 *           example:
 *             updates:
 *               - id: "123e4567-e89b-12d3-a456-426614174010"
 *                 progress_percentage: 60
 *               - id: "123e4567-e89b-12d3-a456-426614174011"
 *                 progress_percentage: 80
 *     responses:
 *       200:
 *         description: Milestone progress updated successfully
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
 *                   example: "Milestone progress updated successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Milestone'
 *       400:
 *         description: Validation error - Invalid updates or progress values
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Project not found or milestones not found
 *       500:
 *         description: Internal server error
 */

module.exports = {
  // Tag and schema exports for Swagger
  tags: ["Releases", "Milestones"],
  schemas: {
    Release,
    ReleaseDetail,
    ReleaseCreate,
    ReleaseUpdate,
    ReleaseStatusUpdate,
    ReleaseProgress,
    ReleaseStatistics,
    Milestone,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneStatusUpdate,
    MilestoneProgress,
    MilestoneStatistics,
    BulkUpdate,
  },
};
