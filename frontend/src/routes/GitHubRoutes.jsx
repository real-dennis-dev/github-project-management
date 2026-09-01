// src/routes/githubRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common";
//const GithubDashboard = React.lazy(() => import('../components/github/GithubDashboard'));

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
        <GitHubIntegration />
      </Suspense>
    ),
  },
  {
    path: "/github",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        {/* Project selector that then navigates to /github/:projectId */}
        <GitHubIntegration />
      </Suspense>
    ),
  },
  {
    path: "/github/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default githubRoutes;
