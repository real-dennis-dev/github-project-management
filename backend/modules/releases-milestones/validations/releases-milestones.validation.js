const Joi = require("joi");

// Release Validation Schemas
const releaseSchemas = {
  createRelease: Joi.object({
    version: Joi.string()
      .required()
      .pattern(/^\d+\.\d+\.\d+$/),

    description: Joi.string().allow("", null),

    status: Joi.string()
      .valid("planned", "in_progress", "testing", "released", "cancelled")
      .default("planned"),

    features: Joi.array().items(Joi.string().uuid()),

    release_date: Joi.date().allow(null),

    project_id: Joi.string().uuid().required(),
  }),

  updateRelease: Joi.object({
    version: Joi.string().pattern(/^\d+\.\d+\.\d+$/),

    description: Joi.string().allow("", null),

    status: Joi.string().valid(
      "planned",
      "in_progress",
      "testing",
      "released",
      "cancelled"
    ),

    release_date: Joi.date().allow(null),
  }).min(1),

  updateReleaseStatus: Joi.object({
    status: Joi.string()
      .valid("planned", "in_progress", "testing", "released", "cancelled")
      .required(),
  }),

  addFeaturesToRelease: Joi.object({
    featureIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),

  getReleases: Joi.object({
    status: Joi.string().valid(
      "planned",
      "in_progress",
      "testing",
      "released",
      "cancelled"
    ),

    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),

    sortBy: Joi.string()
      .valid("created_at", "release_date", "version", "status")
      .default("created_at"),

    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),
};

// Milestone Validation Schemas
const milestoneSchemas = {
  createMilestone: Joi.object({
    name: Joi.string().required().min(3).max(255),

    description: Joi.string().allow("", null),

    status: Joi.string()
      .valid("not_started", "in_progress", "completed", "delayed")
      .default("not_started"),

    target_date: Joi.date().required(),

    completed_date: Joi.date().allow(null),

    progress_percentage: Joi.number().integer().min(0).max(100).default(0),

    project_id: Joi.string().uuid().required(),
  }),

  updateMilestone: Joi.object({
    name: Joi.string().min(3).max(255),

    description: Joi.string().allow("", null),

    status: Joi.string().valid(
      "not_started",
      "in_progress",
      "completed",
      "delayed"
    ),

    target_date: Joi.date(),

    completed_date: Joi.date().allow(null),

    progress_percentage: Joi.number().integer().min(0).max(100),
  }).min(1),

  updateMilestoneStatus: Joi.object({
    status: Joi.string()
      .valid("not_started", "in_progress", "completed", "delayed")
      .required(),
  }),

  getMilestones: Joi.object({
    status: Joi.string().valid(
      "not_started",
      "in_progress",
      "completed",
      "delayed"
    ),

    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),

    sortBy: Joi.string()
      .valid("created_at", "target_date", "status", "progress_percentage")
      .default("target_date"),

    sortOrder: Joi.string().valid("ASC", "DESC").default("ASC"),
  }),

  // ============================================
  // DASHBOARD VALIDATION
  // ============================================

  getReleasesMilestonesDashboard: Joi.object({
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

module.exports = {
  releaseSchemas,
  milestoneSchemas,
};
