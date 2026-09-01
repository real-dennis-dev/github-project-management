const express = require("express");
const { ProjectController } = require("../controllers/project.controller");
const { ProjectMiddleware } = require("../middleware/project.middleware");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const ValidationMiddleware = require("../../../common/middleware/validation.middleware");
const DataMiddleware = require("../../../common/middleware/data.middleware");
const Joi = require("joi");

const router = express.Router();

const projectController = new ProjectController();
const projectMiddleware = new ProjectMiddleware();

// Validation schemas
const projectSchema = Joi.object({
  name: Joi.string().required().max(255),
  description: Joi.string().allow(""),
  status: Joi.string().valid(
    "planning",
    "in_progress",
    "paused",
    "completed",
    "archived"
  ),
  priority: Joi.string().valid("low", "medium", "high", "critical"),
  tech_stack: Joi.array().items(Joi.string()),
  repository_url: Joi.string().uri(),
  start_date: Joi.date().iso(),
  target_completion_date: Joi.date().iso().min(Joi.ref("start_date")),
});

const updateProjectSchema = projectSchema.fork(
  [
    "name",
    "description",
    "status",
    "priority",
    "tech_stack",
    "repository_url",
    "start_date",
    "target_completion_date",
  ],
  (schema) => schema.optional()
);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid("planning", "in_progress", "paused", "completed", "archived")
    .required(),
});

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, in_progress, paused, completed, archived]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get(
  "/projects",
  AuthMiddleware.authenticate,
  DataMiddleware.pagination,
  DataMiddleware.filterParser,
  DataMiddleware.sortParser,
  projectController.getAllProjects
);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, in_progress, paused, completed, archived]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               tech_stack:
 *                 type: array
 *                 items:
 *                   type: string
 *               repository_url:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               target_completion_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Project created
 */
router.post(
  "/projects",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(projectSchema),
  projectMiddleware.sanitizeProjectData,
  projectController.createProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get(
  "/projects:id",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectController.getProjectById
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project updated
 */
router.put(
  "/projects:id",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  ValidationMiddleware.validateRequest(updateProjectSchema),
  projectMiddleware.sanitizeProjectData,
  projectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}/status:
 *   patch:
 *     summary: Update project status
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  "/projects:id/status",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  ValidationMiddleware.validateRequest(statusSchema),
  projectController.updateProjectStatus
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.delete(
  "/projects:id",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  projectController.deleteProject
);

/**
 * @swagger
 * /api/projects/{id}/analytics:
 *   get:
 *     summary: Get project analytics
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Project analytics
 */
router.get(
  "/projects:id/stats",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectController.getProjectAnalytics
);

module.exports = router;
