// src/components/auth/useAuth.js

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useAuthContext } from "../context/AuthContext";

/**
 * Custom hook for authentication operations
 * Extends the global AuthContext with additional UI state
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const authContext = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle login with email/password
   */
  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authContext.login(credentials);
        setSuccess(true);
        navigate("/dashboard");
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext, navigate]
  );

  /**
   * Handle registration
   */
  const register = useCallback(
    async (userData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authContext.register(userData);
        setSuccess(true);
        navigate("/login", {
          state: { message: "Registration successful! Please log in." },
        });
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext, navigate]
  );

  /**
   * Handle logout
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authContext.logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  }, [authContext, navigate]);

  /**
   * Handle logout from all sessions
   */
  const logoutAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authContext.logoutAll();
      navigate("/login");
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authContext, navigate]);

  /**
   * Handle logout from specific session
   */
  const logoutSession = useCallback(
    async (sessionId) => {
      setLoading(true);
      setError(null);
      try {
        await authContext.logoutSession(sessionId);
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext]
  );

  /**
   * Handle forgot password
   */
  const forgotPassword = useCallback(
    async (email) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authContext.forgotPassword(email);
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext]
  );

  /**
   * Handle reset password
   */
  const resetPassword = useCallback(
    async (token, newPassword, confirmPassword) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authContext.resetPassword(
          token,
          newPassword,
          confirmPassword
        );
        setSuccess(true);
        navigate("/login", {
          state: { message: "Password reset successful! Please log in." },
        });
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext, navigate]
  );

  /**
   * Handle change password (authenticated)
   */
  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authContext.changePassword(
          currentPassword,
          newPassword,
          confirmPassword
        );
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext]
  );

  /**
   * Handle verify email
   */
  const verifyEmail = useCallback(
    async (token) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authContext.verifyEmail(token);
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext]
  );

  /**
   * Handle resend verification
   */
  const resendVerification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authContext.resendVerification();
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authContext]);

  /**
   * Initiate OAuth login
   */
  const initiateOAuth = useCallback((provider) => {
    const oauthProvider = OAUTH_PROVIDERS.find((p) => p.id === provider);
    if (!oauthProvider) {
      throw new Error(`Provider ${provider} not found`);
    }

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: oauthProvider.clientId,
      redirect_uri: oauthProvider.redirectUri,
      response_type: "code",
      scope: oauthProvider.scope,
      state: Math.random().toString(36).substring(7),
    });

    window.location.href = `${oauthProvider.authUrl}?${params.toString()}`;
  }, []);

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = useCallback(
    async (provider, code, redirectUri) => {
      setLoading(true);
      setError(null);
      try {
        let result;
        if (provider === "google") {
          result = await authContext.loginWithGoogle(code, redirectUri);
        } else if (provider === "github") {
          result = await authContext.loginWithGithub(code, redirectUri);
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }
        navigate("/dashboard");
        return result;
      } catch (err) {
        setError(err.message);
        navigate("/login", {
          state: { error: `${provider} login failed: ${err.message}` },
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authContext, navigate]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear success
   */
  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    // State
    loading,
    error,
    success,
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    sessions: authContext.sessions,

    // Auth operations
    login,
    register,
    logout,
    logoutAll,
    logoutSession,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    resendVerification,
    initiateOAuth,
    handleOAuthCallback,

    // Utilities
    clearError,
    clearSuccess,
    refreshSessions: authContext.getSessions,
    hasPermission: authContext.hasPermission,
  };
};

export default useAuth;
