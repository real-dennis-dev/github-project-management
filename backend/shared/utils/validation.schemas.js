const Joi = require("joi");

const validationSchemas = {
  // Project schemas
  project: {
    create: Joi.object({
      name: Joi.string().required().max(255).trim(),
      description: Joi.string().allow("").max(2000).trim(),
      status: Joi.string().valid(
        "planning",
        "in_progress",
        "paused",
        "completed",
        "archived"
      ),
      priority: Joi.string().valid("low", "medium", "high", "critical"),
      tech_stack: Joi.array().items(Joi.string().trim()),
      repository_url: Joi.string().uri().allow(""),
      start_date: Joi.date().iso(),
      target_completion_date: Joi.date().iso().min(Joi.ref("start_date")),
    }),

    update: Joi.object({
      name: Joi.string().max(255).trim(),
      description: Joi.string().allow("").max(2000).trim(),
      status: Joi.string().valid(
        "planning",
        "in_progress",
        "paused",
        "completed",
        "archived"
      ),
      priority: Joi.string().valid("low", "medium", "high", "critical"),
      tech_stack: Joi.array().items(Joi.string().trim()),
      repository_url: Joi.string().uri().allow(""),
      start_date: Joi.date().iso(),
      target_completion_date: Joi.date().iso().min(Joi.ref("start_date")),
    }).min(1),

    status: Joi.object({
      status: Joi.string()
        .valid("planning", "in_progress", "paused", "completed", "archived")
        .required(),
    }),
  },

  // Feature schemas
  feature: {
    create: Joi.object({
      title: Joi.string().required().max(255).trim(),
      description: Joi.string().allow("").max(2000).trim(),
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
    }),

    update: Joi.object({
      title: Joi.string().max(255).trim(),
      description: Joi.string().allow("").max(2000).trim(),
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
    }).min(1),

    status: Joi.object({
      status: Joi.string()
        .valid("planned", "in_progress", "completed", "blocked", "cancelled")
        .required(),
    }),

    reorder: Joi.object({
      projectId: Joi.string().uuid().required(),
      orderedIds: Joi.array().items(Joi.string().uuid()).required(),
    }),
  },

  // Subtask schemas
  subtask: {
    create: Joi.object({
      title: Joi.string().required().max(255).trim(),
      is_completed: Joi.boolean(),
    }),

    update: Joi.object({
      title: Joi.string().max(255).trim(),
      is_completed: Joi.boolean(),
    }).min(1),
  },

  // Bug schemas
  bug: {
    create: Joi.object({
      title: Joi.string().required().max(255).trim(),
      description: Joi.string().allow("").max(2000).trim(),
      status: Joi.string().valid(
        "reported",
        "investigating",
        "in_progress",
        "fixed",
        "verified",
        "closed"
      ),
      priority: Joi.string().valid("low", "medium", "high", "critical"),
      cause: Joi.string().allow("").max(1000).trim(),
      possible_fix: Joi.string().allow("").max(1000).trim(),
      reported_by: Joi.string().allow("").max(100).trim(),
      assigned_to: Joi.string().allow("").max(100).trim(),
    }),

    update: Joi.object({
      title: Joi.string().max(255).trim(),
      description: Joi.string().allow("").max(2000).trim(),
      status: Joi.string().valid(
        "reported",
        "investigating",
        "in_progress",
        "fixed",
        "verified",
        "closed"
      ),
      priority: Joi.string().valid("low", "medium", "high", "critical"),
      cause: Joi.string().allow("").max(1000).trim(),
      possible_fix: Joi.string().allow("").max(1000).trim(),
      reported_by: Joi.string().allow("").max(100).trim(),
      assigned_to: Joi.string().allow("").max(100).trim(),
    }).min(1),

    status: Joi.object({
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
    }),

    assign: Joi.object({
      assignee: Joi.string().required().max(100).trim(),
    }),

    resolve: Joi.object({
      resolution: Joi.string().required().max(1000).trim(),
    }),
  },

  // Common schemas
  common: {
    pagination: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100),
      sortBy: Joi.string(),
      sortOrder: Joi.string().valid("asc", "desc"),
    }),

    id: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    projectId: Joi.object({
      projectId: Joi.string().uuid().required(),
    }),

    featureId: Joi.object({
      featureId: Joi.string().uuid().required(),
    }),

    dateRange: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")),
    }),
  },
};

module.exports = validationSchemas;
