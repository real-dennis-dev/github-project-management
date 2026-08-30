// src/routes/progressRoutes.jsx
import React, { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { LoadingSpinner } from "../components/common";
import ProgressReport from "../components/progress-timeline/ProgressReport";
// If you have list/timeline components, import them the same way

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const withSuspense = (Component, props = {}) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

// Simple hub so /progress does not 404
const ProgressHub = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-neutral-900">Progress</h2>
    <p className="text-neutral-600">
      Open a project and go to its progress report, or use a direct link like{" "}
      <code className="text-sm bg-neutral-200 px-1 rounded">
        /progress/:projectId
      </code>
      .
    </p>
    <Link
      to="/projects"
      className="text-primary-500 hover:underline text-sm font-medium"
    >
      Go to Projects →
    </Link>
  </div>
);

const ProgressReportPage = () => {
  const { projectId } = useParams();
  return <ProgressReport projectId={projectId} />;
};

const progressRoutes = [
  { path: "progress", element: withSuspense(ProgressHub) },
  {
    path: "progress/:projectId",
    element: withSuspense(ProgressReportPage),
  },
  {
    path: "projects/:projectId/progress",
    element: withSuspense(ProgressReportPage),
  },
];

export default progressRoutes;
