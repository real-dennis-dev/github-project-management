// src/components/auth/VerifyEmail.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button, Alert, LoadingSpinner } from "../common";
import useAuth from "../../hooks/useAuth";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    verifyEmail,
    resendVerification,
    loading,
    error,
    success,
    clearError,
  } = useAuth();

  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [resending, setResending] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Extract token from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      handleVerification(tokenParam);
    } else {
      setVerifying(false);
    }
  }, [location]);

  // Handle email verification
  const handleVerification = async (tokenParam) => {
    try {
      const result = await verifyEmail(tokenParam);
      setVerificationResult({
        success: true,
        message: "Email verified successfully!",
      });
    } catch (err) {
      setVerificationResult({ success: false, message: err.message });
    } finally {
      setVerifying(false);
    }
  };

  // Handle resend verification
  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      setVerificationResult({
        success: true,
        message: "Verification email has been resent. Please check your inbox.",
      });
    } catch (err) {
      setVerificationResult({
        success: false,
        message: err.message || "Failed to resend verification email",
      });
    } finally {
      setResending(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-500">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500">
            Email Verification
          </h1>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          {verificationResult ? (
            <div className="space-y-4">
              <Alert
                variant={verificationResult.success ? "success" : "error"}
                onClose={clearError}
              >
                {verificationResult.message}
              </Alert>

              {verificationResult.success ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  Go to Sign In
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-500 text-center">
                    The verification link may have expired or is invalid. You
                    can request a new verification email.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={resending}
                    disabled={resending}
                    onClick={handleResend}
                  >
                    Resend Verification Email
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => navigate("/login")}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold">Check Your Email</h2>
              <p className="text-neutral-500">
                We've sent a verification link to your email address. Please
                click the link to verify your account.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleResend}
                  loading={resending}
                  disabled={resending}
                >
                  Resend Verification Email
                </Button>
                <Link
                  to="/login"
                  className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
