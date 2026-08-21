// src/components/vision-board/VisionBoardRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Lazy load components for better performance
const VisionBoardList = React.lazy(() => import("./VisionBoardList"));
const VisionBoardForm = React.lazy(() => import("./VisionBoardForm"));
const VisionBoardDetail = React.lazy(() => import("./VisionBoardDetail"));
const VisionBoardStatistics = React.lazy(() =>
  import("./VisionBoardStatistics")
);
const VisionBoardKanban = React.lazy(() => import("./VisionBoardKanban"));

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
 * Vision Board Routes Component
 */
const VisionBoardRoutes = () => {
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
      {/* Main vision board routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisionBoardList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="kanban"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisionBoardKanban />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="statistics"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisionBoardStatistics />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisionBoardForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path=":goalId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisionBoardDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path=":goalId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <VisionBoardForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default VisionBoardRoutes;
