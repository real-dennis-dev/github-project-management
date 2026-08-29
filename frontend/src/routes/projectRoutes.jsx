// src/routes/projectRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const ProjectList = React.lazy(() =>
  import("../components/projects/ProjectList")
);
const ProjectDetails = React.lazy(() =>
  import("../components/projects/ProjectDetails")
);
const ProjectForm = React.lazy(() =>
  import("../components/projects/ProjectForm")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const projectRoutes = [
  {
    path: "/projects",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ProjectList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/create",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ProjectForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ProjectDetails />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ProjectForm isEditing />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/*",
    element: <Navigate to="/projects" replace />,
  },
];

export default projectRoutes;
