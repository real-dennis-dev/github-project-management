// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/AuthService";

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
   * Validate existing session on application startup
   */
  const validateSession = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authService.validateSession();

      if (res?.data) {
        setUser(res.data);
      } else {
        setUser(null);
        setSessions([]);
      }
    } catch (err) {
      setUser(null);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();

    const handleLogout = () => {
      setUser(null);
      setSessions([]);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [validateSession]);

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

      return true;
    },
    [user]
  );

  const value = {
    user,
    loading,
    error,
    sessions,

    refreshToken,

    hasPermission,
    isAuthenticated: !!user,
    setUser,
    setError,
    getSessions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
