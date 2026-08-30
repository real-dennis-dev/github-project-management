// src/routes/techDebtRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common";

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
    path: "/tech-debt",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtList /> {/* or project picker */}
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/dashboard",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtDashboard />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtList />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtForm />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtDetail />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtForm />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/overview",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtOverview />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/score",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtScore />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/statistics",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtStatistics />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/suggestions",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RefactoringSuggestions />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/:projectId/export",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TechDebtExport />
      </Suspense>
    ),
  },
  {
    path: "/tech-debt/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default techDebtRoutes;
