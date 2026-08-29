// src/utils/visionValidation.js
import * as yup from "yup";

export const visionGoalCreateSchema = yup.object({
  goal: yup
    .string()
    .required("Goal is required")
    .min(3, "Goal must be at least 3 characters")
    .max(500, "Goal must not exceed 500 characters"),
  description: yup.string().nullable(),
  target_timeline: yup.string().nullable(),
  priority: yup
    .number()
    .min(0, "Priority must be at least 0")
    .max(10, "Priority must not exceed 10")
    .default(0),
  category: yup.string().nullable(),
  status: yup
    .string()
    .oneOf(["draft", "active", "completed", "archived"])
    .default("draft"),
});

export const visionGoalUpdateSchema = yup.object({
  goal: yup.string().min(3).max(500),
  description: yup.string().nullable(),
  target_timeline: yup.string().nullable(),
  priority: yup.number().min(0).max(10),
  category: yup.string().nullable(),
  status: yup.string().oneOf(["draft", "active", "completed", "archived"]),
});

export const visionFilterSchema = yup.object({
  status: yup
    .string()
    .oneOf(["draft", "active", "completed", "archived"])
    .nullable(),
  category: yup.string().nullable(),
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  sortBy: yup
    .string()
    .oneOf(["created_at", "priority", "goal", "status"])
    .default("priority"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("DESC"),
});

export const linkProjectSchema = yup.object({
  project_id: yup
    .string()
    .required("Project ID is required")
    .uuid("Invalid project ID format"),
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
// src/utils/visionValidation.js (continued)

export const exportSchema = yup.object({
  format: yup.string().oneOf(["json", "csv"]).default("json"),
});

export const visionStatisticsSchema = yup.object({
  // No required fields, just for validation of response shape
});

export const visionGoalProgressSchema = yup.object({
  progress: yup.number().min(0).max(100),
  totalProjects: yup.number().min(0),
  completedProjects: yup.number().min(0),
  inProgressProjects: yup.number().min(0),
  notStartedProjects: yup.number().min(0),
  status: yup.string().oneOf(["not_started", "in_progress", "completed"]),
  completionRatio: yup.string(),
  summary: yup.string(),
});

export const validateExportFormat = (format) => {
  if (!format) return { isValid: true, errors: null };
  try {
    exportSchema.validateSync({ format });
    return { isValid: true, errors: null };
  } catch (error) {
    return { isValid: false, errors: { format: error.message } };
  }
};
