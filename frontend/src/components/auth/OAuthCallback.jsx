// src/components/auth/OAuthCallback.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSpinner, Alert } from "../common";
import useAuth from "../../hooks/useAuth";

const OAuthCallback = () => {
  const { provider } = useParams();
  const navigate = useNavigate();
  const { handleOAuthCallback, loading, error } = useAuth();

  const [processing, setProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL query params
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");
        const state = params.get("state");

        // Check for OAuth error
        if (error) {
          setErrorMessage(`OAuth error: ${error}`);
          setProcessing(false);
          return;
        }

        // Validate code
        if (!code) {
          setErrorMessage("Authorization code not found");
          setProcessing(false);
          return;
        }

        // Build redirect URI
        const redirectUri =
          process.env.REACT_APP_OAUTH_REDIRECT_URI ||
          `${window.location.origin}/auth/callback/${provider}`;

        // Handle OAuth callback
        await handleOAuthCallback(provider, code, redirectUri);
        setProcessing(false);
      } catch (err) {
        setErrorMessage(err.message || "Authentication failed");
        setProcessing(false);
      }
    };

    handleCallback();
  }, [provider, handleOAuthCallback]);

  // Redirect to login after error or timeout
  useEffect(() => {
    if (!processing && !error) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [processing, error, navigate]);

  if (error || errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">❌</div>
              <h2 className="text-xl font-semibold">Authentication Error</h2>
            </div>
            <Alert variant="error">
              {errorMessage ||
                error ||
                "An error occurred during authentication."}
            </Alert>
            <p className="text-sm text-neutral-500 text-center mt-4">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-neutral-500">
          {loading ? "Authenticating..." : "Verifying your account..."}
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
