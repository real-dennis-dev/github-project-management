// src/routes/authRoutes.jsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
const LoginForm = lazy(() => import("../components/auth/LoginForm"));
const RegisterForm = lazy(() => import("../components/auth/RegisterForm"));
const ResetPasswordForm = lazy(() =>
  import("../components/auth/ResetPasswordForm")
);
const UpdatePasswordForm = lazy(() =>
  import("../components/auth/UpdatePasswordForm")
);
const SessionList = lazy(() => import("../components/auth/SessionList"));
const SessionStats = lazy(() => import("../components/auth/SessionStats"));
const AuthGuard = lazy(() => import("../components/auth/AuthGuard"));
const ProtectedRoute = lazy(() => import("../components/auth/ProtectedRoute"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
  </div>
);

const authRoutes = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthGuard requireGuest>
          <LoginForm />
        </AuthGuard>
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthGuard requireGuest>
          <RegisterForm />
        </AuthGuard>
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthGuard requireGuest>
          <ResetPasswordForm />
        </AuthGuard>
      </Suspense>
    ),
  },
  {
    path: "/update-password",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <UpdatePasswordForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/sessions",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="space-y-6">
            <SessionStats />
            <SessionList />
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/profile",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <div className="space-y-6">
            {/* Profile component can be added here */}
            <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
          </div>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/auth/*",
    element: <Navigate to="/login" replace />,
  },
];

export default authRoutes;
