// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "../utils/axiosInstance";

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

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axiosInstance.get("/auth/validate");
        if (response.data?.data) {
          setUser(response.data.data);
        }
      } catch (err) {
        // Session invalid or expired
        setUser(null);
        // Don't redirect here - let the app handle it
      } finally {
        setLoading(false);
      }
    };

    validateSession();

    // Listen for logout events
    const handleLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/login", credentials);

      if (response.data?.success) {
        const { user, requires2FA } = response.data.data;

        if (requires2FA) {
          // Handle 2FA flow
          return { requires2FA, data: response.data.data };
        }

        setUser(user);
        return { success: true, user };
      }

      throw new Error("Login failed");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setLoading(false);
      // Clear any cached data
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axiosInstance.post("/auth/refresh-token");
      return response.data;
    } catch (err) {
      // If refresh fails, logout
      await logout();
      throw err;
    }
  }, [logout]);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      // Implement your permission logic here
      return true;
    },
    [user]
  );

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    hasPermission,
    isAuthenticated,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
