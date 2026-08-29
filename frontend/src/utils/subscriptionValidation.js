// src/utils/subscriptionValidation.js
import * as yup from "yup";

export const planCreateSchema = yup.object({
  name: yup
    .string()
    .required("Plan name is required")
    .min(3, "Plan name must be at least 3 characters")
    .max(100, "Plan name must not exceed 100 characters"),
  description: yup.string().nullable(),
  plan_type: yup
    .string()
    .oneOf(["free", "basic", "pro", "enterprise", "custom"])
    .default("basic"),
  price: yup.number().min(0, "Price must be at least 0").default(0),
  billing_cycle: yup
    .string()
    .oneOf(["monthly", "yearly", "quarterly"])
    .default("monthly"),
  features: yup.object().default({}),
  limits: yup.object().default({}),
  is_active: yup.boolean().default(true),
  is_default: yup.boolean().default(false),
  trial_days: yup.number().min(0, "Trial days must be at least 0").default(0),
  sort_order: yup.number().default(0),
});

export const planUpdateSchema = yup.object({
  name: yup.string().min(3).max(100),
  description: yup.string().nullable(),
  plan_type: yup
    .string()
    .oneOf(["free", "basic", "pro", "enterprise", "custom"]),
  price: yup.number().min(0),
  billing_cycle: yup.string().oneOf(["monthly", "yearly", "quarterly"]),
  features: yup.object(),
  limits: yup.object(),
  is_active: yup.boolean(),
  is_default: yup.boolean(),
  trial_days: yup.number().min(0),
  sort_order: yup.number(),
});

export const subscriptionCreateSchema = yup.object({
  plan_id: yup
    .string()
    .required("Plan ID is required")
    .uuid("Invalid plan ID format"),
  interval: yup
    .string()
    .oneOf(["daily", "weekly", "monthly", "quarterly", "yearly"])
    .default("monthly"),
  payment_method_id: yup.string().nullable(),
  trial_days: yup.number().min(0).default(0),
});

export const subscriptionUpdateSchema = yup.object({
  plan_id: yup.string().uuid("Invalid plan ID format"),
  interval: yup
    .string()
    .oneOf(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  cancel_at_period_end: yup.boolean(),
  payment_method_id: yup.string().nullable(),
});

export const subscriptionCancelSchema = yup.object({
  cancel_at_period_end: yup.boolean().default(true),
  reason: yup.string().nullable(),
});

export const paymentCreateSchema = yup.object({
  subscription_id: yup
    .string()
    .required("Subscription ID is required")
    .uuid("Invalid subscription ID format"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  currency: yup.string().default("USD"),
  payment_method_type: yup
    .string()
    .oneOf(["card", "paypal", "stripe", "other"])
    .default("stripe"),
  description: yup.string().nullable(),
  metadata: yup.object().default({}),
});

export const subscriptionFilterSchema = yup.object({
  status: yup
    .string()
    .oneOf([
      "active",
      "inactive",
      "past_due",
      "canceled",
      "trialing",
      "expired",
    ]),
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  sortBy: yup
    .string()
    .oneOf(["created_at", "current_period_end", "status"])
    .default("created_at"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("DESC"),
});

export const planFilterSchema = yup.object({
  is_active: yup.boolean(),
  plan_type: yup
    .string()
    .oneOf(["free", "basic", "pro", "enterprise", "custom"]),
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  sortBy: yup.string().default("sort_order"),
  sortOrder: yup.string().oneOf(["ASC", "DESC"]).default("ASC"),
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
