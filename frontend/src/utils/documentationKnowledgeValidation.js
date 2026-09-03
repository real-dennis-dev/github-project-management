// src/utils/documentationKnowledgeValidation.js
import * as yup from "yup";

export const documentationCreateSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  content: yup
    .string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters"),
  doc_type: yup
    .string()
    .required("Document type is required")
    .oneOf(["api", "erd", "flowchart", "user_manual", "technical", "other"]),
  tags: yup.array().of(yup.string()),
  version: yup.number().min(0).default(1),
});

export const documentationUpdateSchema = yup.object({
  title: yup.string().min(3).max(200),
  content: yup.string().min(10),
  doc_type: yup
    .string()
    .oneOf(["api", "erd", "flowchart", "user_manual", "technical", "other"]),
  tags: yup.array().of(yup.string()),
});

export const knowledgeCreateSchema = yup.object({
  category: yup
    .string()
    .required("Category is required")
    .min(2, "Category must be at least 2 characters"),
  topic: yup
    .string()
    .required("Topic is required")
    .min(3, "Topic must be at least 3 characters")
    .max(200, "Topic must not exceed 200 characters"),
  content: yup
    .string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters"),
  tags: yup.array().of(yup.string()),
  related_links: yup.array().of(yup.string().url("Must be a valid URL")),
});

export const knowledgeUpdateSchema = yup.object({
  category: yup.string().min(2),
  topic: yup.string().min(3).max(200),
  content: yup.string().min(10),
  tags: yup.array().of(yup.string()),
  related_links: yup.array().of(yup.string().url("Must be a valid URL")),
});

export const searchSchema = yup.object({
  query: yup.string().required("Search query is required").min(2),
  doc_type: yup
    .string()
    .oneOf(["api", "erd", "flowchart", "user_manual", "technical", "other"]),
  category: yup.string(),
  limit: yup.number().min(1).max(100).default(10),
  offset: yup.number().min(0).default(0),
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
