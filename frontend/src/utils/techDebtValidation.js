// src/utils/techDebtValidation.js
import * as yup from "yup";

export const techDebtCreateSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  reason: yup
    .string()
    .required("Reason is required")
    .min(5, "Reason must be at least 5 characters"),
  impact: yup.string(),
  priority: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"])
    .default("medium"),
  status: yup
    .string()
    .oneOf(["identified", "planned", "in_progress", "resolved", "ignored"])
    .default("identified"),
  estimated_effort_hours: yup
    .number()
    .min(0, "Estimated effort must be at least 0")
    .default(0),
});

export const techDebtUpdateSchema = yup.object({
  title: yup.string().min(3).max(255),
  description: yup.string().min(10),
  reason: yup.string().min(5),
  impact: yup.string(),
  priority: yup.string().oneOf(["low", "medium", "high", "critical"]),
  status: yup
    .string()
    .oneOf(["identified", "planned", "in_progress", "resolved", "ignored"]),
  estimated_effort_hours: yup.number().min(0),
});

export const techDebtStatusSchema = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["identified", "planned", "in_progress", "resolved", "ignored"]),
});

export const techDebtFilterSchema = yup.object({
  priority: yup.string().oneOf(["low", "medium", "high", "critical"]),
  status: yup
    .string()
    .oneOf(["identified", "planned", "in_progress", "resolved", "ignored"]),
  search: yup.string(),
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  sortBy: yup
    .string()
    .oneOf(["created_at", "priority", "status", "estimated_effort_hours"])
    .default("created_at"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("DESC"),
});

export const exportSchema = yup.object({
  format: yup.string().oneOf(["json", "csv"]).default("json"),
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
