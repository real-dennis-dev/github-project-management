// src/components/auth/AuthGuard.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

const AuthGuard = ({
  children,
  requireGuest = false,
  redirectTo = "/dashboard",
}) => {
  const { isAuthenticated, isUserLoading } = useAuth();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireGuest && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default AuthGuard;
