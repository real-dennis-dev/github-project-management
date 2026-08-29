// src/utils/releasesValidation.js
import * as yup from "yup";

// Release Schemas
export const createReleaseSchema = yup.object({
  version: yup
    .string()
    .required("Version is required")
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Version must be in format X.Y.Z (e.g., 1.0.0)"
    ),
  description: yup
    .string()
    .max(2000, "Description must not exceed 2000 characters"),
  status: yup
    .string()
    .oneOf(["planned", "in_progress", "testing", "released", "cancelled"])
    .default("planned"),
  release_date: yup.string().nullable(),
  features: yup.array().of(yup.string().uuid("Invalid feature ID format")),
});

export const updateReleaseSchema = yup.object({
  version: yup
    .string()
    .matches(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z (e.g., 1.0.0)")
    .nullable(),
  description: yup
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .nullable(),
  status: yup
    .string()
    .oneOf(["planned", "in_progress", "testing", "released", "cancelled"])
    .nullable(),
  release_date: yup.string().nullable(),
});

export const releaseStatusSchema = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["planned", "in_progress", "testing", "released", "cancelled"]),
});

export const addFeaturesSchema = yup.object({
  featureIds: yup
    .array()
    .required("Feature IDs are required")
    .min(1, "At least one feature ID is required")
    .of(yup.string().uuid("Invalid feature ID format")),
});

export const releaseFilterSchema = yup.object({
  status: yup
    .string()
    .oneOf(["planned", "in_progress", "testing", "released", "cancelled", ""])
    .nullable(),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(20),
  sortBy: yup
    .string()
    .oneOf(["created_at", "release_date", "version", "status"])
    .default("created_at"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("DESC"),
});

// Milestone Schemas
export const createMilestoneSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must not exceed 255 characters"),
  description: yup
    .string()
    .max(2000, "Description must not exceed 2000 characters"),
  status: yup
    .string()
    .oneOf(["not_started", "in_progress", "completed", "delayed"])
    .default("not_started"),
  target_date: yup.string().required("Target date is required"),
  completed_date: yup.string().nullable(),
  progress_percentage: yup
    .number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress must not exceed 100")
    .default(0),
});

export const updateMilestoneSchema = yup.object({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must not exceed 255 characters")
    .nullable(),
  description: yup
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .nullable(),
  status: yup
    .string()
    .oneOf(["not_started", "in_progress", "completed", "delayed"])
    .nullable(),
  target_date: yup.string().nullable(),
  completed_date: yup.string().nullable(),
  progress_percentage: yup
    .number()
    .min(0, "Progress must be at least 0")
    .max(100, "Progress must not exceed 100")
    .nullable(),
});

export const milestoneStatusSchema = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["not_started", "in_progress", "completed", "delayed"]),
});

export const milestoneFilterSchema = yup.object({
  status: yup
    .string()
    .oneOf(["not_started", "in_progress", "completed", "delayed", ""])
    .nullable(),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(20),
  sortBy: yup
    .string()
    .oneOf(["created_at", "target_date", "status", "progress_percentage"])
    .default("target_date"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("ASC"),
});

export const bulkUpdateSchema = yup.object({
  updates: yup
    .array()
    .required("Updates are required")
    .min(1, "At least one update is required")
    .of(
      yup.object({
        id: yup
          .string()
          .required("Milestone ID is required")
          .uuid("Invalid milestone ID format"),
        progress_percentage: yup
          .number()
          .required("Progress is required")
          .min(0, "Progress must be at least 0")
          .max(100, "Progress must not exceed 100"),
      })
    ),
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
