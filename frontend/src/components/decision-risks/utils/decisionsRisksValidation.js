// src/components/decision-risks/utils/decisionsRisksValidation.js
import * as yup from "yup";

// ========== Decision Schemas ==========
export const decisionCreateSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  decision: yup
    .string()
    .required("Decision is required")
    .min(5, "Decision must be at least 5 characters"),
  reason: yup
    .string()
    .required("Reason is required")
    .min(5, "Reason must be at least 5 characters"),
  impact: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"], "Invalid impact level")
    .default("medium"),
  alternatives: yup.string().nullable(),
  decision_date: yup.string().nullable(),
});

export const decisionUpdateSchema = yup.object({
  title: yup
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  description: yup
    .string()
    .min(10, "Description must be at least 10 characters"),
  decision: yup.string().min(5, "Decision must be at least 5 characters"),
  reason: yup.string().min(5, "Reason must be at least 5 characters"),
  impact: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"], "Invalid impact level"),
  alternatives: yup.string().nullable(),
  decision_date: yup.string().nullable(),
});

// ========== Risk Schemas ==========
export const riskCreateSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  description: yup.string().nullable(),
  risk_level: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"], "Invalid risk level")
    .default("medium"),
  status: yup
    .string()
    .oneOf(
      ["identified", "monitoring", "mitigated", "realized", "closed"],
      "Invalid status"
    )
    .default("identified"),
  reason: yup.string().nullable(),
  mitigation: yup.string().nullable(),
});

export const riskUpdateSchema = yup.object({
  title: yup
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  description: yup.string().nullable(),
  risk_level: yup
    .string()
    .oneOf(["low", "medium", "high", "critical"], "Invalid risk level"),
  status: yup
    .string()
    .oneOf(
      ["identified", "monitoring", "mitigated", "realized", "closed"],
      "Invalid status"
    ),
  reason: yup.string().nullable(),
  mitigation: yup.string().nullable(),
});

export const riskStatusUpdateSchema = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(
      ["identified", "monitoring", "mitigated", "realized", "closed"],
      "Invalid status"
    ),
});

// ========== Filter Schemas ==========
export const decisionFilterSchema = yup.object({
  impact: yup
    .string()
    .oneOf(["low", "medium", "high", "critical", null], "Invalid impact level"),
  fromDate: yup.string().nullable(),
  toDate: yup.string().nullable(),
  sortBy: yup
    .string()
    .oneOf(["created_at", "decision_date", "impact"], "Invalid sort field")
    .default("created_at"),
  sortOrder: yup
    .string()
    .oneOf(["ASC", "DESC"], "Invalid sort order")
    .default("DESC"),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

export const riskFilterSchema = yup.object({
  level: yup
    .string()
    .oneOf(["low", "medium", "high", "critical", null], "Invalid risk level"),
  status: yup
    .string()
    .oneOf(
      ["identified", "monitoring", "mitigated", "realized", "closed", null],
      "Invalid status"
    ),
  sortBy: yup
    .string()
    .oneOf(["created_at", "risk_level", "status"], "Invalid sort field")
    .default("created_at"),
  sortOrder: yup
    .string()
    .oneOf(["ASC", "DESC"], "Invalid sort order")
    .default("DESC"),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

// ========== Export Schema ==========
export const exportFormatSchema = yup.object({
  format: yup.string().oneOf(["json", "csv"], "Invalid format").default("json"),
});

// ========== Validation Helper ==========
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
    return { isValid: false, errors };
  }
};
