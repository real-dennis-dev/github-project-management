// src/components/auth/UpdatePasswordForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Alert } from "../common/Alert";

const UpdatePasswordForm = () => {
  const navigate = useNavigate();
  const { updatePassword, isUpdatingPassword, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearError();
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});
    setSuccess(false);

    try {
      const result = await updatePassword(formData);
      if (result?.success === false) {
        setValidationErrors(result.errors || {});
        return;
      }
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Optionally navigate after success
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderPasswordInput = (name, label, placeholder) => {
    const showKey =
      name === "currentPassword"
        ? "current"
        : name === "newPassword"
        ? "new"
        : "confirm";

    return (
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPasswords[showKey] ? "text" : "password"}
          label={label}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          error={validationErrors?.[name]}
          fullWidth
          required
          disabled={isUpdatingPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => togglePasswordVisibility(showKey)}
              className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
            >
              {showPasswords[showKey] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />
      </div>
    );
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-neutral-200 p-8 rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mt-4">
          Password Updated!
        </h2>
        <p className="text-neutral-600 mt-2">
          Your password has been successfully updated. Redirecting to profile...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-neutral-200 p-8 rounded-xl shadow-lg">
      <div>
        <h2 className="text-center text-2xl font-bold text-neutral-900">
          Update Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Change your password to keep your account secure
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError} className="mt-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {renderPasswordInput(
          "currentPassword",
          "Current Password",
          "Enter your current password"
        )}

        {renderPasswordInput(
          "newPassword",
          "New Password",
          "Enter your new password"
        )}

        {renderPasswordInput(
          "confirmPassword",
          "Confirm New Password",
          "Confirm your new password"
        )}

        <div className="text-sm text-neutral-500 space-y-1">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>At least 8 characters long</li>
            <li>Contains at least one uppercase letter</li>
            <li>Contains at least one lowercase letter</li>
            <li>Contains at least one number</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isUpdatingPassword}
          disabled={isUpdatingPassword}
        >
          {isUpdatingPassword ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default UpdatePasswordForm;
