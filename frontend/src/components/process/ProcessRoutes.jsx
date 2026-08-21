// src/components/process/ProcessRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Lazy load components for better performance
const ProgressDashboard = React.lazy(() => import("./ProgressDashboard"));
const TimelineList = React.lazy(() => import("./TimelineList"));
const TimelineForm = React.lazy(() => import("./TimelineForm"));
const TimelineDetail = React.lazy(() => import("./TimelineDetail"));
const ProgressOverview = React.lazy(() => import("./ProgressOverview"));
const ProgressReport = React.lazy(() => import("./ProgressReport"));

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
 * Process Routes Component
 */
const ProcessRoutes = () => {
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
      {/* Main process routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ProgressDashboard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="timeline"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TimelineList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="timeline/new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TimelineForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="timeline/:entryId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TimelineDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="timeline/:entryId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <TimelineForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="overview"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ProgressOverview />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="report"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ProgressReport />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ProcessRoutes;
