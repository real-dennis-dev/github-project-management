const Joi = require("joi");

/**
 * Vision Board Validation Schemas
 */
const visionSchemas = {
  // Create Vision Goal Validation
  createGoal: Joi.object({
    goal: Joi.string().required().min(3).max(500),
    description: Joi.string().allow("", null),
    target_timeline: Joi.string().allow("", null),
    priority: Joi.number().integer().min(0).max(10).default(0),
    category: Joi.string().allow("", null),
    status: Joi.string()
      .valid("draft", "active", "completed", "archived")
      .default("draft"),
  }),

  // Update Vision Goal Validation
  updateGoal: Joi.object({
    goal: Joi.string().min(3).max(500),
    description: Joi.string().allow("", null),
    target_timeline: Joi.string().allow("", null),
    priority: Joi.number().integer().min(0).max(10),
    category: Joi.string().allow("", null),
    status: Joi.string().valid("draft", "active", "completed", "archived"),
  }).min(1),

  // Link Project to Vision Validation
  linkProject: Joi.object({
    project_id: Joi.string().uuid().required(),
  }),

  // Vision Goals Query Params
  getGoals: Joi.object({
    status: Joi.string().valid("draft", "active", "completed", "archived"),

    category: Joi.string(),

    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),

    sortBy: Joi.string()
      .valid("created_at", "priority", "goal", "status")
      .default("priority"),

    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),

  // ============================================
  // VISION BOARD DASHBOARD
  // ============================================

  getDashboard: Joi.object({
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),

    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),
};

module.exports = {
  visionSchemas,
};
