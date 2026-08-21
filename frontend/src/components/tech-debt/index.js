// src/components/tech-debt/index.js

// Main exports
export { default as TechDebtService } from "./TechDebtService";
export { default as TechDebtRoutes } from "./TechDebtRoutes";
export { default as useTechDebt } from "./useTechDebt";

// Component exports
export { default as TechDebtList } from "./TechDebtList";
export { default as TechDebtForm } from "./TechDebtForm";
export { default as TechDebtDetail } from "./TechDebtDetail";
export { default as TechDebtDashboard } from "./TechDebtDashboard";

// Constants exports
export * from "./TechDebtConstants";

// Combined export object
const TechDebtModule = {
  TechDebtService: require("./TechDebtService").default,
  TechDebtRoutes: require("./TechDebtRoutes").default,
  useTechDebt: require("./useTechDebt").default,
  TechDebtList: require("./TechDebtList").default,
  TechDebtForm: require("./TechDebtForm").default,
  TechDebtDetail: require("./TechDebtDetail").default,
  TechDebtDashboard: require("./TechDebtDashboard").default,
  ...require("./TechDebtConstants"),
};

export default TechDebtModule;
