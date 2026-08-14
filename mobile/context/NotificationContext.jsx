import React, { createContext, useState, useContext, useCallback } from "react";
import Toast from "../components/common/Toast";
import helpers from "../utils/helpers";

// Create context
const NotificationContext = createContext(null);

/**
 * Notification Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
    duration: 3000,
    position: "top",
  });

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - success | error | warning | info
   * @param {number} duration - Duration in milliseconds
   * @param {string} position - top | bottom
   */
  const showToast = useCallback(
    (message, type = "info", duration = 3000, position = "top") => {
      setToast({
        visible: true,
        message,
        type,
        duration,
        position,
      });
    },
    []
  );

  /**
   * Hide toast notification
   */
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {number} duration - Duration in milliseconds
   */
  const showSuccess = useCallback(
    (message, duration = 3000) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {number} duration - Duration in milliseconds
   */
  const showError = useCallback(
    (message, duration = 4000) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {number} duration - Duration in milliseconds
   */
  const showWarning = useCallback(
    (message, duration = 3000) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {number} duration - Duration in milliseconds
   */
  const showInfo = useCallback(
    (message, duration = 3000) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  /**
   * Add notification to list
   * @param {Object} notification - Notification object
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.type - Notification type
   * @param {Object} notification.data - Additional data
   * @returns {string} Notification ID
   */
  const addNotification = useCallback((notification) => {
    const id = helpers.generateId("notif_");
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return id;
  }, []);

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   */
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  /**
   * Remove notification
   * @param {string} id - Notification ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Get unread count
   * @returns {number} Unread count
   */
  const getUnreadCount = useCallback(() => {
    return notifications.filter((notif) => !notif.read).length;
  }, [notifications]);

  const value = {
    notifications,
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onHide={hideToast}
        />
      )}
    </NotificationContext.Provider>
  );
};

/**
 * useNotification hook
 * @returns {Object} Notification context value
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
