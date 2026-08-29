// src/utils/projectValidation.js
import * as yup from "yup";

export const projectSchema = yup.object({
  name: yup
    .string()
    .required("Project name is required")
    .min(3, "Project name must be at least 3 characters")
    .max(255, "Project name must not exceed 255 characters"),
  description: yup.string().nullable(),
  status: yup
    .string()
    .oneOf(["planning", "in_progress", "paused", "completed", "archived"])
    .default("planning"),
  priority: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"])
    .default("medium"),
  completion_percentage: yup
    .number()
    .min(0, "Completion must be between 0 and 100")
    .max(100, "Completion must be between 0 and 100")
    .default(0),
  tech_stack: yup.array().of(yup.string()).default([]),
  repository_url: yup.string().url("Must be a valid URL").nullable(),
  start_date: yup.string().nullable(),
  target_completion_date: yup.string().nullable(),
});

export const featureSchema = yup.object({
  project_id: yup.string().required("Project ID is required"),
  title: yup
    .string()
    .required("Feature title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup.string().nullable(),
  status: yup
    .string()
    .oneOf(["planned", "in_progress", "completed", "blocked", "cancelled"])
    .default("planned"),
  difficulty: yup
    .string()
    .oneOf(["easy", "medium", "hard", "expert"])
    .default("medium"),
  estimated_days: yup
    .number()
    .min(1, "Estimated days must be at least 1")
    .nullable(),
  order_index: yup.number().default(0),
});

export const bugSchema = yup.object({
  project_id: yup.string().required("Project ID is required"),
  title: yup
    .string()
    .required("Bug title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup.string().nullable(),
  status: yup
    .string()
    .oneOf([
      "reported",
      "investigating",
      "in_progress",
      "fixed",
      "verified",
      "closed",
    ])
    .default("reported"),
  priority: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"])
    .default("medium"),
  cause: yup.string().nullable(),
  possible_fix: yup.string().nullable(),
  assigned_to: yup.string().nullable(),
});

export const subtaskSchema = yup.object({
  feature_id: yup.string().required("Feature ID is required"),
  title: yup
    .string()
    .required("Subtask title is required")
    .min(3, "Title must be at least 3 characters"),
  is_completed: yup.boolean().default(false),
  order_index: yup.number().default(0),
});

export const projectFilterSchema = yup.object({
  status: yup
    .string()
    .oneOf(["planning", "in_progress", "paused", "completed", "archived", ""])
    .nullable(),
  priority: yup
    .string()
    .oneOf(["low", "medium", "high", "critical", ""])
    .nullable(),
  search: yup.string().nullable(),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(20),
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
