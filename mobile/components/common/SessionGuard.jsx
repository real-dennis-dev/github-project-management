// components/common/SessionGuard.jsx
import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAuth } from "../../context/AuthContext";

/**
 * Session Guard Component
 * Monitors app state and session validity
 * @param {Object} props - { children, onSessionExpired }
 * @returns {React.ReactElement}
 */
const SessionGuard = ({ children, onSessionExpired }) => {
  const { refreshSession, isAuthenticated } = useAuth();
  const appState = useRef(AppState.currentState);
  const refreshTimeout = useRef(null);

  // Refresh session periodically
  useEffect(() => {
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

    const scheduleRefresh = () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
      refreshTimeout.current = setTimeout(async () => {
        if (isAuthenticated) {
          const result = await refreshSession();
          if (!result.success && onSessionExpired) {
            onSessionExpired();
          }
        }
        scheduleRefresh();
      }, REFRESH_INTERVAL);
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [isAuthenticated, refreshSession, onSessionExpired]);

  // Refresh session when app comes back to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (
        appState.current.match(/background|inactive/) &&
        nextAppState === "active" &&
        isAuthenticated
      ) {
        const result = await refreshSession();
        if (!result.success && onSessionExpired) {
          onSessionExpired();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, refreshSession, onSessionExpired]);

  return children;
};

export default SessionGuard;
