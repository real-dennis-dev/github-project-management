// hooks/useAuth.js
import { useState, useEffect, useCallback, useContext } from "react";
import AuthContext from "../context/AuthContext";
import authService from "../services/authService";
import authStore from "../services/authStore";

/**
 * Authentication Hook
 * Provides authentication state and methods
 * @returns {Object} { user, isAuthenticated, isLoading, login, register, logout, ... }
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/**
 * Internal useAuth implementation
 * For use in AuthProvider only
 */
export const useAuthProvider = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const storedUser = await authStore.getUser();
        const authData = await authStore.getAuthData();

        if (storedUser && authData) {
          // Validate session with backend
          const validation = await authService.validateSession();
          if (validation.valid) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Session expired, clear local data
            await authStore.clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   * @param {Object} credentials - { email, password, rememberMe }
   * @returns {Promise<{ success: boolean, user: User, error?: string }>}
   */
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);

        // Save to local storage
        await authStore.saveAuthData({
          user: response.data.user,
          tokens: response.data.tokens,
          sessionId: response.data.sessionId,
        });

        // Load sessions if available
        if (response.data.sessions) {
          setSessions(response.data.sessions);
        }

        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {Object} userData - { email, password, confirmPassword, fullName, username }
   * @returns {Promise<{ success: boolean, user?: User, error?: string, requires2FA?: boolean }>}
   */
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      if (response.success) {
        if (response.data.requires2FA) {
          return { success: true, requires2FA: true };
        }

        setUser(response.data.user);
        setIsAuthenticated(true);

        await authStore.saveAuthData({
          user: response.data.user,
          tokens: response.data.tokens,
          sessionId: response.data.sessionId,
        });

        return { success: true, user: response.data.user };
      } else {
        return {
          success: false,
          error: response.message || "Registration failed",
        };
      }
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   * @param {boolean} allDevices - Logout from all devices
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const logout = useCallback(async (allDevices = false) => {
    try {
      setIsLoading(true);

      if (allDevices) {
        await authService.logoutAll();
      } else {
        await authService.logout();
      }

      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      setSessions([]);

      // Clear storage
      await authStore.clearAuthData();

      return { success: true };
    } catch (error) {
      // Even if API fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      setSessions([]);
      await authStore.clearAuthData();

      return { success: false, error: error.message || "Logout failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout from specific session
   * @param {string} sessionId - Session ID to logout from
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const logoutSession = useCallback(async (sessionId) => {
    try {
      await authService.logoutSession(sessionId);
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to logout session",
      };
    }
  }, []);

  /**
   * Get active sessions
   * @returns {Promise<{ success: boolean, sessions?: Array<Session>, error?: string }>}
   */
  const getSessions = useCallback(async () => {
    try {
      const response = await authService.getSessions();
      if (response.success) {
        setSessions(response.data);
        return { success: true, sessions: response.data };
      }
      return {
        success: false,
        error: response.message || "Failed to get sessions",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to get sessions",
      };
    }
  }, []);

  /**
   * Refresh session
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      if (response.success) {
        // Update stored tokens
        const authData = await authStore.getAuthData();
        if (authData) {
          authData.tokens = response.data.tokens;
          await authStore.saveAuthData(authData);
        }
        return { success: true };
      }
      return {
        success: false,
        error: response.message || "Failed to refresh session",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to refresh session",
      };
    }
  }, []);

  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const changePassword = useCallback(async (data) => {
    try {
      const response = await authService.changePassword(data);
      if (response.success) {
        return { success: true };
      }
      return {
        success: false,
        error: response.message || "Failed to change password",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to change password",
      };
    }
  }, []);

  /**
   * Update user profile (local only)
   * @param {User} updatedUser - Updated user data
   */
  const updateUser = useCallback(async (updatedUser) => {
    setUser(updatedUser);
    await authStore.updateUser(updatedUser);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    sessions,
    login,
    register,
    logout,
    logoutSession,
    getSessions,
    refreshSession,
    changePassword,
    updateUser,
  };
};

export default useAuth;
