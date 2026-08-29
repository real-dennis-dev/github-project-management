// src/components/journal/ProtectedJournalRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

const ProtectedJournalRoute = ({ children, projectId }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Here you could also check project access permissions
  // For now, just render children

  return children;
};

export default ProtectedJournalRoute;
