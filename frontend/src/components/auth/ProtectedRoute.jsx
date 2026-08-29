// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, isUserLoading } = useAuth();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
