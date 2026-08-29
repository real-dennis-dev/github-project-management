// src/routes/expenseRoutes.jsx
import React, { Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth";
import { LoadingSpinner } from "../components/common";

// Lazy load components
const ExpenseList = React.lazy(() =>
  import("../components/expenses/ExpenseList")
);
const ExpenseSummary = React.lazy(() =>
  import("../components/expenses/ExpenseSummary")
);
const ExpenseCategories = React.lazy(() =>
  import("../components/expenses/ExpenseCategories")
);
const ExpenseMonthly = React.lazy(() =>
  import("../components/expenses/ExpenseMonthly")
);
const ExpenseStatistics = React.lazy(() =>
  import("../components/expenses/ExpenseStatistics")
);
const ExpenseExport = React.lazy(() =>
  import("../components/expenses/ExpenseExport")
);

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

const expenseRoutes = [
  {
    path: "/projects/:projectId/expenses",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ExpenseList />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/expenses/summary",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ExpenseSummary />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/expenses/categories",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ExpenseCategories />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/expenses/monthly",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ExpenseMonthly />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/expenses/statistics",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ExpenseStatistics />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/projects/:projectId/expenses/export",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <ExpenseExport />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/expenses/*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default expenseRoutes;
