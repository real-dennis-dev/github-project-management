// src/components/tech-debt/TechDebtRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Lazy load components for better performance
const TechDebtList = React.lazy(() => import("./TechDebtList"));
const TechDebtForm = React.lazy(() => import("./TechDebtForm"));
const TechDebtDetail = React.lazy(() => import("./TechDebtDetail"));
const TechDebtDashboard = React.lazy(() => import("./TechDebtDashboard"));

/**
 * Protected route wrapper component
 */
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Tech Debt Routes Component
 */
const TechDebtRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Main tech debt routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TechDebtList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TechDebtDashboard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TechDebtForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path=":techDebtId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TechDebtDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path=":techDebtId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TechDebtForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default TechDebtRoutes;
