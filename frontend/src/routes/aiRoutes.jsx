// src/routes/aiRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const AIAssistant = React.lazy(() => import("../components/ai/AIAssistant"));
const ProjectAnalysis = React.lazy(() =>
  import("../components/ai/ProjectAnalysis")
);
const ReportGenerator = React.lazy(() =>
  import("../components/ai/ReportGenerator")
);
const NextActions = React.lazy(() => import("../components/ai/NextActions"));
const TrendAnalysis = React.lazy(() =>
  import("../components/ai/TrendAnalysis")
);
const TextSummarizer = React.lazy(() =>
  import("../components/ai/TextSummarizer")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const aiRoutes = [
  {
    path: "/ai/assistant/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <AIAssistant />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/ai/analysis/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ProjectAnalysis />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/ai/report/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ReportGenerator />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/ai/actions/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <NextActions />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/ai/trends/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TrendAnalysis />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/ai/summarize",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TextSummarizer />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/ai/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default aiRoutes;
