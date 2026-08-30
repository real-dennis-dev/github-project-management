// src/routes/subscriptionRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../components/common";

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
  {
    path: "/subscriptions",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SubscriptionList />
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SubscriptionDetail />
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SubscriptionForm />
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SubscriptionForm />
      </Suspense>
    ),
  },
  {
    path: "/plans",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PlanList />
      </Suspense>
    ),
  },
  {
    path: "/plans/new",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PlanForm />
      </Suspense>
    ),
  },
  {
    path: "/plans/:id/edit",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PlanForm />
      </Suspense>
    ),
  },
  {
    path: "/plans/select",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PlanSelector />
      </Suspense>
    ),
  },
  {
    path: "/features",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <FeatureUsageList />
      </Suspense>
    ),
  },
  {
    path: "/features/check",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <FeatureAccessCheck />
      </Suspense>
    ),
  },
  {
    path: "/subscriptions/stats",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SubscriptionStats />
      </Suspense>
    ),
  },
  {
    path: "/webhooks/events",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <WebhookEventsList />
      </Suspense>
    ),
  },
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
