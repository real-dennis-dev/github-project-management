import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "../components/common/Toast";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Trigger a toast (returns generated ID so you can dismiss manually if needed)
  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random();

    // Normalize string input or object options
    const toastOptions =
      typeof options === "string" ? { message: options } : options;

    setToasts((prevToasts) => [...prevToasts, { id, ...toastOptions }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Helper shortcuts for common variants
  const toast = useCallback(
    (message, options = {}) => addToast({ message, ...options }),
    [addToast]
  );

  toast.success = (message, options = {}) =>
    addToast({ message, variant: "success", ...options });
  toast.error = (message, options = {}) =>
    addToast({ message, variant: "error", ...options });
  toast.info = (message, options = {}) =>
    addToast({ message, variant: "info", ...options });
  toast.warning = (message, options = {}) =>
    addToast({ message, variant: "warning", ...options });
  toast.primary = (message, options = {}) =>
    addToast({ message, variant: "primary", ...options });

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Container for rendering active toasts */}
      <div className="fixed z-50 pointer-events-none inset-0 overflow-hidden flex flex-col items-end p-4 gap-2">
        {toasts.map(({ id, message, ...props }) => (
          <div key={id} className="pointer-events-auto">
            <Toast {...props} onClose={() => removeToast(id)}>
              {message}
            </Toast>
          </div>
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
