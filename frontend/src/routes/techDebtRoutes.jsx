// src/routes/techDebtRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const TechDebtDashboard = React.lazy(() =>
  import("../components/techdebt/TechDebtDashboard")
);
const TechDebtList = React.lazy(() =>
  import("../components/techdebt/TechDebtList")
);
const TechDebtDetail = React.lazy(() =>
  import("../components/techdebt/TechDebtDetail")
);
const TechDebtForm = React.lazy(() =>
  import("../components/techdebt/TechDebtForm")
);
const TechDebtOverview = React.lazy(() =>
  import("../components/techdebt/TechDebtOverview")
);
const TechDebtScore = React.lazy(() =>
  import("../components/techdebt/TechDebtScore")
);
const TechDebtStatistics = React.lazy(() =>
  import("../components/techdebt/TechDebtStatistics")
);
const RefactoringSuggestions = React.lazy(() =>
  import("../components/techdebt/RefactoringSuggestions")
);
const TechDebtExport = React.lazy(() =>
  import("../components/techdebt/TechDebtExport")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const techDebtRoutes = [
  {
    path: "/tech-debt/:projectId/dashboard",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtDashboard />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/overview",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtOverview />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/score",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtScore />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/statistics",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtStatistics />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/suggestions",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <RefactoringSuggestions />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/export",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <TechDebtExport />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default techDebtRoutes;
