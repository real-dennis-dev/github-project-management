// src/routes/aiRoutes.jsx
import React, { Suspense } from "react";
import { LoadingSpinner } from "../components/common";
// const AIDashboard = React.lazy(() => import('../components/ai/AIDashboard'));
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

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const aiRoutes = [
  { path: "ai", element: withSuspense(AIAssistant) },
  { path: "ai/assistant/:projectId", element: withSuspense(AIAssistant) },
  { path: "ai/analysis/:projectId", element: withSuspense(ProjectAnalysis) },
  { path: "ai/report/:projectId", element: withSuspense(ReportGenerator) },
  { path: "ai/actions/:projectId", element: withSuspense(NextActions) },
  { path: "ai/trends/:projectId", element: withSuspense(TrendAnalysis) },
  { path: "ai/summarize", element: withSuspense(TextSummarizer) },
];

export default aiRoutes;
