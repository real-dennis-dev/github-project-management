// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isLoading, user } = useAuth(); // use the REAL flag from your hook
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Important: pass the current location so we can come back
    return (
      <Navigate
        to="/login" // or whatever your login path is
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
