// src/components/expense/index.js

// Main exports
export { default as ExpenseService } from "./ExpenseService";
export { default as ExpenseRoutes } from "./ExpenseRoutes";
export { default as useExpenses } from "./useExpenses";

// Component exports
export { default as ExpenseList } from "./ExpenseList";
export { default as ExpenseForm } from "./ExpenseForm";
export { default as ExpenseDetail } from "./ExpenseDetail";
export { default as ExpenseSummary } from "./ExpenseSummary";
export { default as ExpenseStatistics } from "./ExpenseStatistics";

// Constants exports
export * from "./ExpenseConstants";

// Combined export object
const ExpenseModule = {
  ExpenseService: require("./ExpenseService").default,
  ExpenseRoutes: require("./ExpenseRoutes").default,
  useExpenses: require("./useExpenses").default,
  ExpenseList: require("./ExpenseList").default,
  ExpenseForm: require("./ExpenseForm").default,
  ExpenseDetail: require("./ExpenseDetail").default,
  ExpenseSummary: require("./ExpenseSummary").default,
  ExpenseStatistics: require("./ExpenseStatistics").default,
  ...require("./ExpenseConstants"),
};

export default ExpenseModule;
