// src/components/releases-milestone/ReleasesMilestoneRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Lazy load components for better performance
const ReleaseList = React.lazy(() => import("./ReleaseList"));
const ReleaseForm = React.lazy(() => import("./ReleaseForm"));
const ReleaseDetail = React.lazy(() => import("./ReleaseDetail"));
const MilestoneList = React.lazy(() => import("./MilestoneList"));
const MilestoneForm = React.lazy(() => import("./MilestoneForm"));
const MilestoneDetail = React.lazy(() => import("./MilestoneDetail"));
const ReleasesDashboard = React.lazy(() => import("./ReleasesDashboard"));

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
 * Releases & Milestones Routes Component
 */
const ReleasesMilestoneRoutes = () => {
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
      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <ReleasesDashboard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Release Routes */}
      <Route
        path="releases"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <ReleaseList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="releases/new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <ReleaseForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="releases/:releaseId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <ReleaseDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="releases/:releaseId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <ReleaseForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Milestone Routes */}
      <Route
        path="milestones"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <MilestoneList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="milestones/new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <MilestoneForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="milestones/:milestoneId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <MilestoneDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="milestones/:milestoneId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <MilestoneForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ReleasesMilestoneRoutes;
