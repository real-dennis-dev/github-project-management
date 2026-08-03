const Joi = require("joi");

const authValidation = {
  // Login validation
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
    rememberMe: Joi.boolean().default(false),
  }),

  // Register validation
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, number and special character",
        "any.required": "Password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
      }),
    fullName: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username cannot exceed 30 characters",
        "string.pattern.base":
          "Username can only contain letters, numbers and underscores",
      }),
  }),

  // OAuth validation
  oauth: Joi.object({
    code: Joi.string().required().messages({
      "any.required": "Authorization code is required",
    }),
    redirectUri: Joi.string().uri().required().messages({
      "string.uri": "Invalid redirect URI",
      "any.required": "Redirect URI is required",
    }),
  }),

  // Email verification
  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Verification token is required",
    }),
  }),

  // Forgot password
  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "any.required": "Email is required",
    }),
  }),

  // Reset password
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, number and special character",
        "any.required": "New password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
      }),
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "any.required": "Current password is required",
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, number and special character",
        "any.required": "New password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
      }),
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string(),
  }),

  // Session ID param
  sessionId: Joi.object({
    sessionId: Joi.string().uuid().required().messages({
      "string.uuid": "Invalid session ID format",
      "any.required": "Session ID is required",
    }),
  }),
};

module.exports = authValidation;
