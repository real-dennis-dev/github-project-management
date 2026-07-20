const Joi = require("joi");

/**
 * GitHub Validation Schemas
 */
const GitHubValidation = {
  /**
   * Connect repository validation schema
   */
  connectRepository: Joi.object({
    repoUrl: Joi.string()
      .uri({ scheme: ["https"] })
      .pattern(/^https?:\/\/(?:www\.)?github\.com\/[^\/]+\/[^\/]+(?:\/|$)/)
      .required()
      .messages({
        "string.pattern.base": "Invalid GitHub repository URL",
        "any.required": "Repository URL is required",
      }),
    defaultBranch: Joi.string()
      .default("main")
      .pattern(/^[a-zA-Z0-9\-_\/]+$/)
      .messages({
        "string.pattern.base": "Invalid branch name format",
      }),
    accessToken: Joi.string().min(10).optional().messages({
      "string.min": "Access token too short",
    }),
  }),

  /**
   * Get commits query validation
   */
  getCommits: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    branch: Joi.string().optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional(),
    author: Joi.string().optional(),
    sortBy: Joi.string()
      .valid("committed_at", "added_lines", "removed_lines")
      .default("committed_at"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),

  /**
   * Get pull requests query validation
   */
  getPullRequests: Joi.object({
    state: Joi.string().valid("open", "closed", "merged", "all").default("all"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string()
      .valid("created_at", "updated_at", "merged_at")
      .default("created_at"),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  /**
   * Get issues query validation
   */
  getIssues: Joi.object({
    state: Joi.string().valid("open", "closed", "all").default("all"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    labels: Joi.string().optional(),
    sort: Joi.string().valid("created_at", "updated_at").default("created_at"),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  /**
   * Webhook setup validation
   */
  setupWebhook: Joi.object({
    webhookUrl: Joi.string()
      .uri({ scheme: ["https"] })
      .required()
      .messages({
        "string.uri": "Webhook URL must be a valid HTTPS URL",
        "any.required": "Webhook URL is required",
      }),
    events: Joi.array()
      .items(
        Joi.string().valid(
          "push",
          "pull_request",
          "issues",
          "commit_comment",
          "create",
          "delete",
          "fork",
          "release"
        )
      )
      .default(["push", "pull_request", "issues"]),
    active: Joi.boolean().default(true),
    contentType: Joi.string().valid("json", "form").default("json"),
  }),

  /**
   * Repository ID param validation
   */
  repositoryId: Joi.string().uuid().required(),
};

module.exports = GitHubValidation;
