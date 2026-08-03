// src/components/auth/ChangePassword.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Alert, IconWrapper } from "../common";
import useAuth from "../../hooks/useAuth";
import { CHANGE_PASSWORD_VALIDATION } from "./AuthConstants";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { changePassword, loading, error, success, clearError, clearSuccess } =
    useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    const rules = CHANGE_PASSWORD_VALIDATION;

    // Current password validation
    if (rules.currentPassword.required && !formData.currentPassword) {
      newErrors.currentPassword = rules.currentPassword.required;
    }

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
      await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500">
            Change Password
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Update your account password
          </p>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          {success ? (
            <div className="space-y-4">
              <Alert variant="success">
                Password has been changed successfully!
              </Alert>
              <Button variant="primary" fullWidth onClick={handleCancel}>
                Go Back
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

              {/* Current Password */}
              <div>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  label="Current Password"
                  error={errors.currentPassword}
                  fullWidth
                  autoComplete="current-password"
                  rightElement={
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  }
                />
              </div>

              {/* New Password */}
              <div>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  label="New Password"
                  error={errors.newPassword}
                  fullWidth
                  autoComplete="new-password"
                  rightElement={
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? "👁️" : "👁️‍🗨️"}
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
