// src/utils/authValidation.js
import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: yup.boolean().default(false),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase, one lowercase, and one number"
    )
    .required("Password is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  full_name: yup
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required("You must accept the terms and conditions"),
});

export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
});

export const updatePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "New password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase, one lowercase, and one number"
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your password"),
});

export const socialLoginSchema = yup.object({
  provider: yup
    .string()
    .oneOf(["google", "github"], "Invalid provider")
    .required("Provider is required"),
  code: yup.string().required("Authorization code is required"),
});

export const sessionFilterSchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(20),
  status: yup.string().oneOf(["active", "expired", "all"]).default("active"),
});

export const extendSessionSchema = yup.object({
  sessionId: yup.string().uuid("Invalid session ID"),
  hours: yup.number().min(1).max(72).default(24),
});

export const revokeAllSchema = yup.object({
  excludeCurrent: yup.boolean().default(true),
});

// Helper function to validate form data
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
