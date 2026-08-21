import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "../components/common/Toast"; // Adjust relative path if needed

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Primary method used by useKnowledgeBase:
   * showToast("Message string", "error")
   *
   * Also accepts an options object for advanced usage:
   * showToast({ message: "Hello", variant: "success", title: "Success" })
   */
  const showToast = useCallback((messageOrOptions, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);

    let toastOptions = {};
    if (typeof messageOrOptions === "string") {
      toastOptions = {
        message: messageOrOptions,
        variant: type,
      };
    } else if (
      typeof messageOrOptions === "object" &&
      messageOrOptions !== null
    ) {
      toastOptions = {
        ...messageOrOptions,
        variant: messageOrOptions.variant || type,
      };
    }

    setToasts((prev) => [...prev, { id, ...toastOptions }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col gap-2 p-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            title={toast.title}
            duration={toast.duration}
            position={toast.position || "top-right"}
            className="pointer-events-auto"
            onClose={() => removeToast(toast.id)}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
