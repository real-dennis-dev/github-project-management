// src/routes/journalRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

// Lazy load components
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
    path: "/projects/:projectId/journal",
    element: <ProtectedRoute>{withSuspense(JournalList)}</ProtectedRoute>,
  },
  {
    path: "/projects/:projectId/journal/new",
    element: <ProtectedRoute>{withSuspense(JournalEntryForm)}</ProtectedRoute>,
  },
  {
    path: "/projects/:projectId/journal/edit/:entryId",
    element: <ProtectedRoute>{withSuspense(JournalEntryForm)}</ProtectedRoute>,
  },
  {
    path: "/projects/:projectId/journal/:entryId",
    element: (
      <ProtectedRoute>{withSuspense(JournalEntryDetail)}</ProtectedRoute>
    ),
  },
  {
    path: "/projects/:projectId/journal/stats",
    element: <ProtectedRoute>{withSuspense(JournalStats)}</ProtectedRoute>,
  },
  {
    path: "/projects/:projectId/journal/calendar",
    element: <ProtectedRoute>{withSuspense(JournalCalendar)}</ProtectedRoute>,
  },
  {
    path: "/projects/:projectId/journal/export",
    element: <ProtectedRoute>{withSuspense(JournalExport)}</ProtectedRoute>,
  },
  {
    path: "/projects/:projectId/journal/charts",
    element: <ProtectedRoute>{withSuspense(JournalChart)}</ProtectedRoute>,
  },
  {
    path: "/journal/*",
    element: <Navigate to="/login" replace />,
  },
];

export default journalRoutes;
