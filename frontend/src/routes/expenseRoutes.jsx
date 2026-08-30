// src/routes/expenseRoutes.jsx

import React, { Suspense } from "react";
import { LoadingSpinner } from "../components/common";

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

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const expenseRoutes = [
  {
    path: "expenses",
    element: withSuspense(ExpenseList),
  },
  {
    path: "expenses/summary",
    element: withSuspense(ExpenseSummary),
  },
  {
    path: "expenses/categories",
    element: withSuspense(ExpenseCategories),
  },
  {
    path: "expenses/monthly",
    element: withSuspense(ExpenseMonthly),
  },
  {
    path: "expenses/statistics",
    element: withSuspense(ExpenseStatistics),
  },
  {
    path: "expenses/export",
    element: withSuspense(ExpenseExport),
  },
];

export default expenseRoutes;
