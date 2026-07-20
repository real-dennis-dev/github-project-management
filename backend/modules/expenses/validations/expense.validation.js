const Joi = require("joi");

/**
 * Expense Validation Schemas
 * Validates expense data for various operations
 */
const expenseSchemas = {
  // Create Expense Validation
  createExpense: Joi.object({
    description: Joi.string().required().min(3).max(500),
    amount: Joi.number().positive().precision(2).required().messages({
      "number.positive": "Amount must be greater than 0",
      "number.precision": "Amount must have at most 2 decimal places",
    }),
    category: Joi.string()
      .valid(
        "hosting",
        "database",
        "domain",
        "api",
        "software",
        "hardware",
        "marketing",
        "other"
      )
      .default("other"),
    expense_date: Joi.date().default(() => new Date()),
    vendor: Joi.string().allow("", null).max(100),
    receipt_url: Joi.string().uri().allow("", null).max(500),
    recurring: Joi.boolean().default(false),
    project_id: Joi.string().uuid().required(),
  }),

  // Update Expense Validation
  updateExpense: Joi.object({
    description: Joi.string().min(3).max(500),
    amount: Joi.number().positive().precision(2),
    category: Joi.string().valid(
      "hosting",
      "database",
      "domain",
      "api",
      "software",
      "hardware",
      "marketing",
      "other"
    ),
    expense_date: Joi.date(),
    vendor: Joi.string().allow("", null).max(100),
    receipt_url: Joi.string().uri().allow("", null).max(500),
    recurring: Joi.boolean(),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),

  // Expense Query Params
  getExpenses: Joi.object({
    category: Joi.string().valid(
      "hosting",
      "database",
      "domain",
      "api",
      "software",
      "hardware",
      "marketing",
      "other"
    ),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    minAmount: Joi.number().positive().precision(2),
    maxAmount: Joi.number().positive().precision(2),
    vendor: Joi.string().max(100),
    recurring: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("expense_date", "amount", "category", "created_at")
      .default("expense_date"),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),

  // Monthly Expenses Query
  getMonthlyExpenses: Joi.object({
    year: Joi.number()
      .integer()
      .min(2000)
      .max(new Date().getFullYear() + 1)
      .default(new Date().getFullYear()),
  }),
};

module.exports = {
  expenseSchemas,
};
