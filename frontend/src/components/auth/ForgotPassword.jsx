// src/components/auth/ForgotPassword.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Button, Alert, IconWrapper } from "../common";
import useAuth from "../../hooks/useAuth";
import { FORGOT_PASSWORD_VALIDATION } from "./AuthConstants";

const ForgotPassword = () => {
  const { forgotPassword, loading, error, success, clearError, clearSuccess } =
    useAuth();

  const [email, setEmail] = useState("");
  const [errorField, setErrorField] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errorField) {
      setErrorField(null);
    }
    clearError();
  };

  // Validate form
  const validateForm = () => {
    const rules = FORGOT_PASSWORD_VALIDATION;

    if (rules.email.required && !email) {
      setErrorField("Email is required");
      return false;
    }

    if (rules.email.pattern && !rules.email.pattern.value.test(email)) {
      setErrorField("Invalid email address");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await forgotPassword(email);
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
            Reset Password
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {(error || errorField) && (
              <Alert variant="error" onClose={clearError}>
                {error || errorField}
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert variant="success" onClose={clearSuccess}>
                Password reset link has been sent to your email. Please check
                your inbox.
              </Alert>
            )}

            {/* Email */}
            {!success && (
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  label="Email"
                  fullWidth
                  autoComplete="email"
                />
              </div>
            )}

            {/* Submit Button */}
            {!success && (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              >
                Send Reset Link
              </Button>
            )}

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
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
