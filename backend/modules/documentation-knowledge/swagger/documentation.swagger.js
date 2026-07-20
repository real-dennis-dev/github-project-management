/**
 * @swagger
 * tags:
 *   - name: Documentation
 *     description: Project documentation management
 *   - name: Knowledge Base
 *     description: Knowledge base management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Documentation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier
 *         project_id:
 *           type: string
 *           format: uuid
 *           description: Project ID
 *         title:
 *           type: string
 *           description: Document title
 *         content:
 *           type: string
 *           description: Document content
 *         doc_type:
 *           type: string
 *           enum: [api, erd, flowchart, user_manual, technical, other]
 *           description: Document type
 *         version:
 *           type: integer
 *           description: Document version
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorization
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     KnowledgeEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier
 *         category:
 *           type: string
 *           description: Category name
 *         topic:
 *           type: string
 *           description: Topic title
 *         content:
 *           type: string
 *           description: Content
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorization
 *         related_links:
 *           type: array
 *           items:
 *             type: string
 *             format: url
 *           description: Related links
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     CreateDocumentationRequest:
 *       type: object
 *       required:
 *         - title
 *         - doc_type
 *       properties:
 *         title:
 *           type: string
 *           description: Document title
 *         content:
 *           type: string
 *           description: Document content
 *         doc_type:
 *           type: string
 *           enum: [api, erd, flowchart, user_manual, technical, other]
 *           description: Document type
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorization
 *         version:
 *           type: integer
 *           description: Initial version
 *
 *     UpdateDocumentationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated title
 *         content:
 *           type: string
 *           description: Updated content
 *         doc_type:
 *           type: string
 *           enum: [api, erd, flowchart, user_manual, technical, other]
 *           description: Updated document type
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Updated tags
 *
 *     CreateKnowledgeRequest:
 *       type: object
 *       required:
 *         - category
 *         - topic
 *         - content
 *       properties:
 *         category:
 *           type: string
 *           description: Category name
 *         topic:
 *           type: string
 *           description: Topic title
 *         content:
 *           type: string
 *           description: Content
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags
 *         related_links:
 *           type: array
 *           items:
 *             type: string
 *             format: url
 *           description: Related links
 *
 *     UpdateKnowledgeRequest:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           description: Updated category
 *         topic:
 *           type: string
 *           description: Updated topic
 *         content:
 *           type: string
 *           description: Updated content
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Updated tags
 *         related_links:
 *           type: array
 *           items:
 *             type: string
 *             format: url
 *           description: Updated related links
 */

/**
 * @swagger
 * /api/projects/{projectId}/documentation:
 *   get:
 *     summary: Get project documentation
 *     tags: [Documentation]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [api, erd, flowchart, user_manual, technical, other]
 *         description: Filter by document type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Documentation'
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
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/documentation:
 *   post:
 *     summary: Create documentation
 *     tags: [Documentation]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDocumentationRequest'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Documentation'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/projects/{projectId}/documentation/search:
 *   get:
 *     summary: Search documentation
 *     tags: [Documentation]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: doc_type
 *         schema:
 *           type: string
 *           enum: [api, erd, flowchart, user_manual, technical, other]
 *         description: Filter by document type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Documentation'
 *                       - type: object
 *                         properties:
 *                           relevance:
 *                             type: number
 *                             description: Search relevance score
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
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/documentation/{id}:
 *   get:
 *     summary: Get documentation by ID
 *     tags: [Documentation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Documentation ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Documentation'
 *                 message:
 *                   type: string
 *       404:
 *         description: Documentation not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update documentation
 *     tags: [Documentation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Documentation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDocumentationRequest'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Documentation'
 *                 message:
 *                   type: string
 *       404:
 *         description: Documentation not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete documentation
 *     tags: [Documentation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Documentation ID
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Documentation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/knowledge-base:
 *   get:
 *     summary: Get knowledge entries
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KnowledgeEntry'
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
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create knowledge entry
 *     tags: [Knowledge Base]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateKnowledgeRequest'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KnowledgeEntry'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/knowledge-base/search:
 *   get:
 *     summary: Search knowledge base
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/KnowledgeEntry'
 *                       - type: object
 *                         properties:
 *                           relevance:
 *                             type: number
 *                             description: Search relevance score
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
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/knowledge-base/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Knowledge Base]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/knowledge-base/{id}:
 *   get:
 *     summary: Get knowledge entry by ID
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Knowledge entry ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KnowledgeEntry'
 *                 message:
 *                   type: string
 *       404:
 *         description: Knowledge entry not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update knowledge entry
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Knowledge entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateKnowledgeRequest'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KnowledgeEntry'
 *                 message:
 *                   type: string
 *       404:
 *         description: Knowledge entry not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete knowledge entry
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Knowledge entry ID
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Knowledge entry not found
 *       500:
 *         description: Server error
 */

export default {
  paths: {},
  schemas: {},
};
