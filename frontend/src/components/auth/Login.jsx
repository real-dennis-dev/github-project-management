// src/components/auth/Login.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Input, Button, Alert, Checkbox, IconWrapper } from "../common";
import useAuth from "../../hooks/useAuth";
import { LOGIN_VALIDATION, OAUTH_PROVIDERS } from "./AuthConstants";

const Login = () => {
  const location = useLocation();
  const { login, loading, error, clearError, initiateOAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Check for messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      // Could show a toast notification here
    }
    if (location.state?.error) {
      // Could show an error notification here
    }
  }, [location]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = LOGIN_VALIDATION;

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
      await login(formData);
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
          <h1 className="text-3xl font-bold text-primary-500">Welcome Back</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <Alert variant="error" onClose={clearError}>
                {error}
              </Alert>
            )}

            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                label="Email"
                error={errors.email}
                fullWidth
                autoComplete="email"
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
                autoComplete="current-password"
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
              <div className="flex items-center justify-between mt-1">
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  label="Remember me"
                  id="rememberMe"
                />
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              fullWidth
            >
              Sign In
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

            {/* Register Link */}
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-500 hover:text-primary-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
