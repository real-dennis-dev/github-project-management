// src/routes/journalRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

const JournalList = React.lazy(() =>
  import("../components/journal/JournalList")
);
const JournalEntryForm = React.lazy(() =>
  import("../components/journal/JournalEntryForm")
);
const JournalEntryDetail = React.lazy(() =>
  import("../components/journal/JournalEntryDetail")
);
const JournalStats = React.lazy(() =>
  import("../components/journal/JournalStats")
);
const JournalCalendar = React.lazy(() =>
  import("../components/journal/JournalCalendar")
);
const JournalExport = React.lazy(() =>
  import("../components/journal/JournalExport")
);
const JournalChart = React.lazy(() =>
  import("../components/journal/JournalChart")
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const journalRoutes = [
  {
    path: "/journal",
    element: withSuspense(JournalList), // or a project-picker page
  },
  {
    path: "/projects/:projectId/journal",
    element: withSuspense(JournalList),
  },
  {
    path: "/projects/:projectId/journal/new",
    element: withSuspense(JournalEntryForm),
  },
  {
    path: "/projects/:projectId/journal/edit/:entryId",
    element: withSuspense(JournalEntryForm),
  },
  {
    path: "/projects/:projectId/journal/:entryId",
    element: withSuspense(JournalEntryDetail),
  },
  {
    path: "/projects/:projectId/journal/stats",
    element: withSuspense(JournalStats),
  },
  {
    path: "/projects/:projectId/journal/calendar",
    element: withSuspense(JournalCalendar),
  },
  {
    path: "/projects/:projectId/journal/export",
    element: withSuspense(JournalExport),
  },
  {
    path: "/projects/:projectId/journal/charts",
    element: withSuspense(JournalChart),
  },
  {
    path: "/journal/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default journalRoutes;
