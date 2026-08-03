// src/components/auth/ResetPassword.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Input, Button, Alert, IconWrapper } from "../common";
import useAuth from "../../hooks/useAuth";
import { RESET_PASSWORD_VALIDATION } from "./AuthConstants";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword, loading, error, success, clearError, clearSuccess } =
    useAuth();

  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Extract token from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // If no token, redirect to forgot password
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = RESET_PASSWORD_VALIDATION;

    // New password validation
    if (rules.newPassword.required && !formData.newPassword) {
      newErrors.newPassword = rules.newPassword.required;
    } else if (formData.newPassword && rules.newPassword.minLength) {
      if (formData.newPassword.length < rules.newPassword.minLength.value) {
        newErrors.newPassword = rules.newPassword.minLength.message;
      }
    } else if (formData.newPassword && rules.newPassword.pattern) {
      if (!rules.newPassword.pattern.value.test(formData.newPassword)) {
        newErrors.newPassword = rules.newPassword.pattern.message;
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
      await resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500">
            Set New Password
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          {success ? (
            <div className="space-y-4">
              <Alert variant="success">
                Password has been reset successfully! You can now log in with
                your new password.
              </Alert>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Display */}
              {(error || Object.keys(errors).length > 0) && (
                <Alert variant="error" onClose={clearError}>
                  {error || Object.values(errors)[0]}
                </Alert>
              )}

              {/* New Password */}
              <div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New password"
                  label="New Password"
                  error={errors.newPassword}
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
                {!errors.newPassword && (
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
                  placeholder="Confirm new password"
                  label="Confirm Password"
                  error={errors.confirmPassword}
                  fullWidth
                  autoComplete="new-password"
                  rightElement={
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                disabled={loading || !token}
                fullWidth
              >
                Reset Password
              </Button>

              {/* Back to Login Link */}
              <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                <Link
                  to="/login"
                  className="text-primary-500 hover:text-primary-600 hover:underline font-medium"
                >
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
