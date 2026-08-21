// src/components/documentation-knowledge/Routes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Page imports
import DocumentationList from "./pages/DocumentationList";
import DocumentationDetail from "./pages/DocumentationDetail";
import DocumentationCreate from "./pages/DocumentationCreate";
import DocumentationEdit from "./pages/DocumentationEdit";
import KnowledgeBaseList from "./pages/KnowledgeBaseList";
import KnowledgeBaseDetail from "./pages/KnowledgeBaseDetail";
import KnowledgeBaseCreate from "./pages/KnowledgeBaseCreate";
import KnowledgeBaseEdit from "./pages/KnowledgeBaseEdit";
import KnowledgeBaseCategories from "./pages/KnowledgeBaseCategories";

// Layout components
import ProtectedRoute from "../../routes/ProtectedRoute";

const DocumentationKnowledgeRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Documentation Routes */}
      <Route
        path="documentation"
        element={
          <ProtectedRoute>
            <DocumentationList />
          </ProtectedRoute>
        }
      />
      <Route
        path="documentation/create"
        element={
          <ProtectedRoute>
            <DocumentationCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="documentation/:id"
        element={
          <ProtectedRoute>
            <DocumentationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="documentation/:id/edit"
        element={
          <ProtectedRoute>
            <DocumentationEdit />
          </ProtectedRoute>
        }
      />

      {/* Knowledge Base Routes */}
      <Route
        path="knowledge-base"
        element={
          <ProtectedRoute>
            <KnowledgeBaseList />
          </ProtectedRoute>
        }
      />
      <Route
        path="knowledge-base/categories"
        element={
          <ProtectedRoute>
            <KnowledgeBaseCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="knowledge-base/create"
        element={
          <ProtectedRoute>
            <KnowledgeBaseCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="knowledge-base/:id"
        element={
          <ProtectedRoute>
            <KnowledgeBaseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="knowledge-base/:id/edit"
        element={
          <ProtectedRoute>
            <KnowledgeBaseEdit />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="" element={<Navigate to="documentation" replace />} />
    </Routes>
  );
};

export default DocumentationKnowledgeRoutes;
