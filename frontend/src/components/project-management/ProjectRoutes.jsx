// src/components/project-management/ProjectRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Lazy load components
const ProjectList = React.lazy(() => import("./ProjectList"));
const ProjectDetail = React.lazy(() => import("./ProjectDetail"));
const ProjectForm = React.lazy(() => import("./ProjectForm"));
const ProjectBoard = React.lazy(() => import("./ProjectBoard"));
const ProjectDashboard = React.lazy(() => import("./ProjectDashboard"));
const FeatureForm = React.lazy(() => import("./FeatureForm"));
const BugForm = React.lazy(() => import("./BugForm"));

/**
 * Protected route wrapper
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
 * Loading fallback
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
  </div>
);

/**
 * Project Routes Component
 */
const ProjectRoutes = () => {
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
      {/* Main project routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/:projectId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/:projectId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/:projectId/board"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectBoard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/:projectId/dashboard"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <ProjectDashboard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Feature routes */}
      <Route
        path="/:projectId/features/new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <FeatureForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/features/:featureId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <FeatureForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Bug routes */}
      <Route
        path="/:projectId/bugs/new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <BugForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bugs/:bugId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingFallback />}>
              <BugForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ProjectRoutes;
