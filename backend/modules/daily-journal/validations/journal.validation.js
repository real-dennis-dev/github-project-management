const Joi = require("joi");

/**
 * Journal Validation Schemas
 * Validates journal entry data
 */
const journalSchemas = {
  // Create Journal Entry Validation
  createJournalEntry: Joi.object({
    project_id: Joi.string().uuid().required(),
    entry_date: Joi.date().default(() => new Date()),
    finished_today: Joi.string().allow("", null).max(2000),
    problems: Joi.string().allow("", null).max(2000),
    tomorrow_plan: Joi.string().allow("", null).max(2000),
    mood: Joi.string()
      .valid("😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰")
      .default("😐"),
    notes: Joi.string().allow("", null).max(5000),
  }),

  // Update Journal Entry Validation
  updateJournalEntry: Joi.object({
    entry_date: Joi.date(),
    finished_today: Joi.string().allow("", null).max(2000),
    problems: Joi.string().allow("", null).max(2000),
    tomorrow_plan: Joi.string().allow("", null).max(2000),
    mood: Joi.string().valid("😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"),
    notes: Joi.string().allow("", null).max(5000),
  }).min(1),

  // Get Journal Entries Query Params
  getJournalEntries: Joi.object({
    fromDate: Joi.date(),
    toDate: Joi.date(),
    mood: Joi.string().valid("😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("entry_date", "created_at", "mood")
      .default("entry_date"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),

  // Get Journal by Date Validation
  getJournalByDate: Joi.object({
    date: Joi.date().required(),
  }),

  /**
   * Dashboard statistics query validation
   *
   * No project_id is accepted here.
   * The authenticated user's projects are used automatically.
   */
  getDashboardStats: Joi.object({
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(20),

    fromDate: Joi.date().optional(),

    toDate: Joi.date().optional(),
  }),
};

module.exports = {
  journalSchemas,
};
