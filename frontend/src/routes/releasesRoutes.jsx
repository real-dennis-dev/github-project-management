// src/routes/releasesRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const ReleaseList = React.lazy(() =>
  import("../components/releases/ReleaseList")
);
const ReleaseForm = React.lazy(() =>
  import("../components/releases/ReleaseForm")
);
const ReleaseDetail = React.lazy(() =>
  import("../components/releases/ReleaseDetail")
);
const ReleaseStats = React.lazy(() =>
  import("../components/releases/ReleaseStats")
);
const MilestoneList = React.lazy(() =>
  import("../components/releases/MilestoneList")
);
const MilestoneForm = React.lazy(() =>
  import("../components/releases/MilestoneForm")
);
const MilestoneDetail = React.lazy(() =>
  import("../components/releases/MilestoneDetail")
);
const MilestoneStats = React.lazy(() =>
  import("../components/releases/MilestoneStats")
);
const BulkUpdateProgress = React.lazy(() =>
  import("../components/releases/BulkUpdateProgress")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const releasesRoutes = [
  // Release routes
  {
    path: "/projects/:projectId/releases",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ReleaseList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/releases/create",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ReleaseForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/releases/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ReleaseDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/releases/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ReleaseForm editMode />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/releases/stats",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ReleaseStats />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Milestone routes
  {
    path: "/projects/:projectId/milestones",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <MilestoneList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/milestones/create",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <MilestoneForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/milestones/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <MilestoneDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/milestones/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <MilestoneForm editMode />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/milestones/stats",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <MilestoneStats />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/milestones/bulk-update",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <BulkUpdateProgress />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Catch-all redirect
  {
    path: "/releases/*",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/milestones/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default releasesRoutes;
