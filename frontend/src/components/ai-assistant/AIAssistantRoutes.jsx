// src/components/ai-assistant/AIAssistantRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AIAssistant from "./AIAssistant";
import { LoadingSpinner } from "../common";

// Lazy load components
const AIAssistantPage = React.lazy(() => import("./AIAssistant"));

const AIAssistantRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="xl" />
        </div>
      }
    >
      <Routes>
        <Route path="/projects/:projectId/ai" element={<AIAssistantPage />} />
        <Route
          path="/projects/:projectId/ai/:tab"
          element={<AIAssistantPage />}
        />
        <Route path="/ai" element={<Navigate to="/projects" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AIAssistantRoutes;
