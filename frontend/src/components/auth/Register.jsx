// src/components/auth/Register.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Alert, IconWrapper } from "../common";
import useAuth from "../../hooks/useAuth";
import { REGISTER_VALIDATION, OAUTH_PROVIDERS } from "./AuthConstants";

const Register = () => {
  const { register, loading, error, clearError, initiateOAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = REGISTER_VALIDATION;

    // Email validation
    if (rules.email.required && !formData.email) {
      newErrors.email = rules.email.required;
    } else if (formData.email && rules.email.pattern) {
      if (!rules.email.pattern.value.test(formData.email)) {
        newErrors.email = rules.email.pattern.message;
      }
    }

    // Password validation
    if (rules.password.required && !formData.password) {
      newErrors.password = rules.password.required;
    } else if (formData.password && rules.password.minLength) {
      if (formData.password.length < rules.password.minLength.value) {
        newErrors.password = rules.password.minLength.message;
      }
    } else if (formData.password && rules.password.pattern) {
      if (!rules.password.pattern.value.test(formData.password)) {
        newErrors.password = rules.password.pattern.message;
      }
    }

    // Confirm password validation
    if (rules.confirmPassword.required && !formData.confirmPassword) {
      newErrors.confirmPassword = rules.confirmPassword.required;
    } else if (formData.confirmPassword && rules.confirmPassword.validate) {
      if (!rules.confirmPassword.validate(formData.confirmPassword, formData)) {
        newErrors.confirmPassword = rules.confirmPassword.validate(
          formData.confirmPassword,
          formData
        );
      }
    }

    // Full name validation
    if (rules.fullName.required && !formData.fullName) {
      newErrors.fullName = rules.fullName.required;
    } else if (formData.fullName && rules.fullName.minLength) {
      if (formData.fullName.length < rules.fullName.minLength.value) {
        newErrors.fullName = rules.fullName.minLength.message;
      }
    }

    // Username validation (optional)
    if (formData.username && rules.username.minLength) {
      if (formData.username.length < rules.username.minLength.value) {
        newErrors.username = rules.username.minLength.message;
      }
    } else if (formData.username && rules.username.pattern) {
      if (!rules.username.pattern.value.test(formData.username)) {
        newErrors.username = rules.username.pattern.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle OAuth login
  const handleOAuthLogin = (provider) => {
    initiateOAuth(provider);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500">
            Create Account
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Join us and start managing your projects
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <Alert variant="error" onClose={clearError}>
                {error}
              </Alert>
            )}

            {/* Full Name */}
            <div>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                label="Full Name"
                error={errors.fullName}
                fullWidth
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                label="Email"
                error={errors.email}
                fullWidth
                autoComplete="email"
              />
            </div>

            {/* Username (Optional) */}
            <div>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                label="Username (Optional)"
                error={errors.username}
                fullWidth
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                label="Password"
                error={errors.password}
                fullWidth
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                }
              />
              {!errors.password && (
                <p className="text-xs text-neutral-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase,
                  number, and special character
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                label="Confirm Password"
                error={errors.confirmPassword}
                fullWidth
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              fullWidth
            >
              Create Account
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-2">
              {OAUTH_PROVIDERS.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => handleOAuthLogin(provider.id)}
                  className="flex items-center justify-center gap-2"
                >
                  <span>{provider.icon}</span>
                  Continue with {provider.name}
                </Button>
              ))}
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
