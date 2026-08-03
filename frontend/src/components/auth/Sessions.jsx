// src/components/auth/Sessions.jsx

import React, { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  Modal,
  IconWrapper,
} from "../common";
import useAuth from "../../hooks/useAuth";
import {
  formatDate,
  getDeviceType,
  getSessionStatusVariant,
  DEVICE_TYPES,
} from "./AuthConstants";

const Sessions = () => {
  const {
    sessions,
    loading,
    error,
    refreshSessions,
    logoutSession,
    logoutAll,
    clearError,
  } = useAuth();

  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [showLogoutSessionModal, setShowLogoutSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(null);

  // Refresh sessions on mount
  useEffect(() => {
    refreshSessions();
  }, []);

  // Handle logout session
  const handleLogoutSession = async (sessionId) => {
    setSessionLoading(sessionId);
    try {
      await logoutSession(sessionId);
      setShowLogoutSessionModal(false);
      setSelectedSession(null);
      await refreshSessions();
    } catch (err) {
      // Error handled by hook
    } finally {
      setSessionLoading(null);
    }
  };

  // Handle logout all
  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      setShowLogoutAllModal(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Get device icon
  const getDeviceIcon = (userAgent) => {
    const type = getDeviceType(userAgent);
    switch (type) {
      case DEVICE_TYPES.DESKTOP:
        return "💻";
      case DEVICE_TYPES.MOBILE:
        return "📱";
      case DEVICE_TYPES.TABLET:
        return "📋";
      default:
        return "🖥️";
    }
  };

  if (loading && !sessions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Active Sessions</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your active sessions across all devices
          </p>
        </div>
        {sessions.length > 1 && (
          <Button variant="danger" onClick={() => setShowLogoutAllModal(true)}>
            Logout All
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Sessions List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No active sessions found.
          </div>
        ) : (
          sessions.map((session) => {
            const isCurrent = session.isCurrent;
            const deviceType = getDeviceType(session.userAgent);

            return (
              <div
                key={session.id}
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                  isCurrent ? "bg-primary-50 dark:bg-primary-900/10" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-2xl">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {session.deviceName || "Unknown Device"}
                      </span>
                      {isCurrent && (
                        <Badge variant="success" size="sm">
                          Current Session
                        </Badge>
                      )}
                      <Badge
                        variant={getSessionStatusVariant("active")}
                        size="sm"
                      >
                        Active
                      </Badge>
                    </div>
                    <div className="text-sm text-neutral-500 space-y-0.5 mt-1">
                      {session.ipAddress && (
                        <div className="flex items-center gap-2">
                          <span>IP: {session.ipAddress}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span>
                          Last active: {formatDate(session.lastActive)}
                        </span>
                        <span>•</span>
                        <span>Expires: {formatDate(session.expiresAt)}</span>
                      </div>
                      {session.userAgent && (
                        <div className="text-xs text-neutral-400 truncate">
                          {session.userAgent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    loading={sessionLoading === session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      setShowLogoutSessionModal(true);
                    }}
                  >
                    Logout
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Logout Session Confirmation Modal */}
      <Modal
        isOpen={showLogoutSessionModal}
        onClose={() => setShowLogoutSessionModal(false)}
        title="Logout Session"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to logout this session?
          </p>
          {selectedSession && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">
                {selectedSession.deviceName || "Unknown Device"}
              </p>
              <p className="text-sm text-neutral-500">
                Last active: {formatDate(selectedSession.lastActive)}
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowLogoutSessionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleLogoutSession(selectedSession?.id)}
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout All Confirmation Modal */}
      <Modal
        isOpen={showLogoutAllModal}
        onClose={() => setShowLogoutAllModal(false)}
        title="Logout All Sessions"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to logout from all devices? This will end all
            active sessions except this one.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowLogoutAllModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleLogoutAll}>
              Logout All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sessions;
