// src/routes/visionRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common";

const VisionBoard = React.lazy(() =>
  import("../components/vision/VisionBoard")
);
const VisionGoalForm = React.lazy(() =>
  import("../components/vision/VisionGoalForm")
);
const VisionGoalDetail = React.lazy(() =>
  import("../components/vision/VisionGoalDetail")
);
const VisionStatistics = React.lazy(() =>
  import("../components/vision/VisionStatistics")
);
const VisionOptions = React.lazy(() =>
  import("../components/vision/VisionOptions")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const visionRoutes = [
  {
    path: "/vision",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VisionBoard />
      </Suspense>
    ),
  },
  {
    path: "/vision/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VisionGoalForm />
      </Suspense>
    ),
  },
  {
    path: "/vision/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VisionGoalDetail />
      </Suspense>
    ),
  },
  {
    path: "/vision/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VisionGoalForm />
      </Suspense>
    ),
  },
  {
    path: "/vision/statistics",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VisionStatistics />
      </Suspense>
    ),
  },
  {
    path: "/vision/options",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <VisionOptions />
      </Suspense>
    ),
  },
  {
    path: "/vision/*",
    element: <Navigate to="/vision" replace />,
  },
];

export default visionRoutes;
