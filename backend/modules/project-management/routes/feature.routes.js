// Export at the top
const express = require("express");
const Joi = require("joi");

const { FeatureController } = require("../controllers/feature.controller");
const {
  FeatureSubtaskController,
} = require("../controllers/feature-subtask.controller");
const { FeatureMiddleware } = require("../middleware/feature.middleware");
const { ProjectMiddleware } = require("../middleware/project.middleware");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const ValidationMiddleware = require("../../../common/middleware/validation.middleware");

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
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  featureController.getFeatures
);

router.post(
  "/projects/:projectId/features",
  AuthMiddleware.authenticate,
  projectMiddleware.validateProjectId,
  projectMiddleware.checkProjectAccess,
  ValidationMiddleware.validateRequest(featureSchema),
  featureController.createFeature
);

router.get(
  "/features/:id",
  AuthMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureController.getFeatureById
);

router.put(
  "/features/:id",
  AuthMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  ValidationMiddleware.validateRequest(updateFeatureSchema),
  featureController.updateFeature
);

router.patch(
  "/features/:id/status",
  AuthMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  ValidationMiddleware.validateRequest(statusSchema),
  featureController.updateFeatureStatus
);

router.delete(
  "/features/:id",
  AuthMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  featureController.deleteFeature
);

router.post(
  "/features/reorder",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(reorderSchema),
  featureController.reorderFeatures
);

// Subtask routes
router.get(
  "/features/:featureId/subtasks",
  AuthMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  subtaskController.getSubtasks
);

router.post(
  "/features/:featureId/subtasks",
  AuthMiddleware.authenticate,
  featureMiddleware.validateFeatureId,
  featureMiddleware.checkFeatureOwnership,
  ValidationMiddleware.validateRequest(subtaskSchema),
  featureMiddleware.validateSubtaskData,
  subtaskController.createSubtask
);

router.put(
  "/subtasks/:id",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(updateSubtaskSchema),
  subtaskController.updateSubtask
);

router.patch(
  "/subtasks/:id/toggle",
  AuthMiddleware.authenticate,
  subtaskController.toggleSubtaskCompletion
);

router.delete(
  "/subtasks/:id",
  AuthMiddleware.authenticate,
  subtaskController.deleteSubtask
);

module.exports = router;
