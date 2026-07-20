import express from "express";
import { FeatureController } from "../controllers/feature.controller.js";
import { FeatureSubtaskController } from "../controllers/feature-subtask.controller.js";
import { FeatureMiddleware } from "../middleware/feature.middleware.js";
import { ProjectMiddleware } from "../middleware/project.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import Joi from "joi";

const router = express.Router();
const featureController = new FeatureController();
const subtaskController = new FeatureSubtaskController();
const featureMiddleware = new FeatureMiddleware();
const projectMiddleware = new ProjectMiddleware();

// Validation schemas
const featureSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().allow(""),
  status: Joi.string().valid(
    "planned",
    "in_progress",
    "completed",
    "blocked",
    "cancelled"
  ),
  difficulty: Joi.string().valid("easy", "medium", "hard", "expert"),
  estimated_days: Joi.number().integer().positive(),
  order_index: Joi.number().integer().min(0),
});

const updateFeatureSchema = featureSchema.fork(
  [
    "title",
    "description",
    "status",
    "difficulty",
    "estimated_days",
    "order_index",
  ],
  (schema) => schema.optional()
);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid("planned", "in_progress", "completed", "blocked", "cancelled")
    .required(),
});

const subtaskSchema = Joi.object({
  title: Joi.string().required().max(255),
  is_completed: Joi.boolean(),
});

const updateSubtaskSchema = subtaskSchema.fork(
  ["title", "is_completed"],
  (schema) => schema.optional()
);

const reorderSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  orderedIds: Joi.array().items(Joi.string().uuid()).required(),
});

// Feature routes
router.get(
  "/projects/:projectId/features",
  authMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  featureController.getFeatures
);

router.post(
  "/projects/:projectId/features",
  authMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  validationMiddleware.validateRequest(featureSchema),
  featureController.createFeature
);

router.get(
  "/features/:id",
  authMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureController.getFeatureById
);

router.put(
  "/features/:id",
  authMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  validationMiddleware.validateRequest(updateFeatureSchema),
  featureController.updateFeature
);

router.patch(
  "/features/:id/status",
  authMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  validationMiddleware.validateRequest(statusSchema),
  featureController.updateFeatureStatus
);

router.delete(
  "/features/:id",
  authMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  featureController.deleteFeature
);

router.post(
  "/features/reorder",
  authMiddleware.authenticate,
  validationMiddleware.validateRequest(reorderSchema),
  featureController.reorderFeatures
);

// Subtask routes
router.get(
  "/features/:featureId/subtasks",
  authMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  subtaskController.getSubtasks
);

router.post(
  "/features/:featureId/subtasks",
  authMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  validationMiddleware.validateRequest(subtaskSchema),
  featureMiddleware.validateSubtaskData,
  subtaskController.createSubtask
);

router.put(
  "/subtasks/:id",
  authMiddleware.authenticate,
  validationMiddleware.validateRequest(updateSubtaskSchema),
  subtaskController.updateSubtask
);

router.patch(
  "/subtasks/:id/toggle",
  authMiddleware.authenticate,
  subtaskController.toggleSubtaskCompletion
);

router.delete(
  "/subtasks/:id",
  authMiddleware.authenticate,
  subtaskController.deleteSubtask
);

export default router;
