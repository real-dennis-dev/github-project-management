// src/utils/progressValidation.js
import * as yup from "yup";

export const timelineEntrySchema = yup.object({
  month_year: yup
    .string()
    .required("Month is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
  feature_name: yup
    .string()
    .required("Feature name is required")
    .max(255, "Feature name must not exceed 255 characters"),
  progress_percentage: yup
    .number()
    .required("Progress percentage is required")
    .min(0, "Progress must be at least 0%")
    .max(100, "Progress must not exceed 100%"),
});

export const updateTimelineEntrySchema = yup.object({
  month_year: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)")
    .nullable(),
  feature_name: yup
    .string()
    .max(255, "Feature name must not exceed 255 characters")
    .nullable(),
  progress_percentage: yup
    .number()
    .min(0, "Progress must be at least 0%")
    .max(100, "Progress must not exceed 100%")
    .nullable(),
});

export const timelineFilterSchema = yup.object({
  from_date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)")
    .nullable(),
  to_date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)")
    .nullable(),
  feature_name: yup
    .string()
    .max(255, "Feature name must not exceed 255 characters")
    .nullable(),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(20),
  sort_by: yup
    .string()
    .oneOf(["month_year", "feature_name", "progress_percentage", "created_at"])
    .default("month_year"),
  sort_order: yup.string().oneOf(["asc", "desc"]).default("asc"),
});

export const monthlyProgressSchema = yup.object({
  month: yup
    .string()
    .required("Month is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
  feature_name: yup
    .string()
    .max(255, "Feature name must not exceed 255 characters")
    .nullable(),
});

export const bulkEntrySchema = yup.object({
  entries: yup
    .array()
    .required("Entries are required")
    .min(1, "At least one entry is required")
    .max(50, "Maximum 50 entries allowed")
    .of(timelineEntrySchema),
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
