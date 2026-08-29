// src/routes/githubRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const GitHubIntegration = React.lazy(() =>
  import("../components/github/GitHubIntegration")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const githubRoutes = [
  {
    path: "/github/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <GitHubIntegration />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/github/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default githubRoutes;
