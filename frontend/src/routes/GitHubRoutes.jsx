// src/components/github-integration/GitHubRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Lazy load components for better performance
const GitHubDashboard = React.lazy(() =>
  import("../components/github-integration/GitHubDashboard")
);
const RepositoryList = React.lazy(() =>
  import("../components/github-integration/RepositoryList")
);
const RepositoryDetail = React.lazy(() =>
  import("../components/github-integration/RepositoryDetail")
);
const ConnectRepository = React.lazy(() =>
  import("../components/github-integration/ConnectRepository")
);
const RepositoryStats = React.lazy(() =>
  import("../components/github-integration/RepositoryStats")
);
const WebhookSettings = React.lazy(() =>
  import("../components/github-integration/WebhookSettings")
);

/**
 * Protected route wrapper component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * GitHub Routes Component
 */
const GitHubRoutes = () => {
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
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <GitHubDashboard />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="repositories"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <RepositoryList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="repositories/connect"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ConnectRepository />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="repositories/:repositoryId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <RepositoryDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="repositories/:repositoryId/stats"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <RepositoryStats />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="repositories/:repositoryId/webhook"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <WebhookSettings />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default GitHubRoutes;
