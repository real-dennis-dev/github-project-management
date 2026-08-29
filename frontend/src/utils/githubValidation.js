// src/utils/githubValidation.js
import * as yup from "yup";

export const connectRepositorySchema = yup.object({
  repoUrl: yup
    .string()
    .required("Repository URL is required")
    .url("Invalid URL format")
    .matches(
      /^https?:\/\/github\.com\/[^\/]+\/[^\/]+$/,
      "Must be a valid GitHub repository URL"
    ),
  defaultBranch: yup.string().default("main").min(1, "Branch name is required"),
  accessToken: yup
    .string()
    .nullable()
    .min(1, "Access token must be at least 1 character"),
});

export const webhookSetupSchema = yup.object({
  webhookUrl: yup
    .string()
    .required("Webhook URL is required")
    .url("Invalid URL format"),
  events: yup
    .array()
    .of(
      yup
        .string()
        .oneOf([
          "push",
          "pull_request",
          "issues",
          "create",
          "delete",
          "release",
          "watch",
        ])
    )
    .default(["push", "pull_request", "issues"]),
  active: yup.boolean().default(true),
  contentType: yup.string().oneOf(["json", "form"]).default("json"),
});

export const commitFilterSchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  since: yup.string().nullable(),
  until: yup.string().nullable(),
  author: yup.string().nullable(),
  search: yup.string().nullable(),
});

export const pullRequestFilterSchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  state: yup.string().oneOf(["open", "closed", "all"]).default("all"),
  since: yup.string().nullable(),
  until: yup.string().nullable(),
  author: yup.string().nullable(),
});

export const issueFilterSchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  state: yup.string().oneOf(["open", "closed", "all"]).default("all"),
  since: yup.string().nullable(),
  until: yup.string().nullable(),
  author: yup.string().nullable(),
});

export const syncRequestSchema = yup.object({
  accessToken: yup.string().nullable(),
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
