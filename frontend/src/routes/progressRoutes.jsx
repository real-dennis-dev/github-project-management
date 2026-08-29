// src/routes/progressRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const TimelineList = React.lazy(() =>
  import("../components/progress-timeline/TimelineList")
);
const ProgressOverview = React.lazy(() =>
  import("../components/progress-timeline/ProgressOverview")
);
const MonthlyProgress = React.lazy(() =>
  import("../components/progress-timeline/MonthlyProgress")
);
const ProgressReport = React.lazy(() =>
  import("../components/progress-timeline/ProgressReport")
);
const TimelineBulkAdd = React.lazy(() =>
  import("../components/progress-timeline/TimelineBulkAdd")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const progressRoutes = [
  {
    path: "/projects/:projectId/timeline",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="container mx-auto p-4 space-y-6">
            <TimelineList />
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/progress",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="container mx-auto p-4 space-y-6">
            <ProgressOverview />
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/progress/monthly",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="container mx-auto p-4 space-y-6">
            <MonthlyProgress />
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/progress/report",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="container mx-auto p-4 space-y-6">
            <ProgressReport />
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/timeline/bulk-add",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-neutral-900">
              Bulk Add Timeline Entries
            </h1>
            <TimelineBulkAdd />
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/progress/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default progressRoutes;
