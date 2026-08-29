// src/utils/aiValidation.js
import * as yup from "yup";

export const askQuestionSchema = yup.object({
  question: yup
    .string()
    .required("Question is required")
    .min(3, "Question must be at least 3 characters")
    .max(2000, "Question must not exceed 2000 characters"),
  context: yup.object({
    includeFeatures: yup.boolean().default(true),
    includeBugs: yup.boolean().default(true),
    includeDecisions: yup.boolean().default(true),
    includeRisks: yup.boolean().default(true),
    includeMilestones: yup.boolean().default(true),
    includeTechDebt: yup.boolean().default(true),
  }),
});

export const analyzeProjectSchema = yup.object({
  focus: yup
    .string()
    .oneOf([
      "overall",
      "risks",
      "performance",
      "quality",
      "resources",
      "timeline",
    ])
    .default("overall"),
  depth: yup.string().oneOf(["quick", "standard", "deep"]).default("standard"),
});

export const summarizeTextSchema = yup.object({
  text: yup
    .string()
    .required("Text is required")
    .min(10, "Text must be at least 10 characters")
    .max(50000, "Text must not exceed 50000 characters"),
  maxLength: yup
    .number()
    .min(50, "Max length must be at least 50")
    .max(5000, "Max length must not exceed 5000")
    .default(500),
  format: yup
    .string()
    .oneOf(["paragraph", "bullet", "numbered"])
    .default("paragraph"),
});

export const generateReportSchema = yup.object({
  type: yup
    .string()
    .oneOf(["executive", "technical", "risk", "progress", "comprehensive"])
    .default("comprehensive"),
  format: yup.string().oneOf(["json", "markdown", "html"]).default("json"),
  includeCharts: yup.boolean().default(false),
  period: yup.object({
    startDate: yup.string(),
    endDate: yup.string(),
  }),
});

export const conversationFilterSchema = yup.object({
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(20),
  questionContains: yup.string().nullable(),
  fromDate: yup.string().nullable(),
  toDate: yup.string().nullable(),
});

export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};
