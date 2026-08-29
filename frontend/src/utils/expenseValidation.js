// src/utils/expenseValidation.js
import * as yup from "yup";

const CATEGORIES = [
  "hosting",
  "database",
  "domain",
  "api",
  "software",
  "hardware",
  "marketing",
  "other",
];

export const createExpenseSchema = yup.object({
  description: yup
    .string()
    .required("Description is required")
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must not exceed 500 characters"),
  amount: yup
    .number()
    .required("Amount is required")
    .min(0.01, "Amount must be at least 0.01")
    .max(999999999.99, "Amount is too large"),
  category: yup.string().oneOf(CATEGORIES, "Invalid category").default("other"),
  expense_date: yup.string().nullable().default(null),
  vendor: yup
    .string()
    .nullable()
    .max(100, "Vendor name must not exceed 100 characters"),
  receipt_url: yup
    .string()
    .nullable()
    .url("Must be a valid URL")
    .max(500, "Receipt URL must not exceed 500 characters"),
  recurring: yup.boolean().default(false),
});

export const updateExpenseSchema = yup.object({
  description: yup
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must not exceed 500 characters"),
  amount: yup
    .number()
    .min(0.01, "Amount must be at least 0.01")
    .max(999999999.99, "Amount is too large"),
  category: yup.string().oneOf(CATEGORIES, "Invalid category"),
  expense_date: yup.string().nullable(),
  vendor: yup
    .string()
    .nullable()
    .max(100, "Vendor name must not exceed 100 characters"),
  receipt_url: yup
    .string()
    .nullable()
    .url("Must be a valid URL")
    .max(500, "Receipt URL must not exceed 500 characters"),
  recurring: yup.boolean(),
});

export const expenseFiltersSchema = yup.object({
  category: yup.string().oneOf(["", ...CATEGORIES], "Invalid category"),
  fromDate: yup.string().nullable(),
  toDate: yup.string().nullable(),
  minAmount: yup
    .number()
    .nullable()
    .min(0, "Minimum amount must be 0 or greater"),
  maxAmount: yup
    .number()
    .nullable()
    .positive("Maximum amount must be greater than 0"),
  vendor: yup.string().nullable().max(100, "Vendor search term is too long"),
  recurring: yup.boolean().nullable(),
  page: yup.number().min(1, "Page must be at least 1").default(1),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must not exceed 100")
    .default(20),
  sortBy: yup
    .string()
    .oneOf(["expense_date", "amount", "category", "created_at"])
    .default("expense_date"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("DESC"),
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

export const CATEGORY_OPTIONS = CATEGORIES.map((cat) => ({
  value: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1),
}));

export const CATEGORY_LABELS = {
  hosting: "Hosting",
  database: "Database",
  domain: "Domain",
  api: "API Services",
  software: "Software",
  hardware: "Hardware",
  marketing: "Marketing",
  other: "Other",
};

export const CATEGORY_COLORS = {
  hosting: "#4CAF50",
  database: "#2196F3",
  domain: "#9C27B0",
  api: "#FF9800",
  software: "#00BCD4",
  hardware: "#607D8B",
  marketing: "#E91E63",
  other: "#9E9E9E",
};

export const CATEGORY_ICONS = {
  hosting: "Cloud",
  database: "Database",
  domain: "Globe",
  api: "Code",
  software: "Package",
  hardware: "Cpu",
  marketing: "Megaphone",
  other: "MoreHorizontal",
};
