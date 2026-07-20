import express from "express";
import { BugController } from "../controllers/bug.controller.js";
import { ProjectMiddleware } from "../middleware/project.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import Joi from "joi";

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
  authMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  bugController.getBugs
);

router.post(
  "/projects/:projectId/bugs",
  authMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  validationMiddleware.validateRequest(bugSchema),
  bugController.createBug
);

router.get("/bugs/:id", authMiddleware.authenticate, bugController.getBugById);

router.put(
  "/bugs/:id",
  authMiddleware.authenticate,
  validationMiddleware.validateRequest(updateBugSchema),
  bugController.updateBug
);

router.patch(
  "/bugs/:id/status",
  authMiddleware.authenticate,
  validationMiddleware.validateRequest(statusSchema),
  bugController.updateBugStatus
);

router.patch(
  "/bugs/:id/assign",
  authMiddleware.authenticate,
  validationMiddleware.validateRequest(assignSchema),
  bugController.assignBug
);

router.patch(
  "/bugs/:id/resolve",
  authMiddleware.authenticate,
  validationMiddleware.validateRequest(resolveSchema),
  bugController.resolveBug
);

router.delete(
  "/bugs/:id",
  authMiddleware.authenticate,
  bugController.deleteBug
);

export default router;
