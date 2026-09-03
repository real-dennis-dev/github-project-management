// src/routes/documentationKnowledgeRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const DocumentationKnowledgeDashboard = React.lazy(() =>
  import(
    "../components/documentation-knowledge/DocumentationKnowledgeDashboard"
  )
);
const DocumentationList = React.lazy(() =>
  import("../components/documentation-knowledge/DocumentationList")
);
const DocumentationForm = React.lazy(() =>
  import("../components/documentation-knowledge/DocumentationForm")
);
const DocumentationDetail = React.lazy(() =>
  import("../components/documentation-knowledge/DocumentationDetail")
);
const KnowledgeList = React.lazy(() =>
  import("../components/documentation-knowledge/KnowledgeList")
);
const KnowledgeForm = React.lazy(() =>
  import("../components/documentation-knowledge/KnowledgeForm")
);
const KnowledgeDetail = React.lazy(() =>
  import("../components/documentation-knowledge/KnowledgeDetail")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const documentationKnowledgeRoutes = [
  {
    path: "/documentation-knowledge",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <DocumentationKnowledgeDashboard />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/documentation/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <DocumentationList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/documentation/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <DocumentationForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/documentation/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <DocumentationForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/documentation/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <DocumentationDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/knowledge",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <KnowledgeList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/knowledge/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <KnowledgeForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/knowledge/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <KnowledgeForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/knowledge/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <KnowledgeDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/documentation-knowledge/*",
    element: <Navigate to="/documentation-knowledge" replace />,
  },
];

export default documentationKnowledgeRoutes;
