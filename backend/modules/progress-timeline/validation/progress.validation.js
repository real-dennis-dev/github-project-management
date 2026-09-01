// src/modules/progress-timeline/validation/progress.validation.js
const Joi = require("joi");

const ProgressValidation = {
  // Schema for creating timeline entry
  createTimelineEntry: Joi.object({
    month_year: Joi.date().required(),
    feature_name: Joi.string().min(1).max(255).required(),
    progress_percentage: Joi.number().integer().min(0).max(100).required(),
  }),

  // Schema for updating timeline entry
  updateTimelineEntry: Joi.object({
    month_year: Joi.date(),
    feature_name: Joi.string().min(1).max(255),
    progress_percentage: Joi.number().integer().min(0).max(100),
  }).min(1),

  // Schema for timeline query params
  timelineQuery: Joi.object({
    from_date: Joi.date().iso(),
    to_date: Joi.date().iso().min(Joi.ref("from_date")),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort_by: Joi.string().valid(
      "month_year",
      "feature_name",
      "progress_percentage",
      "created_at"
    ),
    sort_order: Joi.string().valid("asc", "desc").default("asc"),
    feature_name: Joi.string(),
  }),

  // Schema for project ID param
  projectIdParam: Joi.object({
    projectId: Joi.string().uuid().required(),
  }),

  // Schema for timeline ID param
  timelineIdParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Schema for monthly progress
  monthlyProgressQuery: Joi.object({
    month: Joi.date().iso().required(),
    feature_name: Joi.string(),
  }),
  dashboardStatsQuery: Joi.object({
    months: Joi.number().integer().min(1).max(60).default(12),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort_by: Joi.string()
      .valid(
        "latest_activity",
        "overall_progress",
        "total_features",
        "completed_features",
        "project_name"
      )
      .default("latest_activity"),
    sort_order: Joi.string().valid("asc", "desc").default("desc"),
    search: Joi.string().allow("").max(100),
  }),
};
module.exports = {
  ProgressValidation,
};
