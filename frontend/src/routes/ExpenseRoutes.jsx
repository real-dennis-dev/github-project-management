// src/components/expense/ExpenseRoutes.jsx

import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Lazy load components for better performance
const ExpenseList = React.lazy(() => import("./ExpenseList"));
const ExpenseForm = React.lazy(() => import("./ExpenseForm"));
const ExpenseDetail = React.lazy(() => import("./ExpenseDetail"));
const ExpenseSummary = React.lazy(() => import("./ExpenseSummary"));
const ExpenseStatistics = React.lazy(() => import("./ExpenseStatistics"));

/**
 * Protected route wrapper component
 */
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Expense Routes Component
 */
const ExpenseRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Main expense routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpenseList />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="summary"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpenseSummary />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="statistics"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpenseStatistics />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="new"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpenseForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path=":expenseId"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpenseDetail />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path=":expenseId/edit"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ExpenseForm />
            </React.Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ExpenseRoutes;
