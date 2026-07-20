const Joi = require("joi");

/**
 * Tech Debt Validation Schemas
 */
const techDebtSchemas = {
  // Create Tech Debt Validation
  createTechDebt: Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    reason: Joi.string().required().min(5),
    impact: Joi.string().allow("", null),
    priority: Joi.string()
      .valid("low", "medium", "high", "critical")
      .default("medium"),
    status: Joi.string()
      .valid("identified", "planned", "in_progress", "resolved", "ignored")
      .default("identified"),
    estimated_effort_hours: Joi.number().integer().min(0).allow(null),
    project_id: Joi.string().uuid().required(),
  }),

  // Update Tech Debt Validation
  updateTechDebt: Joi.object({
    title: Joi.string().min(3).max(255),
    description: Joi.string().min(10),
    reason: Joi.string().min(5),
    impact: Joi.string().allow("", null),
    priority: Joi.string().valid("low", "medium", "high", "critical"),
    status: Joi.string().valid(
      "identified",
      "planned",
      "in_progress",
      "resolved",
      "ignored"
    ),
    estimated_effort_hours: Joi.number().integer().min(0).allow(null),
  }).min(1),

  // Update Tech Debt Status Validation
  updateTechDebtStatus: Joi.object({
    status: Joi.string()
      .valid("identified", "planned", "in_progress", "resolved", "ignored")
      .required(),
  }),

  // Tech Debt Query Params
  getTechDebt: Joi.object({
    priority: Joi.string().valid("low", "medium", "high", "critical"),
    status: Joi.string().valid(
      "identified",
      "planned",
      "in_progress",
      "resolved",
      "ignored"
    ),
    search: Joi.string().allow("", null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("created_at", "priority", "status", "estimated_effort_hours")
      .default("created_at"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),
};

module.exports = {
  techDebtSchemas,
};
