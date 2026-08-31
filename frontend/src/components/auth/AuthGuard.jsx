// src/components/auth/AuthGuard.jsx

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

const AuthGuard = ({
  children,
  requireGuest = false,
  redirectTo = "/dashboard",
}) => {
  const { isAuthenticated, isUserLoading } = useAuth();
  const location = useLocation();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireGuest && isAuthenticated) {
    // If the user explicitly navigated to a specific URL (like a project), send them there instead of forcing /dashboard
    const origin = location.state?.from?.pathname || redirectTo;
    return <Navigate to={origin} replace />;
  }

  return children;
};

export default AuthGuard;
