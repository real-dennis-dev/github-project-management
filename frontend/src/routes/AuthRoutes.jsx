import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// Lazy load components for better performance
const Login = React.lazy(() => import("../components/auth/Login"));
const Register = React.lazy(() => import("../components/auth/Register"));
const ForgotPassword = React.lazy(() =>
  import("../components/auth/ForgotPassword")
);
const ResetPassword = React.lazy(() =>
  import("../components/auth/ResetPassword")
);
const ChangePassword = React.lazy(() =>
  import("../components/auth/ChangePassword")
);
const VerifyEmail = React.lazy(() => import("../components/auth/VerifyEmail"));
const Sessions = React.lazy(() => import("../components/auth/Sessions"));
const OAuthCallback = React.lazy(() =>
  import("../components/auth/OAuthCallback")
);

/**
 * Auth Routes Component
 */
const AuthRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="login"
        element={
          <PublicRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Login />
            </React.Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="register"
        element={
          <PublicRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Register />
            </React.Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="forgot-password"
        element={
          <PublicRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ForgotPassword />
            </React.Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="reset-password"
        element={
          <PublicRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ResetPassword />
            </React.Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="verify-email"
        element={
          <React.Suspense fallback={<div>Loading...</div>}>
            <VerifyEmail />
          </React.Suspense>
        }
      />
      <Route
        path="callback/:provider"
        element={
          <React.Suspense fallback={<div>Loading...</div>}>
            <OAuthCallback />
          </React.Suspense>
        }
      />

      {/* Protected routes */}
      <Route
        path="change-password"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ChangePassword />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="sessions"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Sessions />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
