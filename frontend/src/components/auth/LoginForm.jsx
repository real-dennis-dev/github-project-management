// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Checkbox } from "../common/Checkbox";
import { Alert } from "../common/Alert";
import SocialLoginButtons from "./SocialLoginButtons";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    try {
      const result = await login(formData);
      if (result?.success === false) {
        setValidationErrors(result.errors || {});
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-neutral-200 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-neutral-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Sign in to your account to continue
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
            value={formData.email}
            onChange={handleChange}
            error={validationErrors?.email}
            fullWidth
            required
            leftIcon={<Mail className="w-4 h-4" />}
            disabled={isLoggingIn}
          />

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={validationErrors?.password}
              fullWidth
              required
              disabled={isLoggingIn}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              label="Remember me"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoggingIn}
            />
            <Link
              to="/reset-password"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoggingIn}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <SocialLoginButtons />

        <p className="text-center text-sm text-neutral-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-500 hover:text-primary-600"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
