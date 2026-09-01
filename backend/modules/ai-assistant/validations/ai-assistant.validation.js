const Joi = require("joi");

/**
 * AI Assistant Validation Schemas
 */
const aiSchemas = {
  // Ask Question Validation
  askQuestion: Joi.object({
    question: Joi.string().required().min(3).max(5000),

    context: Joi.object({
      includeFeatures: Joi.boolean().default(true),
      includeBugs: Joi.boolean().default(true),
      includeDecisions: Joi.boolean().default(true),
      includeRisks: Joi.boolean().default(true),
      includeMilestones: Joi.boolean().default(true),
      includeTechDebt: Joi.boolean().default(true),
    }).default({
      includeFeatures: true,
      includeBugs: true,
      includeDecisions: true,
      includeRisks: true,
      includeMilestones: true,
      includeTechDebt: true,
    }),
  }),

  // Summarize Text Validation
  summarizeText: Joi.object({
    text: Joi.string().required().min(10).max(20000),

    maxLength: Joi.number().integer().min(50).max(5000).default(500),

    format: Joi.string()
      .valid("paragraph", "bullet", "numbered")
      .default("paragraph"),
  }),

  // Generate Report Validation
  generateReport: Joi.object({
    type: Joi.string()
      .valid(
        "executive",
        "technical",
        "risk",
        "progress",
        "resource",
        "quality",
        "comprehensive"
      )
      .default("comprehensive"),

    format: Joi.string().valid("json", "markdown", "html").default("json"),

    includeCharts: Joi.boolean().default(false),

    period: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
    }),
  }),

  // Get Conversations Validation
  getConversations: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),

    fromDate: Joi.date(),
    toDate: Joi.date(),

    questionContains: Joi.string().min(1).max(100),
  }),

  // Analyze Project Validation
  analyzeProject: Joi.object({
    focus: Joi.string()
      .valid(
        "overall",
        "risks",
        "performance",
        "quality",
        "resources",
        "timeline"
      )
      .default("overall"),

    depth: Joi.string().valid("quick", "standard", "deep").default("standard"),
  }),

  /**
   * Global AI Dashboard Statistics
   *
   * GET /api/ai/stats
   *
   * No projectId is accepted.
   */
  getAIStats: Joi.object({
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),

    fromDate: Joi.date(),

    toDate: Joi.date(),

    type: Joi.string().valid(
      "ask_question",
      "analyze_project",
      "summarize_text",
      "generate_report",
      "suggest_next_actions",
      "analyze_trends"
    ),

    projectId: Joi.string().uuid(),
  }),
};

module.exports = {
  aiSchemas,
};
