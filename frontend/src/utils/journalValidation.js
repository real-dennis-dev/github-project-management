// src/utils/journalValidation.js
import * as yup from "yup";

// Mood options
export const MOODS = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];

// Mood mapping for scores
export const MOOD_SCORES = {
  "😊": 5,
  "🎉": 5,
  "🤔": 3,
  "😐": 3,
  "😔": 2,
  "😴": 2,
  "😡": 1,
  "😰": 1,
};

export const journalEntrySchema = yup.object({
  entry_date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .nullable(),
  finished_today: yup
    .string()
    .max(2000, "Finished today must be at most 2000 characters")
    .nullable(),
  problems: yup
    .string()
    .max(2000, "Problems must be at most 2000 characters")
    .nullable(),
  tomorrow_plan: yup
    .string()
    .max(2000, "Tomorrow plan must be at most 2000 characters")
    .nullable(),
  mood: yup.string().oneOf(MOODS, "Invalid mood selection").default("😐"),
  notes: yup
    .string()
    .max(5000, "Notes must be at most 5000 characters")
    .nullable(),
});

export const journalFilterSchema = yup.object({
  fromDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .nullable(),
  toDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .nullable(),
  mood: yup
    .string()
    .oneOf([...MOODS, null], "Invalid mood selection")
    .nullable(),
  page: yup.number().integer().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .integer()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(20),
  sortBy: yup
    .string()
    .oneOf(["entry_date", "created_at", "mood"], "Invalid sort field")
    .default("entry_date"),
  sortOrder: yup
    .string()
    .oneOf(["ASC", "DESC"], "Invalid sort order")
    .default("DESC"),
});

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
