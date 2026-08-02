const express = require("express");
const { BugController } = require("../controllers/bug.controller");
const { ProjectMiddleware } = require("../middleware/project.middleware");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const ValidationMiddleware = require("../../../common/middleware/validation.middleware");
const Joi = require("joi");

const router = express.Router();
const bugController = new BugController();
const projectMiddleware = new ProjectMiddleware();

// Validation schemas
const bugSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().allow(""),
  status: Joi.string().valid(
    "reported",
    "investigating",
    "in_progress",
    "fixed",
    "verified",
    "closed"
  ),
  priority: Joi.string().valid("low", "medium", "high", "critical"),
  cause: Joi.string().allow(""),
  possible_fix: Joi.string().allow(""),
  reported_by: Joi.string().allow(""),
  assigned_to: Joi.string().allow(""),
});

const updateBugSchema = bugSchema.fork(
  [
    "title",
    "description",
    "status",
    "priority",
    "cause",
    "possible_fix",
    "reported_by",
    "assigned_to",
  ],
  (schema) => schema.optional()
);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "reported",
      "investigating",
      "in_progress",
      "fixed",
      "verified",
      "closed"
    )
    .required(),
});

const assignSchema = Joi.object({
  assignee: Joi.string().required(),
});

const resolveSchema = Joi.object({
  resolution: Joi.string().required(),
});

// Bug routes
router.get(
  "/projects/:projectId/bugs",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  bugController.getBugs
);

router.post(
  "/projects/:projectId/bugs",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  ValidationMiddleware.validateRequest(bugSchema),
  bugController.createBug
);

router.get("/bugs/:id", AuthMiddleware.authenticate, bugController.getBugById);

router.put(
  "/bugs/:id",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(updateBugSchema),
  bugController.updateBug
);

router.patch(
  "/bugs/:id/status",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(statusSchema),
  bugController.updateBugStatus
);

router.patch(
  "/bugs/:id/assign",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(assignSchema),
  bugController.assignBug
);

router.patch(
  "/bugs/:id/resolve",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(resolveSchema),
  bugController.resolveBug
);

router.delete(
  "/bugs/:id",
  AuthMiddleware.authenticate,
  bugController.deleteBug
);

// Export
module.exports = router;
