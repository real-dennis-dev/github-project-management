// src/components/auth/ResetPasswordForm.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Alert } from "../common/Alert";

const ResetPasswordForm = () => {
  const { resetPassword, isResettingPassword, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    try {
      const result = await resetPassword(email);
      if (result?.success === false) {
        setValidationErrors(result.errors || {});
        return;
      }
      setSuccess(true);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-neutral-200 p-8 rounded-xl shadow-lg text-center">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Check Your Email
          </h2>
          <p className="text-neutral-600">
            We've sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-neutral-200 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-neutral-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        {error && (
          <Alert variant="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
              setValidationErrors({});
            }}
            error={validationErrors?.email}
            fullWidth
            required
            leftIcon={<Mail className="w-4 h-4" />}
            disabled={isResettingPassword}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isResettingPassword}
            disabled={isResettingPassword}
          >
            {isResettingPassword ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-primary-500"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
