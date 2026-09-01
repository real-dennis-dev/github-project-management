// src/routes/releasesRoutes.jsx
import React, { Suspense } from "react";
import { LoadingSpinner } from "../components/common";

// Lazy-loaded components
const ReleasesDashboard = React.lazy(() =>
  import("../components/releases/ReleasesDashboard")
);
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

// Proper HOC that returns a component
const withSuspense = (LazyComponent, extraProps = {}) => {
  const Wrapped = (props) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...extraProps} {...props} />
    </Suspense>
  );
  return <Wrapped />;
};

const releasesRoutes = [
  // Top-level dashboard
  {
    path: "/releases-milestones",
    element: withSuspense(ReleasesDashboard),
  },

  // ========== Project-scoped routes ==========
  {
    path: "projects/:projectId/releases",
    element: withSuspense(ReleaseList),
  },
  {
    path: "projects/:projectId/releases/create",
    element: withSuspense(ReleaseForm),
  },
  {
    path: "projects/:projectId/releases/stats",
    element: withSuspense(ReleaseStats),
  },
  {
    path: "projects/:projectId/milestones",
    element: withSuspense(MilestoneList),
  },
  {
    path: "projects/:projectId/milestones/create",
    element: withSuspense(MilestoneForm),
  },
  {
    path: "projects/:projectId/milestones/stats",
    element: withSuspense(MilestoneStats),
  },
  {
    path: "projects/:projectId/milestones/bulk-update",
    element: withSuspense(BulkUpdateProgress),
  },

  // ========== By ID routes ==========
  {
    path: "releases/:id",
    element: withSuspense(ReleaseDetail),
  },
  {
    path: "releases/:id/edit",
    element: withSuspense(ReleaseForm, { editMode: true }),
  },
  {
    path: "milestones/:id",
    element: withSuspense(MilestoneDetail),
  },
  {
    path: "milestones/:id/edit",
    element: withSuspense(MilestoneForm, { editMode: true }),
  },
];

export default releasesRoutes;
