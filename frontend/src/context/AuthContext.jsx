// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/AuthService"; // adjust path if needed

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);

  /**
   * Fetch current user on application startup (via /auth/me)
   * Uses optionalAuth on the backend — works for both guests and authenticated users.
   */
  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await authService.getCurrentUser();

      // Backend returns user data (or null) in res.data
      if (res?.data) {
        console.log(res.data);
        setUser(res.data);
      } else {
        console.log(res.data);
        setUser(null);
        setSessions([]);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setUser(null);
      setSessions([]);
      setError(err?.message || "Failed to fetch current user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser();

    const handleLogout = () => {
      setUser(null);
      setSessions([]);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [getCurrentUser]);

  /**
   * Fetch active sessions
   */
  const getSessions = useCallback(async () => {
    try {
      const res = await authService.getSessions();
      const list = res?.data || [];
      setSessions(list);
      return list;
    } catch (err) {
      console.error("Error fetching sessions:", err);
      return [];
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      return await authService.refreshToken();
    } catch (err) {
      setUser(null);
      setSessions([]);
      throw err;
    }
  }, []);

  /**
   * Permission helper
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      // Extend this with real permission checks as needed
      return true;
    },
    [user]
  );

  // ────────────────────────────────────────────────
  // Auth operations expected by the useAuth hook
  // ────────────────────────────────────────────────

  const login = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      // Refresh user after successful login
      await getCurrentUser();
      // Optionally load sessions
      getSessions().catch(() => {});
      return result;
    },
    [getCurrentUser, getSessions]
  );

  const register = useCallback(async (userData) => {
    const result = await authService.register(userData);
    // Usually you don't auto-login after register; user is sent to /login
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSessions([]);
      // Let other parts of the app know
      window.dispatchEvent(new Event("auth:logout"));
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } finally {
      setUser(null);
      setSessions([]);
      window.dispatchEvent(new Event("auth:logout"));
    }
  }, []);

  const logoutSession = useCallback(
    async (sessionId) => {
      const result = await authService.logoutSession(sessionId);
      // Refresh the sessions list
      await getSessions();
      return result;
    },
    [getSessions]
  );

  const forgotPassword = useCallback(async (email) => {
    return await authService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(
    async (token, newPassword, confirmPassword) => {
      return await authService.resetPassword(
        token,
        newPassword,
        confirmPassword
      );
    },
    []
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      return await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );
    },
    []
  );

  const verifyEmail = useCallback(
    async (token) => {
      const result = await authService.verifyEmail(token);
      // Optionally refresh user so emailVerified flag is up to date
      await getCurrentUser();
      return result;
    },
    [getCurrentUser]
  );

  const resendVerification = useCallback(async () => {
    return await authService.resendVerification();
  }, []);

  const loginWithGoogle = useCallback(
    async (code, redirectUri) => {
      const result = await authService.loginWithGoogle(code, redirectUri);
      await getCurrentUser();
      getSessions().catch(() => {});
      return result;
    },
    [getCurrentUser, getSessions]
  );

  const loginWithGithub = useCallback(
    async (code, redirectUri) => {
      const result = await authService.loginWithGithub(code, redirectUri);
      await getCurrentUser();
      getSessions().catch(() => {});
      return result;
    },
    [getCurrentUser, getSessions]
  );

  const value = {
    // State
    user,
    loading,
    error,
    sessions,
    isAuthenticated: !!user,

    // Core helpers (kept from your original)
    getCurrentUser,
    refreshToken,
    getSessions,
    hasPermission,
    setUser,
    setError,

    // Auth operations used by the useAuth hook
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
    loginWithGoogle,
    loginWithGithub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
