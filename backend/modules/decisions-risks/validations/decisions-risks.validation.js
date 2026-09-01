const Joi = require("joi");

// Decision Validation Schemas
const decisionSchemas = {
  // Create Decision Validation
  createDecision: Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    decision: Joi.string().required().min(5),
    reason: Joi.string().required().min(5),
    impact: Joi.string()
      .valid("low", "medium", "high", "critical")
      .default("medium"),
    alternatives: Joi.string().allow("", null),
    decision_date: Joi.date().default(() => new Date()),
    project_id: Joi.string().uuid().required(),
  }),

  // Update Decision Validation
  updateDecision: Joi.object({
    title: Joi.string().min(3).max(255),
    description: Joi.string().min(10),
    decision: Joi.string().min(5),
    reason: Joi.string().min(5),
    impact: Joi.string().valid("low", "medium", "high", "critical"),
    alternatives: Joi.string().allow("", null),
    decision_date: Joi.date(),
  }).min(1),

  // Decision Query Params
  getDecisions: Joi.object({
    impact: Joi.string().valid("low", "medium", "high", "critical"),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("created_at", "decision_date", "impact")
      .default("created_at"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),
};

// Risk Validation Schemas
const riskSchemas = {
  // Create Risk Validation
  createRisk: Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().allow("", null),
    risk_level: Joi.string()
      .valid("low", "medium", "high", "critical")
      .default("medium"),
    status: Joi.string()
      .valid("identified", "monitoring", "mitigated", "realized", "closed")
      .default("identified"),
    reason: Joi.string().allow("", null),
    mitigation: Joi.string().allow("", null),
    project_id: Joi.string().uuid().required(),
  }),

  // Update Risk Validation
  updateRisk: Joi.object({
    title: Joi.string().min(3).max(255),
    description: Joi.string().allow("", null),
    risk_level: Joi.string().valid("low", "medium", "high", "critical"),
    status: Joi.string().valid(
      "identified",
      "monitoring",
      "mitigated",
      "realized",
      "closed"
    ),
    reason: Joi.string().allow("", null),
    mitigation: Joi.string().allow("", null),
  }).min(1),

  // Update Risk Status Validation
  updateRiskStatus: Joi.object({
    status: Joi.string()
      .valid("identified", "monitoring", "mitigated", "realized", "closed")
      .required(),
  }),

  // Risk Query Params
  getRisks: Joi.object({
    level: Joi.string().valid("low", "medium", "high", "critical"),
    status: Joi.string().valid(
      "identified",
      "monitoring",
      "mitigated",
      "realized",
      "closed"
    ),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("created_at", "risk_level", "status")
      .default("created_at"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),
};

// Dashboard / Decision & Risk Statistics Validation
const decisionRiskStatsSchema = Joi.object({
  /**
   * Optional project filter.
   * If omitted, statistics are calculated across all projects
   * accessible to the endpoint.
   */
  projectId: Joi.string().uuid(),

  /**
   * Filter decisions by impact.
   */
  decisionImpact: Joi.string().valid("low", "medium", "high", "critical"),

  /**
   * Filter risks by level.
   */
  riskLevel: Joi.string().valid("low", "medium", "high", "critical"),

  /**
   * Filter risks by status.
   */
  riskStatus: Joi.string().valid(
    "identified",
    "monitoring",
    "mitigated",
    "realized",
    "closed"
  ),

  /**
   * Start date.
   */
  fromDate: Joi.date().iso(),

  /**
   * End date.
   */
  toDate: Joi.date().iso(),

  /**
   * Number of months to return in trend data.
   */
  months: Joi.number().integer().min(1).max(24).default(12),
})
  .custom((value, helpers) => {
    if (
      value.fromDate &&
      value.toDate &&
      new Date(value.fromDate) > new Date(value.toDate)
    ) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid": "fromDate must be before or equal to toDate",
  });

module.exports = {
  decisionSchemas,
  riskSchemas,
  decisionRiskStatsSchema,
};
