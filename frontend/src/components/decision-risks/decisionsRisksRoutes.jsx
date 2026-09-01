// src/components/decision-risks/decisionsRisksRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import DecisionRisksDashboard from "./DecisionRisksDashboard";
// Lazy load components
const DecisionList = lazy(() => import("./components/DecisionList"));
const RiskList = lazy(() => import("./components/RiskList"));
const DecisionStats = lazy(() => import("./components/DecisionStats"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

// Wrapper component to pass projectId
const DecisionListWrapper = () => {
  // You can get projectId from URL params or context
  const projectId = "current-project-id"; // Replace with actual project ID
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <DecisionList projectId={projectId} />
      </div>
    </ProtectedRoute>
  );
};

const RiskListWrapper = () => {
  const projectId = "current-project-id"; // Replace with actual project ID
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <RiskList projectId={projectId} />
      </div>
    </ProtectedRoute>
  );
};

const DecisionStatsWrapper = () => {
  const projectId = "current-project-id"; // Replace with actual project ID
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <DecisionStats projectId={projectId} />
      </div>
    </ProtectedRoute>
  );
};

const decisionsRisksRoutes = [
  {
    path: "/decisions-risks",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <DecisionRisksDashboard />
      </Suspense>
    ),
  },
  {
    path: "/risks",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RiskListWrapper />
      </Suspense>
    ),
  },
  {
    path: "/decisions/stats",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <DecisionStatsWrapper />
      </Suspense>
    ),
  },
  {
    path: "/decisions/*",
    element: <Navigate to="/decisions" replace />,
  },
  {
    path: "/risks/*",
    element: <Navigate to="/risks" replace />,
  },
];

export default decisionsRisksRoutes;
