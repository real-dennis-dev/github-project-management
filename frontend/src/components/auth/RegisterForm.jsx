// src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Checkbox } from "../common/Checkbox";
import { Alert } from "../common/Alert";
import SocialLoginButtons from "./SocialLoginButtons";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isRegistering, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    acceptTerms: false,
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
      const result = await register(formData);
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
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Join us and get started
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
            disabled={isRegistering}
          />

          <Input
            id="username"
            name="username"
            type="text"
            label="Username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            error={validationErrors?.username}
            fullWidth
            leftIcon={<User className="w-4 h-4" />}
            disabled={isRegistering}
          />

          <Input
            id="full_name"
            name="full_name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={handleChange}
            error={validationErrors?.full_name}
            fullWidth
            disabled={isRegistering}
          />

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={validationErrors?.password}
              fullWidth
              required
              disabled={isRegistering}
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

          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            label="I accept the terms and conditions"
            checked={formData.acceptTerms}
            onChange={handleChange}
            error={validationErrors?.acceptTerms}
            disabled={isRegistering}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isRegistering}
            disabled={isRegistering}
          >
            {isRegistering ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <SocialLoginButtons />

        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-500 hover:text-primary-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
