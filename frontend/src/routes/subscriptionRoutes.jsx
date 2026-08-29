// src/routes/subscriptionRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const SubscriptionList = React.lazy(() =>
  import("../components/subscription/SubscriptionList")
);
const SubscriptionDetail = React.lazy(() =>
  import("../components/subscription/SubscriptionDetail")
);
const SubscriptionForm = React.lazy(() =>
  import("../components/subscription/SubscriptionForm")
);
const PlanList = React.lazy(() =>
  import("../components/subscription/PlanList")
);
const PlanForm = React.lazy(() =>
  import("../components/subscription/PlanForm")
);
const PlanSelector = React.lazy(() =>
  import("../components/subscription/PlanSelector")
);
const FeatureUsageList = React.lazy(() =>
  import("../components/subscription/FeatureUsageList")
);
const FeatureAccessCheck = React.lazy(() =>
  import("../components/subscription/FeatureAccessCheck")
);
const SubscriptionStats = React.lazy(() =>
  import("../components/subscription/SubscriptionStats")
);
const WebhookEventsList = React.lazy(() =>
  import("../components/subscription/WebhookEventsList")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const subscriptionRoutes = [
  // Subscription routes
  {
    path: "/subscriptions",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <SubscriptionList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <SubscriptionDetail />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <SubscriptionForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <SubscriptionForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Plan routes
  {
    path: "/plans",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <PlanList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/plans/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <PlanForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/plans/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <PlanForm />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/plans/select",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <PlanSelector />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Feature routes
  {
    path: "/features",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <FeatureUsageList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/features/check",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <FeatureAccessCheck />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Stats route
  {
    path: "/subscriptions/stats",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <SubscriptionStats />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Webhook routes (admin only)
  {
    path: "/webhooks/events",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <WebhookEventsList />
        </ProtectedRoute>
      </Suspense>
    ),
  },

  // Fallback routes
  {
    path: "/subscriptions/*",
    element: <Navigate to="/subscriptions" replace />,
  },
  {
    path: "/plans/*",
    element: <Navigate to="/plans" replace />,
  },
  {
    path: "/features/*",
    element: <Navigate to="/features" replace />,
  },
];

export default subscriptionRoutes;
