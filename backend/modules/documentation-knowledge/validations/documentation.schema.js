const Joi = require("joi");

const documentationSchemas = {
  // Documentation Schemas
  createDocumentation: Joi.object({
    title: Joi.string().required().min(3).max(255),
    content: Joi.string().allow("", null),
    doc_type: Joi.string()
      .valid("api", "erd", "flowchart", "user_manual", "technical", "other")
      .required(),
    tags: Joi.array().items(Joi.string()).default([]),
    version: Joi.number().integer().default(1),
  }),

  updateDocumentation: Joi.object({
    title: Joi.string().min(3).max(255),
    content: Joi.string().allow("", null),
    doc_type: Joi.string().valid(
      "api",
      "erd",
      "flowchart",
      "user_manual",
      "technical",
      "other"
    ),
    tags: Joi.array().items(Joi.string()),
  }),

  searchDocumentation: Joi.object({
    query: Joi.string().required().min(1),
    doc_type: Joi.string().valid(
      "api",
      "erd",
      "flowchart",
      "user_manual",
      "technical",
      "other"
    ),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
  }),

  // Knowledge Base Schemas
  createKnowledge: Joi.object({
    category: Joi.string().required().min(2).max(100),
    topic: Joi.string().required().min(3).max(255),
    content: Joi.string().required().min(10),
    tags: Joi.array().items(Joi.string()).default([]),
    related_links: Joi.array().items(Joi.string().uri()).default([]),
  }),

  updateKnowledge: Joi.object({
    category: Joi.string().min(2).max(100),
    topic: Joi.string().min(3).max(255),
    content: Joi.string().min(10),
    tags: Joi.array().items(Joi.string()),
    related_links: Joi.array().items(Joi.string().uri()),
  }),

  searchKnowledge: Joi.object({
    query: Joi.string().required().min(1),
    category: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
  }),

  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string()
      .valid("created_at", "updated_at", "title", "topic")
      .default("created_at"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
  getDocumentationKnowledgeStats: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string()
      .valid("created_at", "updated_at")
      .default("updated_at"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

module.exports = documentationSchemas;
