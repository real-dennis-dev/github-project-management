import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/apiService";

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("@auth_token");
      const userData = await AsyncStorage.getItem("@user");

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>}
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      const { token, refreshToken, user: userData } = response.data;

      // Store tokens and user data
      await AsyncStorage.multiSet([
        ["@auth_token", token],
        ["@refresh_token", refreshToken],
        ["@user", JSON.stringify(userData)],
      ]);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>}
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post("/auth/register", userData);

      const { token, refreshToken, user: userDataResponse } = response.data;

      // Store tokens and user data
      await AsyncStorage.multiSet([
        ["@auth_token", token],
        ["@refresh_token", refreshToken],
        ["@user", JSON.stringify(userDataResponse)],
      ]);

      setUser(userDataResponse);
      setIsAuthenticated(true);

      return { success: true, user: userDataResponse };
    } catch (err) {
      setError(err.message || "Registration failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear stored data
      await AsyncStorage.multiRemove([
        "@auth_token",
        "@refresh_token",
        "@user",
      ]);

      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   * @param {Object} updateData - User data to update
   * @returns {Promise<Object>}
   */
  const updateProfile = async (updateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.put("/users/profile", updateData);

      const updatedUser = response.data;

      // Update stored user data
      await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message || "Update failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.post("/auth/reset-password", { email });
      return { success: true };
    } catch (err) {
      setError(err.message || "Reset password failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
